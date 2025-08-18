import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import Board from "../models/Board.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// auth middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// multer local storage
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// S3 client if env provided
let s3Client = null;
const S3_BUCKET = process.env.AWS_S3_BUCKET;
if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  S3_BUCKET
) {
  s3Client = new S3Client({ region: process.env.AWS_REGION });
}

// ---------------- ROUTES ----------------

// GET boards
router.get("/", auth, async (req, res) => {
  try {
    const boards = await Board.find({ createdBy: req.user }).sort({
      createdAt: -1,
    });
    res.json(boards);
  } catch (err) {
    console.error("Get boards error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE board
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const board = new Board({
      title: title || "Untitled",
      createdBy: req.user,
    });
    await board.save();
    res.json(board);
  } catch (err) {
    console.error("Create board error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET single board
router.get("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      createdBy: req.user,
    });
    if (!board) return res.status(404).json({ msg: "Not found" });
    res.json(board);
  } catch (err) {
    console.error("Get board error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE board (title/elements/backgroundImage)
router.put("/:id", auth, async (req, res) => {
  try {
    const update = {};
    if (req.body.title) update.title = req.body.title;
    if (req.body.elements) update.elements = req.body.elements;
    if (req.body.backgroundImage)
      update.backgroundImage = req.body.backgroundImage;

    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user },
      update,
      { new: true }
    );
    if (!board) return res.status(404).json({ msg: "Not found" });

    res.json(board);
  } catch (err) {
    console.error("Update board error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE board (and clean up files/snapshots)
router.delete("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user,
    });
    if (!board) return res.status(404).json({ msg: "Not found" });

    // Remove local snapshot files if stored
    if (board.snapshotPath && !s3Client) {
      const filePath = path.join(uploadDir, board.snapshotPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from S3 if enabled
    if (board.snapshotKey && s3Client) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: board.snapshotKey,
          })
        );
      } catch (s3err) {
        console.error("S3 delete error:", s3err);
      }
    }

    res.json({ msg: "Board deleted" });
  } catch (err) {
    console.error("Delete board error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// SNAPSHOT upload
router.post("/:id/snapshot", auth, upload.single("file"), async (req, res) => {
  try {
    const boardId = req.params.id;
    if (!req.file) return res.status(400).json({ msg: "No file" });

    if (s3Client) {
      const key = `snapshots/${boardId}/${uuidv4()}-${req.file.originalname}`;
      const body = fs.createReadStream(req.file.path);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: body,
          ContentType: req.file.mimetype,
          ACL: "private",
        })
      );

      fs.unlinkSync(req.file.path);

      const url = process.env.CLOUDFRONT_URL
        ? `${process.env.CLOUDFRONT_URL.replace(/\/$/, "")}/${key}`
        : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;

      // Save snapshotKey to board for cleanup
      await Board.findByIdAndUpdate(boardId, { snapshotKey: key });

      return res.json({ key, url });
    }

    // Fallback local storage
    const publicUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${path.basename(req.file.path)}`;

    // Save local snapshot path for cleanup
    await Board.findByIdAndUpdate(boardId, {
      snapshotPath: path.basename(req.file.path),
    });

    return res.json({ key: path.basename(req.file.path), url: publicUrl });
  } catch (err) {
    console.error("Snapshot upload error:", err);
    res.status(500).json({ msg: "Upload error" });
  }
});

export default router;

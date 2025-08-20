import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Board from "../models/Board.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

// ✅ Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------- Auth ----------
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalize user id
    req.user = { id: decoded.id || decoded._id };
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// ---------- Multer ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, ""));
  },
});

const upload = multer({ storage });

// ---------- AWS S3 ----------
let s3Client = null;
const S3_BUCKET = process.env.AWS_S3_BUCKET;
if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  S3_BUCKET
) {
  s3Client = new S3Client({ region: process.env.AWS_REGION });
}

// ---------- Routes ----------

// GET boards
router.get("/", auth, async (req, res) => {
  try {
    const boards = await Board.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(boards);
  } catch (err) {
    console.error("Error fetching boards:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE board
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ msg: "Missing user id from token" });
    }

    const { title } = req.body;

    const board = new Board({
      title: title || "Untitled Board",
      createdBy: new mongoose.Types.ObjectId(req.user.id),
      elements: [],
    });

    await board.save();
    res.json(board);
  } catch (err) {
    console.error("Error creating board:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET single board
router.get("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!board) return res.status(404).json({ msg: "Not found" });
    res.json(board);
  } catch (err) {
    console.error("Error getting board:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE board
router.put("/:id", auth, async (req, res) => {
  try {
    const update = {};
    if (req.body.title) update.title = req.body.title;
    if (req.body.elements) update.elements = req.body.elements;
    if (req.body.backgroundImage)
      update.backgroundImage = req.body.backgroundImage;

    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      update,
      { new: true }
    );
    if (!board) return res.status(404).json({ msg: "Not found" });
    res.json(board);
  } catch (err) {
    console.error("Error updating board:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE board
router.delete("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!board)
      return res
        .status(404)
        .json({ msg: "Board not found or not owned by user" });

    if (board.snapshotPath && !s3Client) {
      const filePath = path.join(uploadDir, board.snapshotPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    if (board.snapshotKey && s3Client) {
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: board.snapshotKey })
      );
    }

    res.json({ msg: "Board deleted" });
  } catch (err) {
    console.error("Error deleting board:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// SNAPSHOT (PNG preview)
router.post("/:id/snapshot", auth, upload.single("file"), async (req, res) => {
  try {
    const boardId = req.params.id;
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    // ✅ return relative path
    res.json({ url: `http://localhost:4000/uploads/${req.file.filename}` });

    if (s3Client) {
      const key = `snapshots/${boardId}/${uuidv4()}-${req.file.originalname}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: fs.createReadStream(req.file.path),
          ContentType: req.file.mimetype,
          ACL: "private",
        })
      );
      fs.unlinkSync(req.file.path);
      const url = `${
        process.env.CLOUDFRONT_URL || `https://${S3_BUCKET}.s3.amazonaws.com`
      }/${key}`;
      await Board.findByIdAndUpdate(boardId, { snapshotKey: key });
      return res.json({ key, url });
    }

    // Save local filename only
    await Board.findByIdAndUpdate(boardId, {
      snapshotPath: path.basename(req.file.path),
    });
    const publicUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${path.basename(req.file.path)}`;
    return res.json({ key: path.basename(req.file.path), url: publicUrl });
  } catch (err) {
    console.error("Error uploading snapshot:", err.message);
    res.status(500).json({ msg: "Upload error" });
  }
});

export default router;

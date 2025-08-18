const Board = require("../models/Board");
const { uploadBufferToS3 } = require("../services/s3");
const sharp = require("sharp");

exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.create({
      name: name || "Untitled board",
      owner: req.user._id,
      collaborators: [{ user: req.user._id, role: "editor" }],
    });
    res.json(board);
  } catch (err) {
    console.error("createBoard", err);
    res.status(500).json({ message: "Server error creating board" });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }],
    }).lean();
    res.json(boards);
  } catch (err) {
    console.error("getBoards", err);
    res.status(500).json({ message: "Server error fetching boards" });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate(
      "collaborators.user",
      "name email role"
    );
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    console.error("getBoard", err);
    res.status(500).json({ message: "Server error fetching board" });
  }
};

exports.uploadSnapshot = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const boardId = req.params.id;
    const cleanedName = (file.originalname || "snapshot").replace(/\s+/g, "_");
    const key = `snapshots/${boardId}/${Date.now()}-${cleanedName}`;

    let buffer = file.buffer;
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      buffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
    }

    await uploadBufferToS3(
      key,
      buffer,
      file.mimetype || "application/octet-stream"
    );
    const url = `${process.env.CLOUDFRONT_URL}/${key}`;

    const board = await Board.findByIdAndUpdate(
      boardId,
      {
        $push: { snapshots: { key, url, uploadedAt: new Date() } },
      },
      { new: true }
    );

    res.json({ key, url, board });
  } catch (err) {
    console.error("uploadSnapshot", err);
    res.status(500).json({ message: "Server error uploading snapshot" });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { elements } = req.body; 
    const board = await Board.findByIdAndUpdate(
      id,
      { elements },
      { new: true }
    );
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

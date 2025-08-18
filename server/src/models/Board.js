import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled",
    },
    elements: {
      type: Array,
      default: [],
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 For snapshot cleanup
    snapshotPath: {
      type: String, // local file name if stored on disk
      default: null,
    },
    snapshotKey: {
      type: String, // S3 object key if uploaded to S3
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Board", BoardSchema);

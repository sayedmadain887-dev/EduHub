const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    requestDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookRequest", bookRequestSchema);
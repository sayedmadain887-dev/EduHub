const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    studentName: String,
    studentCode: String,
    detail: String, // e.g. session date or request date
    status: { type: String, enum: ["pending", "confirmed"] },
  },
  { _id: false }
);

const adminLogSchema = new mongoose.Schema({
  kind: { type: String, enum: ["center", "book"], required: true },
  label: { type: String, required: true }, // e.g. group name or book name
  entries: [logEntrySchema],
  savedAt: { type: Date, default: Date.now },
  // Only set for "book" logs. MongoDB auto-deletes the document once this time passes.
  expiresAt: { type: Date, default: null },
});

// TTL index: MongoDB checks this field and deletes the document automatically
// once the current time passes "expiresAt". Documents with expiresAt = null
// are never touched by this index, so "center" logs stay forever.
adminLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AdminLog", adminLogSchema);
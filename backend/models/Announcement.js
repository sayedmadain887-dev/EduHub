const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["general", "alert", "newMaterial", "newGroup", "cancelled", "rescheduled"],
      default: "general",
    },
    title: {
      type: String,
      required: [true, "عنوان الإعلان مطلوب"],
      trim: true,
      maxlength: [200, "العنوان مش أطول من 200 حرف"],
    },
    message: {
      type: String,
      required: [true, "نص الإعلان مطلوب"],
      trim: true,
      maxlength: [700, "النص مش أطول من 700 حرف"],
    },
    pages: {
      type: mongoose.Schema.Types.Mixed,
      default: "all",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
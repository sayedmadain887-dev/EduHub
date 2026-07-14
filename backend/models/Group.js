const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    default: null, // null means unlimited capacity
  },
  bookedCount: {
    type: Number,
    default: 0,
  },
});

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "اسم المجموعة مطلوب"],
      trim: true,
    },
    centerName: {
      type: String,
      required: [true, "اسم السنتر مطلوب"],
      trim: true,
    },
    days: {
      type: String,
      required: [true, "أيام المجموعة مطلوبة"],
    },
    grade: {
      type: String,
      required: [true, "الصف الدراسي مطلوب"],
    },
    startDate: {
      type: Date,
      required: [true, "تاريخ البداية مطلوب"],
    },
    isNewGroup: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    timeSlots: [timeSlotSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);
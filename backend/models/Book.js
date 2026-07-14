const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "اسم الكتاب مطلوب"], trim: true },
    subject: { type: String, required: [true, "المادة مطلوبة"] },
    grade: { type: String, required: [true, "الصف الدراسي مطلوب"] },
    type: { type: String, enum: ["كتاب", "ملزمة"], default: "كتاب" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isNewGroup: { type: Boolean, default: false },
    copies: { type: Number, required: true, default: 0 }, // never exposed as-is to students
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
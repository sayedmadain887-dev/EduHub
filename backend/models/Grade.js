const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الصف مطلوب"],
      unique: true,
      trim: true,
      minlength: [2, "اسم الصف لازم يكون أكتر من حرفين"],
      maxlength: [50, "اسم الصف مش أطول من 50 حرف"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "الوصف مش أطول من 200 حرف"],
    },
  },
  { timestamps: true }
);


{ unique: true };

module.exports = mongoose.model("Grade", gradeSchema);
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "اسم الملزمة مطلوب"], 
      trim: true,
      maxlength: [100, "اسم الملزمة مش أطول من 100 حرف"],
    },
    grade: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Grade", 
      required: [true, "الصف الدراسي مطلوب"],
      index: true,
    },
    description: { 
      type: String, 
      default: "", 
      maxlength: [500, "الوصف مش أطول من 500 حرف"],
    },
    pdfUrl: { 
      type: String, 
      required: [true, "ملف الـ PDF مطلوب"], 
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, "معرف الملف مطلوب"], // needed to delete the file from Cloudinary later
    },
    order: { 
      type: Number, 
      default: 999,
      min: [0, "الترتيب لازم يكون رقم موجب"],
    },
  },
  { timestamps: true }
);

// Index للـ performance لما تجيب materials حسب الصف مع الـ sorting
materialSchema.index({ grade: 1, order: 1 });

module.exports = mongoose.model("Material", materialSchema);
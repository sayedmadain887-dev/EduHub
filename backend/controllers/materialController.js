const Material = require("../models/Material");
const Grade = require("../models/Grade");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

/* ---------------- Grades ---------------- */

const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ createdAt: 1 });
    res.status(200).json(grades);
  } catch (error) {
    console.error("Get Grades Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const createGrade = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "اسم الصف مطلوب" });
    }

    const existing = await Grade.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "الصف ده موجود بالفعل" });
    }

    const grade = await Grade.create({ name: name.trim() });
    res.status(201).json({ message: "تم إضافة الصف بنجاح", grade });
  } catch (error) {
    console.error("Create Grade Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ message: "الصف غير موجود" });

    const materialsInGrade = await Material.find({ grade: grade._id });

    // Delete each material's actual file from Cloudinary
    for (const material of materialsInGrade) {
      await cloudinary.uploader.destroy(material.publicId, { resource_type: "raw" });
    }

    await Material.deleteMany({ grade: grade._id });
    await grade.deleteOne();

    res.status(200).json({ message: "تم حذف الصف وكل الملازم اللي جواه" });
  } catch (error) {
    console.error("Delete Grade Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/* ---------------- Materials ---------------- */

const getMaterialsByGrade = async (req, res) => {
  try {
    const materials = await Material.find({ grade: req.params.gradeId })
      .sort({ order: 1 })
      .populate("grade", "name"); // اختياري: لو عايز ترجع اسم الصف

    res.status(200).json(materials);
  } catch (error) {
    console.error("Get Materials Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { name, grade, description, order } = req.body;

    if (!name?.trim() || name.length > 100) {
      return res.status(400).json({ message: "اسم الملزمة مطلوب وأقصى طول 100 حرف" });
    }

    if (!grade) {
      return res.status(400).json({ message: "الصف الدراسي مطلوب" });
    }

    const gradeExists = await Grade.findById(grade);
    if (!gradeExists) {
      return res.status(400).json({ message: "الصف الدراسي غير موجود" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ملف الـ PDF مطلوب" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "eduhub/materials", "raw");

    if (!result?.secure_url) {
      console.error("Cloudinary upload failed:", result);
      return res.status(500).json({ message: "فشل رفع الملف" });
    }

    const material = await Material.create({
      name: name.trim(),
      grade,
      description: description?.trim() || "",
      pdfUrl: result.secure_url,
      publicId: result.public_id,
      order: order ? Number(order) : 999,
    });

    res.status(201).json({ message: "تم إضافة الملزمة بنجاح", material });
  } catch (error) {
    console.error("Create Material Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "الملزمة غير موجودة" });

    await cloudinary.uploader.destroy(material.publicId, { resource_type: "raw" });
    await material.deleteOne();

    res.status(200).json({ message: "تم حذف الملزمة بنجاح" });
  } catch (error) {
    console.error("Delete Material Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = {
  getAllGrades,
  createGrade,
  deleteGrade,
  getMaterialsByGrade,
  createMaterial,
  deleteMaterial,
};
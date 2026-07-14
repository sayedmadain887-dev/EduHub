const express = require("express");
const {
  getAllGrades,
  createGrade,
  deleteGrade,
  getMaterialsByGrade,
  createMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const  protect  = require("../middleware/authMiddleware");
const adminOnly  = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Grades
router.get("/grades", getAllGrades);
router.post("/grades", protect, adminOnly, createGrade);
router.delete("/grades/:id", protect, adminOnly, deleteGrade);

// Materials
router.get("/grade/:gradeId", getMaterialsByGrade);
router.post("/", protect, adminOnly, upload.single("pdf"), createMaterial);
router.delete("/:id", protect, adminOnly, deleteMaterial);

module.exports = router;
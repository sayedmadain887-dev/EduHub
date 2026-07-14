const express = require("express");

const {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// عرض المجموعات للطلاب
router.get("/", getAllGroups);


// الأدمن فقط يضيف مجموعة
router.post("/", protect, adminOnly, createGroup);


// الأدمن فقط يعدل مجموعة
router.put("/:id", protect, adminOnly, updateGroup);


// الأدمن فقط يحذف مجموعة
router.delete("/:id", protect, adminOnly, deleteGroup);

module.exports = router;
const express = require("express");
const multer = require("multer");
const {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllAnnouncements);
router.post("/", protect, adminOnly, upload.single("image"), createAnnouncement);
router.delete("/:id", protect, adminOnly, deleteAnnouncement);

module.exports = router;
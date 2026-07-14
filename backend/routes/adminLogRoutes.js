const express = require("express");
const { getLogEntries } = require("../controllers/adminLogController");
const  protect  = require("../middleware/authMiddleware");
const  adminOnly  = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getLogEntries);

module.exports = router;
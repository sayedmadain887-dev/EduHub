const express = require("express");

const {
  createBookRequest,
  getRequestsByBook,
  toggleRequestStatus,
  saveBookRequestsToLog,
} = require("../controllers/bookRequestController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// الطالب يرسل طلب كتاب
router.post("/", protect, createBookRequest);


// الأدمن يشوف طلبات كتاب معين
router.get(
  "/book/:bookId",
  protect,
  adminOnly,
  getRequestsByBook
);


// الأدمن يغير حالة الطلب
router.patch(
  "/:id",
  protect,
  adminOnly,
  toggleRequestStatus
);


// الأدمن يحفظ الطلبات في Log
router.post(
  "/book/:bookId/save",
  protect,
  adminOnly,
  saveBookRequestsToLog
);


module.exports = router;
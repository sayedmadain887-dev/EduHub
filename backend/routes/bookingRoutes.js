const express = require("express");
const {
  createBooking,
  getMyBookings,
  getBookingsByGroup,
  toggleBookingStatus,
  saveGroupSnapshot,
  deleteBooking,
} = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/group/:groupId", protect, adminOnly, getBookingsByGroup);
router.patch("/:id", protect, adminOnly, toggleBookingStatus);
router.post("/group/:groupId/save", protect, adminOnly, saveGroupSnapshot);
router.delete("/:id", protect, adminOnly, deleteBooking);

module.exports = router;
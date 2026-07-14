const Booking = require("../models/Booking");
const Group = require("../models/Group");
const AdminLog = require("../models/AdminLog");

/**
 * @desc   Book a time slot in a group (Student only, must be logged in)
 * @route  POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const { groupId, timeSlot, sessionDate } = req.body;
    const studentId = req.user.id;

    if (!groupId || !timeSlot || !sessionDate) {
      return res.status(400).json({ message: "بيانات الحجز غير مكتملة" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "المجموعة غير موجودة" });
    }

    const slot = group.timeSlots.find((s) => s.time === timeSlot);
    if (!slot) {
      return res.status(404).json({ message: "الميعاد غير موجود" });
    }

    if (slot.capacity !== null && slot.bookedCount >= slot.capacity) {
      return res.status(400).json({ message: "الميعاد ده مكتمل بالكامل" });
    }

    const existingBooking = await Booking.findOne({
      student: studentId,
      group: groupId,
      timeSlot,
      sessionDate,
    });

    if (existingBooking) {
      return res.status(400).json({ message: "إنت حاجز في الميعاد ده بالفعل" });
    }

    const booking = await Booking.create({
      student: studentId,
      group: groupId,
      timeSlot,
      sessionDate,
    });

    slot.bookedCount += 1;
    await group.save();

    res.status(201).json({ message: "تم الحجز بنجاح", booking });
  } catch (error) {
    console.error("Create Booking Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Save a snapshot of a group's current attendance list into the permanent log
 * @route  POST /api/bookings/group/:groupId/save
 */
const saveGroupSnapshot = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "المجموعة غير موجودة" });

    const bookings = await Booking.find({ group: req.params.groupId }).populate(
      "student",
      "fullName studentCode"
    );

    if (bookings.length === 0) {
      return res.status(400).json({ message: "مفيش حجوزات لحفظها" });
    }

    const entries = bookings.map((b) => ({
      studentName: b.student.fullName,
      studentCode: b.student.studentCode,
      detail: new Date(b.sessionDate).toISOString().split("T")[0],
      status: b.status,
    }));

    await AdminLog.create({
      kind: "center",
      label: `${group.groupName} — ${group.centerName}`,
      entries,
      savedAt: new Date(),
      expiresAt: null,
    });

    res.status(200).json({ message: "تم حفظ نسخة من الحضور في السجل" });
  } catch (error) {
    console.error("Save Group Snapshot Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Get bookings for the logged-in student
 * @route  GET /api/bookings/my-bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate("group", "groupName centerName")
      .sort({ sessionDate: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get My Bookings Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Get all bookings for a specific group
 * @route  GET /api/bookings/group/:groupId
 */
const getBookingsByGroup = async (req, res) => {
  try {
    const bookings = await Booking.find({ group: req.params.groupId })
      .populate("student", "fullName studentCode")
      .sort({ sessionDate: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get Group Bookings Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Toggle a booking's status
 * @route  PATCH /api/bookings/:id
 */
const toggleBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    booking.status = booking.status === "confirmed" ? "pending" : "confirmed";
    await booking.save();

    res.status(200).json({ message: "تم تحديث حالة الحجز", booking });
  } catch (error) {
    console.error("Toggle Booking Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Delete a single booking (Admin only)
 * @route  DELETE /api/bookings/:id
 */
const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!deletedBooking) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    const group = await Group.findById(deletedBooking.group);
    if (group) {
      const slot = group.timeSlots.find((s) => s.time === deletedBooking.timeSlot);
      if (slot && slot.bookedCount > 0) {
        slot.bookedCount -= 1;
        await group.save();
      }
    }

    res.status(200).json({ 
      message: "تم الحذف بنجاح", 
      bookingId: req.params.id 
    });
  } catch (error) {
    console.error("Delete Booking Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingsByGroup,
  toggleBookingStatus,
  saveGroupSnapshot,
  deleteBooking,
};
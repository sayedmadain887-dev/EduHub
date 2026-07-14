const mongoose = require("mongoose");
const BookRequest = require("../models/BookRequest");
const Book = require("../models/Book");
const AdminLog = require("../models/AdminLog");

const HOURS_48_IN_MS = 48 * 60 * 60 * 1000;

/**
 * @desc   Student requests a book (must be logged in)
 * @route  POST /api/book-requests
 */
const createBookRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { bookId } = req.body;
    const studentId = req.user.id;

    const existingRequest = await BookRequest.findOne({
      student: studentId,
      book: bookId,
      status: "pending",
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "إنت طالب الكتاب ده بالفعل ولسه مستني" });
    }

    const book = await Book.findOneAndUpdate(
      { _id: bookId, isAvailable: true, copies: { $gt: 0 } },
      { $inc: { copies: -1 } },
      { new: true, session }
    );

    if (!book) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "الكتاب غير متوفر حاليًا" });
    }

    const request = await BookRequest.create([{ student: studentId, book: bookId }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "تم إرسال طلبك بنجاح", request: request[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Book Request Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Get all active requests for a specific book (Admin only)
 * @route  GET /api/book-requests/book/:bookId
 */
const getRequestsByBook = async (req, res) => {
  try {
    const requests = await BookRequest.find({ book: req.params.bookId })
      .populate("student", "fullName studentCode")
      .sort({ requestDate: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Book Requests Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Toggle a request's status between pending/confirmed (Admin only)
 * @route  PATCH /api/book-requests/:id
 */
const toggleRequestStatus = async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "الطلب غير موجود" });

    request.status = request.status === "confirmed" ? "pending" : "confirmed";
    await request.save();

    res.status(200).json({ message: "تم تحديث حالة الطلب", request });
  } catch (error) {
    console.error("Toggle Request Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Save all active requests for a book into the 48h expiring log,
 *         then permanently remove them from the active list (Admin only).
 * @route  POST /api/book-requests/book/:bookId/save
 */
const saveBookRequestsToLog = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "الكتاب غير موجود" });

    const requests = await BookRequest.find({ book: req.params.bookId }).populate(
      "student",
      "fullName studentCode"
    );

    if (requests.length === 0) {
      return res.status(400).json({ message: "مفيش طلبات لحفظها" });
    }

    const entries = requests.map((r) => ({
      studentName: r.student.fullName,
      studentCode: r.student.studentCode,
      detail: r.requestDate.toISOString().split("T")[0],
      status: r.status,
    }));

    await AdminLog.create({
      kind: "book",
      label: book.name,
      entries,
      savedAt: new Date(),
      expiresAt: new Date(Date.now() + HOURS_48_IN_MS),
    });

    await BookRequest.deleteMany({ book: req.params.bookId });

    res.status(200).json({ message: "تم الحفظ ونقل الطلبات للسجل" });
  } catch (error) {
    console.error("Save Book Requests Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { createBookRequest, getRequestsByBook, toggleRequestStatus, saveBookRequestsToLog };
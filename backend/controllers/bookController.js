const Book = require("../models/Book");

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("Get Books Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const createBook = async (req, res) => {
  try {
    const { name, subject, grade, type, description, image, isAvailable, isNew, copies } = req.body;

    if (!name || !subject || !grade) {
      return res.status(400).json({ message: "البيانات الأساسية للكتاب مطلوبة" });
    }

    const newBook = await Book.create({
      name, subject, grade, type, description, image,
      isAvailable: isAvailable ?? true,
      isNew: isNew || false,
      copies: copies || 0,
    });

    res.status(201).json({ message: "تم إضافة الكتاب بنجاح", book: newBook });
  } catch (error) {
    console.error("Create Book Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "الكتاب غير موجود" });

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "تم تعديل الكتاب بنجاح", book: updatedBook });
  } catch (error) {
    console.error("Update Book Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "الكتاب غير موجود" });

    await book.deleteOne();
    res.status(200).json({ message: "تم حذف الكتاب بنجاح" });
  } catch (error) {
    console.error("Delete Book Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { getAllBooks, createBook, updateBook, deleteBook };
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./BooksReservation.module.css";

const GRADE_OPTIONS = [
  "أولى ابتدائي",
  "ثانية ابتدائي",
  "ثالثة ابتدائي",
  "رابعة ابتدائي",
  "خامسة ابتدائي",
  "سادسة ابتدائي",
  "أولى إعدادي",
  "ثانية إعدادي",
  "ثالثة إعدادي",
  "أولى ثانوي",
  "ثانية ثانوي",
  "ثالثة ثانوي"
];
const TYPE_OPTIONS = ["كتاب", "ملزمة"];

function BooksReservation() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const [books, setBooks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [newBook, setNewBook] = useState({
    name: "",
    subject: "",
    grade: GRADE_OPTIONS[0],
    type: TYPE_OPTIONS[0],
    description: "",
    image: "",
    isAvailable: true,
    isNew: false,
    copies: "",
  });

  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedCode, setBookedCode] = useState("");
  const [bookedBookName, setBookedBookName] = useState("");

  /* ---------------- Fetch Books from Backend ---------------- */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get("/books");
        setBooks(res.data);
      } catch (error) {
        console.error("Fetch Books Error:", error.message);
      }
    };

    fetchBooks();
  }, []);

  /* ---------------- Admin: Add Book Form ---------------- */
  const handleNewBookChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook({
      ...newBook,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/books", {
        ...newBook,
        copies: Number(newBook.copies),
      });

      setBooks([res.data.book, ...books]);
      setNewBook({
        name: "",
        subject: "",
        grade: GRADE_OPTIONS[0],
        type: TYPE_OPTIONS[0],
        description: "",
        image: "",
        isAvailable: true,
        isNew: false,
        copies: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Add Book Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء إضافة الكتاب");
    }
  };

  /* ---------------- Student: Request Book ---------------- */
  const handleRequestBook = async (book) => {
    if (!isLoggedIn) {
      setShowLoginRequiredModal(true);
      return;
    }

    if (!book.isAvailable || book.copies <= 0) return;

    try {
      await api.post("/book-requests", { bookId: book._id });

      setBooks((prev) =>
        prev.map((b) =>
          b._id === book._id ? { ...b, copies: b.copies - 1 } : b
        )
      );

      setBookedBookName(book.name);
      setBookedCode(user?.studentCode || "");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Book Request Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء الطلب");
    }
  };

  /* ---------------- Admin: Delete Book ---------------- */
  const requestDeleteBook = (book, e) => {
    e.stopPropagation();
    setBookToDelete(book);
  };

  const confirmDeleteBook = async () => {
    try {
      await api.delete(`/books/${bookToDelete._id}`);
      setBooks(books.filter((b) => b._id !== bookToDelete._id));
      setBookToDelete(null);
    } catch (error) {
      console.error("Delete Book Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ---------- Page Header ---------- */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>الكتب والملازم</h1>
          <p className={styles.pageSubtitle}>
            اطلب كتبك وملازمك بسهولة واستلمها من السنتر
          </p>

          {isAdmin && (
            <button
              className={styles.addBookBtn}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              <AddIcon fontSize="small" />
              <span>{showAddForm ? "إلغاء" : "إضافة كتاب جديد"}</span>
            </button>
          )}
        </div>

        {/* ---------- Admin: Add Book Form ---------- */}
        {isAdmin && showAddForm && (
          <form className={styles.addForm} onSubmit={handleAddBook}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="name"
                placeholder="اسم الكتاب"
                value={newBook.name}
                onChange={handleNewBookChange}
                className={styles.formInput}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="المادة"
                value={newBook.subject}
                onChange={handleNewBookChange}
                className={styles.formInput}
                required
              />
            </div>

            <input
              type="url"
              name="image"
              placeholder="رابط صورة الكتاب"
              value={newBook.image}
              onChange={handleNewBookChange}
              className={styles.formInput}
              required
            />

            <div className={styles.formRow}>
              <select
                name="grade"
                value={newBook.grade}
                onChange={handleNewBookChange}
                className={styles.formInput}
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <select
                name="type"
                value={newBook.type}
                onChange={handleNewBookChange}
                className={styles.formInput}
              >
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="description"
              placeholder="وصف الكتاب (اختياري) — اكتب جملة تشد الطالب"
              value={newBook.description}
              onChange={handleNewBookChange}
              className={styles.formTextarea}
              rows={2}
            />

            <div className={styles.formRow}>
              <input
                type="number"
                name="copies"
                placeholder="عدد النسخ المتاحة"
                value={newBook.copies}
                onChange={handleNewBookChange}
                className={styles.formInput}
                min="0"
                required
              />

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={newBook.isAvailable}
                  onChange={handleNewBookChange}
                />
                <span>متوفر حاليًا</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={newBook.isNew}
                  onChange={handleNewBookChange}
                />
                <span>جديد 🔥</span>
              </label>
            </div>

            <button type="submit" className={styles.submitFormBtn}>
              إضافة الكتاب
            </button>
          </form>
        )}

        {/* ---------- Books Grid ---------- */}
        <div className={styles.booksGrid}>
          {books.map((book) => {
            const isOutOfStock = !book.isAvailable || book.copies <= 0;

            return (
              <div key={book._id} className={styles.bookCard}>
                <div className={styles.cardImageWrapper}>
                  <img
                    src={book.image}
                    alt={book.name}
                    className={styles.cardImage}
                  />
                  {book.isNew && (
                    <div className={styles.newBadge}>🔥 جديد</div>
                  )}
                  <div className={styles.typeTag}>{book.type}</div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.bookName}>{book.name}</h3>

                  <p className={styles.bookDetail}>
                    <MenuBookIcon fontSize="small" />
                    <span>{book.subject}</span>
                  </p>

                  <p className={styles.bookDetail}>
                    <SchoolIcon fontSize="small" />
                    <span>{book.grade}</span>
                  </p>

                  {book.description && (
                    <p className={styles.bookDescription}>
                      {book.description}
                    </p>
                  )}

                  <button
                    className={styles.requestBtn}
                    disabled={isOutOfStock}
                    onClick={() => handleRequestBook(book)}
                  >
                    {isOutOfStock ? "غير متوفر" : "اطلب الكتاب"}
                  </button>

                  {/* زرار الحذف - بيظهر بس للـ admin */}
                  {isAdmin && (
                    <button
                      className={styles.deleteBookBtn}
                      onClick={(e) => requestDeleteBook(book, e)}
                      aria-label="حذف الكتاب"
                    >
                      <DeleteIcon fontSize="small" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- Success Modal (Book Requested) ---------- */}
      {showSuccessModal && (
        <div
          className={styles.overlay}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className={styles.successModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.checkCircle}>
              <CheckCircleIcon className={styles.checkIcon} />
            </div>

            <h3 className={styles.successTitle}>تم إرسال طلبك بنجاح</h3>
            <p className={styles.successText}>
              اطلبت <strong>{bookedBookName}</strong>. احتفظ بالكود ده
              واستلمه من السنتر.
            </p>

            <div className={styles.successCode}>{bookedCode}</div>

            <p className={styles.successNote}>
              الكود ده اتسجل في صفحة البروفايل بتاعتك برضو.
            </p>

            <button
              className={styles.successBtn}
              onClick={() => setShowSuccessModal(false)}
            >
              تمام
            </button>
          </div>
        </div>
      )}

      {/* ---------- Login Required Modal ---------- */}
      <ConfirmModal
        isOpen={showLoginRequiredModal}
        title="لازم تسجل دخول الأول"
        message="عشان تقدر تطلب الكتاب، لازم يكون عندك حساب ومسجل دخول."
        confirmText="تسجيل الدخول"
        onConfirm={() => {
          setShowLoginRequiredModal(false);
          navigate("/login");
        }}
        onCancel={() => setShowLoginRequiredModal(false)}
      />

      {/* ---------- Delete Confirmation Modal ---------- */}
      <ConfirmModal
        isOpen={!!bookToDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد إنك عايز تحذف كتاب "${bookToDelete?.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={confirmDeleteBook}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
}

export default BooksReservation;
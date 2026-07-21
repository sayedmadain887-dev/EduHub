const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const groupRoutes = require("./routes/groupRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookRequestRoutes = require("./routes/bookRequestRoutes");
const materialRoutes = require("./routes/materialRouter");
const announcementRoutes = require("./routes/announcementRoutes");
const adminLogRoutes = require("./routes/adminLogRoutes");

connectDB();

const app = express();

// لو شغال ورا proxy (Render / Railway / Nginx) عشان rate limiting يشتغل صح
app.set("trust proxy", 1);

// ---------- Core Middlewares ----------
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.set("etag", false);
app.use(mongoSanitize());
app.use(hpp());

// Rate limiter عام لكل الـ API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "طلبات كتير جدًا، حاول تاني بعد شوية" },
});
app.use("/api", globalLimiter);

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin-log", adminLogRoutes);

app.get("/", (req, res) => {
  res.json({ message: "EduHub Backend is running successfully 🚀" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "المسار غير موجود" });
});

// ---------- Error Handlers ----------
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "حدث خطأ غير متوقع"
      : err.message,
  });
});
app.get("/loaderio-3e93df04996fab60084de1a85ef739d9.txt", (req, res) => {
  res.send("loaderio-3e93df04996fab60084de1a85ef739d9");
});
// ---------- Server Start ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
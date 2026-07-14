const rateLimit = require("express-rate-limit");

// Applies strict limits on auth routes to prevent brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 10 requests per window
  message: {
    message: "محاولات كتير جدًا، حاول تاني بعد 5 دقيقة",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
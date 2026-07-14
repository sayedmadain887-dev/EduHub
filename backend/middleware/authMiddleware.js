const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No Token
    if (!token) {
      return res.status(401).json({
        message: "يرجى تسجيل الدخول أولاً",
      });
    }

    // Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get User Without Password
    req.user = await User.findById(
      decoded.id
    ).select("-password");

    // User Not Found
    if (!req.user) {
      return res.status(401).json({
        message: "الحساب غير متاح",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error
    );

    return res.status(401).json({
      message:
        "انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى",
    });
  }
};

module.exports = protect;
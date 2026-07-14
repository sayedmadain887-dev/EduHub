const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "يرجى تسجيل الدخول أولاً",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      message: "حدث خطأ في السيرفر",
    });
  }
};

module.exports = adminOnly;
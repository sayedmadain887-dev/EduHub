const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  getProfileData,
  updateProfile
} = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimiter");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema, updateProfileSchema } = require("../validators/userValidator");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

router.get("/me", protect, getMe);
router.get("/profile-data", protect, getProfileData);

router.put("/update", protect, authLimiter, validate(updateProfileSchema), updateProfile);

module.exports = router;
const User = require("../models/User");
const generateStudentCode = require("../utils/generateStudentCode");
const generateToken = require("../utils/generateToken");
const Booking = require("../models/Booking");
const BookRequest = require("../models/BookRequest");

/**
 * @desc   Register a new user (student by default)
 * @route  POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // رسالة عامة عشان منسربش إن الإيميل موجود فعلاً (user enumeration)
      return res.status(400).json({ message: "تعذر إنشاء الحساب بالبيانات المدخلة" });
    }

    const studentCode = await generateStudentCode();

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      studentCode,
    });

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        studentCode: newUser.studentCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "حصل خطأ أثناء إنشاء الحساب" });
  }
};

/**
 * @desc   Login an existing user
 * @route  POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        studentCode: user.studentCode,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "حصل خطأ أثناء تسجيل الدخول" });
  }
};

const getProfileData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const bookings = await Booking.find({ student: req.user.id })
      .populate("group", "groupName centerName")
      .sort({ sessionDate: -1 });

    const bookRequests = await BookRequest.find({ student: req.user.id })
      .populate("book", "name")
      .sort({ requestDate: -1 });

    res.status(200).json({ user, bookings, bookRequests });
  } catch (error) {
    console.error("Get Profile Data Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get Me Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // منع تكرار الإيميل عند التعديل
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ message: "تعذر تحديث البيانات بالمدخلات الحالية" });
      }
      user.email = email.toLowerCase();
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;
    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.status(200).json({ message: "تم تعديل البيانات بنجاح", user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { registerUser, loginUser, getMe, getProfileData, updateProfile };
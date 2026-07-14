import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import styles from "./Register.module.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { register:registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const passwordValue = watch("password");

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  /**
   * Handles form submission.
   * NOTE: Placeholder until the backend API is connected.
   * Will later send a POST request to /api/auth/register,
   * where the backend will also check for duplicate email/phone.
   */
  const onSubmit = async (data) => {
  setServerError("");
  try {
    await registerUser(data);
    navigate("/");
  } catch (error) {
    setServerError(error.response?.data?.message || "حصل خطأ، حاول تاني");
  }
};

  return (
    <div className={styles.pageWrapper}>
      {/* ---------- Left Side: Branding ---------- */}
      <div className={styles.brandSide}>
        <h1 className={styles.brandTitle}>EduHub</h1>
        <p className={styles.brandText}>
          سجّل حسابك دلوقتي وابدأ رحلتك التعليمية معنا.
        </p>
      </div>

      {/* ---------- Right Side: Register Form ---------- */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>إنشاء حساب جديد</h2>
          <p className={styles.formSubtitle}>
            سجل بياناتك عشان تبدأ تستخدم المنصة
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* ---------- Full Name ---------- */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>الاسم بالكامل</label>
              <div className={styles.inputWrapper}>
                <PersonIcon className={styles.inputIcon} fontSize="small" />
                <input
                  type="text"
                  placeholder="اسمك بالكامل"
                  className={styles.input}
                  {...register("fullName", {
                    required: "الاسم مطلوب",
                    minLength: {
                      value: 3,
                      message: "الاسم لازم يكون 3 حروف على الأقل",
                    },
                    pattern: {
                      value: /^[a-zA-Zء-ي\s]+$/,
                      message: "الاسم لازم يكون حروف بس، من غير أرقام أو رموز",
                    },
                  })}
                />
              </div>
              {errors.fullName && (
                <span className={styles.errorText}>
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* ---------- Email ---------- */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>البريد الإلكتروني</label>
              <div className={styles.inputWrapper}>
                <EmailIcon className={styles.inputIcon} fontSize="small" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  className={styles.input}
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "صيغة البريد الإلكتروني غير صحيحة",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <span className={styles.errorText}>
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* ---------- Phone Number ---------- */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>رقم التليفون</label>
              <div className={styles.inputWrapper}>
                <PhoneIcon className={styles.inputIcon} fontSize="small" />
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  className={styles.input}
                  {...register("phone", {
                    required: "رقم التليفون مطلوب",
                    pattern: {
                      value: /^01[0-2,5]{1}[0-9]{8}$/,
                      message: "رقم التليفون غير صحيح",
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <span className={styles.errorText}>
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* ---------- Password ---------- */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>كلمة المرور</label>
              <div className={styles.inputWrapper}>
                <LockIcon className={styles.inputIcon} fontSize="small" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: {
                      value: 8,
                      message: "كلمة المرور لازم تكون 8 حروف على الأقل",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "لازم تحتوي على حرف كبير وحرف صغير ورقم على الأقل ا",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className={styles.eyeButton}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
              <span className={styles.hintText}>
                 حروف على الأقل، وتحتوي على حرف كبير وحرف صغير ورقم
              </span>
              {errors.password && (
                <span className={styles.errorText}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* ---------- Confirm Password ---------- */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>تأكيد كلمة المرور</label>
              <div className={styles.inputWrapper}>
                <LockIcon className={styles.inputIcon} fontSize="small" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.input}
                  {...register("confirmPassword", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: (value) =>
                      value === passwordValue || "كلمتا المرور غير متطابقتين",
                  })}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className={styles.eyeButton}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* ---------- Server Error ---------- */}
            {serverError && (
              <div className={styles.serverError}>{serverError}</div>
            )}

            {/* ---------- Submit Button ---------- */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </button>
          </form>

          <p className={styles.switchText}>
            عندك حساب فعلاً؟{" "}
            <Link to="/login" className={styles.switchLink}>
              سجل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import styles from "./Login.module.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const togglePassword = () => setShowPassword((prev) => !prev);

  /**
   * Handles form submission.
   * NOTE: This is a placeholder until the backend API is connected.
   * It will later send a POST request to /api/auth/login and
   * store the returned JWT token.
   */
  const onSubmit = async (data) => {
  setServerError("");
  try {
    await login(data.email, data.password);
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
          منصتك الشاملة لحجز السناتر، الكتب، والمواد التعليمية.
        </p>
      </div>

      {/* ---------- Right Side: Login Form ---------- */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>تسجيل الدخول</h2>
          <p className={styles.formSubtitle}>
            سجل دخولك عشان تكمل رحلتك التعليمية
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* ---------- Email Field ---------- */}
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

            {/* ---------- Password Field ---------- */}
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
                      value: 6,
                      message: "كلمة المرور لازم تكون 8 حروف على الأقل",
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
              {errors.password && (
                <span className={styles.errorText}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* ---------- Server Error Message ---------- */}
            {serverError && (
              <div className={styles.serverError}>{serverError}</div>
            )}

            {/* ---------- Submit Button ---------- */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className={styles.switchText}>
            معندكش حساب؟{" "}
            <Link to="/register" className={styles.switchLink}>
              سجل دلوقتي
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
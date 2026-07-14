import styles from "./ConfirmModal.module.css";

/**
 * Reusable confirmation modal.
 * Used for: Logout confirmation, Save changes confirmation, etc.
 *
 * Props:
 * - isOpen: boolean, controls visibility
 * - title: string, modal heading
 * - message: string, description text
 * - confirmText: string, label for confirm button
 * - onConfirm: function, called when user confirms
 * - onCancel: function, called when user cancels/closes
 * - requirePassword: boolean, if true shows a password input
 * - password / onPasswordChange: controlled password field (optional)
 * - error: string, shown if password is wrong
 */
function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "تأكيد",
  onConfirm,
  onCancel,
  requirePassword = false,
  password = "",
  onPasswordChange,
  error = "",
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {requirePassword && (
          <div className={styles.passwordField}>
            <input
              type="password"
              placeholder="اكتب كلمة المرور للتأكيد"
              value={password}
              onChange={onPasswordChange}
              className={styles.passwordInput}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            إلغاء
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ContentCopyOffIcon from "@mui/icons-material/Block";

import styles from "./Profile.module.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [centerBookings, setCenterBookings] = useState([]);
  const [bookRequests, setBookRequests] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fetch real profile data (user + bookings + book requests) on page load.
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get("/auth/profile-data");
        setUserData(res.data.user);
        setCenterBookings(res.data.bookings);
        setBookRequests(res.data.bookRequests);
        setEditForm({
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          phone: res.data.user.phone,
        });
      } catch (error) {
        console.error("Fetch Profile Error:", error.message);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (isPageLoading) {
    return <div className={styles.profilePage}>جاري التحميل...</div>;
  }

  if (!userData) {
    return <div className={styles.profilePage}>حصل خطأ في تحميل البيانات</div>;
  }

  const firstLetter = userData.fullName.trim().charAt(0);

  /* ---------------- Edit Form Handlers ---------------- */
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setPasswordError("");
    setConfirmPassword("");
    setShowEditModal(true);
  };

  /**
   * Confirms profile changes.
   * NOTE: Placeholder — will later verify the password against
   * the backend before actually saving the new data.
   */
 const handleConfirmEdit = async () => {
  if (!confirmPassword) {
    setPasswordError("لازم تكتب كلمة المرور للتأكيد");
    return;
  }

  try {
    const res = await api.put("/auth/update", { ...editForm, password: confirmPassword });
    setUserData(res.data.user);
    setIsEditing(false);
    setShowEditModal(false);
    setPasswordError("");
  } catch (error) {
    setPasswordError(error.response?.data?.message || "حصل خطأ");
  }
};

  /* ---------------- Logout Handlers ---------------- */
  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* ================= Header: Avatar + Basic Info ================= */}
        <div className={styles.headerCard}>
          <div className={styles.avatar}>{firstLetter}</div>

          <div className={styles.headerInfo}>
            <h2 className={styles.userName}>{userData.fullName}</h2>
            <p className={styles.userEmail}>{userData.email}</p>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogoutClick}>
            <LogoutIcon fontSize="small" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* ================= Student Code Card ================= */}
        <div className={styles.codeCard}>
          <p className={styles.codeLabel}>كود الطالب الخاص بيك</p>
          <div className={styles.codeValue} onCopy={(e) => e.preventDefault()}>
            {userData.studentCode}
          </div>
          <p className={styles.codeInstruction}>
               احتفظ بالكود ده كويس، هتستخدمه عشان تستلم كتبك من السنتر
          </p>
          <div className={styles.codeNote}>
            <ContentCopyOffIcon fontSize="small" />
            <span>الكود ده خاص بيك وغير قابل للنسخ</span>
          </div>
        </div>

        {/* ================= Personal Info Section ================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>البيانات الشخصية</h3>
            {!isEditing && (
              <button className={styles.editBtn} onClick={handleEditClick}>
                <EditIcon fontSize="small" />
                <span>تعديل</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الاسم</span>
                <span className={styles.infoValue}>{userData.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>البريد الإلكتروني</span>
                <span className={styles.infoValue}>{userData.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>رقم التليفون</span>
                <span className={styles.infoValue}>{userData.phone}</span>
              </div>
            </div>
          ) : (
            <div className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>الاسم</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>رقم التليفون</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.editActions}>
                <button
                  className={styles.cancelEditBtn}
                  onClick={() => setIsEditing(false)}
                >
                  إلغاء
                </button>
                <button className={styles.saveBtn} onClick={handleSaveClick}>
                  حفظ التعديلات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= Center Bookings Section ================= */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <ApartmentIcon fontSize="small" /> حجوزات السناتر
          </h3>

          {centerBookings?.length === 0 ? (
            <p className={styles.emptyText}>مفيش حجوزات لسه</p>
          ) : (
            <div className={styles.bookingsList}>
              {centerBookings?.map((booking) => (
                <div key={booking._id} className={styles.bookingItem}>
                  <div>
                    <p className={styles.bookingName}>
                      {booking.group?.groupName} — {booking.group?.centerName}
                    </p>
                    <p className={styles.bookingDate}>
                      {new Date(booking.sessionDate).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span
                    className={
                      booking.status === "confirmed"
                        ? styles.statusConfirmed
                        : styles.statusPending
                    }
                  >
                    {booking.status === "confirmed" ? "مؤكد" : "معلق"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= Book Requests Section ================= */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <MenuBookIcon fontSize="small" /> طلبات الكتب
          </h3>

          {bookRequests?.length === 0 ? (
            <p className={styles.emptyText}>مفيش طلبات لسه</p>
          ) : (
            <div className={styles.bookingsList}>
              {bookRequests?.map((request) => (
                <div key={request._id} className={styles.bookingItem}>
                  <div>
                    <p className={styles.bookingName}>{request.book?.name}</p>
                    <p className={styles.bookingDate}>
                      {new Date(request.requestDate).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span
                    className={
                      request.status === "confirmed"
                        ? styles.statusConfirmed
                        : styles.statusPending
                    }
                  >
                    {request.status === "confirmed" ? "تم الاستلام" : "معلق"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= Logout Confirm Modal ================= */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="تسجيل الخروج"
        message="متأكد إنك عايز تخرج من حسابك؟ هتحتاج تسجل دخول تاني عشان تشوف حجوزاتك وطلباتك."
        confirmText="خروج"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* ================= Edit Confirm Modal ================= */}
      <ConfirmModal
        isOpen={showEditModal}
        title="تأكيد التعديل"
        message="اكتب كلمة المرور بتاعتك عشان تأكد حفظ التعديلات دي."
        confirmText="حفظ"
        onConfirm={handleConfirmEdit}
        onCancel={() => setShowEditModal(false)}
        requirePassword
        password={confirmPassword}
        onPasswordChange={(e) => setConfirmPassword(e.target.value)}
        error={passwordError}
      />
    </div>
  );
}

export default Profile;
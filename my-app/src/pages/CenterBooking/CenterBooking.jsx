import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./CenterBooking.module.css";

const GRADE_OPTIONS = ["سنة أولى", "سنة تانية", "سنة ثالثة"];

function CenterBooking() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newGroup, setNewGroup] = useState({
    groupName: "",
    centerName: "",
    days: "",
    grade: GRADE_OPTIONS[0],
    notes: "",
    startDate: "",
    isNew: false,
    image: "",
  });

  const [newTimeSlots, setNewTimeSlots] = useState([{ time: "", capacity: "" }]);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  /* ---------------- Fetch Groups from Backend ---------------- */
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        setGroups(res.data);
      } catch (error) {
        console.error("Fetch Groups Error:", error.message);
      }
    };

    fetchGroups();
  }, []);

  /* ---------------- Helpers ---------------- */
  const isSlotFull = (slot) =>
    slot.capacity !== null && slot.bookedCount >= slot.capacity;

  /* ---------------- Admin: Add Group Form ---------------- */
  const handleNewGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGroup({
      ...newGroup,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTimeSlotChange = (index, field, value) => {
    const updated = [...newTimeSlots];
    updated[index][field] = value;
    setNewTimeSlots(updated);
  };

  const addTimeSlotField = () => {
    setNewTimeSlots([...newTimeSlots, { time: "", capacity: "" }]);
  };

  const removeTimeSlotField = (index) => {
    setNewTimeSlots(newTimeSlots.filter((_, i) => i !== index));
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/groups", {
        ...newGroup,
        timeSlots: newTimeSlots.map((slot) => ({
          time: slot.time,
          capacity: slot.capacity === "" ? null : Number(slot.capacity),
        })),
      });

      setGroups([res.data.group, ...groups]);
      setNewGroup({
        groupName: "",
        centerName: "",
        days: "",
        grade: GRADE_OPTIONS[0],
        notes: "",
        startDate: "",
        isNew: false,
        image: "",
      });
      setNewTimeSlots([{ time: "", capacity: "" }]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Add Group Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء إضافة المجموعة");
    }
  };

  /* ---------------- Student: Booking ---------------- */
  const openGroupModal = (group) => {
    if (!isLoggedIn) {
      setShowLoginRequiredModal(true);
      return;
    }

    setSelectedGroup(group);
    setSelectedTime(null);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime) return;

    try {
      await api.post("/bookings", {
        groupId: selectedGroup._id,
        timeSlot: selectedTime,
        sessionDate: new Date().toISOString(),
      });

      setGroups((prev) =>
        prev.map((g) =>
          g._id === selectedGroup._id
            ? {
                ...g,
                timeSlots: g.timeSlots.map((slot) =>
                  slot.time === selectedTime
                    ? { ...slot, bookedCount: slot.bookedCount + 1 }
                    : slot
                ),
              }
            : g
        )
      );

      setSuccessMessage(
        `تم الحجز في ${selectedGroup.groupName} — الساعة ${selectedTime}`
      );
      setShowBookingModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Booking Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء الحجز");
    }
  };

  const requestDeleteGroup = (group, e) => {
    e.stopPropagation();
    setGroupToDelete(group);
  };

  const confirmDeleteGroup = async () => {
    try {
      await api.delete(`/groups/${groupToDelete._id}`);
      setGroups(groups.filter((g) => g._id !== groupToDelete._id));
      setGroupToDelete(null);
    } catch (error) {
      console.error("Delete Group Error:", error.message);
      alert(error.response?.data?.message || "حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ---------- Page Header ---------- */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>احجز مكانك في السنتر</h1>
          <p className={styles.pageSubtitle}>
            اختار المجموعة والميعاد المناسب لوقتك
          </p>

          {isAdmin && (
            <button
              className={styles.addCenterBtn}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              <AddIcon fontSize="small" />
              <span>{showAddForm ? "إلغاء" : "إضافة مجموعة جديدة"}</span>
            </button>
          )}
        </div>

        {/* ---------- Admin: Add Group Form ---------- */}
        {isAdmin && showAddForm && (
          <form className={styles.addForm} onSubmit={handleAddGroup}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="groupName"
                placeholder="اسم المجموعة"
                value={newGroup.groupName}
                onChange={handleNewGroupChange}
                className={styles.formInput}
                required
              />
              <input
                type="text"
                name="centerName"
                placeholder="اسم السنتر"
                value={newGroup.centerName}
                onChange={handleNewGroupChange}
                className={styles.formInput}
                required
              />
            </div>

            <input
              type="url"
              name="image"
              placeholder="رابط صورة السنتر"
              value={newGroup.image}
              onChange={handleNewGroupChange}
              className={styles.formInput}
              required
            />

            <div className={styles.formRow}>
              <input
                type="text"
                name="days"
                placeholder="الأيام (مثال: السبت والأربعاء)"
                value={newGroup.days}
                onChange={handleNewGroupChange}
                className={styles.formInput}
                required
              />

              <select
                name="grade"
                value={newGroup.grade}
                onChange={handleNewGroupChange}
                className={styles.formInput}
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <input
                type="date"
                name="startDate"
                value={newGroup.startDate}
                onChange={handleNewGroupChange}
                className={styles.formInput}
                required
              />

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={newGroup.isNew}
                  onChange={handleNewGroupChange}
                />
                <span>مجموعة جديدة 🔥</span>
              </label>
            </div>

            <textarea
              name="notes"
              placeholder="ملاحظات (اختياري)"
              value={newGroup.notes}
              onChange={handleNewGroupChange}
              className={styles.formTextarea}
              rows={2}
            />

            <div className={styles.timeSlotsSection}>
              <p className={styles.timeSlotsLabel}>المواعيد المتاحة</p>
              <p className={styles.timeSlotsHint}>
                عدد الطلاب اختياري — لو سبته فاضي، الميعاد يفضل مفتوح من غير حد أقصى
              </p>

              {newTimeSlots.map((slot, index) => (
                <div key={index} className={styles.timeSlotRow}>
                  <input
                    type="text"
                    placeholder="الساعة (مثال: 6:00)"
                    value={slot.time}
                    onChange={(e) =>
                      handleTimeSlotChange(index, "time", e.target.value)
                    }
                    className={styles.formInput}
                    required
                  />
                  <input
                    type="number"
                    placeholder="عدد الطلاب (اختياري)"
                    value={slot.capacity}
                    onChange={(e) =>
                      handleTimeSlotChange(index, "capacity", e.target.value)
                    }
                    className={styles.formInput}
                    min="1"
                  />
                  {newTimeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlotField(index)}
                      className={styles.removeSlotBtn}
                      aria-label="حذف الميعاد ده"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addTimeSlotField}
                className={styles.addSlotBtn}
              >
                <AddIcon fontSize="small" />
                <span>إضافة ميعاد تاني</span>
              </button>
            </div>

            <button type="submit" className={styles.submitFormBtn}>
              إضافة المجموعة
            </button>
          </form>
        )}

        {/* ---------- Groups Grid ---------- */}
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <div
              key={group._id}
              className={styles.groupCard}
              onClick={() => openGroupModal(group)}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={group.image}
                  alt={group.groupName}
                  className={styles.cardImage}
                />
                {group.isNew && (
                  <div className={styles.newBadge}>🔥 جديد</div>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.gradeTag}>{group.grade}</div>

                <h3 className={styles.groupName}>{group.groupName}</h3>

                <p className={styles.groupDetail}>
                  <LocationOnIcon fontSize="small" />
                  <span>{group.centerName}</span>
                </p>

                <p className={styles.groupDetail}>
                  <EventIcon fontSize="small" />
                  <span>{group.days}</span>
                </p>

                <p className={styles.groupDetail}>
                  <CalendarTodayIcon fontSize="small" />
                  <span>
                    يبدأ من {new Date(group.startDate).toLocaleDateString("ar-EG")}
                  </span>
                </p>

                {group.notes && (
                  <p className={styles.groupNotes}>{group.notes}</p>
                )}

                {/* زرار الحذف - بيظهر بس للـ admin */}
                {isAdmin && (
                  <button
                    className={styles.deleteGroupBtn}
                    onClick={(e) => requestDeleteGroup(group, e)}
                    aria-label="حذف المجموعة"
                  >
                    <DeleteIcon fontSize="small" />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Booking Modal (Choose Time) ---------- */}
      {showBookingModal && selectedGroup && (
        <div
          className={styles.overlay}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className={styles.bookingModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>{selectedGroup.groupName}</h3>
            <p className={styles.modalSubtitle}>
              {selectedGroup.centerName} — {selectedGroup.days}
            </p>

            <div className={styles.groupsList}>
              {selectedGroup.timeSlots.map((slot) => {
                const isFull = isSlotFull(slot);
                const isSelected = selectedTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    disabled={isFull}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`${styles.timeOption} ${
                      isSelected ? styles.timeSelected : ""
                    } ${isFull ? styles.timeFull : ""}`}
                  >
                    <span className={styles.timeLabel}>
                      الساعة {slot.time}
                    </span>
                    <span
                      className={
                        isFull ? styles.badgeFull : styles.badgeAvailable
                      }
                    >
                      {isFull ? "مكتملة" : "متاحة"}
                    </span>
                  </button>
                )
              })};
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowBookingModal(false)}
              >
                إلغاء
              </button>
              <button
                className={styles.confirmBtn}
                disabled={!selectedTime}
                onClick={handleConfirmBooking}
              >
                تأكيد الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Success Modal ---------- */}
      <ConfirmModal
        isOpen={showSuccessModal}
        title="تم الحجز بنجاح ✅"
        message={successMessage}
        confirmText="تمام"
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />

      {/* ---------- Login Required Modal ---------- */}
      <ConfirmModal
        isOpen={showLoginRequiredModal}
        title="لازم تسجل دخول الأول"
        message="عشان تقدر تحجز مكانك في المجموعة، لازم يكون عندك حساب ومسجل دخول."
        confirmText="تسجيل الدخول"
        onConfirm={() => {
          setShowLoginRequiredModal(false);
          navigate("/login");
        }}
        onCancel={() => setShowLoginRequiredModal(false)}
      />

      {/* ---------- Delete Confirmation Modal ---------- */}
      <ConfirmModal
        isOpen={!!groupToDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد إنك عايز تحذف مجموعة "${groupToDelete?.groupName}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={confirmDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
      />
    </div>
  );
}

export default CenterBooking;

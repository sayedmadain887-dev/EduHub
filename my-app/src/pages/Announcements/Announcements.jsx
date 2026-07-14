import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAnnouncements } from "../../context/AnnouncementsContext";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import BlockIcon from "@mui/icons-material/Block";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./Announcements.module.css";

export const ANNOUNCEMENT_TYPES = {
  general: { label: "إعلان عام", icon: <CampaignIcon />, color: "#3b82f6" },
  alert: { label: "تنبيه مهم", icon: <WarningAmberIcon />, color: "#dc2626" },
  newMaterial: { label: "ملزمة جديدة", icon: <MenuBookIcon />, color: "#16a34a" },
  newGroup: { label: "مجموعة جديدة", icon: <SchoolIcon />, color: "#7c3aed" },
  cancelled: { label: "إلغاء حصة", icon: <BlockIcon />, color: "#475569" },
  rescheduled: { label: "تغيير موعد", icon: <AccessTimeIcon />, color: "#ea580c" },
};

const PAGE_OPTIONS = [
  { key: "home", label: "الرئيسية" },
  { key: "centers", label: "حجز السناتر" },
  { key: "books", label: "الكتب" },
  { key: "materials", label: "الملازم" },
];

function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { announcements, addAnnouncement, deleteAnnouncement } =
    useAnnouncements();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    type: "general",
    title: "",
    message: "",
    pages: [],
  });
  const [imageFile, setImageFile] = useState(null);

  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleNewAnnouncementChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const handlePageToggle = (pageKey) => {
    setNewAnnouncement((prev) => {
      const alreadySelected = prev.pages.includes(pageKey);
      const updatedPages = alreadySelected
        ? prev.pages.filter((p) => p !== pageKey)
        : [...prev.pages, pageKey];
      return { ...prev, pages: updatedPages };
    });
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("type", newAnnouncement.type);
      formData.append("title", newAnnouncement.title);
      formData.append("message", newAnnouncement.message);
      formData.append("pages", JSON.stringify(newAnnouncement.pages));
      if (imageFile) formData.append("image", imageFile);

      await addAnnouncement(formData);

      setNewAnnouncement({ type: "general", title: "", message: "", pages: [] });
      setImageFile(null);
      setShowAddForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء نشر الإعلان");
    }
  };

  const requestDelete = (id, e) => {
    e.stopPropagation();
    setAnnouncementToDelete(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteAnnouncement(announcementToDelete);
      setAnnouncementToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>الإعلانات</h1>
          <p className={styles.pageSubtitle}>آخر أخبار وتحديثات المستر</p>

          {isAdmin && (
            <button
              className={styles.addBtn}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              <AddIcon fontSize="small" />
              <span>{showAddForm ? "إلغاء" : "إضافة إعلان جديد"}</span>
            </button>
          )}
        </div>

        {isAdmin && showAddForm && (
          <form className={styles.addForm} onSubmit={handleAddAnnouncement}>
            <select
              name="type"
              value={newAnnouncement.type}
              onChange={handleNewAnnouncementChange}
              className={styles.formInput}
            >
              {Object.entries(ANNOUNCEMENT_TYPES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="title"
              placeholder="عنوان الإعلان"
              value={newAnnouncement.title}
              onChange={handleNewAnnouncementChange}
              className={styles.formInput}
              required
            />

            <textarea
              name="message"
              placeholder="نص الإعلان"
              value={newAnnouncement.message}
              onChange={handleNewAnnouncementChange}
              className={styles.formTextarea}
              rows={3}
              required
            />

            <div className={styles.fileInputWrapper}>
              <label className={styles.fileLabel}>
                صورة (اختياري)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className={styles.fileInput}
                />
              </label>
              {imageFile && <span className={styles.fileName}>{imageFile.name}</span>}
            </div>

            <div className={styles.pagesSection}>
              <p className={styles.pagesLabel}>
                يظهر كبانر في الصفحات دي (سيبها فاضية عشان يظهر في كل مكان):
              </p>
              <div className={styles.pagesOptions}>
                {PAGE_OPTIONS.map((page) => (
                  <label key={page.key} className={styles.pageCheckbox}>
                    <input
                      type="checkbox"
                      checked={newAnnouncement.pages.includes(page.key)}
                      onChange={() => handlePageToggle(page.key)}
                    />
                    <span>{page.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submitFormBtn}>
              نشر الإعلان
            </button>
          </form>
        )}

        {sortedAnnouncements.length === 0 ? (
          <p className={styles.emptyText}>مفيش إعلانات جديدة دلوقتي</p>
        ) : (
          <div className={styles.timeline}>
            {sortedAnnouncements.map((item) => {
              const typeConfig = ANNOUNCEMENT_TYPES[item.type];
              const hasImage = Boolean(item.image);

              return (
                <div key={item._id} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <div
                      className={styles.timelineDot}
                      style={{ backgroundColor: typeConfig.color }}
                    >
                      {typeConfig.icon}
                    </div>
                    <div className={styles.timelineLine} />
                  </div>

                  <div
                    className={styles.card}
                    style={
                      hasImage
                        ? {
                            backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.75)), url(${item.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : { borderLeft: `4px solid ${typeConfig.color}` }
                    }
                  >
                   
                    {isAdmin && (
                      <button
                        className={`${styles.deleteBtn} ${
                          hasImage ? styles.deleteBtnOnImage : ""
                        }`}
                        onClick={(e) => requestDelete(item._id, e)}
                        aria-label="حذف الإعلان"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}

                    <div className={styles.cardHeader}>
                      <span
                        className={styles.typeTag}
                        style={{
                          backgroundColor: hasImage
                            ? "rgba(255,255,255,0.15)"
                            : `${typeConfig.color}1A`,
                          color: hasImage ? "#fff" : typeConfig.color,
                        }}
                      >
                        {typeConfig.label}
                      </span>
                      <span
                        className={`${styles.cardDate} ${
                          hasImage ? styles.cardDateOnImage : ""
                        }`}
                      >
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <h3
                      className={`${styles.cardTitle} ${
                        hasImage ? styles.textOnImage : ""
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`${styles.cardMessage} ${
                        hasImage ? styles.textOnImage : ""
                      }`}
                    >
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!announcementToDelete}
        title="حذف الإعلان"
        message="متأكد إنك عايز تمسح الإعلان ده؟ مينفعش ترجعه تاني."
        confirmText="حذف"
        onConfirm={confirmDelete}
        onCancel={() => setAnnouncementToDelete(null)}
      />
    </div>
  );
}

export default Announcements;
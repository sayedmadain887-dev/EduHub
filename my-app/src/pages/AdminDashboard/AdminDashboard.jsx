import { useState, useEffect } from "react";
import { useAdminRecords } from "../../context/AdminRecordsContext";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import api from "../../services/api";


import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./AdminDashboard.module.css";

function AdminDashboard() {
  const {
    centerGroups,
    bookItems,
    fetchCenterGroups,
    fetchGroupStudents,
    toggleCenterStudentStatus,
    saveCenterGroupSnapshot,
    removeStudentFromGroup, // ✅
    fetchBookItems,
    fetchBookRequests,
    toggleBookRequestStatus,
    saveBookRequestsAndClear,
    getVisibleLogEntries,
  } = useAdminRecords();

  const [activeSection, setActiveSection] = useState("centers");
  const [openedItem, setOpenedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const isCenters = activeSection === "centers";
  const items = isCenters ? centerGroups : bookItems;

  const logEntries = getVisibleLogEntries();
  const suspensionCounts = {};
  logEntries.forEach(log => {
    log.entries.forEach(entry => {
      if (entry.status === "pending") {
        suspensionCounts[entry.studentCode] = (suspensionCounts[entry.studentCode] || 0) + 1;
      }
    });
  });

  useEffect(() => {
    fetchCenterGroups();
    fetchBookItems();
  }, []);

  const getConfirmedCount = (list) =>
    list.filter((s) => s.status === "confirmed").length;

  const openItem = (item) => {
    setOpenedItem(item);
    setSearchQuery("");

    if (isCenters) {
      fetchGroupStudents(item._id);
    } else {
      fetchBookRequests(item._id);
    }
  };

  const closeItem = () => setOpenedItem(null);

  const currentList = openedItem
    ? isCenters
      ? openedItem.students || []
      : openedItem.requests || []
    : [];

  const filteredList = currentList.filter((entry) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      query === "" ||
      entry.name.toLowerCase().includes(query) ||
      entry.code.toLowerCase().includes(query)
    );
  });

  const handleToggleStatus = (entryId) => {
    if (isCenters) {
      toggleCenterStudentStatus(openedItem._id, entryId);
    } else {
      toggleBookRequestStatus(openedItem._id, entryId);
    }

    setOpenedItem((prev) => {
      const listKey = isCenters ? "students" : "requests";
      return {
        ...prev,
        [listKey]: prev[listKey].map((entry) =>
          entry.id === entryId
            ? { ...entry, status: entry.status === "confirmed" ? "pending" : "confirmed" }
            : entry
        ),
      };
    });
  };

  // ✅ دالة حذف الطالب من الجلسة
  const handleDeleteStudent = async (entry) => {
    if (!window.confirm(`تحب تحذف "${entry.name}" (كود: ${entry.code}) من الجلسة؟`)) {
      return;
    }

    try {
      if (isCenters) {
        await removeStudentFromGroup(openedItem._id, entry.id); // ✅
      }

      setOpenedItem((prev) => {
        const listKey = isCenters ? "students" : "requests";
        return {
          ...prev,
          [listKey]: prev[listKey].filter((e) => e.id !== entry.id),
        };
      });
    } catch (error) {
      alert("حصل خطأ أثناء الحذف");
      console.error("Delete Error:", error);
    }
  };

  const handleSaveClick = () => setShowSaveConfirm(true);

  const handleConfirmSave = async () => {
    try {
      if (isCenters) {
        await saveCenterGroupSnapshot(openedItem._id);
      } else {
        await saveBookRequestsAndClear(openedItem._id);
        setOpenedItem(null);
      }
      setShowSaveConfirm(false);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء الحفظ");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {!openedItem ? (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>لوحة تحكم الأدمن</h1>
              <p className={styles.pageSubtitle}>
                اختار مجموعة أو كتاب عشان تشوف تفاصيله
              </p>
            </div>

            <div className={styles.sectionToggle}>
              <button
                className={`${styles.sectionBtn} ${
                  isCenters ? styles.sectionBtnActive : ""
                }`}
                onClick={() => setActiveSection("centers")}
              >
                <ApartmentIcon fontSize="small" />
                <span>حجوزات السناتر</span>
              </button>
              <button
                className={`${styles.sectionBtn} ${
                  !isCenters ? styles.sectionBtnActive : ""
                }`}
                onClick={() => setActiveSection("books")}
              >
                <MenuBookIcon fontSize="small" />
                <span>طلبات الكتب</span>
              </button>
            </div>

            <div className={styles.cardsGrid}>
              {items.map((item) => {
                const list = isCenters ? item.students || [] : item.requests || [];
                const confirmedCount = getConfirmedCount(list);
                const totalCount = list.length;
                const progressPercent =
                  totalCount === 0 ? 0 : Math.round((confirmedCount / totalCount) * 100);

                return (
                  <div
                    key={item._id}
                    className={styles.creativeCard}
                    onClick={() => openItem(item)}
                  >
                    <div className={styles.cardGlow} />

                    <div className={styles.progressRing}>
                      <svg viewBox="0 0 60 60" className={styles.progressSvg}>
                        <circle cx="30" cy="30" r="26" className={styles.progressBg} />
                        <circle
                          cx="30"
                          cy="30"
                          r="26"
                          className={styles.progressFill}
                          style={{
                            strokeDasharray: 163,
                            strokeDashoffset: 163 - (163 * progressPercent) / 100,
                          }}
                        />
                      </svg>
                      <span className={styles.progressText}>{progressPercent}%</span>
                    </div>

                    <h3 className={styles.cardName}>
                      {isCenters ? item.groupName : item.name}
                    </h3>
                    {isCenters && (
                      <p className={styles.cardSubtext}>{item.centerName}</p>
                    )}

                    <div className={styles.cardStats}>
                      <span>{totalCount} طالب</span>
                      <span className={styles.dotSeparator}>•</span>
                      <span>{confirmedCount} مؤكد</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button className={styles.backBtn} onClick={closeItem}>
              <ArrowBackIcon fontSize="small" />
              <span>رجوع</span>
            </button>

            <h2 className={styles.detailTitle}>
              {isCenters ? openedItem.groupName : openedItem.name}
            </h2>

            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} fontSize="small" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {filteredList.length === 0 ? (
              <p className={styles.emptyText}>مفيش نتائج مطابقة</p>
            ) : (
              <div className={styles.timeline}>
                {filteredList.map((entry, index) => {
                  const isConfirmed = entry.status === "confirmed";
                  const suspensionCount = suspensionCounts[entry.code] || 0;

                  return (
                    <div key={entry.id} className={styles.timelineItem}>
                      <div className={styles.timelineMarker}>
                        <div
                          className={`${styles.timelineDot} ${
                            isConfirmed ? styles.dotConfirmed : styles.dotPending
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index !== filteredList.length - 1 && (
                          <div className={styles.timelineLine} />
                        )}
                      </div>

                      <div className={styles.entryCard}>
                        <div className={styles.entryInfo}>
                          <div className={styles.entryNameRow}>
                            <span className={styles.entryName}>{entry.name}</span>
                            <span className={styles.entryCode}>{entry.code}</span>
                          </div>
                          <span className={styles.entryDate}>
                            {entry.sessionDate || entry.date}
                          </span>
                        </div>

                        <div className={styles.entryActions}>
                          {suspensionCount > 2 && (
                            <span className={styles.suspensionCount}>
                              معلق {suspensionCount} مرات
                            </span>
                          )}

                          <button
                            onClick={() => handleToggleStatus(entry.id)}
                            className={`${styles.statusBtn} ${
                              isConfirmed ? styles.statusConfirmed : styles.statusPending
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircleIcon fontSize="small" />
                            ) : (
                              <RadioButtonUncheckedIcon fontSize="small" />
                            )}
                            <span>{isConfirmed ? "مؤكد" : "معلق"}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(entry)}
                            className={styles.deleteBtn}
                            title="حذف من الجلسة"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentList.length > 0 && (
              <div className={styles.saveWrapper}>
                <button className={styles.saveBtn} onClick={handleSaveClick}>
                  <SaveIcon fontSize="small" />
                  <span>حفظ ونقل للسجل</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showSaveConfirm}
        title="حفظ ونقل للسجل"
        message={
          isCenters
            ? "هيتحفظ نسخة من الحضور الحالي في السجل. الطلاب هيفضلوا مسجلين في المجموعة زي ما هما."
            : "هيتم نقل كل الطلبات دي للسجل، والليستة هترجع فاضية عشان تبدأ من جديد."
        }
        confirmText="حفظ"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
}

export default AdminDashboard;
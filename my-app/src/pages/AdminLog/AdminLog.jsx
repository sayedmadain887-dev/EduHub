import { useState, useMemo } from "react";
import { useAdminRecords } from "../../context/AdminRecordsContext";
import { useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";

import styles from "./AdminLog.module.css";

function AdminLog() {
  const { getVisibleLogEntries, fetchLogEntries } = useAdminRecords();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogEntries();
  }, []);

  const visibleEntries = getVisibleLogEntries();

  const formatSavedTime = (timestamp) =>
    new Date(timestamp).toLocaleString("ar-EG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query === "") {
      return visibleEntries;
    }

    return visibleEntries
      .map((logEntry) => {
        const matchingStudents = logEntry.entries.filter(
          (e) =>
            e.studentName.toLowerCase().includes(query) ||
            e.studentCode.toLowerCase().includes(query)
        );

        if (matchingStudents.length === 0) return null;

        return { ...logEntry, entries: matchingStudents };
      })
      .filter(Boolean);
  }, [visibleEntries, searchQuery]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <HistoryIcon className={styles.headerIcon} />
          <h1 className={styles.pageTitle}>سجل الحجوزات والطلبات</h1>
          <p className={styles.pageSubtitle}>
            سجلات الكتب بتتمسح تلقائيًا بعد 48 ساعة — سجلات السناتر تفضل محفوظة
          </p>
        </div>

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

        {filteredEntries.length === 0 ? (
          <p className={styles.emptyText}>مفيش سجلات متاحة دلوقتي</p>
        ) : (
          <div className={styles.logList}>
            {filteredEntries.map((logEntry) => (
              <div key={logEntry.id} className={styles.logGroup}>
                <div className={styles.logGroupHeader}>
                  <span className={styles.logGroupLabel}>{logEntry.label}</span>
                  <span className={styles.logGroupMeta}>
                    {logEntry.expires ? "مؤقت (48 ساعة)" : "دائم"} —{" "}
                    {formatSavedTime(logEntry.savedAt)}
                  </span>
                </div>

                {logEntry.entries.map((student) => (
                  <div
                    key={`${logEntry.id}-${student.studentCode}-${student.studentName}`}
                    className={styles.studentRow}
                  >
                    <div>
                      <span className={styles.studentName}>{student.studentName}</span>
                      <span className={styles.studentCode}>{student.studentCode}</span>
                    </div>
                    <span
                      className={
                        student.status === "confirmed"
                          ? styles.statusConfirmed
                          : styles.statusPending
                      }
                    >
                      {student.status === "confirmed" ? "مؤكد" : "معلق"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLog;
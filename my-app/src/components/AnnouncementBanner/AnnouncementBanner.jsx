import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnnouncements } from "../../context/AnnouncementsContext";

import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import BlockIcon from "@mui/icons-material/Block";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import styles from "./AnnouncementBanner.module.css";

export const ANNOUNCEMENT_TYPES = {
  general: { label: "إعلان عام", icon: <CampaignIcon fontSize="small" />, color: "#3b82f6" },
  alert: { label: "تنبيه مهم", icon: <WarningAmberIcon fontSize="small" />, color: "#dc2626" },
  newMaterial: { label: "ملزمة جديدة -كتاب جديد", icon: <MenuBookIcon fontSize="small" />, color: "#16a34a" },
  
  newGroup: { label: "مجموعة جديدة", icon: <SchoolIcon fontSize="small" />, color: "#7c3aed" },
  cancelled: { label: "إلغاء حصة", icon: <BlockIcon fontSize="small" />, color: "#475569" },
  rescheduled: { label: "تغيير موعد", icon: <AccessTimeIcon fontSize="small" />, color: "#ea580c" },
};

const PATH_TO_PAGE_KEY = {
  "/": "home",
  "/centers": "centers",
  "/books": "books",
  "/materials": "materials",
  "/announcements": "announcements",
};

// How long the banner stays visible before auto-hiding, in seconds.
const AUTO_HIDE_SECONDS = 9;

function AnnouncementBanner() {
  const location = useLocation();
  const { announcements } = useAnnouncements();

  // Tracks which announcement IDs have auto-hidden due to the timer.
  const [autoHiddenIds, setAutoHiddenIds] = useState([]);

  const currentPageKey = PATH_TO_PAGE_KEY[location.pathname];

  const bannersForThisPage = announcements.filter((a) => {
    if (autoHiddenIds.includes(a._id)) return false;
    if (a.pages === "all") return true;
    if (Array.isArray(a.pages)) return a.pages.includes(currentPageKey);
    return false;
  });

  // Start a 60-second auto-hide timer for each banner currently showing.
  useEffect(() => {
    const timers = bannersForThisPage.map((item) =>
      setTimeout(() => {
        setAutoHiddenIds((prev) => [...prev, item._id]);
      }, AUTO_HIDE_SECONDS * 1000)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements, location.pathname]);

  if (bannersForThisPage.length === 0) return null;

  return (
    <div className={styles.bannerWrapper}>
      {bannersForThisPage.map((item) => {
        const typeConfig = ANNOUNCEMENT_TYPES[item.type];

        return (
          <div
            key={item._id}
            className={styles.banner}
            style={{ borderRight: `4px solid ${typeConfig.color}` }}
          >
            <div
              className={styles.iconWrapper}
              style={{
                backgroundColor: `${typeConfig.color}1A`,
                color: typeConfig.color,
              }}
            >
              {typeConfig.icon}
            </div>

            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>{item.title}</span>
              <span className={styles.bannerMessage}>{item.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnnouncementBanner;
import { Link } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";

import styles from "./Footer.module.css";

const BROWSE_LINKS = [
  { label: "الرئيسية", path: "/", icon: <HomeIcon fontSize="small" /> },
  { label: "حجز السناتر", path: "/centers", icon: <ApartmentIcon fontSize="small" /> },
  { label: "الكتب", path: "/books", icon: <MenuBookIcon fontSize="small" /> },
  { label: "الملازم", path: "/materials", icon: <FolderIcon fontSize="small" /> },
];

const ACCOUNT_LINKS = [
  { label: "البروفايل", path: "/profile", icon: <PersonIcon fontSize="small" /> },
  { label: "تسجيل الدخول", path: "/login", icon: <LoginIcon fontSize="small" /> },
  { label: "إنشاء حساب", path: "/register", icon: <PersonAddIcon fontSize="small" /> },
];

const CONTACT_LINKS = [
  {
    label: "اتصل بينا",
    value: "01000000000",
    href: "tel:01000000000",
    icon: <PhoneIcon fontSize="small" />,
  },
  {
    label: "واتساب",
    value: "تواصل مباشر",
    href: "https://wa.me/201000000000",
    icon: <WhatsAppIcon fontSize="small" />,
  },
  {
    label: "فيسبوك",
    value: "تابعنا",
    href: "https://facebook.com/eduhub",
    icon: <FacebookIcon fontSize="small" />,
  },
];

function TimelineColumn({ title, items, isExternal }) {
  return (
    <div className={styles.column}>
      <p className={styles.columnTitle}>{title}</p>
      <div className={styles.timeline}>
        {items.map((item, index) => (
          <div key={item.label} className={styles.timelineItem}>
            <div className={styles.timelineMarker}>
              <div className={styles.timelineDot}>{item.icon}</div>
              {index !== items.length - 1 && <div className={styles.timelineLine} />}
            </div>

            {isExternal ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={styles.timelineLink}
              >
                <span>{item.label}</span>
                {item.value && (
                  <span className={styles.timelineSubValue}>{item.value}</span>
                )}
              </a>
            ) : (
              <Link to={item.path} className={styles.timelineLink}>
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* ---------- Brand Column ---------- */}
        <div className={styles.column}>
          <div className={styles.logoRow}>
            <SchoolIcon className={styles.logoIcon} />
            <span className={styles.logoText}>EduHub</span>
          </div>
          <p className={styles.tagline}>
            منصتك الشاملة لحجز السناتر، الكتب، والمواد التعليمية.
          </p>
        </div>

        <TimelineColumn title="تصفح الموقع" items={BROWSE_LINKS} />
        <TimelineColumn title="حسابك" items={ACCOUNT_LINKS} />
        <TimelineColumn title="تواصل معانا" items={CONTACT_LINKS} isExternal />
      </div>

      {/* ---------- Credit Line ---------- */}
      <div className={styles.creditSection}>
        <div className={styles.creditBox}>
          <SchoolIcon className={styles.creditLogo} />
          <div className={styles.creditText}>
            <span className={styles.creditEnglish}>
              Under the Supervision of Eng.Madain elsayed
            </span>
            <span className={styles.creditArabic}>تحت إشراف المهندس  مدين</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
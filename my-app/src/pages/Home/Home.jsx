import { Link } from "react-router-dom";
import { useAnnouncements } from "../../context/AnnouncementsContext";
import { ANNOUNCEMENT_TYPES } from "../Announcements/Announcements";

import styles from "./Home.module.css";
import heroImage from "../../assets/images/hero.jpg";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";


/**
 * All editable text content for the Home page's Hero Section.
 */
const HERO_CONTENT = {
  title: "كل اللي تحتاجه لمسيرتك الدراسية في مكان واحد",
  subtitle:
    "نظم وقتك، احجز أماكنك في السناتر، واحصل على المواد العلمية بسهولة وسرعة.",
  primaryButtonText: "احجز دلوقتي",
  primaryButtonLink: "/centers",
  secondaryButtonText: "اعرف أكتر",
  secondaryButtonLink: "#services",
  imageAlt: "طالب يذاكر",
};

/**
 * "Why Choose Us" section content.
 */
const WHY_US_CONTENT = {
  title: "ليه تختار EduHub؟",
  items: [
    {
      icon: <EventAvailableIcon fontSize="large" />,
      heading: "احجز في ثواني",
      text: "وفّر وقتك ومجهودك من غير ما تتحرك من مكانك. اختار السنتر والمجموعة اللي تناسبك، وأكّد حجزك في ثواني، أونلاين بالكامل.",
    },
    {
      icon: <MenuBookIcon fontSize="large" />,
      heading: "كل الكتب في مكان واحد",
      text: "خلاص وقت البحث عن الكتب والملازم من مكان لمكان. كل المواد التعليمية بتاعة أساتذتك متوفرة على المنصة، واطلبها بضغطة واحدة.",
    },
    {
      icon: <CloudDownloadIcon fontSize="large" />,
      heading: "ذاكر في أي وقت",
      text: "مش بس كتب — عندنا كمان الملخصات والملازم الرقمية، تحمّلها وتذاكر منها في أي وقت وأي مكان. كل حاجة تخص مستقبلك الدراسي، في مكان واحد.",
    },
  ],
};

/**
 * "How It Works" section content.
 */
const HOW_IT_WORKS_CONTENT = {
  title: "إزاي تستخدم الموقع؟",
  steps: [
    {
      number: "1",
      title: "اعمل حسابك",
      description: "سجل بياناتك في ثواني وابدأ رحلتك التعليمية معانا.",
    },
    {
      number: "2",
      title: "اختار احتياجك",
      description: "احجز مكانك في السنتر، أو اطلب كتبك وملازمك.",
    },
    {
      number: "3",
      title: "استلم واستمتع بالمذاكرة",
      description: "هيوصلك تأكيد فوري، واستلم من السنتر بالكود بتاعك.",
    },
  ],
};

function Home() {
  const { announcements, dismissAnnouncement } = useAnnouncements();

  // Show only the 3 most recent announcements as a preview.
  const recentAnnouncements = [...announcements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className={styles.homePage}>
      {/* ---------- Hero Section ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{HERO_CONTENT.title}</h1>
          <p className={styles.heroSubtitle}>{HERO_CONTENT.subtitle}</p>

          <div className={styles.heroButtons}>
            <Link
              to={HERO_CONTENT.primaryButtonLink}
              className={styles.primaryBtn}
            >
              {HERO_CONTENT.primaryButtonText}
            </Link>

            <a
              href={HERO_CONTENT.secondaryButtonLink}
              className={styles.secondaryBtn}
            >
              {HERO_CONTENT.secondaryButtonText}
            </a>
          </div>
        </div>

        <div className={styles.heroImageWrapper}>
          <img
            src={heroImage}
            alt={HERO_CONTENT.imageAlt}
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* ---------- Why Choose Us Section ---------- */}
      <section id="services" className={styles.whyUsSection}>
        <h2 className={styles.sectionTitle}>{WHY_US_CONTENT.title}</h2>

        <div className={styles.whyUsGrid}>
          {WHY_US_CONTENT.items.map((item, index) => (
            <div key={index} className={styles.whyUsCard}>
              <div className={styles.whyUsIcon}>{item.icon}</div>
              <h3 className={styles.whyUsHeading}>{item.heading}</h3>
              <p className={styles.whyUsText}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How It Works Section ---------- */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>{HOW_IT_WORKS_CONTENT.title}</h2>

        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS_CONTENT.steps.map((step) => (
            <div key={step.number} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Announcements Preview Section ---------- */}
      <section className={styles.announcementsSection}>
        <h2 className={styles.sectionTitle}>آخر الإعلانات</h2>

        {recentAnnouncements.length === 0 ? (
          <p className={styles.emptyText}>مفيش إعلانات جديدة دلوقتي</p>
        ) : (
          <>
            <div className={styles.timeline}>
              {recentAnnouncements.map((item) => {
                const typeConfig = ANNOUNCEMENT_TYPES[item.type];
                const hasImage = Boolean(item.image);

                return (
                  <div key={item.id} className={styles.timelineItem}>
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
                      {/* <button
                        className={`${styles.dismissBtn} ${
                          hasImage ? styles.dismissBtnOnImage : ""
                        }`}
                        onClick={() => dismissAnnouncement(item.id)}
                        aria-label="إخفاء الإعلان"
                      >
                      
                      </button> */}

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
                          {item.date}
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

            <div className={styles.seeAllWrapper}>
              <Link to="/announcements" className={styles.seeAllBtn}>
                شوف كل الإعلانات
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
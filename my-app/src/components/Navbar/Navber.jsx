import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FolderIcon from "@mui/icons-material/Folder";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
import styles from "./Navbar.module.css";

/**
 * Navigation links configuration.

 */
const NAV_LINKS = [
  { label: "Home", path: "/", icon: <HomeIcon fontSize="small" /> },
  {
    label: "Book a Center",
    path: "/centers",
    icon: <ApartmentIcon fontSize="small" />,
  },
  {
    label: "Book a Book",
    path: "/books",
    icon: <MenuBookIcon fontSize="small" />,
  },
  {
    label: "Materials",
    path: "/materials",
    icon: <FolderIcon fontSize="small" />,
  },
  {
    label: "Announcements",
    path: "/announcements",
    icon: <CampaignIcon fontSize="small" />,
  }
];

/**
 * Navbar Component
 * -----------------
 * Responsibilities:
 * 1. Display the site logo and main navigation links.
 * 2. Highlight the currently active page (via NavLink).
 * 3. Show Login/Sign Up buttons OR a Profile button,
 *    depending on the user's authentication state (from AuthContext).
 * 4. Collapse into a hamburger menu on small screens.
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Returns the correct className depending on whether the link is active
  const getLinkClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink;

  /**
   * Renders the authentication section of the navbar:
   * - If logged in: shows a single "My Profile" button.
   * - If logged out: shows "Login" and "Sign Up" buttons.
   */
  const renderAuthButton = (isMobile = false) => {
    const baseClass = isMobile ? "" : styles.desktopOnly;

    if (isLoggedIn) {
      return (
        <NavLink
          to="/profile"
          className={`${styles.profileBtn} ${baseClass}`}
          onClick={isMobile ? closeMenu : undefined}
        >
          <PersonIcon fontSize="small" />
          <span>My Profile</span>
        </NavLink>
      );
    }

    return (
      <div className={`${styles.authButtons} ${baseClass}`}>
        <NavLink
          to="/login"
          className={styles.loginBtn}
          onClick={isMobile ? closeMenu : undefined}
        >
          <LoginIcon fontSize="small" />
          <span>Login</span>
        </NavLink>

        <NavLink
          to="/register"
          className={styles.signUpBtn}
          onClick={isMobile ? closeMenu : undefined}
        >
          <PersonAddIcon fontSize="small" />
          <span>Sign Up</span>
        </NavLink>
      </div>
    );
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* ---------- Logo ---------- */}
        <NavLink to="/" className={styles.navbarLogo}>
          EduHub
        </NavLink>

        {/* ---------- Desktop Navigation Links ---------- */}
        <ul className={`${styles.navbarLinks} ${styles.desktopOnly}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink to={link.path} className={getLinkClass}>
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ---------- Auth Buttons (Desktop) ---------- */}
        {renderAuthButton()}

        {/* ---------- Hamburger Toggle (Mobile) ---------- */}
        <button
          className={`${styles.menuToggle} ${styles.mobileOnly}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* ---------- Mobile Menu ---------- */}
      {isMenuOpen && (
        <ul className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={getLinkClass}
                onClick={closeMenu}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
          <li>{renderAuthButton(true)}</li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
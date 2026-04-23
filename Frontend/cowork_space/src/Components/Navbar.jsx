import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Navbar.module.css";

function Navbar() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState(false);
  const [mobileCitiesOpen, setMobileCitiesOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileRoleOpen, setMobileRoleOpen] = useState(false);
  const [showEnterprise, setShowEnterprise] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const isAdmin = localStorage.getItem("is_admin");
  const username = localStorage.getItem("username");

  const workspaceLinks = [
    { label: "Office Spaces", path: "/workspaces/office" },
    { label: "Coworking Spaces", path: "/workspaces/coworking" },
    { label: "Meeting Rooms", path: "/workspaces/meeting" },
  ];

  const cityLinks = [
    { label: "Hyderabad", value: "Hyderabad" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Updated id: workspace-companies-section */
  const scrollToCompanies = () => {
    const companiesSection = document.getElementById("workspace-companies-section");
    if (companiesSection) {
      companiesSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("workspace-companies-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileWorkspaceOpen(false);
    setMobileCitiesOpen(false);
    setMobileRoleOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const handleUserClick = () => {
    if (token) {
      if (isAdmin === "true") navigate("/admin-dashboard");
      else alert("User profile coming soon 👤");
    } else {
      setShowRoleMenu(r => !r);
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("username");
    alert("Logged out successfully");
    navigate("/");
    closeMobileMenu();
  };

  const handleMyOrders = () => {
    navigate("/my-orders");
    closeMobileMenu();
  };

  const scrollToCities = (city) => {
    const section = document.getElementById("cities");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setShowCities(false);
    closeMobileMenu();
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>

        {/* ── LOGO ── */}
        <h2 className={styles.logo} onClick={() => { navigate("/"); scrollToTop(); }}>
          CoWork
        </h2>

        {/* ── DESKTOP MENU ── */}
        <nav className={styles.menu}>
          <p className={styles.menuItem} onClick={() => { navigate("/"); scrollToTop(); }}>
            Home
          </p>

          <p className={styles.menuItem} onClick={scrollToCompanies}>
            Companies
          </p>

          {/* Enterprise */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowEnterprise(true)}
            onMouseLeave={() => setShowEnterprise(false)}
          >
            <span className={styles.dropdownLabel}>Enterprises</span>
            <span className={styles.arrow}>▼</span>

            {showEnterprise && (
              <div className={styles.dropdownMenu}>
                <p onClick={() => navigate("/Enterprise")}>
                  Enterprise Workspaces
                </p>
                <p onClick={() => navigate("/RightSpace")}>
                  Business Solutions
                </p>
              </div>
            )}
          </div>

          {/* Workspaces */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowWorkspace(true)}
            onMouseLeave={() => setShowWorkspace(false)}
          >
            <span className={styles.dropdownLabel}>Our Gallery</span>
            <span className={styles.arrow}>▼</span>
            {showWorkspace && (
              <div className={styles.dropdownMenu}>
                {workspaceLinks.map((item, i) => (
                  <p key={i} onClick={() => navigate(item.path)}>{item.label}</p>
                ))}
              </div>
            )}
          </div>

          <p className={styles.menuItem} onClick={() => navigate("/amenities")}>
            Amenities
          </p>
        </nav>

        {/* ── DESKTOP RIGHT ── */}
        <div className={styles.right}>
{/* 
          <span className={styles.icon} onClick={() => navigate("/cart")} title="Cart">
            🛒
          </span> */}

          <span className={styles.icon} onClick={handleUserClick} title="Profile">
            👤
          </span>

          {showRoleMenu && (
            <div className={styles.roleMenu}>
              <div onClick={() => { navigate("/auth?type=user"); setShowRoleMenu(false); }}>
                User
              </div>
              <div onClick={() => { navigate("/auth?type=owner"); setShowRoleMenu(false); }}>
                Owner
              </div>
              <div onClick={() => { navigate("/auth?type=admin"); setShowRoleMenu(false); }}>
                Admin
              </div>
            </div>
          )}

          {token ? (
            <div className={styles.userBox}>
              <span className={styles.userName}>Hi, {username || "User"}</span>
              <button className={styles.logoutBtn} onClick={handleMyOrders}>
                My Orders
              </button>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className={styles.btn} onClick={() => navigate("/auth")}>
              Get Started
            </button>
          )}
        </div>

        {/* ── HAMBURGER ── */}
        <button
          className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

      {/* ═══════════════════════════════════
          MOBILE MENU — Full-screen luxury drawer
          ═══════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) closeMobileMenu(); }}
        >
          <div className={styles.mobileMenu}>

            {/* ── Drawer Header ── */}
            <div className={styles.mobileHeader}>
              <div
                className={styles.mobileLogo}
                onClick={() => { handleNavigate("/"); scrollToTop(); }}
              >
                CoWork
              </div>
              {/* <button className={styles.mobileClose} onClick={closeMobileMenu} aria-label="Close menu">
                ✕
              </button> */}
            </div>

            {/* ── User greeting strip (if logged in) ── */}
            {token && username && (
              <div className={styles.mobileUserStrip}>
                <div className={styles.mobileUserAvatar}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className={styles.mobileUserInfo}>
                  <span className={styles.mobileUserGreet}>Welcome back</span>
                  <span className={styles.mobileUserName}>{username}</span>
                </div>
              </div>
            )}

            {/* ── Nav Links ── */}
            <nav className={styles.mobileNav}>

              <div
                className={styles.mobileNavItem}
                onClick={() => { handleNavigate("/"); scrollToTop(); }}
              >
                <span className={styles.mobileNavIcon}>⌂</span>
                <span className={styles.mobileNavLabel}>Home</span>
                <span className={styles.mobileNavArrow}>›</span>
              </div>

              <div className={styles.mobileNavItem} onClick={scrollToCompanies}>
                <span className={styles.mobileNavIcon}>🏢</span>
                <span className={styles.mobileNavLabel}>Companies</span>
                <span className={styles.mobileNavArrow}>›</span>
              </div>

              {/* Enterprises accordion */}
              <div className={styles.mobileAccordion}>
                <div
                  className={`${styles.mobileNavItem} ${mobileRoleOpen ? styles.mobileNavItemOpen : ""}`}
                  onClick={() => setMobileRoleOpen(o => !o)}
                >
                  <span className={styles.mobileNavIcon}>🌐</span>
                  <span className={styles.mobileNavLabel}>Enterprises</span>
                  <span className={`${styles.mobileNavChevron} ${mobileRoleOpen ? styles.chevronOpen : ""}`}>⌄</span>
                </div>
                {mobileRoleOpen && (
                  <div className={styles.mobileAccordionBody}>
                    <div
                      className={styles.mobileSubItem}
                      onClick={() => handleNavigate("/Enterprise")}
                    >
                      <span className={styles.mobileSubDot} />
                      Enterprise Workspaces
                    </div>
                    <div
                      className={styles.mobileSubItem}
                      onClick={() => handleNavigate("/RightSpace")}
                    >
                      <span className={styles.mobileSubDot} />
                      Business Solutions
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery accordion */}
              <div className={styles.mobileAccordion}>
                <div
                  className={`${styles.mobileNavItem} ${mobileWorkspaceOpen ? styles.mobileNavItemOpen : ""}`}
                  onClick={() => setMobileWorkspaceOpen(o => !o)}
                >
                  <span className={styles.mobileNavIcon}>🖼</span>
                  <span className={styles.mobileNavLabel}>Our Gallery</span>
                  <span className={`${styles.mobileNavChevron} ${mobileWorkspaceOpen ? styles.chevronOpen : ""}`}>⌄</span>
                </div>
                {mobileWorkspaceOpen && (
                  <div className={styles.mobileAccordionBody}>
                    {workspaceLinks.map((item, i) => (
                      <div
                        key={i}
                        className={styles.mobileSubItem}
                        onClick={() => handleNavigate(item.path)}
                      >
                        <span className={styles.mobileSubDot} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={styles.mobileNavItem}
                onClick={() => handleNavigate("/amenities")}
              >
                <span className={styles.mobileNavIcon}>✦</span>
                <span className={styles.mobileNavLabel}>Amenities</span>
                <span className={styles.mobileNavArrow}>›</span>
              </div>

              <div
                className={styles.mobileNavItem}
                onClick={() => handleNavigate("/cart")}
              >
                {/* <span className={styles.mobileNavIcon}>🛒</span> */}
                {/* <span className={styles.mobileNavLabel}>Cart</span> */}
                <span className={styles.mobileNavArrow}>›</span>
              </div>

            </nav>

            {/* ── Bottom CTA Zone ── */}
            <div className={styles.mobileBottom}>

              {token ? (
                <>
                  <div
                    className={styles.mobileProfileRow}
                    onClick={() => {
                      isAdmin === "true"
                        ? handleNavigate("/admin-dashboard")
                        : alert("Profile coming soon");
                    }}
                  >
                    <span>{isAdmin === "true" ? "⚙️ Admin Dashboard" : "👤 My Profile"}</span>
                    <span className={styles.mobileNavArrow}>›</span>
                  </div>

                  <button className={styles.mobileOrderBtn} onClick={handleMyOrders}>
                    My Orders
                  </button>
                  <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.mobileLoginLabel}>Login as</p>
                  <div className={styles.mobileRoleTiles}>
                    <div
                      className={styles.mobileRoleTile}
                      onClick={() => handleNavigate("/auth?type=user")}
                    >
                      <span className={styles.mobileRoleTileIcon}>👤</span>
                      <span>User</span>
                    </div>
                    <div
                      className={styles.mobileRoleTile}
                      onClick={() => handleNavigate("/auth?type=owner")}
                    >
                      <span className={styles.mobileRoleTileIcon}>🏢</span>
                      <span>Owner</span>
                    </div>
                    <div
                      className={styles.mobileRoleTile}
                      onClick={() => handleNavigate("/auth?type=admin")}
                    >
                      <span className={styles.mobileRoleTileIcon}>⚙️</span>
                      <span>Admin</span>
                    </div>
                  </div>

                  <button
                    className={styles.mobileStartBtn}
                    onClick={() => handleNavigate("/auth")}
                  >
                    Get Started →
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;

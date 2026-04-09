import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Navbar.module.css";

function Navbar() {
  const [showWorkspace,      setShowWorkspace]      = useState(false);
  const [showCities,         setShowCities]         = useState(false);
  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [mobileWorkspaceOpen,setMobileWorkspaceOpen]= useState(false);
  const [mobileCitiesOpen,   setMobileCitiesOpen]   = useState(false);
  const [showRoleMenu,       setShowRoleMenu]        = useState(false);
  const [mobileRoleOpen,     setMobileRoleOpen]      = useState(false);

  const navigate  = useNavigate();
  const token     = localStorage.getItem("access");
  const isAdmin   = localStorage.getItem("is_admin");
  const username  = localStorage.getItem("username");

  const workspaceLinks = [
    { label: "Office Spaces",    path: "/workspaces/office" },
    { label: "Coworking Spaces", path: "/workspaces/coworking" },
    { label: "Meeting Rooms",    path: "/workspaces/meeting" },
  ];

  const cityLinks = [
    { label: "Hyderabad", value: "Hyderabad" },
    { label: "Bangalore", value: "Bangalore" },
    { label: "Delhi",     value: "Delhi" },
  ];

  /* Close all mobile panels */
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

  /* Desktop profile icon click */
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

  const scrollToClients = () => {
  const section = document.getElementById("workspace-clients-section");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};
  const scrollToCities = (city) => {
    const section = document.getElementById("cities");
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setShowCities(false);
    closeMobileMenu();
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>

        {/* ── LOGO ── */}
        <h2 className={styles.logo} onClick={() => navigate("/")}>
          CoWork
        </h2>

        {/* ── DESKTOP MENU ── */}
        <nav className={styles.menu}>
          <p className={styles.menuItem} onClick={() => navigate("/")}>Home</p>
          <p className={styles.menuItem} onClick={() => navigate("/Enterprise")}>Enterprise</p>
          <p className={styles.menuItem} onClick={scrollToClients}>Companies</p>

          {/* Workspaces */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowWorkspace(true)}
            onMouseLeave={() => setShowWorkspace(false)}
          >
            <span className={styles.dropdownLabel}>Workspaces</span>
            <span className={styles.arrow}>▼</span>
            {showWorkspace && (
              <div className={styles.dropdownMenu}>
                {workspaceLinks.map((item, i) => (
                  <p key={i} onClick={() => navigate(item.path)}>{item.label}</p>
                ))}
              </div>
            )}
          </div>

          {/* Cities */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowCities(true)}
            onMouseLeave={() => setShowCities(false)}
          >
            <span className={styles.dropdownLabel}>Cities</span>
            <span className={styles.arrow}>▼</span>
            {showCities && (
              <div className={styles.dropdownMenu}>
                {cityLinks.map((city, i) => (
                  <p key={i} onClick={() => scrollToCities(city.value)}>{city.label}</p>
                ))}
              </div>
            )}
          </div>

          <p className={styles.menuItem} onClick={() => navigate("/amenities")}>Amenities</p>
        </nav>

        {/* ── DESKTOP RIGHT ── */}
        <div className={styles.right}>

          {/* Cart */}
          <span className={styles.icon} onClick={() => navigate("/cart")} title="Cart">🛒</span>

          {/* Profile / Login */}
          <span className={styles.icon} onClick={handleUserClick} title="Profile">👤</span>

          {/* Role menu popup (shown when not logged in) */}
          {showRoleMenu && (
            <div className={styles.roleMenu}>
              <div onClick={() => { navigate("/auth?type=user");  setShowRoleMenu(false); }}>User</div>
              <div onClick={() => { navigate("/auth?type=owner"); setShowRoleMenu(false); }}>Owner</div>
              <div onClick={() => { navigate("/auth?type=admin"); setShowRoleMenu(false); }}>Admin</div>
            </div>
          )}

          {token ? (
            <div className={styles.userBox}>
              <span className={styles.userName}>Hi, {username || "User"}</span>
              <button className={styles.logoutBtn} onClick={handleMyOrders}>My Orders</button>
              <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
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
          MOBILE MENU
          ═══════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) closeMobileMenu(); }}
        >
          <div className={styles.mobileMenu}>

            {/* Logo in drawer */}
            <div className={styles.mobileLogo}>CoWork</div>

            {/* Home */}
            <p className={styles.mobileItem} onClick={() => handleNavigate("/")}>
              Home
            </p>

            {/* Enterprise */}
            <p className={styles.mobileItem} onClick={() => handleNavigate("/Enterprise")}>
              Enterprise
            </p>
              {/* Enterprise */}
            <p className={styles.mobileItem} onClick={scrollToClients}>Companies</p>

            {/* Workspaces accordion */}
            <div className={styles.mobileDropdown}>
              <button
                className={styles.mobileDropdownBtn}
                onClick={() => setMobileWorkspaceOpen(o => !o)}
              >
                Workspaces
                <span>{mobileWorkspaceOpen ? "−" : "+"}</span>
              </button>
              {mobileWorkspaceOpen && (
                <div className={styles.mobileSubmenu}>
                  {workspaceLinks.map((item, i) => (
                    <p key={i} onClick={() => handleNavigate(item.path)}>{item.label}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Cities accordion */}
            <div className={styles.mobileDropdown}>
              <button
                className={styles.mobileDropdownBtn}
                onClick={() => setMobileCitiesOpen(o => !o)}
              >
                Cities
                <span>{mobileCitiesOpen ? "−" : "+"}</span>
              </button>
              {mobileCitiesOpen && (
                <div className={styles.mobileSubmenu}>
                  {cityLinks.map((city, i) => (
                    <p key={i} onClick={() => scrollToCities(city.value)}>{city.label}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            <p className={styles.mobileItem} onClick={() => handleNavigate("/amenities")}>
              Amenities
            </p>

            {/* ── MOBILE RIGHT SECTION ── */}
            <div className={styles.mobileRight}>

              {/* Show username if logged in */}
              {token && username && (
                <div className={styles.mobileUserName}>👤 Hi, {username}</div>
              )}

              {/* Cart */}
              <span onClick={() => handleNavigate("/cart")}>🛒 Cart</span>

              {/* Logged in: profile link */}
              {token ? (
                <span onClick={() => {
                  isAdmin === "true" ? handleNavigate("/admin-dashboard") : alert("Profile coming soon");
                }}>
                  {isAdmin === "true" ? "⚙️ Admin Dashboard" : "👤 My Profile"}
                </span>
              ) : (
                /* Not logged in: role chooser */
                <div className={styles.mobileRoleMenu}>
                  <span className={styles.mobileRoleTitle}>Login as</span>

                  
                  <div
                    className={styles.mobileRoleItem}
                    onClick={() => handleNavigate("/auth?type=user")}
                  >
                    👤 User
                  </div>
                  <div
                    className={styles.mobileRoleItem}
                    onClick={() => handleNavigate("/auth?type=owner")}
                  >
                    🏢 Owner
                  </div>
                  <div
                    className={styles.mobileRoleItem}
                    onClick={() => handleNavigate("/auth?type=admin")}
                  >
                    ⚙️ Admin
                  </div>
                 
                  
                </div>
              )}

              {/* Logged in buttons */}
              {token ? (
                <>
                  <button className={styles.mobileOrderBtn} onClick={handleMyOrders}>
                    My Orders
                  </button>
                  <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button className={styles.mobileStartBtn} onClick={() => handleNavigate("/auth")}>
                  Get Started →
                </button>
              )}

            </div>
          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Navbar.module.css";

function Navbar() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState(false);
  const [mobileCitiesOpen, setMobileCitiesOpen] = useState(false);

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
    { label: "Bangalore", value: "Bangalore" },
    { label: "Delhi", value: "Delhi" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileWorkspaceOpen(false);
    setMobileCitiesOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const handleUserClick = () => {
    if (token) {
      if (isAdmin === "true") {
        navigate("/admin-dashboard");
      } else {
        alert("User profile coming soon 👤");
      }
    } else {
      navigate("/auth");
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

  const scrollToCities = (city) => {
    const section = document.getElementById("cities");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      console.log("Selected:", city);
    }
    setShowCities(false);
    closeMobileMenu();
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>
        {/* LOGO */}
        <h2 className={styles.logo} onClick={() => navigate("/")}>
          CoWork
        </h2>

        {/* DESKTOP MENU */}
        <nav className={styles.menu}>
          <p className={styles.menuItem} onClick={() => navigate("/")}>
            Home
          </p>

          <p className={styles.menuItem} onClick={() => navigate("/Enterprise")}>
            Enterprise
          </p>

          {/* WORKSPACES */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowWorkspace(true)}
            onMouseLeave={() => setShowWorkspace(false)}
          >
            <span className={styles.dropdownLabel}>Workspaces</span>
            <span className={styles.arrow}>▼</span>

            {showWorkspace && (
              <div className={styles.dropdownMenu}>
                {workspaceLinks.map((item, index) => (
                  <p key={index} onClick={() => navigate(item.path)}>
                    {item.label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* CITIES */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setShowCities(true)}
            onMouseLeave={() => setShowCities(false)}
          >
            <span className={styles.dropdownLabel}>Cities</span>
            <span className={styles.arrow}>▼</span>

            {showCities && (
              <div className={styles.dropdownMenu}>
                {cityLinks.map((city, index) => (
                  <p key={index} onClick={() => scrollToCities(city.value)}>
                    {city.label}
                  </p>
                ))}
              </div>
            )}
          </div>

          <p className={styles.menuItem} onClick={() => navigate("/amenities")}>
            Amenities
          </p>
        </nav>

        {/* RIGHT SIDE */}
        <div className={styles.right}>
          <span
            className={styles.icon}
            onClick={() => navigate("/cart")}
            title="Cart"
          >
            🛒
          </span>

          <span
            className={styles.icon}
            onClick={handleUserClick}
            title="User"
          >
            👤
          </span>

          {token ? (
            <div className={styles.userBox}>
              <span className={styles.userName}>Hi, {username || "User"}</span>
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

        {/* HAMBURGER */}
        <button
          className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <div className={styles.mobileMenu}>
            <p className={styles.mobileItem} onClick={() => handleNavigate("/")}>
              Home
            </p>

            <p
              className={styles.mobileItem}
              onClick={() => handleNavigate("/Enterprise")}
            >
              Enterprise
            </p>

            <div className={styles.mobileDropdown}>
              <button
                className={styles.mobileDropdownBtn}
                onClick={() => setMobileWorkspaceOpen(!mobileWorkspaceOpen)}
              >
                Workspaces <span>{mobileWorkspaceOpen ? "−" : "+"}</span>
              </button>

              {mobileWorkspaceOpen && (
                <div className={styles.mobileSubmenu}>
                  {workspaceLinks.map((item, index) => (
                    <p key={index} onClick={() => handleNavigate(item.path)}>
                      {item.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.mobileDropdown}>
              <button
                className={styles.mobileDropdownBtn}
                onClick={() => setMobileCitiesOpen(!mobileCitiesOpen)}
              >
                Cities <span>{mobileCitiesOpen ? "−" : "+"}</span>
              </button>

              {mobileCitiesOpen && (
                <div className={styles.mobileSubmenu}>
                  {cityLinks.map((city, index) => (
                    <p key={index} onClick={() => scrollToCities(city.value)}>
                      {city.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <p
              className={styles.mobileItem}
              onClick={() => handleNavigate("/amenities")}
            >
              Amenities
            </p>

            <div className={styles.mobileRight}>
              <span onClick={() => handleNavigate("/cart")}>🛒 Cart</span>
              <span onClick={handleUserClick}>👤 {token ? "Profile" : "Login"}</span>

              {token ? (
                <button onClick={handleLogout}>Logout</button>
              ) : (
                <button onClick={() => handleNavigate("/auth")}>Get Started</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
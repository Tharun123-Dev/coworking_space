import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Navbar.module.css";

function Navbar() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  //  Check login
  const token = localStorage.getItem("access");
  const isAdmin = localStorage.getItem("is_admin");
  const username=localStorage.getItem("username");

  //  USER CLICK (ADMIN / NORMAL)
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
  };

  //  LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("username")

    alert("Logged out successfully ");
    navigate("/");
  };
  const scrollToCities = (city) => {
  const section = document.getElementById("cities");

  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
    console.log("Selected:", city); // optional
  }
};

const handleScroll = (city) => {
  const section = document.getElementById("cities");

  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }

  console.log("Clicked:", city); // optional

  setShowCities(false); //  close dropdown after click
};

  return (
    <div className={styles.navbar}>
      
      {/* LOGO */}
      <h2 className={styles.logo} onClick={() => navigate("/")}>
        CoWork
      </h2>
   

      {/* DESKTOP MENU */}
      <div className={styles.menu}>
                  <p
      className={styles.menuItem}
      onClick={() => navigate("/")}
      style={{ cursor: "pointer" }}
    >
      Home
    </p>
        {/* WORKSPACES */}
        <div 
          
          className={styles.dropdown}
          onMouseEnter={() => setShowWorkspace(true)}
          onMouseLeave={() => setShowWorkspace(false)}
        >
          Workspaces(Our Gallery) ▼
          {showWorkspace && (
            <div className={styles.dropdownMenu}>
             <p onClick={() => navigate("/workspaces/office")}>Office Spaces</p>
             <p onClick={() => navigate("/workspaces/coworking")}>Coworking Spaces</p>
             <p onClick={() => navigate("/workspaces/meeting")}>Meeting Rooms</p>
            </div>
          )}
        </div>

    {/* CITIES */}
<div
  className={styles.dropdown}
  onMouseEnter={() => setShowCities(true)}
  onMouseLeave={() => setShowCities(false)}
>
  Cities(Locations) ▼

  {showCities && (
    <div className={styles.dropdownMenu}>
      <p onClick={() => handleScroll("Hyderabad")}>Hyderabad</p>
      <p onClick={() => handleScroll("Bangalore")}>Bangalore</p>
      <p onClick={() => handleScroll("Delhi")}>Delhi</p>
    </div>
  )}
</div>

           <p
      className={styles.menuItem}
      onClick={() => navigate("/amenities")}
      style={{ cursor: "pointer" }}
    >
      Amenities
    </p>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>

        {/* CART */}
        <span 
          className={styles.icon} 
          onClick={() => navigate("/cart")}
          title="Cart"
        >
          🛒
        </span>

        {/* USER */}
        <span 
          className={styles.icon} 
          onClick={handleUserClick}
          title="User"
        >
          👤
        </span>

     {/* LOGIN / LOGOUT */}
{token ? (
<div className={styles.userBox}>
  <span className={styles.userName}>
    Hi, {username || "User"}
  </span>

  <button
    className={styles.logoutBtn}
    onClick={handleLogout}
  >
    Logout
  </button>
</div>
) : (
  <button
    className={styles.btn}
    onClick={() => navigate("/auth")}
  >
    Get Started
  </button>
)}

      </div>

      {/* MOBILE HAMBURGER */}
      <div 
        className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <div className={styles.mobileMenu}>
{/* WORKSPACES */}
<div className={styles.mobileDropdown}>
  <p>Workspaces</p>

  <div className={styles.mobileSubmenu}>
    
    <p onClick={() => {navigate("/workspaces/office"); setIsMobileMenuOpen(false);}}>
      Office Spaces
    </p>

    <p onClick={() => {navigate("/workspaces/coworking"); setIsMobileMenuOpen(false);}}>
      Coworking Spaces
    </p>

    <p onClick={() => {navigate("/workspaces/meeting"); setIsMobileMenuOpen(false);}}>
      Meeting Rooms
    </p>

  </div>
</div>

 {/* CITIES */}
<div className={styles.mobileDropdown}>
  <p>Cities</p>

  <div className={styles.mobileSubmenu}>
    <p onClick={() => scrollToCities("Hyderabad")}>Hyderabad</p>
    <p onClick={() => scrollToCities("Bangalore")}>Bangalore</p>
    <p onClick={() => scrollToCities("Delhi")}>Delhi</p>
  </div>
</div>

            <p className={styles.mobileItem}>Enterprise</p>

            {/* MOBILE RIGHT */}
            <div className={styles.mobileRight}>
              <span onClick={() => {navigate("/cart"); setIsMobileMenuOpen(false);}}>
                🛒 Cart
              </span>

              <span 
                onClick={() => {
                  handleUserClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                👤 {token ? "Profile" : "Login"}
              </span>

              {token ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => {
                    navigate("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Navbar;
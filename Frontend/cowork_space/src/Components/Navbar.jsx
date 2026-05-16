import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GetAQuote from "../Improved/GetQuote";
import styles from "../Styles/Navbar.module.css";

const WORKSPACE_TYPES = [
  { label: "Hot Desk",             icon: "⚡" },
  { label: "Dedicated Desk",       icon: "🖥️" },
  { label: "Private Office Space", icon: "🏢" },
  { label: "Private Cabin",        icon: "🔐" },
  { label: "Meeting Room",         icon: "🤝" },
  { label: "Board Room",           icon: "👔" },
  { label: "Event Space",          icon: "🎯" },
  { label: "Podcast Studio",       icon: "🎙️" },
  { label: "Virtual Office",       icon: "🌐" },
];

const GALLERY_LINKS = [
  { label: "Office Spaces",    path: "/workspaces/office" },
  { label: "Coworking Spaces", path: "/workspaces/coworking" },
  { label: "Meeting Rooms",    path: "/workspaces/meeting" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const [wsOpen,    setWsOpen]    = useState(false);
  const [galOpen,   setGalOpen]   = useState(false);
  const [roleOpen,  setRoleOpen]  = useState(false);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [mWsOpen,   setMWsOpen]   = useState(false);
  const [mGalOpen,  setMGalOpen]  = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const wsTimer  = useRef(null);
  const galTimer = useRef(null);

  const token    = localStorage.getItem("access");
  const isAdmin  = localStorage.getItem("is_admin");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest(`.${styles.roleAnchor}`)) setRoleOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    if (profileModalOpen) {
      document.body.style.overflow = "hidden";
    } else if (!drawerOpen) {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [profileModalOpen, drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false); setMWsOpen(false); setMGalOpen(false);
  };

  const go = (path) => { navigate(path); closeDrawer(); };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToCompanies = () => {
    const el = document.getElementById("workspace-companies-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("workspace-companies-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
    closeDrawer();
  };

 const goToType = (typeLabel) => {

  navigate("/Enterprise", {

    state: {
      workspaceType: typeLabel,
    },

  });

  setWsOpen(false);

  closeDrawer();
};
const goToLocation = (locationName) => {
  navigate(`/Enterprise?location=${encodeURIComponent(locationName)}`);

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 300);

  setGalOpen(false);
  closeDrawer();
};

  const handleLogout = () => {
    ["access","refresh","is_admin","username"].forEach((k) => localStorage.removeItem(k));
    alert("Logged out successfully");
    navigate("/");
    closeDrawer();
  };

  const LOCATIONS = [
    "Hitech City",
    "Madhapur",
    "Gachibowli",
    "Kondapur",
    "Financial District",
  ];

  const enterWs  = () => { clearTimeout(wsTimer.current);  setWsOpen(true);  };
  const leaveWs  = () => { wsTimer.current  = setTimeout(() => setWsOpen(false), 160); };
  const enterGal = () => { clearTimeout(galTimer.current); setGalOpen(true);  };
  const leaveGal = () => { galTimer.current = setTimeout(() => setGalOpen(false), 160); };
  const [mLocOpen, setMLocOpen] = useState(false);

  return (
    <>
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header className={styles.navbar}>
        <div className={styles.goldLine} />

        <div className={styles.inner}>

          {/* LOGO */}
          <div className={styles.logo} onClick={() => { navigate("/"); scrollToTop(); }}>
            <span className={styles.logoW}>C</span>
            <span className={styles.logoRest}>oWork</span>
          </div>

          <div className={styles.spacer} />

          {/* DESKTOP NAV */}
          <nav className={styles.nav}>

            <button className={styles.link} onClick={() => { navigate("/"); scrollToTop(); }}>
              Home
            </button>

            {/* Workspaces */}
            <div className={styles.dropWrap} onMouseEnter={enterWs} onMouseLeave={leaveWs}>
              <button className={`${styles.link} ${styles.linkDrop} ${wsOpen ? styles.linkActive : ""}`}>
                Booking
                <svg className={`${styles.chevron} ${wsOpen ? styles.chevUp : ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {wsOpen && (
                <div className={styles.wsDrop}>
                  <div className={styles.wsDropHead}>Choose your workspace</div>
                  <div className={styles.wsGrid}>
                    {WORKSPACE_TYPES.map((ws) => (
                      <div key={ws.label} className={styles.wsItem} onClick={() => goToType(ws.label)}>
                        <span className={styles.wsIcon}>{ws.icon}</span>
                        <span className={styles.wsLabel}>{ws.label}</span>
                        <svg className={styles.wsArrow} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

         <button
  className={styles.link}
  onClick={() => {
    navigate("/");

    setTimeout(() => {
      document
        .getElementById("spaces-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }}
>
  Spaces
</button>

            <div className={styles.dropWrap}>
              <button className={`${styles.link} ${styles.linkDrop}`}>
                Locations
              </button>

              <div className={styles.galDrop}>
                {LOCATIONS.map((loc) => (
                  <div
                    key={loc}
                    className={styles.galItem}
                    onClick={() => goToLocation(loc)}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            </div>

          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.actions}>

            <div className={`${styles.roleAnchor}`}>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  if (token) {
                    if (isAdmin === "true") navigate("/admin-dashboard");
                    else setProfileModalOpen(true);
                  } else setRoleOpen((r) => !r);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>

              {roleOpen && !token && (
                <div className={styles.roleMenu}>
                  <p className={styles.roleHdr}>Login as</p>
                  {[{l:"User",i:"👤",t:"user"},{l:"Manager",i:"🏢",t:"owner"},{l:"Admin",i:"⚙️",t:"admin"}].map((r)=>(
                    <div key={r.t} className={styles.roleItem} onClick={() => { navigate(`/auth?type=${r.t}`); setRoleOpen(false); }}>
                      <span>{r.i}</span><span>{r.l}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

           {token ? (
  <>
    <div className={styles.avatar}>
      {(username || "U")
        .charAt(0)
        .toUpperCase()}
    </div>

    <span className={styles.hiText}>
      Hi, {username || "User"}
    </span>

    {/* SHOW ONLY FOR USER */}

    {localStorage.getItem("role") ===
      "user" && (
      <button
        className={styles.ghostBtn}
        onClick={() =>
          navigate("/my-orders")
        }
      >
        MY Orders
      </button>
    )}

    <button
      className={styles.ghostBtn}
      onClick={handleLogout}
    >
      Logout
    </button>
  </>
) : (
              <button className={styles.getStarted} onClick={() => navigate("/getquote")}>
                Get A Quote
              </button>
            )}

          </div>

          {/* HAMBURGER */}
          <button
            className={`${styles.burger} ${drawerOpen ? styles.burgerOpen : ""}`}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </header>

      {/* ════════════════════ MOBILE DRAWER ════════════════════ */}
      <div className={`${styles.backdrop} ${drawerOpen ? styles.backdropOn : ""}`} onClick={closeDrawer} />

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOn : ""}`}>

        {/* Top bar */}
        <div className={styles.drawerTop}>
          <div className={styles.logo} style={{cursor:"pointer"}} onClick={() => { go("/"); scrollToTop(); }}>
            <span className={styles.logoW}>C</span>
            <span className={styles.logoRest}>oWork</span>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* User strip */}
        {token && username && (
          <div className={styles.mStrip}>
            <div className={styles.mStripAva}>{username.charAt(0).toUpperCase()}</div>
            <div>
              <p className={styles.mStripGreet}>Welcome back</p>
              <p className={styles.mStripName}>{username}</p>
            </div>
          </div>
        )}

        <hr className={styles.hr} />

        {/* NAV LIST */}
        <div className={styles.mNavList}>

          <div className={styles.mRow} onClick={() => { go("/"); scrollToTop(); }}>
            <span className={styles.mRowIco}>⌂</span>
            <span className={styles.mRowTxt}>Home</span>
            <span className={styles.mChev}>›</span>
          </div>

          <div>
            <div className={`${styles.mRow} ${mWsOpen ? styles.mRowOpen : ""}`} onClick={() => setMWsOpen((o)=>!o)}>
              <span className={styles.mRowIco}>🏙️</span>
              <span className={styles.mRowTxt}>Booking</span>
              <svg className={`${styles.mCaret} ${mWsOpen ? styles.mCaretOpen : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {mWsOpen && (
              <div className={styles.mSub}>
                {WORKSPACE_TYPES.map((ws) => (
                  <div key={ws.label} className={styles.mSubRow} onClick={() => goToType(ws.label)}>
                    <span className={styles.mSubIco}>{ws.icon}</span>
                    <span>{ws.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mRow} onClick={scrollToCompanies}>
            <span className={styles.mRowIco}>🏢</span>
            <div
  className={styles.mRow}
  onClick={() => {
    navigate("/");

    setTimeout(() => {
      document
        .getElementById("spaces-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);

    closeDrawer();
  }}
>Spaces</div>
            <span className={styles.mChev}>›</span>
          </div>

          <div>
            <div
              className={`${styles.mRow} ${mLocOpen ? styles.mRowOpen : ""}`}
              onClick={() => setMLocOpen((prev) => !prev)}
            >
              <span className={styles.mRowIco}>📍</span>
              <span className={styles.mRowTxt}>Locations</span>
              <svg
                className={`${styles.mCaret} ${mLocOpen ? styles.mCaretOpen : ""}`}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {mLocOpen && (
              <div className={styles.mSub}>
                {["Hitech City","Madhapur","Gachibowli","Kondapur","Financial District"].map((loc) => (
                  <div
                    key={loc}
                    className={styles.mSubRow}
                    onClick={() => goToLocation(loc)}
                  >
                    <span className={styles.mSubIco}>📍</span>
                    <span>{loc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mRow} onClick={() => go("/amenities")}>
          </div>

        </div>

        <hr className={styles.hr} />

        {/* Footer */}
        <div className={styles.drawerFoot}>
          {token ? (
            <>
              <div
                className={styles.mProfileRow}
                onClick={() =>
                  isAdmin === "true"
                    ? go("/admin-dashboard")
                    : setProfileModalOpen(true)
                }
              >
                <span>{isAdmin==="true" ? "⚙️ Admin Dashboard" : "👤 My Profile"}</span>
                <span>›</span>
              </div>

    {localStorage.getItem("role") ===
  "user" && (
  <button
    className={styles.mOrderBtn}
    onClick={() => {
      navigate("/my-orders");
      closeDrawer();
    }}
  >
    My Orders
  </button>
)}
              <button className={styles.mLogoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <p className={styles.mLoginHdr}>Continue as</p>

              <div className={styles.mTiles}>
                {[{l:"User",i:"👤",t:"user"},{l:"Manager",i:"🏢",t:"owner"},{l:"Admin",i:"⚙️",t:"admin"}].map((r)=>(
                  <div key={r.t} className={styles.mTile} onClick={() => go(`/auth?type=${r.t}`)}>
                    <span className={styles.mTileIco}>{r.i}</span>
                    <span>{r.l}</span>
                  </div>
                ))}
              </div>

              <button className={styles.mStartBtn} onClick={() => go("/auth")}>
                Get Started →
              </button>
            </>
          )}
        </div>

      </div>

      {/* ════════════════════ PROFILE MODAL ════════════════════ */}
      {profileModalOpen && (
        <>
          <div
            className={styles.profileBackdrop}
            onClick={() => setProfileModalOpen(false)}
          />
          <div className={styles.profileModal}>

            <button
              className={styles.profileModalClose}
              onClick={() => setProfileModalOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            {/* Animated ring loader */}
            <div className={styles.profileLoaderWrap}>
              <div className={styles.profileRing}>
                <div className={styles.profileRingInner} />
              </div>
              <div className={styles.profileAvatarInner}>
                {(username || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* ── CHANGED TEXT BELOW ── */}
            <h2 className={styles.profileModalTitle}>Your Space Awaits ✦</h2>
            <p className={styles.profileModalSub}>
              Good to see you, <strong>{username || "there"}</strong>. Your personal dashboard is being
              tailored just for you — every booking, every preference, all in one place.
              <br /><br />We're putting the finishing touches on it now.
            </p>

            <div className={styles.profileDots}>
              <span className={styles.profileDot} style={{ animationDelay: "0s" }} />
              <span className={styles.profileDot} style={{ animationDelay: "0.22s" }} />
              <span className={styles.profileDot} style={{ animationDelay: "0.44s" }} />
            </div>

            <div className={styles.profileModalActions}>
              <button className={styles.profileModalOrders} onClick={() => { navigate("/my-orders"); setProfileModalOpen(false); }}>
                View My Orders
              </button>
              <button className={styles.profileModalDismiss} onClick={() => setProfileModalOpen(false)}>
                Dismiss
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}
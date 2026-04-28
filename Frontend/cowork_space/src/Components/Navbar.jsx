import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  /* clicking a type → HyderabadWorkspaces with ?type= so it can pre-filter */
  const goToType = (typeLabel) => {
    navigate(`/Enterprise?type=${encodeURIComponent(typeLabel)}`);
    setWsOpen(false);
    closeDrawer();
  };

  const handleLogout = () => {
    ["access","refresh","is_admin","username"].forEach((k) => localStorage.removeItem(k));
    alert("Logged out successfully");
    navigate("/");
    closeDrawer();
  };
  

  const enterWs  = () => { clearTimeout(wsTimer.current);  setWsOpen(true);  };
  const leaveWs  = () => { wsTimer.current  = setTimeout(() => setWsOpen(false), 160); };
  const enterGal = () => { clearTimeout(galTimer.current); setGalOpen(true);  };
  const leaveGal = () => { galTimer.current = setTimeout(() => setGalOpen(false), 160); };

  return (
    <>
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header className={styles.navbar}>
        <div className={styles.goldLine} />

        <div className={styles.inner}>

          {/* LOGO — far left */}
          <div className={styles.logo} onClick={() => { navigate("/"); scrollToTop(); }}>
            <span className={styles.logoW}>C</span>
            <span className={styles.logoRest}>oWork</span>
          </div>

          {/* SPACER pushes nav + cta to far right */}
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

            <button className={styles.link} onClick={scrollToCompanies}>
              Spaces
            </button>

            {/* <button className={styles.link} onClick={() => navigate("/RightSpace")}>
              Suite &amp; Scale
            </button> */}

            <button className={styles.link} onClick={() => navigate("/amenities")}>
              Amenities
            </button>

            {/* Gallery */}
            {/* <div className={styles.dropWrap} onMouseEnter={enterGal} onMouseLeave={leaveGal}>
              <button className={`${styles.link} ${styles.linkDrop} ${galOpen ? styles.linkActive : ""}`}>
                Gallery
                <svg className={`${styles.chevron} ${galOpen ? styles.chevUp : ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {galOpen && (
                <div className={styles.galDrop}>
                  {GALLERY_LINKS.map((g) => (
                    <div key={g.label} className={styles.galItem} onClick={() => go(g.path)}>
                      {g.label}
                    </div>
                  ))}
                </div>
              )}
            </div> */}

          </nav>

          {/* RIGHT ACTIONS */}
          <div className={styles.actions}>

            {/* Profile icon + role popup */}
            <div className={`${styles.roleAnchor}`}>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  if (token) {
                    if (isAdmin === "true") navigate("/admin-dashboard");
                    else alert("User profile coming soon 👤");
                  } else setRoleOpen((r) => !r);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>

              {roleOpen && !token && (
                <div className={styles.roleMenu}>
                  <p className={styles.roleHdr}>Login as</p>
                  {[{l:"User",i:"👤",t:"user"},{l:"Owner",i:"🏢",t:"owner"},{l:"Admin",i:"⚙️",t:"admin"}].map((r)=>(
                    <div key={r.t} className={styles.roleItem} onClick={() => { navigate(`/auth?type=${r.t}`); setRoleOpen(false); }}>
                      <span>{r.i}</span><span>{r.l}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {token ? (
              <>
                <div className={styles.avatar}>{(username||"U").charAt(0).toUpperCase()}</div>
                <span className={styles.hiText}>Hi, {username||"User"}</span>
                <button className={styles.ghostBtn} onClick={() => navigate("/my-orders")}>MY Orders</button>
                <button className={styles.ghostBtn} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className={styles.getStarted} onClick={() => navigate("/auth")}>
                Get Started
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

        {/* Drawer top bar */}
        <div className={styles.drawerTop}>
          <div className={styles.logo} style={{cursor:"pointer"}} onClick={() => { go("/"); scrollToTop(); }}>
            <span className={styles.logoW}>C</span>
            <span className={styles.logoRest}>oWork</span>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Logged-in user strip */}
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

        {/* Nav rows */}
        <div className={styles.mNavList}>

          <div className={styles.mRow} onClick={() => { go("/"); scrollToTop(); }}>
            <span className={styles.mRowIco}>⌂</span>
            <span className={styles.mRowTxt}>Home</span>
            <span className={styles.mChev}>›</span>
          </div>

          {/* Workspaces accordion */}
          <div>
            <div className={`${styles.mRow} ${mWsOpen ? styles.mRowOpen : ""}`} onClick={() => setMWsOpen((o)=>!o)}>
              <span className={styles.mRowIco}>🏙️</span>
              <span className={styles.mRowTxt}>Booking</span>
              <svg className={`${styles.mCaret} ${mWsOpen ? styles.mCaretOpen : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
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
            <span className={styles.mRowTxt}>Spaces</span>
            <span className={styles.mChev}>›</span>
          </div>

          <div className={styles.mRow} onClick={() => go("/RightSpace")}>
            <span className={styles.mRowIco}>📈</span>
            {/* <span className={styles.mRowTxt}>Suite &amp; Scale</span> */}
            <span className={styles.mChev}>›</span>
          </div>

          <div className={styles.mRow} onClick={() => go("/amenities")}>
            <span className={styles.mRowIco}>✦</span>
            <span className={styles.mRowTxt}>Amenities</span>
            <span className={styles.mChev}>›</span>
          </div>

          {/* Gallery accordion */}
          {/* <div>
            <div className={`${styles.mRow} ${mGalOpen ? styles.mRowOpen : ""}`} onClick={() => setMGalOpen((o)=>!o)}>
              <span className={styles.mRowIco}>🖼️</span>
              <span className={styles.mRowTxt}>Gallery</span>
              <svg className={`${styles.mCaret} ${mGalOpen ? styles.mCaretOpen : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {mGalOpen && (
              <div className={styles.mSub}>
                {GALLERY_LINKS.map((g) => (
                  <div key={g.label} className={styles.mSubRow} onClick={() => go(g.path)}>
                    <span className={styles.mSubDot} />
                    <span>{g.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div> */}

        </div>

        <hr className={styles.hr} />

        {/* Drawer footer */}
        <div className={styles.drawerFoot}>
          {token ? (
            <>
              <div className={styles.mProfileRow} onClick={() => isAdmin==="true" ? go("/admin-dashboard") : alert("Profile coming soon")}>
                <span>{isAdmin==="true" ? "⚙️ Admin Dashboard" : "👤 My Profile"}</span>
                <span>›</span>
              </div>
              <button className={styles.mOrderBtn} onClick={() => { navigate("/my-orders"); closeDrawer(); }}>My Orders</button>
              <button className={styles.mLogoutBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <p className={styles.mLoginHdr}>Continue as</p>
              <div className={styles.mTiles}>
                {[{l:"User",i:"👤",t:"user"},{l:"Owner",i:"🏢",t:"owner"},{l:"Admin",i:"⚙️",t:"admin"}].map((r)=>(
                  <div key={r.t} className={styles.mTile} onClick={() => go(`/auth?type=${r.t}`)}>
                    <span className={styles.mTileIco}>{r.i}</span>
                    <span>{r.l}</span>
                  </div>
                ))}
              </div>
              <button className={styles.mStartBtn} onClick={() => go("/auth")}>Get Started →</button>
            </>
          )}
        </div>

      </div>
    </>
  );
}

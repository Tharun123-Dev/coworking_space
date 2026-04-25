import { useEffect, useState, useRef } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/AdminDashboard.module.css";

/* ─── SVG Icon ─── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  dashboard:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  workspace:  "M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3",
  category:   "M4 6h16M4 12h8m-8 6h16",
  leads:      "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  owners:     "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z",
  enterprise: "M3 21h18 M9 3h6l3 7H6L9 3z M6 10v11 M18 10v11 M12 10v11",
  bookings:   "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  tickets:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  offers:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z",
  users:      "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  support:    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  chevDown:   "M6 9l6 6 6-6",
  menu:       "M3 6h18 M3 12h18 M3 18h18",
  close:      "M18 6L6 18 M6 6l12 12",
  activity:   "M22 12h-4l-3 9L9 3l-3 9H2",
  bell:       "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  search:     "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  add:        "M12 5v14 M5 12h14",
  edit:       "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:      "M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  refresh:    "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  clock:      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  tag:        "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  check:      "M20 6L9 17l-5-5",
  arrowUp:    "M18 15l-6-6-6 6",
  arrowDown:  "M6 9l6 6 6-6",
  dotsV:      "M12 5h.01 M12 12h.01 M12 19h.01",
};

/* ─── Sidebar groups ─── */
const SIDEBAR_GROUPS = [
  { id:"dashboard", label:"Dashboard", icon:IC.dashboard, section:"overview", children:null },
  {
    id:"management", label:"Management", icon:IC.users,
    children:[
      { id:"manage-users",  label:"Manage Users",  icon:IC.users,  path:"/admin-users" },
      { id:"manage-owners", label:"Manage Owners", icon:IC.owners, path:"/create-owner" },
    ]
  },
  {
    id:"workspaces-group", label:"Workspaces", icon:IC.workspace,
    children:[
      { id:"workspaces", label:"Workspaces", icon:IC.workspace, section:"workspaces" },
      { id:"categories", label:"Categories", icon:IC.category,  section:"categories" },
    ]
  },
  {
    id:"leads-group", label:"Leads", icon:IC.leads,
    children:[
      { id:"leads",       label:"View Leads",        icon:IC.leads,      path:"/admin-leads" },
      { id:"offerleads",  label:"Offer Leads",       icon:IC.offers,     path:"/admin-leadss" },
      { id:"enterprise",  label:"Modern Leads",  icon:IC.enterprise, path:"/admin-Enterprise" },
      { id:"ownerlead",   label:"Owner Leads",       icon:IC.tag,        path:"/owner-special-leads" },
    ]
  },
  {
    id:"business-group", label:"Business", icon:IC.enterprise,
    children:[
      { id:"entbiz",      label:"Enterprise",    icon:IC.enterprise, path:"/enterprise-business" },
      { id:"companylead", label:"Company Leads", icon:IC.leads,      path:"/company-special-leads" },
    ]
  },
  {
    id:"bookings-group", label:"Bookings", icon:IC.bookings,
    children:[
      { id:"bookings", label:"All Bookings", icon:IC.bookings, path:"/admin-bookings" },
    ]
  },
  {
    id:"support-group", label:"Support", icon:IC.support,
    children:[
      { id:"tickets", label:"Support Tickets", icon:IC.tickets, path:"/admin-tickets" },
    ]
  },
];

/* ─── Weekly booking chart data ─── */
const CHART_DATA = [
  { day: "Mon", bookings: 18, revenue: 42 },
  { day: "Tue", bookings: 27, revenue: 63 },
  { day: "Wed", bookings: 22, revenue: 51 },
  { day: "Thu", bookings: 35, revenue: 82 },
  { day: "Fri", bookings: 31, revenue: 74 },
  { day: "Sat", bookings: 14, revenue: 33 },
  { day: "Sun", bookings: 9,  revenue: 21 },
];

/* ─── Animated Bar Chart ─── */
function WeeklyChart({ data }) {
  const [animate, setAnimate] = useState(false);
  const maxB = Math.max(...data.map(d => d.bookings));
  const maxR = Math.max(...data.map(d => d.revenue));

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Weekly Overview</h3>
          <p className={styles.chartSub}>Bookings &amp; Revenue this week</p>
        </div>
        <div className={styles.chartLegend}>
          <span className={styles.legendDot} style={{ background: "#C9A84C" }} />
          <span className={styles.legendTxt}>Bookings</span>
          <span className={styles.legendDot} style={{ background: "#4A90D9" }} />
          <span className={styles.legendTxt}>Revenue (k)</span>
        </div>
      </div>

      <div className={styles.chartBody}>
        {data.map((d, i) => (
          <div key={i} className={styles.chartCol}>
            <div className={styles.chartBars}>
              {/* Revenue bar (back) */}
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: animate ? `${(d.revenue / maxR) * 100}%` : "0%",
                    background: "linear-gradient(180deg, #4A90D9 0%, rgba(74,144,217,0.3) 100%)",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              {/* Bookings bar (front) */}
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: animate ? `${(d.bookings / maxB) * 100}%` : "0%",
                    background: "linear-gradient(180deg, #C9A84C 0%, rgba(201,168,76,0.3) 100%)",
                    transitionDelay: `${i * 60 + 30}ms`,
                  }}
                />
              </div>
            </div>
            <span className={styles.chartDay}>{d.day}</span>
          </div>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className={styles.chartYLabels}>
        {[100, 75, 50, 25, 0].map(v => (
          <span key={v} className={styles.yLabel}>{v}%</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Donut chart ─── */
const DONUT_SEGS = [
  { label:"Day Pass",   pct:32, color:"#C9A84C" },
  { label:"Meeting",    pct:28, color:"#4A90D9" },
  { label:"Fixed Seat", pct:22, color:"#4CAF82" },
  { label:"Cabin",      pct:18, color:"#9B7FD4" },
];

function DonutChart({ data }) {
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 128 128" width="130" height="130">
        {data.map((seg, i) => {
          const dash = (seg.pct / 100) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth="18"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform:"rotate(-90deg)", transformOrigin:"64px 64px" }}
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx={cx} cy={cy} r={40} fill="#1A1A1A" />
        <text x="64" y="60" textAnchor="middle" fill="#F0F0F0" fontSize="13" fontWeight="700">Types</text>
        <text x="64" y="76" textAnchor="middle" fill="#A0A0A0" fontSize="10">{data.length} cats</text>
      </svg>
      <div className={styles.donutLegend}>
        {data.map((d, i) => (
          <div key={i} className={styles.donutItem}>
            <span className={styles.donutDot} style={{ background: d.color }} />
            <span className={styles.donutLabel}>{d.label}</span>
            <span className={styles.donutPct}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Spark bar ─── */
const mkSpark = (n, mx) => Array.from({ length: n }, () => Math.floor(Math.random() * mx + 4));
function SparkBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className={styles.spark}>
      {data.map((v, i) => (
        <div key={i} className={styles.sparkBar}
          style={{ height:`${(v/max)*100}%`, background: color,
            opacity: 0.45 + (i / data.length) * 0.55 }} />
      ))}
    </div>
  );
}

const MOCK_TICKETS = [
  { id:"#T-201", subject:"AC not working in Cabin 3",      status:"open",        priority:"high",   user:"Aarav M.",  time:"10m ago" },
  { id:"#T-202", subject:"WiFi disconnecting frequently", status:"in_progress", priority:"medium", user:"Priya S.",  time:"25m ago" },
  { id:"#T-203", subject:"Invoice discrepancy - May",     status:"open",        priority:"high",   user:"Kiran D.",  time:"1h ago"  },
  { id:"#T-204", subject:"Parking slot not assigned",     status:"resolved",    priority:"low",    user:"Sneha R.",  time:"3h ago"  },
  { id:"#T-205", subject:"Meeting room double booked",    status:"in_progress", priority:"medium", user:"Rahul K.",  time:"5h ago"  },
  { id:"#T-206", subject:"Printer paper jam",             status:"resolved",    priority:"low",    user:"Meera T.",  time:"1d ago"  },
];

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [owners,      setOwners]      = useState([]);
  const [workspaces,  setWorkspaces]  = useState([]);
  const [categories,  setCategories]  = useState([]);

  // Updated form with is_available
  const [form,     setForm]    = useState({ 
    name:"", city:"", location:"", price:"", image:"", description:"", 
    is_available: true 
  });
  const [editId,   setEditId]  = useState(null);
  const [catForm,  setCatForm] = useState({ 
    name:"", category:"", description:"", image:"", hourly_price:"", daily_price:"", monthly_price:"", 
    is_available:true, owner:"" 
  });

  const [section,       setSection]       = useState("overview");
  const [sideOpen,     setSideOpen]     = useState(true);
  const [mobOpen,      setMobOpen]      = useState(false);
  const [openGroup,    setOpenGroup]    = useState("management");
  const [searchQ,      setSearchQ]      = useState("");
  const [toast,        setToast]        = useState(null);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [notifOpen,    setNotifOpen]    = useState(false);
  const notifRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const SPARKS = {
    ws:   mkSpark(10, 8),
    cat:  mkSpark(10, 6),
    avl:  mkSpark(10, 5),
    own:  mkSpark(10, 4),
  };

  useEffect(() => {
    axiosInstance.get("owners/").then(r => setOwners(r.data)).catch(() => {});
    fetchWS(); fetchCat();
  }, []);

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchWS  = () => axiosInstance.get("workspaces/").then(r => setWorkspaces(r.data)).catch(() => {});
  const fetchCat = () => axiosInstance.get("workspaces/categories/").then(r => setCategories(r.data)).catch(() => {});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) { 
      showToast("Fill required fields", "error"); 
      return; 
    }
    const req = editId
      ? axiosInstance.put(`workspaces/update/${editId}/`, form)
      : axiosInstance.post("workspaces/add/", form);
    req.then(() => {
      showToast(editId ? "Updated successfully" : "Workspace added");
      setEditId(null);
      setForm({ 
        name:"", city:"", location:"", price:"", image:"", description:"", 
        is_available: true 
      });
      fetchWS();
    }).catch(() => showToast("Operation failed", "error"));
  };

  const handleEdit = item => {
    setForm({
      name: item.name,
      city: item.city,
      location: item.location || "",
      price: item.price,
      image: item.image || "",
      description: item.description || "",
      is_available: item.is_available || true
    });
    setEditId(item.id);
    setSection("workspaces");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleDelete = id => {
    if (!window.confirm("Delete this workspace?")) return;
    axiosInstance.delete(`workspaces/delete/${id}/`).then(() => { 
      showToast("Deleted"); 
      fetchWS(); 
    });
  };

  const handleAddCat = () => {
    axiosInstance.post("workspaces/categories/add/", catForm)
      .then(() => {
        showToast("Category added");
        setCatForm({ 
          name:"", category:"", description:"", image:"", hourly_price:"", daily_price:"", monthly_price:"", 
          is_available:true, owner:"" 
        });
        fetchCat();
      }).catch(() => showToast("Failed to add", "error"));
  };

  const handleDeleteCat = id => {
    if (!window.confirm("Delete this category?")) return;
    axiosInstance.delete(`workspaces/categories/delete/${id}/`).then(() => { 
      showToast("Deleted"); 
      fetchCat(); 
    });
  };

  const toggleGroup = id => setOpenGroup(prev => prev === id ? null : id);

  const goNav = item => {
    if (item.path)    { navigate(item.path); setMobOpen(false); return; }
    if (item.section) { setSection(item.section); setMobOpen(false); }
  };

  const closeMob = () => setMobOpen(false);

  const handleMobileMenuToggle = () => {
    if (isMobile) {
      setMobOpen(p => !p);
    } else {
      setSideOpen(p => !p);
    }
  };

  const filteredWS = workspaces.filter(w =>
    w.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredTickets = ticketFilter === "all"
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => t.status === ticketFilter);

  const STATS = [
    { label:"Workspaces",        value:workspaces.length,                     color:"#C9A84C", spark:SPARKS.ws,  trend:"+12%", up:true,  icon:IC.workspace },
    { label:"Categories",        value:categories.length,                      color:"#9B7FD4", spark:SPARKS.cat, trend:"+8%",  up:true,  icon:IC.category  },
    { label:"Available Spaces",  value:workspaces.filter(w=>w.is_available).length, color:"#4CAF82", spark:SPARKS.avl, trend:"-3%",  up:false, icon:IC.check     },
    { label:"Total Owners",      value:owners.length,                          color:"#E6A23C", spark:SPARKS.own, trend:"+5%",  up:true,  icon:IC.owners    },
  ];

  const sideWidth = sideOpen ? 240 : 64;

  const sectionTitle = () => {
    if (section === "overview")   return "Dashboard Overview";
    if (section === "workspaces") return "Workspace Management";
    if (section === "categories") return "Category Management";
    if (section === "tickets")    return "Support Tickets";
    return "Dashboard";
  };

  const MOCK_NOTIF = [
    { icon:IC.workspace,  text:"New workspace 'Horizon Hub' added",  time:"2m ago",  color:"#C9A84C" },
    { icon:IC.leads,      text:"Lead #4821 assigned to Ravi",         time:"11m ago", color:"#4A90D9" },
    { icon:IC.tickets,    text:"Ticket #209 marked resolved",         time:"34m ago", color:"#4CAF82" },
    { icon:IC.bookings,   text:"Booking #1042 confirmed",             time:"1h ago",  color:"#9B7FD4" },
  ];

  return (
    <div className={styles.root}>

      {/* Mobile overlay */}
      {mobOpen && <div className={styles.overlay} onClick={closeMob} />}

      {/* ══════ SIDEBAR ══════ */}
      <aside
        className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : styles.sidebarCollapsed} ${mobOpen ? styles.sidebarMob : ""}`}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>WN</div>
          {(sideOpen || mobOpen) && (
            <span className={styles.logoText}>
              Work<span className={styles.logoGold}>Nest</span>
            </span>
          )}
          {isMobile && mobOpen && (
            <button className={styles.sideCloseBtn} onClick={closeMob} title="Close menu">
              <Icon d={IC.close} size={15} />
            </button>
          )}
        </div>

        <div className={styles.divider} />

        {/* Nav */}
        <nav className={styles.nav}>
          {SIDEBAR_GROUPS.map(group => {
            if (!group.children) {
              return (
                <button
                  key={group.id}
                  className={`${styles.navItem} ${section === group.section ? styles.navItemActive : ""}`}
                  onClick={() => { setSection(group.section); closeMob(); }}
                  title={!sideOpen && !mobOpen ? group.label : ""}
                >
                  <span className={styles.navIco}><Icon d={group.icon} size={15} /></span>
                  {(sideOpen || mobOpen) && <span className={styles.navLabel}>{group.label}</span>}
                </button>
              );
            }

            const isOpen   = openGroup === group.id;
            const isActive = group.children.some(c => c.section === section);

            return (
              <div key={group.id}>
                <button
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => (sideOpen || mobOpen) && toggleGroup(group.id)}
                  title={!sideOpen && !mobOpen ? group.label : ""}
                >
                  <span className={styles.navIco}><Icon d={group.icon} size={15} /></span>
                  {(sideOpen || mobOpen) && (
                    <>
                      <span className={styles.navLabel}>{group.label}</span>
                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                        <Icon d={IC.chevDown} size={11} />
                      </span>
                    </>
                  )}
                </button>

                {(sideOpen || mobOpen) && isOpen && (
                  <div className={styles.navChildren}>
                    {group.children.map(child => (
                      <button
                        key={child.id}
                        className={`${styles.navChild} ${section === (child.section || child.id) ? styles.navChildActive : ""}`}
                        onClick={() => goNav(child)}
                      >
                        <span className={styles.childDot} />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={styles.sideFooter}>
          <div className={styles.divider} />
          {(sideOpen || mobOpen) && (
            <div className={styles.sideUser}>
              <div className={styles.sideAvatar}>A</div>
              <div>
                <p className={styles.sideName}>Admin</p>
                <p className={styles.sideRole}>Super Admin</p>
              </div>
              <div className={styles.onlineDot} />
            </div>
          )}
        </div>
      </aside>

      {/* ══════ MAIN ══════ */}
      <div className={styles.main} style={{ marginLeft: isMobile ? 0 : sideWidth }}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={`${styles.menuBtn} ${isMobile ? styles.menuBtnMobile : ""}`}
            onClick={handleMobileMenuToggle}
            title={isMobile ? "Open menu" : (sideOpen ? "Collapse sidebar" : "Expand sidebar")}
          >
            <Icon d={isMobile ? IC.dotsV : (sideOpen ? IC.menu : IC.menu)} size={isMobile ? 18 : 17} />
          </button>

          <div className={styles.topTitle}>
            <span className={styles.topSub}>Admin Panel</span>
            <span className={styles.topSection}>{sectionTitle()}</span>
          </div>

          <div className={styles.topRight}>
            <button className={styles.actBtn} onClick={() => navigate("/recent-activity")}>
              <span className={styles.livePulse} />
              <Icon d={IC.activity} size={14} />
              <span className={styles.actBtnTxt}>Recent Activity</span>
            </button>

            <div className={styles.notifWrap} ref={notifRef}>
              <button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                onClick={() => setNotifOpen(p => !p)}
                title="Notifications"
              >
                <Icon d={IC.bell} size={15} />
                <span className={styles.notifBadge}>3</span>
              </button>

              {notifOpen && (
                <div className={styles.notifPanel}>
                  <div className={styles.notifHead}>
                    <span>Notifications</span>
                    <span className={styles.notifCount}>3 new</span>
                  </div>
                  {MOCK_NOTIF.map((a, i) => (
                    <div key={i} className={styles.notifItem}>
                      <span className={styles.notifIco} style={{ color: a.color }}>
                        <Icon d={a.icon} size={12} />
                      </span>
                      <div>
                        <p className={styles.notifTxt}>{a.text}</p>
                        <p className={styles.notifTime}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                  <button className={styles.notifAll}
                    onClick={() => { setNotifOpen(false); navigate("/recent-activity"); }}>
                    View all →
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.breadcrumb}>
          {section !== "overview" && (
            <>
              <span className={styles.breadSep}>›</span>
              <span className={styles.breadCur}>{sectionTitle()}</span>
            </>
          )}
        </div>

        <main className={styles.content}>

          {/* ════ OVERVIEW ════ */}
          {section === "overview" && (
            <div className={styles.overview}>

              <div className={styles.statsGrid}>
                {STATS.map((s, i) => (
                  <div key={i} className={styles.statCard} style={{ "--ac": s.color }}>
                    <div className={styles.statTop}>
                      <div className={styles.statIco}><Icon d={s.icon} size={17} /></div>
                      <span className={`${styles.trend} ${s.up ? styles.trendUp : styles.trendDn}`}>
                        <Icon d={s.up ? IC.arrowUp : IC.arrowDown} size={10} />
                        {s.trend}
                      </span>
                    </div>
                    <div className={styles.statVal}>{s.value}</div>
                    <div className={styles.statLbl}>{s.label}</div>
                    <SparkBar data={s.spark} color={s.color} />
                  </div>
                ))}
              </div>

              <div className={styles.chartPanel}>
                <WeeklyChart data={CHART_DATA} />
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>Space Mix</h3>
                  <span className={styles.panelSub}>By category type</span>
                </div>
                <div className={styles.donutSection}>
                  <DonutChart data={DONUT_SEGS} />
                </div>
              </div>

            </div>
          )}

          {/* ════ WORKSPACES ════ */}
          {section === "workspaces" && (
            <div className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco}><Icon d={IC.workspace} size={18} /></div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Management</h2>
                  <p className={styles.secSub}>Add, edit and delete workspace records.</p>
                </div>
                <span className={styles.countPill}>{workspaces.length} Total</span>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <Icon d={editId ? IC.edit : IC.add} size={13} />
                  <span>{editId ? `Editing Workspace #${editId}` : "Add New Workspace"}</span>
                </div>
                <div className={styles.formGrid}>
                  {[
                    { ph:"Workspace Name *", key:"name" },
                    { ph:"City *",            key:"city" },
                    { ph:"Location",          key:"location" },
                    { ph:"Price (₹) *",       key:"price" },
                    { ph:"Description",       key:"description" },
                    { ph:"Image URL",         key:"image" },
                  ].map(f => (
                    <input key={f.key} className={styles.inp} placeholder={f.ph}
                      value={form[f.key]} onChange={e => setForm({ ...form, [f.key]:e.target.value })} />
                  ))}
                  
                  {/* ✅ AVAILABILITY DROPDOWN - SAME AS PREVIOUS */}
                  <select 
                    className={styles.selectField}
                    value={form.is_available ? "available" : "unavailable"}
                    onChange={(e) => setForm({
                      ...form,
                      is_available: e.target.value === "available"
                    })}
                  >
                    <option value="available">✅ Available</option>
                    <option value="unavailable">❌ Unavailable</option>
                  </select>
                </div>
                <div className={styles.formActs}>
                  <button className={styles.btnGold} onClick={handleSubmit}>
                    <Icon d={editId ? IC.edit : IC.add} size={13} />
                    {editId ? " Update Workspace" : " Add Workspace"}
                  </button>
                  {editId && (
                    <button className={styles.btnGhost}
                      onClick={() => { 
                        setEditId(null); 
                        setForm({ 
                          name:"", city:"", location:"", price:"", image:"", description:"", 
                          is_available: true 
                        }); 
                      }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.tableBar}>
                <div className={styles.tableSearch}>
                  <Icon d={IC.search} size={13} />
                  <input className={styles.searchInp} placeholder="Search..."
                    value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <span className={styles.tableCount}>{filteredWS.length} records</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>City</th>
                      <th>Location</th>
                      <th>Price</th>
                      {/* ✅ ADDED STATUS COLUMN */}
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWS.map((item, i) => (
                      <tr key={item.id}>
                        <td className={styles.tdSerial}>{String(i + 1).padStart(2, "0")}</td>
                        <td className={styles.tdBold}>{item.name}</td>
                        <td>{item.city}</td>
                        <td className={styles.tdMuted}>{item.location || "—"}</td>
                        <td className={styles.tdGold}>₹{item.price}</td>
                        
                        {/* ✅ STATUS BADGE - SAME AS PREVIOUS */}
                        <td>
                          <span
                            className={`${styles.status} ${
                              item.is_available ? styles.available : styles.unavailable
                            }`}
                          >
                            {item.is_available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        
                        <td>
                          <div className={styles.actCell}>
                            <button className={styles.editBtn} onClick={() => handleEdit(item)}>
                              <Icon d={IC.edit} size={11} /> Edit
                            </button>
                            <button className={styles.delBtn} onClick={() => handleDelete(item.id)}>
                              <Icon d={IC.trash} size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredWS.length === 0 && (
                      <tr><td colSpan="7" className={styles.tdEmpty}>No workspaces found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ CATEGORIES ════ */}
          {section === "categories" && (
            <div className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco}><Icon d={IC.category} size={18} /></div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Categories</h2>
                  <p className={styles.secSub}>Create and manage categories and pricing tiers.</p>
                </div>
                <span className={styles.countPill}>{categories.length} Total</span>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <Icon d={IC.add} size={13} /><span>Add New Category</span>
                </div>
                <div className={styles.formGrid}>
                  <input className={styles.inp} placeholder="Category Name"
                    value={catForm.name} onChange={e => setCatForm({ ...catForm, name:e.target.value })} />
                  <select className={styles.inp} value={catForm.owner || ""}
                    onChange={e => setCatForm({ ...catForm, owner:e.target.value })}>
                    <option value="">Assign Owner</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.username}</option>)}
                  </select>
                  <select className={styles.inp} value={catForm.category}
                    onChange={e => setCatForm({ ...catForm, category:e.target.value })}>
                    <option value="">Select Category Type</option>
                    <option value="day_pass">Day Pass</option>
                    <option value="meeting">Meeting Rooms</option>
                    <option value="fixed">Fixed Seats</option>
                    <option value="cabin">Cabins</option>
                  </select>
                  <input className={styles.inp} placeholder="Description"
                    value={catForm.description} onChange={e => setCatForm({ ...catForm, description:e.target.value })} />
                  <input className={styles.inp} placeholder="Image URL"
                    value={catForm.image} onChange={e => setCatForm({ ...catForm, image:e.target.value })} />
                  <input className={styles.inp} placeholder="Hourly Price (₹)"
                    value={catForm.hourly_price} onChange={e => setCatForm({ ...catForm, hourly_price:e.target.value })} />
                  <input className={styles.inp} placeholder="Daily Price (₹)"
                    value={catForm.daily_price} onChange={e => setCatForm({ ...catForm, daily_price:e.target.value })} />
                  <input className={styles.inp} placeholder="Monthly Price (₹)"
                    value={catForm.monthly_price} onChange={e => setCatForm({ ...catForm, monthly_price:e.target.value })} />
                  <select className={styles.inp} value={String(catForm.is_available)}
                    onChange={e => setCatForm({ ...catForm, is_available:e.target.value === "true" })}>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
                <div className={styles.formActs}>
                  <button className={styles.btnGold} onClick={handleAddCat}>
                    <Icon d={IC.add} size={13} /> Add Category
                  </button>
                </div>
              </div>

              <div className={styles.catGrid}>
                {categories.map(item => (
                  <div key={item.id} className={styles.catCard}>
                    <div className={styles.catTop}>
                      <div>
                        <h4 className={styles.catName}>{item.name}</h4>
                        <span className={styles.catType}>{item.category}</span>
                      </div>
                      <span className={`${styles.badge} ${item.is_available ? styles.badgeOn : styles.badgeOff}`}>
                        {item.is_available ? "Available" : "Off"}
                      </span>
                    </div>
                    <p className={styles.catDesc}>{item.description || "No description."}</p>
                    <div className={styles.catPrices}>
                      {[["Hourly", item.hourly_price], ["Daily", item.daily_price], ["Monthly", item.monthly_price]].map(([lbl, val]) => (
                        <div key={lbl} className={styles.priceBox}>
                          <span className={styles.priceLbl}>{lbl}</span>
                          <span className={styles.priceVal}>₹{val || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <button className={styles.delBtn} style={{ marginTop:12 }} onClick={() => handleDeleteCat(item.id)}>
                      <Icon d={IC.trash} size={11} /> Delete
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className={styles.empty}>No categories yet.</p>}
              </div>
            </div>
          )}

          {/* ════ TICKETS ════ */}
          {section === "tickets" && (
            <div className={styles.section}>
              <div className={styles.secHead}>
                <div className={`${styles.secIco} ${styles.secIcoPurple}`}>
                  <Icon d={IC.tickets} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Support Tickets</h2>
                  <p className={styles.secSub}>Manage and resolve user support requests.</p>
                </div>
                <div className={styles.ticketSummary}>
                  <span className={`${styles.countPill} ${styles.pillRed}`}>
                    {MOCK_TICKETS.filter(t => t.status === "open").length} Open
                  </span>
                  <span className={`${styles.countPill} ${styles.pillOrange}`}>
                    {MOCK_TICKETS.filter(t => t.status === "in_progress").length} In Prog
                  </span>
                  <span className={`${styles.countPill} ${styles.pillGreen}`}>
                    {MOCK_TICKETS.filter(t => t.status === "resolved").length} Done
                  </span>
                </div>
              </div>

              <div className={styles.filterRow}>
                {["all", "open", "in_progress", "resolved"].map(f => (
                  <button key={f}
                    className={`${styles.filterPill} ${ticketFilter === f ? styles.filterActive : ""}`}
                    onClick={() => setTicketFilter(f)}>
                    {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className={styles.ticketList}>
                {filteredTickets.map((t, i) => (
                  <div key={i} className={styles.ticketRow}>
                    <span className={styles.ticketId}>{t.id}</span>
                    <div className={styles.ticketMain}>
                      <span className={styles.ticketSubject}>{t.subject}</span>
                      <span className={styles.ticketUser}><Icon d={IC.users} size={10} />{t.user}</span>
                    </div>
                    <span className={`${styles.pri} ${t.priority === "high" ? styles.priHigh : t.priority === "medium" ? styles.priMed : styles.priLow}`}>
                      {t.priority}
                    </span>
                    <span className={`${styles.status} ${t.status === "open" ? styles.stOpen : t.status === "in_progress" ? styles.stProg : styles.stDone}`}>
                      {t.status === "open" ? "Open" : t.status === "in_progress" ? "In Progress" : "Resolved"}
                    </span>
                    <span className={styles.ticketTime}><Icon d={IC.clock} size={10} />{t.time}</span>
                    <button className={styles.editBtn} onClick={() => navigate(`/admin-tickets/${t.id}`)}>
                      <Icon d={IC.edit} size={11} /> Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastErr : ""}`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
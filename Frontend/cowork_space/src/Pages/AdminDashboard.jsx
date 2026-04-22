import { useEffect, useState, useRef } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";

import FooterCarousel from "../Pages/FooterCarousel";



/* ══════════════════════════════════════════════════════
   SVG ICON HELPER
══════════════════════════════════════════════════════ */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  workspace: "M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3",
  category:  "M4 6h16M4 12h8m-8 6h16",
  leads:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  owners:    "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z",
  enterprise:"M3 21h18 M9 3h6l3 7H6L9 3z M6 10v11 M18 10v11 M12 10v11",
  bookings:  "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  tickets:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  offers:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  support:   "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  chevron:   "M6 9l6 6 6-6",
  menu:      "M3 6h18 M3 12h18 M3 18h18",
  close:     "M18 6L6 18 M6 6l12 12",
  activity:  "M22 12h-4l-3 9L9 3l-3 9H2",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  add:       "M12 5v14 M5 12h14",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:     "M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  trend:     "M23 6l-9.5 9.5-5-5L1 18",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  arrowUp:   "M18 15l-6-6-6 6",
  arrowDown: "M6 9l6 6 6-6",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  check:     "M20 6L9 17l-5-5",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  map:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4",
  dollar:    "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  percent:   "M19 5L5 19 M6.5 6.5a.5.5 0 100-1 .5.5 0 000 1 M17.5 17.5a.5.5 0 100-1 .5.5 0 000 1",
  pulse:     "M22 12h-4l-3 9L9 3l-3 9H2",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z",
  grid:      "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  zip:       "M21 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-2 M12 12h6 M15 9l3 3-3 3",
};

/* ── Nav config — each item navigates directly from sidebar ── */
const NAV = [
  { id:"overview",    label:"Overview",         icon:IC.dashboard,  section:"overview" },
  { id:"workspaces",  label:"Workspaces",       icon:IC.workspace,  section:"workspaces" },
  { id:"categories",  label:"Categories",       icon:IC.category,   section:"categories" },
  { id:"leads",       label:"View Leads",       icon:IC.leads,      path:"/admin-leads" },
  { id:"offerleads",  label:"Offer Leads",      icon:IC.offers,     path:"/admin-leadss" },
  { id:"enterprise",  label:"Enterprise Leads", icon:IC.enterprise, path:"/admin-Enterprise" },
  { id:"entbiz",      label:"Ent. Business",    icon:IC.owners,     path:"/enterprise-business" },
  { id:"companylead", label:"Company Leads",    icon:IC.leads,      path:"/company-special-leads" },
  { id:"users",       label:"Manage Users",     icon:IC.users,      path:"/admin-users" },
  { id:"owners",      label:"Owner Accounts",   icon:IC.owners,     path:"/create-owner" },
  { id:"bookings",    label:"All Bookings",     icon:IC.bookings,   path:"/admin-bookings" },
  { id:"ownerlead",   label:"Owner Leads",      icon:IC.tag,        path:"/owner-special-leads" },
  { id:"tickets",     label:"Support Tickets",  icon:IC.tickets,    section:"tickets" },
  { id:"activity",    label:"Recent Activity",  icon:IC.activity,   path:"/recent-activity" },
  { id:"settings",    label:"Settings",         icon:IC.settings,   path:"/settings" },
];

/* ── Sidebar group labels ── */
const NAV_GROUPS = [
  { label: "MAIN",        ids: ["overview"] },
  { label: "WORKSPACES",  ids: ["workspaces","categories"] },
  { label: "LEADS",       ids: ["leads","offerleads"] },
  { label: "ENTERPRISE",  ids: ["enterprise","entbiz","companylead"] },
  { label: "MANAGEMENT",  ids: ["users","owners"] },
  { label: "OWNER OPS",   ids: ["bookings","ownerlead"] },
  { label: "SUPPORT",     ids: ["tickets","activity","settings"] },
];

/* ── Mini spark bar data ── */
const spark = (n, max) => Array.from({length:n}, () => Math.floor(Math.random() * max + 4));
const WS_SPARK   = spark(12, 10);
const CAT_SPARK  = spark(12, 8);
const AVAIL_SPARK= spark(12, 6);
const OWN_SPARK  = spark(12, 5);

/* ── Bar chart data ── */
const BAR_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
const BAR_DATA   = [42,67,55,80,73,91,88];

/* ── Donut segments: workspace types ── */
const DONUT_TYPES = [
  { label:"Day Pass",   pct:32, color:"#C9A84C" },
  { label:"Meeting",    pct:28, color:"#4A90D9" },
  { label:"Fixed Seat", pct:22, color:"#4CAF82" },
  { label:"Cabin",      pct:18, color:"#9B7FD4" },
];

/* ── Heatmap: 7×12 random booking heatmap ── */
const HEATMAP_DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HEATMAP_HOURS = ["6am","8am","10am","12pm","2pm","4pm","6pm","8pm","10pm","12am","2am","4am"];
const HEATMAP_DATA  = Array.from({length:7}, () => Array.from({length:12}, () => Math.floor(Math.random()*10)));

/* ── Pie helper ── */
function DonutChart({ data }) {
  let offset = 0;
  const r = 54, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 128 128" width="128" height="128" style={{display:"block"}}>
      {data.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{transform:"rotate(-90deg)", transformOrigin:"64px 64px", transition:"stroke-dasharray .6s"}}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={42} fill="var(--bg2)" />
    </svg>
  );
}

/* ── Spark bar ── */
function SparkBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{display:"flex", alignItems:"flex-end", gap:2, height:28}}>
      {data.map((v,i) => (
        <div key={i} style={{
          width: 4,
          height: `${(v/max)*100}%`,
          background: color || "var(--gold)",
          borderRadius: 2,
          opacity: 0.7 + (i / data.length) * 0.3,
          transition: "height .3s"
        }} />
      ))}
    </div>
  );
}

/* ── Bar chart ── */
function BarChart({ data, labels, color }) {
  const max = Math.max(...data);
  return (
    <div className={styles.barChartWrap}>
      {data.map((v,i) => (
        <div key={i} className={styles.barCol}>
          <div className={styles.barFill} style={{height:`${(v/max)*100}%`, background: color||"var(--gold)"}} />
          <span className={styles.barLbl}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Heatmap cell colour ── */
function heatColor(v) {
  if (v === 0) return "rgba(201,168,76,0.04)";
  if (v < 3)  return "rgba(201,168,76,0.15)";
  if (v < 6)  return "rgba(201,168,76,0.35)";
  if (v < 9)  return "rgba(201,168,76,0.60)";
  return "rgba(201,168,76,0.90)";
}

/* ── Activity feed (mock) ── */
const MOCK_ACTIVITY = [
  { icon: IC.workspace, text: "New workspace 'Horizon Hub' added", time: "2m ago",   color: "#C9A84C" },
  { icon: IC.leads,     text: "Lead #4821 assigned to owner Ravi", time: "11m ago",  color: "#4A90D9" },
  { icon: IC.tickets,   text: "Ticket #209 marked resolved",       time: "34m ago",  color: "#4CAF82" },
  { icon: IC.bookings,  text: "Booking #1042 confirmed",           time: "1h ago",   color: "#9B7FD4" },
  { icon: IC.enterprise,text: "Enterprise lead from TechCorp",     time: "2h ago",   color: "#E6A23C" },
  { icon: IC.offers,    text: "Offer lead #88 accepted",           time: "3h ago",   color: "#E05C5C" },
];

/* ── Ticket mock data ── */
const MOCK_TICKETS = [
  { id:"#T-201", subject:"AC not working in Cabin 3",    status:"open",       priority:"high",   user:"Aarav M.",  time:"10m ago" },
  { id:"#T-202", subject:"WiFi disconnecting frequently", status:"in_progress",priority:"medium", user:"Priya S.",  time:"25m ago" },
  { id:"#T-203", subject:"Invoice discrepancy - May",    status:"open",       priority:"high",   user:"Kiran D.",  time:"1h ago" },
  { id:"#T-204", subject:"Parking slot not assigned",    status:"resolved",   priority:"low",    user:"Sneha R.",  time:"3h ago" },
  { id:"#T-205", subject:"Meeting room double booked",   status:"in_progress",priority:"medium", user:"Rahul K.",  time:"5h ago" },
  { id:"#T-206", subject:"Printer paper jam",            status:"resolved",   priority:"low",    user:"Meera T.",  time:"1d ago" },
];

/* ── Offer leads mock ── */
const MOCK_OFFER_LEADS = [
  { id:"#OL-01", name:"Deskwise Pro",    type:"Day Pass",   discount:"20%", expires:"May 30", status:"active",  claimed:14 },
  { id:"#OL-02", name:"Cabin Saver",     type:"Cabin",      discount:"15%", expires:"Jun 5",  status:"active",  claimed:7  },
  { id:"#OL-03", name:"Meeting Bundle",  type:"Meeting",    discount:"25%", expires:"May 25", status:"expired", claimed:22 },
  { id:"#OL-04", name:"Flex Month Deal", type:"Fixed Seat", discount:"10%", expires:"Jun 15", status:"active",  claimed:3  },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [owners,     setOwners]     = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form,   setForm]   = useState({ name:"", city:"", location:"", price:"", image:"", description:"" });
  const [editId, setEditId] = useState(null);
  const [catForm,setCatForm]= useState({ name:"", category:"", description:"", image:"", hourly_price:"", daily_price:"", monthly_price:"", is_available:true, owner:"" });

  const [sideOpen, setSideOpen] = useState(true);
  const [section,  setSection]  = useState("overview");
  const [mobOpen,  setMobOpen]  = useState(false);
  const [searchQ,  setSearchQ]  = useState("");
  const [toast,    setToast]    = useState(null);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [actDrawer, setActDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    axiosInstance.get("owners/").then(r=>setOwners(r.data)).catch(()=>{});
    fetchWS(); fetchCat();
  }, []);

  /* close notif on outside click */
  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchWS  = () => axiosInstance.get("workspaces/").then(r=>setWorkspaces(r.data)).catch(()=>{});
  const fetchCat = () => axiosInstance.get("workspaces/categories/").then(r=>setCategories(r.data)).catch(()=>{});

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3200);
  };

  const handleSubmit = () => {
    if (!form.name||!form.city||!form.price){ showToast("Fill required fields","error"); return; }
    const req = editId
      ? axiosInstance.put(`workspaces/update/${editId}/`, form)
      : axiosInstance.post("workspaces/add/", form);
    req.then(()=>{
      showToast(editId?"Updated ✓":"Added ✓");
      setEditId(null);
      setForm({name:"",city:"",location:"",price:"",image:"",description:""});
      fetchWS();
    }).catch(()=>showToast("Error","error"));
  };

  const handleEdit = item => {
    setForm(item); setEditId(item.id);
    setSection("workspaces");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleDelete = id => {
    if(!window.confirm("Delete?")) return;
    axiosInstance.delete(`workspaces/delete/${id}/`).then(()=>{showToast("Deleted ✓");fetchWS();});
  };

  const handleAddCat = () => {
    axiosInstance.post("workspaces/categories/add/", catForm)
      .then(()=>{
        showToast("Category added ✓");
        setCatForm({name:"",category:"",description:"",image:"",hourly_price:"",daily_price:"",monthly_price:"",is_available:true,owner:""});
        fetchCat();
      }).catch(()=>showToast("Failed","error"));
  };

  const handleDeleteCat = id => {
    if(!window.confirm("Delete category?")) return;
    axiosInstance.delete(`workspaces/categories/delete/${id}/`).then(()=>{showToast("Deleted ✓");fetchCat();});
  };

  const goNav = item => {
    if(item.path)    { navigate(item.path); setMobOpen(false); return; }
    if(item.section) { setSection(item.section); setMobOpen(false); }
  };

  const filteredWS = workspaces.filter(w =>
    w.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredTickets = ticketFilter === "all"
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => t.status === ticketFilter);

  const STATS = [
    {
      label:"Total Workspaces", value: workspaces.length,
      icon:IC.workspace, ac:"#C9A84C",
      spark: WS_SPARK, trend:"+12%", up:true,
      sub: "Active spaces"
    },
    {
      label:"Categories", value: categories.length,
      icon:IC.category, ac:"#9B7FD4",
      spark: CAT_SPARK, trend:"+8%", up:true,
      sub: "Workspace types"
    },
    {
      label:"Available Now", value: categories.filter(c=>c.is_available).length,
      icon:IC.activity, ac:"#4CAF82",
      spark: AVAIL_SPARK, trend:"-3%", up:false,
      sub: "Ready to book"
    },
    {
      label:"Total Owners", value: owners.length,
      icon:IC.owners, ac:"#E6A23C",
      spark: OWN_SPARK, trend:"+5%", up:true,
      sub: "Registered owners"
    },
  ];

  const SW_OPEN   = 240;
  const SW_CLOSED = 66;

  /* ── Build grouped nav ── */
  const navItems = NAV_GROUPS.map(g => ({
    ...g,
    items: NAV.filter(n => g.ids.includes(n.id))
  }));

  return (
    <div className={styles.root}>

      {/* Mobile backdrop */}
      {mobOpen && <div className={styles.backdrop} onClick={()=>setMobOpen(false)} />}

      {/* Activity Drawer */}
      <div className={`${styles.actDrawer} ${actDrawer ? styles.actDrawerOpen : ""}`}>
        <div className={styles.actDrawerHead}>
          <span className={styles.actDrawerTitle}>Recent Activity</span>
          <button className={styles.actDrawerClose} onClick={()=>setActDrawer(false)}>
            <Icon d={IC.close} size={16}/>
          </button>
        </div>
        <div className={styles.actDrawerList}>
          {MOCK_ACTIVITY.map((a,i) => (
            <div key={i} className={styles.actDrawerItem}>
              <div className={styles.actDrawerIco} style={{background:`${a.color}18`, color:a.color}}>
                <Icon d={a.icon} size={13}/>
              </div>
              <div className={styles.actDrawerMeta}>
                <span className={styles.actDrawerTxt}>{a.text}</span>
                <span className={styles.actDrawerTime}><Icon d={IC.clock} size={10}/>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.actDrawerAll} onClick={()=>navigate("/recent-activity")}>
          View All Activity →
        </button>
      </div>
      {actDrawer && <div className={styles.drawerBd} onClick={()=>setActDrawer(false)}/>}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={styles.sidebar} style={{width: sideOpen ? SW_OPEN : SW_CLOSED}}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>WN</div>
          {sideOpen && <span className={styles.logoTxt}>WorkNest</span>}
          {sideOpen && <span className={styles.logoBadge}>ADMIN</span>}
        </div>

        <div className={styles.divider}/>

        {/* Nav list grouped */}
        <nav className={styles.nav}>
          {navItems.map(group => (
            <div key={group.label} className={styles.navGroup}>
              {sideOpen && <span className={styles.navGroupLabel}>{group.label}</span>}
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`${styles.navRow} ${section === (item.section||item.id) ? styles.navRowActive : ""}`}
                  onClick={() => goNav(item)}
                  title={!sideOpen ? item.label : ""}
                >
                  <span className={styles.navIco}><Icon d={item.icon} size={15}/></span>
                  {sideOpen && <span className={styles.navTxt}>{item.label}</span>}
                  {sideOpen && section === (item.section||item.id) && (
                    <span className={styles.navActiveDot}/>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.divider}/>

        {sideOpen && (
          <div className={styles.sideUser}>
            <div className={styles.sideAvatar}>A</div>
            <div>
              <p className={styles.sideUserName}>Admin</p>
              <p className={styles.sideUserRole}>Super Admin</p>
            </div>
            <div className={styles.sideOnline}/>
          </div>
        )}

        {/* <button className={styles.logoutBtn} title="Logout">
          <Icon d={IC.logout} size={15}/>
          {sideOpen && <span>Logout</span>}
        </button> */}
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className={styles.mainWrap} style={{marginLeft: sideOpen ? SW_OPEN : SW_CLOSED}}>

        {/* ── TOP BAR ── */}
        <header className={styles.topBar}>
          <button className={styles.menuBtn}
            onClick={()=>{ setSideOpen(p=>!p); setMobOpen(p=>!p); }}>
            <Icon d={sideOpen ? IC.close : IC.menu} size={17}/>
          </button>

          <div className={styles.topTitle}>
            <span className={styles.topEye}>Internal Workspace System</span>
            <h1 className={styles.topH1}>Admin <em>Panel</em></h1>
          </div>

          <div className={styles.topSearch}>
            <Icon d={IC.search} size={13}/>
            <input className={styles.topSearchInp}
              placeholder="Search workspaces…"
              value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          </div>

          <div className={styles.topRight}>
            {/* Recent Activity Button */}
            <button className={styles.actPulseBtn} onClick={()=>setActDrawer(true)}>
              <span className={styles.actPulseDot}/>
              <Icon d={IC.pulse} size={14}/>
              <span className={styles.actPulseTxt}>Live Activity</span>
            </button>

            {/* Notifications */}
            <div className={styles.notifWrap} ref={notifRef}>
              <button className={`${styles.topIconBtn} ${notifOpen ? styles.topIconBtnActive : ""}`}
                onClick={()=>setNotifOpen(p=>!p)} title="Notifications">
                <Icon d={IC.bell} size={15}/>
                <span className={styles.notifDot}/>
              </button>
              {notifOpen && (
                <div className={styles.notifPanel}>
                  <div className={styles.notifHead}>
                    <span>Notifications</span>
                    <span className={styles.notifCount}>3 new</span>
                  </div>
                  {MOCK_ACTIVITY.slice(0,4).map((a,i) => (
                    <div key={i} className={styles.notifItem}>
                      <div className={styles.notifIco} style={{color:a.color}}>
                        <Icon d={a.icon} size={12}/>
                      </div>
                      <div>
                        <p className={styles.notifTxt}>{a.text}</p>
                        <p className={styles.notifTime}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                  <button className={styles.notifAll} onClick={()=>{setNotifOpen(false); navigate("/recent-activity");}}>
                    View all →
                  </button>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button className={styles.topIconBtn} title="Refresh" onClick={()=>{fetchWS();fetchCat();showToast("Data refreshed");}}>
              <Icon d={IC.refresh} size={15}/>
            </button>

            <div className={styles.topUser}>
              <div className={styles.topAvatar}>A</div>
              <div className={styles.topUserInfo}>
                <span className={styles.topUserName}>Admin</span>
                <span className={styles.topUserRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── BREADCRUMB ── */}
        <div className={styles.breadcrumb}>
          <span className={styles.breadHome} onClick={()=>setSection("overview")}>Dashboard</span>
          {section !== "overview" && (
            <>
              <span className={styles.breadSep}>›</span>
              <span className={styles.breadCur}>{
                section === "workspaces" ? "Workspaces" :
                section === "categories" ? "Categories" :
                section === "tickets"    ? "Support Tickets" : section
              }</span>
            </>
          )}
        </div>

        {/* ── CONTENT ── */}
        <main className={styles.content}>

          {/* ═══════ OVERVIEW ═══════ */}
          {section === "overview" && (
            <div className={styles.ovWrap}>

              {/* Welcome banner */}
              <div className={styles.banner}>
                <div className={styles.bannerLeft}>
                  <p className={styles.bannerEye}>Good day, Admin 👋</p>
                  <h2 className={styles.bannerH}>WorkNest Command Center</h2>
                  <p className={styles.bannerSub}>Full visibility across workspaces, leads, bookings & enterprise operations.</p>
                  <div className={styles.bannerActions}>
                    <button className={styles.bannerBtn} onClick={()=>setSection("workspaces")}>
                      <Icon d={IC.add} size={13}/> Add Workspace
                    </button>
                    <button className={styles.bannerBtnGhost} onClick={()=>navigate("/admin-leads")}>
                      View Leads →
                    </button>
                  </div>
                </div>
                <div className={styles.bannerOrbs}>
                  <div className={styles.orb1}/><div className={styles.orb2}/><div className={styles.orb3}/>
                </div>
              </div>

              {/* ── STAT CARDS ── */}
              <div className={styles.statsRow}>
                {STATS.map((s,i) => (
                  <div key={i} className={styles.statCard} style={{"--a":s.ac}}>
                    <div className={styles.statTop}>
                      <div className={styles.statIco}><Icon d={s.icon} size={18}/></div>
                      <span className={`${styles.statTrend} ${s.up ? styles.statTrendUp : styles.statTrendDn}`}>
                        <Icon d={s.up ? IC.arrowUp : IC.arrowDown} size={10}/>
                        {s.trend}
                      </span>
                    </div>
                    <div className={styles.statVal}>{s.value}</div>
                    <div className={styles.statLbl}>{s.label}</div>
                    <div className={styles.statSub}>{s.sub}</div>
                    <div className={styles.statSparkWrap}>
                      <SparkBar data={s.spark} color={s.ac}/>
                    </div>
                    <div className={styles.statGlow}/>
                  </div>
                ))}
              </div>

              {/* ── ANALYTICS ROW ── */}
              <div className={styles.analyticsRow}>

                {/* Bar chart */}
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsHead}>
                    <div>
                      <h3 className={styles.analyticsTitle}>Booking Trend</h3>
                      <p className={styles.analyticsSub}>Monthly bookings overview</p>
                    </div>
                    <span className={styles.analyticsBadge}>Last 7 months</span>
                  </div>
                  <BarChart data={BAR_DATA} labels={BAR_MONTHS} color="var(--gold)"/>
                </div>

                {/* Donut + legend */}
                <div className={styles.analyticsCard} style={{maxWidth:320}}>
                  <div className={styles.analyticsHead}>
                    <div>
                      <h3 className={styles.analyticsTitle}>Space Mix</h3>
                      <p className={styles.analyticsSub}>By workspace type</p>
                    </div>
                  </div>
                  <div className={styles.donutWrap}>
                    <DonutChart data={DONUT_TYPES}/>
                    <div className={styles.donutLegend}>
                      {DONUT_TYPES.map((d,i) => (
                        <div key={i} className={styles.donutItem}>
                          <span className={styles.donutDot} style={{background:d.color}}/>
                          <span className={styles.donutLabel}>{d.label}</span>
                          <span className={styles.donutPct}>{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* ── HEATMAP + ACTIVITY ROW ── */}
              <div className={styles.heatRow}>

                {/* Booking heatmap */}
                <div className={styles.heatCard}>
                  <div className={styles.analyticsHead}>
                    <div>
                      <h3 className={styles.analyticsTitle}>Booking Heatmap</h3>
                      <p className={styles.analyticsSub}>Occupancy by day & hour</p>
                    </div>
                    <div className={styles.heatLegend}>
                      <span className={styles.heatLegLbl}>Low</span>
                      {[0.1,0.25,0.45,0.65,0.9].map((o,i) => (
                        <div key={i} className={styles.heatLegBox} style={{background:`rgba(201,168,76,${o})`}}/>
                      ))}
                      <span className={styles.heatLegLbl}>High</span>
                    </div>
                  </div>
                  <div className={styles.heatGrid}>
                    <div className={styles.heatYAxis}>
                      {HEATMAP_DAYS.map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className={styles.heatCells}>
                      <div className={styles.heatXAxis}>
                        {HEATMAP_HOURS.map(h => <span key={h}>{h}</span>)}
                      </div>
                      {HEATMAP_DATA.map((row, ri) => (
                        <div key={ri} className={styles.heatRow2}>
                          {row.map((v, ci) => (
                            <div key={ci} className={styles.heatCell}
                              style={{background: heatColor(v)}}
                              title={`${HEATMAP_DAYS[ri]} ${HEATMAP_HOURS[ci]}: ${v} bookings`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live activity feed */}
                <div className={styles.feedCard}>
                  <div className={styles.analyticsHead}>
                    <div>
                      <h3 className={styles.analyticsTitle}>Live Feed</h3>
                      <p className={styles.analyticsSub}>Real-time platform events</p>
                    </div>
                    <span className={styles.liveDot}><span/>LIVE</span>
                  </div>
                  <div className={styles.feedList}>
                    {MOCK_ACTIVITY.map((a,i) => (
                      <div key={i} className={styles.feedItem}>
                        <div className={styles.feedIco} style={{background:`${a.color}18`, color:a.color}}>
                          <Icon d={a.icon} size={12}/>
                        </div>
                        <div className={styles.feedMeta}>
                          <span className={styles.feedTxt}>{a.text}</span>
                          <span className={styles.feedTime}><Icon d={IC.clock} size={9}/>{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className={styles.feedAllBtn} onClick={()=>navigate("/recent-activity")}>
                    View All Activity →
                  </button>
                </div>
              </div>

              {/* ── WORKSPACE & CATEGORY MINI TABLES ── */}
              <div className={styles.botRow}>
                <div className={styles.miniCard}>
                  <div className={styles.miniHead}>
                    <h3>Recent Workspaces</h3>
                    <button className={styles.miniSeeAll} onClick={()=>setSection("workspaces")}>View all →</button>
                  </div>
                  <div className={styles.miniListWrap}>
                    {workspaces.slice(0,6).map((w,i) => (
                      <div key={w.id} className={styles.miniRow}>
                        <span className={styles.miniIdx}>{String(i+1).padStart(2,"0")}</span>
                        <div className={styles.miniMeta}>
                          <span className={styles.miniName}>{w.name}</span>
                          <span className={styles.miniCity}>{w.city}</span>
                        </div>
                        <span className={styles.miniPrice}>₹{w.price}</span>
                        <button className={styles.miniEditBtn} onClick={()=>handleEdit(w)}>
                          <Icon d={IC.edit} size={11}/>
                        </button>
                      </div>
                    ))}
                    {workspaces.length===0 && <p className={styles.emptyMsg}>No workspaces yet</p>}
                  </div>
                </div>

                <div className={styles.miniCard}>
                  <div className={styles.miniHead}>
                    <h3>Recent Categories</h3>
                    <button className={styles.miniSeeAll} onClick={()=>setSection("categories")}>View all →</button>
                  </div>
                  <div className={styles.catMiniGrid}>
                    {categories.slice(0,4).map(c => (
                      <div key={c.id} className={styles.catMiniItem}>
                        <div className={styles.catMiniTop2}>
                          <span className={styles.catMiniNm}>{c.name}</span>
                          <span className={`${styles.badge} ${c.is_available ? styles.badgeOn : styles.badgeOff}`}>
                            {c.is_available ? "Active" : "Off"}
                          </span>
                        </div>
                        <span className={styles.catMiniType}>{c.category}</span>
                        <div className={styles.catMiniPrices}>
                          {c.hourly_price && <span>₹{c.hourly_price}/hr</span>}
                          {c.daily_price  && <span>₹{c.daily_price}/day</span>}
                        </div>
                      </div>
                    ))}
                    {categories.length===0 && <p className={styles.emptyMsg}>No categories yet</p>}
                  </div>
                </div>
              </div>

              {/* ── OFFER LEADS STRIP ── */}
              <div className={styles.offerStrip}>
                <div className={styles.miniHead} style={{padding:"16px 20px"}}>
                  <h3>Active Offer Leads</h3>
                  <button className={styles.miniSeeAll} onClick={()=>navigate("/admin-leadss")}>View all →</button>
                </div>
                <div className={styles.offerCards}>
                  {MOCK_OFFER_LEADS.map((o,i) => (
                    <div key={i} className={`${styles.offerCard} ${o.status==="expired" ? styles.offerCardExp : ""}`}>
                      <div className={styles.offerCardTop}>
                        <span className={styles.offerIco}><Icon d={IC.offers} size={16}/></span>
                        <span className={`${styles.badge} ${o.status==="active" ? styles.badgeOn : styles.badgeOff}`}>
                          {o.status}
                        </span>
                      </div>
                      <p className={styles.offerName}>{o.name}</p>
                      <p className={styles.offerType}>{o.type}</p>
                      <div className={styles.offerMeta}>
                        <span className={styles.offerDisc}>{o.discount} off</span>
                        <span className={styles.offerExpiry}>Exp: {o.expires}</span>
                      </div>
                      <div className={styles.offerClaimed}>
                        <div className={styles.offerBar} style={{width:`${Math.min(o.claimed*4,100)}%`}}/>
                        <span>{o.claimed} claimed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════ WORKSPACES ═══════ */}
          {section === "workspaces" && (
            <section className={styles.panelSec}>
              <div className={styles.panelHead}>
                <div className={styles.panelIco}><Icon d={IC.workspace} size={20}/></div>
                <div>
                  <h2 className={styles.panelH}>Workspace Management</h2>
                  <p className={styles.panelSub}>Add, edit & delete master workspace records.</p>
                </div>
                <div style={{marginLeft:"auto", display:"flex", gap:10}}>
                  <span className={styles.countPill}>{workspaces.length} Total</span>
                </div>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formCardHead}>
                  <span className={styles.formLbl}>
                    <Icon d={editId ? IC.edit : IC.add} size={13}/>
                    {editId ? " Edit Workspace" : " Add New Workspace"}
                  </span>
                  {editId && <span className={styles.editBadge}>Editing #{editId}</span>}
                </div>
                <div className={styles.formGrid}>
                  {[
                    {ph:"Workspace Name *",  key:"name"},
                    {ph:"City *",            key:"city"},
                    {ph:"Location",          key:"location"},
                    {ph:"Price (₹) *",       key:"price"},
                    {ph:"Description",       key:"description"},
                    {ph:"Image URL",         key:"image"},
                  ].map(f => (
                    <input key={f.key} className={styles.inp}
                      placeholder={f.ph} value={form[f.key]}
                      onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
                  ))}
                </div>
                <div className={styles.formActs}>
                  <button onClick={handleSubmit} className={styles.btnGold}>
                    <Icon d={editId ? IC.edit : IC.add} size={13}/>
                    {editId ? " Update" : " Add Workspace"}
                  </button>
                  {editId && (
                    <button className={styles.btnGhost}
                      onClick={()=>{setEditId(null);setForm({name:"",city:"",location:"",price:"",image:"",description:""});}}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.tableBar}>
                <div className={styles.tableSearch}>
                  <Icon d={IC.search} size={13}/>
                  <input className={styles.tableSearchInp}
                    placeholder="Search…" value={searchQ}
                    onChange={e=>setSearchQ(e.target.value)}/>
                </div>
                <span className={styles.tableCount}>{filteredWS.length} records</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>#</th><th>Name</th><th>City</th><th>Location</th><th>Price</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredWS.map((item,i) => (
                      <tr key={item.id}>
                        <td className={styles.tdSerial}>{String(i+1).padStart(2,"0")}</td>
                        <td className={styles.tdBold}>{item.name}</td>
                        <td>{item.city}</td>
                        <td className={styles.tdMuted}>{item.location||"—"}</td>
                        <td className={styles.tdGold}>₹{item.price}</td>
                        <td>
                          <div className={styles.actCell}>
                            <button className={styles.editBtn} onClick={()=>handleEdit(item)}>
                              <Icon d={IC.edit} size={11}/> Edit
                            </button>
                            <button className={styles.delBtn} onClick={()=>handleDelete(item.id)}>
                              <Icon d={IC.trash} size={11}/> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredWS.length===0 && (
                      <tr><td colSpan="6" className={styles.emptyRow}>No workspaces found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══════ CATEGORIES ═══════ */}
          {section === "categories" && (
            <section className={styles.panelSec}>
              <div className={styles.panelHead}>
                <div className={styles.panelIco}><Icon d={IC.category} size={20}/></div>
                <div>
                  <h2 className={styles.panelH}>Workspace Categories</h2>
                  <p className={styles.panelSub}>Create & manage categories and pricing tiers.</p>
                </div>
                <div style={{marginLeft:"auto"}}>
                  <span className={styles.countPill}>{categories.length} Total</span>
                </div>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formCardHead}>
                  <span className={styles.formLbl}><Icon d={IC.add} size={13}/> Add New Category</span>
                </div>
                <div className={styles.formGrid}>
                  <input className={styles.inp} placeholder="Category Name"
                    value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})}/>
                  <select className={styles.inp} value={catForm.owner||""}
                    onChange={e=>setCatForm({...catForm,owner:e.target.value})}>
                    <option value="">Assign Owner</option>
                    {owners.map(o=><option key={o.id} value={o.id}>{o.username}</option>)}
                  </select>
                  <select className={styles.inp} value={catForm.category}
                    onChange={e=>setCatForm({...catForm,category:e.target.value})}>
                    <option value="">Select Category Type</option>
                    <option value="day_pass">Day Pass</option>
                    <option value="meeting">Meeting Rooms</option>
                    <option value="fixed">Fixed Seats</option>
                    <option value="cabin">Cabins</option>
                  </select>
                  <input className={styles.inp} placeholder="Description"
                    value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})}/>
                  <input className={styles.inp} placeholder="Image URL"
                    value={catForm.image} onChange={e=>setCatForm({...catForm,image:e.target.value})}/>
                  <input className={styles.inp} placeholder="Hourly Price (₹)"
                    value={catForm.hourly_price} onChange={e=>setCatForm({...catForm,hourly_price:e.target.value})}/>
                  <input className={styles.inp} placeholder="Daily Price (₹)"
                    value={catForm.daily_price} onChange={e=>setCatForm({...catForm,daily_price:e.target.value})}/>
                  <input className={styles.inp} placeholder="Monthly Price (₹)"
                    value={catForm.monthly_price} onChange={e=>setCatForm({...catForm,monthly_price:e.target.value})}/>
                  <select className={styles.inp} value={String(catForm.is_available)}
                    onChange={e=>setCatForm({...catForm,is_available:e.target.value==="true"})}>
                    <option value="true">✅ Available</option>
                    <option value="false">❌ Not Available</option>
                  </select>
                </div>
                <div className={styles.formActs}>
                  <button onClick={handleAddCat} className={styles.btnGold}>
                    <Icon d={IC.add} size={13}/> Add Category
                  </button>
                </div>
              </div>

              <div className={styles.catGrid}>
                {categories.map(item => (
                  <div key={item.id} className={styles.catCard}>
                    <div className={styles.catCardTop}>
                      <div>
                        <h4 className={styles.catCardNm}>{item.name}</h4>
                        <span className={styles.catCardType}>{item.category}</span>
                      </div>
                      <span className={`${styles.badge} ${item.is_available?styles.badgeOn:styles.badgeOff}`}>
                        {item.is_available?"Available":"Unavailable"}
                      </span>
                    </div>
                    <p className={styles.catDesc}>{item.description||"No description added."}</p>
                    <div className={styles.catPrices}>
                      <div className={styles.catPriceBox}>
                        <span className={styles.catPriceLbl}>Hourly</span>
                        <span className={styles.catPriceVal}>₹{item.hourly_price||"—"}</span>
                      </div>
                      <div className={styles.catPriceBox}>
                        <span className={styles.catPriceLbl}>Daily</span>
                        <span className={styles.catPriceVal}>₹{item.daily_price||"—"}</span>
                      </div>
                      <div className={styles.catPriceBox}>
                        <span className={styles.catPriceLbl}>Monthly</span>
                        <span className={styles.catPriceVal}>₹{item.monthly_price||"—"}</span>
                      </div>
                    </div>
                    <button className={styles.catDelBtn} onClick={()=>handleDeleteCat(item.id)}>
                      <Icon d={IC.trash} size={11}/> Delete
                    </button>
                  </div>
                ))}
                {categories.length===0 && <p className={styles.emptyMsg}>No categories found</p>}
              </div>
            </section>
          )}

          {/* ═══════ SUPPORT TICKETS ═══════ */}
          {section === "tickets" && (
            <section className={styles.panelSec}>
              <div className={styles.panelHead}>
                <div className={styles.panelIco} style={{background:"rgba(155,127,212,.12)", color:"var(--purple)"}}>
                  <Icon d={IC.tickets} size={20}/>
                </div>
                <div>
                  <h2 className={styles.panelH}>Support Tickets</h2>
                  <p className={styles.panelSub}>Manage & resolve user support requests.</p>
                </div>
                <div style={{marginLeft:"auto", display:"flex", gap:8}}>
                  <span className={styles.countPill} style={{"--pc":"var(--red)"}}>
                    {MOCK_TICKETS.filter(t=>t.status==="open").length} Open
                  </span>
                  <span className={styles.countPill} style={{"--pc":"#E6A23C"}}>
                    {MOCK_TICKETS.filter(t=>t.status==="in_progress").length} In Progress
                  </span>
                  <span className={styles.countPill} style={{"--pc":"var(--green)"}}>
                    {MOCK_TICKETS.filter(t=>t.status==="resolved").length} Resolved
                  </span>
                </div>
              </div>

              {/* Filter pills */}
              <div className={styles.filterRow}>
                {["all","open","in_progress","resolved"].map(f => (
                  <button key={f}
                    className={`${styles.filterPill} ${ticketFilter===f ? styles.filterPillActive : ""}`}
                    onClick={()=>setTicketFilter(f)}>
                    {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>

              <div className={styles.ticketList}>
                {filteredTickets.map((t,i) => (
                  <div key={i} className={styles.ticketRow}>
                    <div className={styles.ticketId}>{t.id}</div>
                    <div className={styles.ticketMain}>
                      <span className={styles.ticketSubject}>{t.subject}</span>
                      <span className={styles.ticketUser}><Icon d={IC.users} size={10}/>{t.user}</span>
                    </div>
                    <span className={`${styles.ticketPri} ${
                      t.priority==="high" ? styles.priHigh :
                      t.priority==="medium" ? styles.priMed : styles.priLow
                    }`}>{t.priority}</span>
                    <span className={`${styles.ticketStatus} ${
                      t.status==="open" ? styles.stOpen :
                      t.status==="in_progress" ? styles.stProg : styles.stDone
                    }`}>
                      {t.status==="open" ? "Open" : t.status==="in_progress" ? "In Progress" : "Resolved"}
                    </span>
                    <span className={styles.ticketTime}><Icon d={IC.clock} size={10}/>{t.time}</span>
                    <div className={styles.ticketActs}>
                      <button className={styles.editBtn}><Icon d={IC.edit} size={11}/> Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        <div className={styles.fullWidthSection}>
  <FooterCarousel />
</div>

<div className={styles.fullWidthFooter}>
  <Footer />
</div>


        </main>
      </div>

      {/* ══ TOAST ══ */}
      {toast && (
        <div className={`${styles.toast} ${toast.type==="error" ? styles.toastErr : ""}`}>
          <span className={styles.toastIcon}>{toast.type==="error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

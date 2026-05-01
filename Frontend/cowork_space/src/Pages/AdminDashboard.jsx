import { useEffect, useState, useRef } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import AdminUsers from "./AdminUsers";
import CreateOwner from "./CreateOwner";
import AdminLeadss from "../Improved/AdminLeadss";
import AdminCompanyLeads from "../Pages/CompanyAdminleads"; 
import AdminBookings from "./AdminBookings";
import AdminTickets from "./AdminTickets";
import AdminDashboardEnterprise from "../Improved/AdminEnterprise"; 
import AdminDashboards from "../Improved/AdminHyd";
import AdminLeads from "./Leads";
import styles from "../Styles/AdminDashboard.module.css";
import AdminAmenities from "./AdminAmenities";
import RecentActivity from "./RecentActivity";

/* ─── SVG Icon ─── */
const Icon = ({ d, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  workspace: "M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3",
  category: "M4 6h16M4 12h8m-8 6h16",
  leads: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  owners: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z",
  enterprise: "M3 21h18 M9 3h6l3 7H6L9 3z M6 10v11 M18 10v11 M12 10v11",
  bookings: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  tickets: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  offers: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  support: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  chevDown: "M6 9l6 6 6-6",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  close: "M18 6L6 18 M6 6l12 12",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  add: "M12 5v14 M5 12h14",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  check: "M20 6L9 17l-5-5",
  arrowUp: "M18 15l-6-6-6 6",
  arrowDown: "M6 9l6 6 6-6",
  dotsV: "M12 5h.01 M12 12h.01 M12 19h.01",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  building: "M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18 M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2 M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  amenities: "M4 7h16 M7 4v16 M17 4v16 M4 17h16",
};

/* ─── Sidebar groups ─── */
const SIDEBAR_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: IC.dashboard,
    section: "overview",
    children: null,
  },
  {
    id: "management",
    label: "Management",
    icon: IC.users,
    children: [
      { id: "manage-users", label: "Manage Users", icon: IC.users, section: "users" },
      { id: "manage-owners", label: "Manage Owners", icon: IC.owners, section: "owners" },
    ],
  },
  {
    id: "workspaces-group",
    label: "Workspaces",
    icon: IC.workspace,
    children: [
      { id: "workspaces", label: "Workspaces", icon: IC.workspace, section: "workspaces" },
    ],
  },
  {
    id: "leads-group",
    label: "Leads",
    icon: IC.leads,
    children: [
      { id: "view-leads", label: "View Leads", icon: IC.leads, section: "leads" },
      { id: "offerleads", label: "Offer Leads", icon: IC.offers, section: "offerleads" },
      { id: "enterprise", label: "Customise Leads", icon: IC.enterprise, section: "enterprise" },
    ],
  },
  {
    id: "business-group",
    label: "Business",
    icon: IC.enterprise,
    children: [
      { id: "entbiz", label: "Hyderabad Leads", icon: IC.enterprise, section: "hyderabad-leads" },
      { id: "company-leads", label: "Company Leads", icon: IC.leads, section: "company-leads" },
    ],
  },
  {
    id: "bookings-group",
    label: "Bookings",
    icon: IC.bookings,
    children: [
      { id: "bookings", label: "All Bookings", icon: IC.bookings, section: "bookings" },
    ],
  },
  {
    id: "support-group",
    label: "Support",
    icon: IC.support,
    children: [
      { id: "support", label: "Support Desk", icon: IC.tickets, section: "tickets" },
    ],
  },
  {
    id: "activity-group",
    label: "Activity",
    icon: IC.activity,
    children: [
      { id: "recent-activity", label: "Recent Activity", icon: IC.activity, section: "activity" },
    ],
  },
  {
    id: "amenities-group",
    label: "Amenities",
    icon: IC.amenities,
    children: [
      { id: "amenities", label: "Amenities Management", icon: IC.amenities, section: "amenities" },
    ],
  },
];

const CHART_DATA = [
  { day: "Mon", bookings: 18, revenue: 42 },
  { day: "Tue", bookings: 27, revenue: 63 },
  { day: "Wed", bookings: 22, revenue: 51 },
  { day: "Thu", bookings: 35, revenue: 82 },
  { day: "Fri", bookings: 31, revenue: 74 },
  { day: "Sat", bookings: 14, revenue: 33 },
  { day: "Sun", bookings: 9, revenue: 21 },
];

const DONUT_SEGS = [
  { label: "Day Pass", pct: 32, color: "#f59e0b" },
  { label: "Meeting", pct: 28, color: "#10b981" },
  { label: "Fixed Seat", pct: 22, color: "#6366f1" },
  { label: "Cabin", pct: 18, color: "#f43f5e" },
];

const MOCK_TICKETS = [
  { id: "#T-201", subject: "AC not working in Cabin 3", status: "open", priority: "high", user: "Aarav M.", time: "10m ago" },
  { id: "#T-202", subject: "WiFi disconnecting frequently", status: "in_progress", priority: "medium", user: "Priya S.", time: "25m ago" },
  { id: "#T-203", subject: "Invoice discrepancy - May", status: "open", priority: "high", user: "Kiran D.", time: "1h ago" },
  { id: "#T-204", subject: "Parking slot not assigned", status: "resolved", priority: "low", user: "Sneha R.", time: "3h ago" },
  { id: "#T-205", subject: "Meeting room double booked", status: "in_progress", priority: "medium", user: "Rahul K.", time: "5h ago" },
  { id: "#T-206", subject: "Printer paper jam", status: "resolved", priority: "low", user: "Meera T.", time: "1d ago" },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: "booking", icon: IC.bookings, title: "New booking confirmed", desc: "Workspace 'Horizon Hub' booked by Aarav M. for 3 days", time: "2 min ago", color: "#f59e0b", badge: "Booking" },
  { id: 2, type: "lead", icon: IC.leads, title: "New lead assigned", desc: "Lead #4821 from Priya S. assigned to sales team", time: "8 min ago", color: "#6366f1", badge: "Lead" },
  { id: 3, type: "ticket", icon: IC.tickets, title: "Support ticket resolved", desc: "Ticket #T-204 'Parking slot not assigned' marked resolved", time: "15 min ago", color: "#10b981", badge: "Ticket" },
  { id: 4, type: "workspace", icon: IC.workspace, title: "New workspace added", desc: "'TechNest Madhapur' workspace added by admin", time: "34 min ago", color: "#f43f5e", badge: "Space" },
  { id: 5, type: "user", icon: IC.users, title: "New user registered", desc: "Kiran D. created an account and verified email", time: "1 hr ago", color: "#6366f1", badge: "User" },
  { id: 6, type: "payment", icon: IC.bookings, title: "Payment received", desc: "₹12,500 received for Booking #1042 via Razorpay", time: "1.5 hr ago", color: "#10b981", badge: "Payment" },
  { id: 7, type: "owner", icon: IC.owners, title: "Owner account created", desc: "New owner 'Rahul K.' onboarded for Gachibowli branch", time: "2 hr ago", color: "#f59e0b", badge: "Owner" },
  { id: 8, type: "category", icon: IC.category, title: "Category updated", desc: "'Meeting Rooms' pricing updated - hourly ₹350 → ₹420", time: "3 hr ago", color: "#6366f1", badge: "Category" },
  { id: 9, type: "lead", icon: IC.leads, title: "Enterprise lead converted", desc: "Swiggy Technologies converted from lead to enterprise client", time: "4 hr ago", color: "#f59e0b", badge: "Lead" },
  { id: 10, type: "ticket", icon: IC.tickets, title: "High priority ticket opened", desc: "Ticket #T-203 'Invoice discrepancy' marked high priority", time: "5 hr ago", color: "#f43f5e", badge: "Ticket" },
  { id: 11, type: "booking", icon: IC.bookings, title: "Booking cancelled", desc: "Booking #1039 cancelled - refund of ₹4,200 initiated", time: "6 hr ago", color: "#f43f5e", badge: "Booking" },
  { id: 12, type: "workspace", icon: IC.workspace, title: "Workspace availability updated", desc: "'Hitech Hub' marked unavailable for maintenance", time: "8 hr ago", color: "#f59e0b", badge: "Space" },
  { id: 13, type: "user", icon: IC.users, title: "User profile updated", desc: "Sneha R. updated contact info and billing address", time: "10 hr ago", color: "#6366f1", badge: "User" },
  { id: 14, type: "payment", icon: IC.bookings, title: "Refund processed", desc: "₹2,800 refund processed for Booking #1035", time: "Yesterday", color: "#f43f5e", badge: "Payment" },
  { id: 15, type: "owner", icon: IC.owners, title: "Owner slot released", desc: "Meera T. released slots for Financial District space", time: "Yesterday", color: "#10b981", badge: "Owner" },
];

function WeeklyChart({ data }) {
  const [animate, setAnimate] = useState(false);
  const maxB = Math.max(...data.map((d) => d.bookings));
  const maxR = Math.max(...data.map((d) => d.revenue));

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
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
          <span className={styles.legendDot} style={{ background: "#f59e0b" }} />
          <span className={styles.legendTxt}>Bookings</span>
          <span className={styles.legendDot} style={{ background: "#6366f1" }} />
          <span className={styles.legendTxt}>Revenue (k)</span>
        </div>
      </div>

      <div className={styles.chartBody}>
        {data.map((d, i) => (
          <div key={i} className={styles.chartCol}>
            <div className={styles.chartBars}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: animate ? `${(d.revenue / maxR) * 100}%` : "0%",
                    background: "linear-gradient(180deg,#6366f1 0%,rgba(99,102,241,0.15) 100%)",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: animate ? `${(d.bookings / maxB) * 100}%` : "0%",
                    background: "linear-gradient(180deg,#f59e0b 0%,rgba(245,158,11,0.15) 100%)",
                    transitionDelay: `${i * 60 + 30}ms`,
                  }}
                />
              </div>
            </div>
            <span className={styles.chartDay}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 128 128" width="130" height="130">
        {data.map((seg, i) => {
          const dash = (seg.pct / 100) * circ;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx={cx} cy={cy} r={40} fill="var(--card-bg)" />
        <text x="64" y="60" textAnchor="middle" fill="#1E1A08" fontSize="11" fontWeight="700">
          Space
        </text>
        <text x="64" y="75" textAnchor="middle" fill="#A89A6A" fontSize="9">
          Mix
        </text>
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

const mkSpark = (n, mx) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * mx + 4));

function SparkBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className={styles.spark}>
      {data.map((v, i) => (
        <div
          key={i}
          className={styles.sparkBar}
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: 0.25 + (i / data.length) * 0.75,
          }}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    price: "",
    image: "",
    description: "",
    is_available: true,
  });

  const [editId, setEditId] = useState(null);

  const [catForm, setCatForm] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    hourly_price: "",
    daily_price: "",
    monthly_price: "",
    is_available: true,
    owner: "",
  });

  const [section, setSection] = useState("overview");
  const [sideOpen, setSideOpen] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState(null);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [notifOpen, setNotifOpen] = useState(false);
  const [actFilter, setActFilter] = useState("all");
  const [activityDropOpen, setActivityDropOpen] = useState(false); // ← NEW
  const notifRef = useRef(null);
  const activityRef = useRef(null); // ← NEW

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const SPARKS = {
    ws: mkSpark(10, 8),
    cat: mkSpark(10, 6),
    own: mkSpark(10, 4),
  };

  const fetchWS = () =>
    axiosInstance
      .get("workspaces/")
      .then((r) => setWorkspaces(r.data))
      .catch(() => {});

  const fetchCat = () =>
    axiosInstance
      .get("workspaces/categories/")
      .then((r) => setCategories(r.data))
      .catch(() => {});

  useEffect(() => {
    axiosInstance
      .get("owners/")
      .then((r) => setOwners(r.data))
      .catch(() => {});
    fetchWS();
    fetchCat();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      // ← NEW: close activity dropdown on outside click
      if (activityRef.current && !activityRef.current.contains(e.target)) {
        setActivityDropOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

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

    req
      .then(() => {
        showToast(editId ? "Updated successfully" : "Workspace added");
        setEditId(null);
        setForm({ name: "", city: "", location: "", price: "", image: "", description: "", is_available: true });
        fetchWS();
      })
      .catch(() => showToast("Operation failed", "error"));
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      city: item.city,
      location: item.location || "",
      price: item.price,
      image: item.image || "",
      description: item.description || "",
      is_available: item.is_available ?? true,
    });
    setEditId(item.id);
    setSection("workspaces");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this workspace?")) return;
    axiosInstance.delete(`workspaces/delete/${id}/`).then(() => {
      showToast("Deleted");
      fetchWS();
    });
  };

  const handleAddCat = () => {
    axiosInstance
      .post("workspaces/categories/add/", catForm)
      .then(() => {
        showToast("Category added");
        setCatForm({ name: "", category: "", description: "", image: "", hourly_price: "", daily_price: "", monthly_price: "", is_available: true, owner: "" });
        fetchCat();
      })
      .catch(() => showToast("Failed to add", "error"));
  };

  const handleDeleteCat = (id) => {
    if (!window.confirm("Delete this category?")) return;
    axiosInstance.delete(`workspaces/categories/delete/${id}/`).then(() => {
      showToast("Deleted");
      fetchCat();
    });
  };

  const toggleGroup = (id) => setOpenGroup((prev) => (prev === id ? null : id));

  const goNav = (item) => {
    if (item.path) {
      navigate(item.path);
      setMobOpen(false);
      return;
    }
    if (item.section) {
      setSection(item.section);
      setMobOpen(false);
    }
  };

  const closeMob = () => setMobOpen(false);

  const handleMobileMenuToggle = () => {
    if (isMobile) setMobOpen((p) => !p);
    else setSideOpen((p) => !p);
  };

  const filteredWS = workspaces.filter(
    (w) =>
      w.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      w.city?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredTickets =
    ticketFilter === "all" ? MOCK_TICKETS : MOCK_TICKETS.filter((t) => t.status === ticketFilter);

  const filteredActivity =
    actFilter === "all" ? RECENT_ACTIVITIES : RECENT_ACTIVITIES.filter((a) => a.type === actFilter);

  const STATS = [
    { label: "Total Workspaces", value: workspaces.length, color: "#f59e0b", spark: SPARKS.ws, trend: "+12%", up: true, icon: IC.workspace },
    { label: "Categories", value: categories.length, color: "#6366f1", spark: SPARKS.cat, trend: "+8%", up: true, icon: IC.category },
    { label: "Total Owners", value: owners.length, color: "#10b981", spark: SPARKS.own, trend: "+3%", up: true, icon: IC.owners },
  ];

  const sectionTitle = () => {
    const map = {
      overview: "Dashboard Overview",
      users: "User Management",
      workspaces: "Workspace Management",
      categories: "Category Management",
      tickets: "Support Tickets",
      activity: "Recent Activity",
    };
    return map[section] || "Dashboard";
  };

  const MOCK_NOTIF = [
    { icon: IC.workspace, text: "New workspace 'Horizon Hub' added", time: "2m ago", color: "#f59e0b" },
    { icon: IC.leads, text: "Lead #4821 assigned to Ravi", time: "11m ago", color: "#6366f1" },
    { icon: IC.tickets, text: "Ticket #209 marked resolved", time: "34m ago", color: "#10b981" },
    { icon: IC.bookings, text: "Booking #1042 confirmed", time: "1h ago", color: "#f43f5e" },
  ];

  const activityTypes = ["all", "booking", "lead", "ticket", "workspace", "user", "payment", "owner", "category"];

  // ← NEW: inline styles for the activity dropdown panel
  const activityDropdownStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "360px",
    background: "var(--card-bg, #fff)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "14px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
    zIndex: 1000,
    overflow: "hidden",
  };

  const actDropHeadStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 10px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  };

  const actDropTitleStyle = {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary, #1a1a1a)",
  };

  const actDropViewAllStyle = {
    fontSize: "12px",
    color: "#6366f1",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
  };

  const actDropItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "11px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.04)",
    transition: "background 0.15s",
  };

  const actDropIcoStyle = (color) => ({
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: `${color}18`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  });

  const actDropTxtStyle = {
    fontSize: "12.5px",
    fontWeight: "600",
    color: "var(--text-primary, #1a1a1a)",
    lineHeight: "1.3",
    marginBottom: "2px",
  };

  const actDropDescStyle = {
    fontSize: "11.5px",
    color: "var(--text-muted, #888)",
    lineHeight: "1.4",
    marginBottom: "3px",
  };

  const actDropTimeStyle = {
    fontSize: "11px",
    color: "#aaa",
  };

  return (
    <div className={styles.root}>
      {mobOpen && <div className={styles.mobOverlay} onClick={closeMob} />}

      <aside
        className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : styles.sidebarCollapsed} ${
          mobOpen ? styles.sidebarMob : ""
        }`}
      >
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <Icon d={IC.building} size={18} />
          </div>

          {(sideOpen || mobOpen) && (
            <span className={styles.logoText}>
              Work<span className={styles.logoAccent}>Nest</span>
            </span>
          )}

          {isMobile && mobOpen && (
            <button className={styles.sideCloseBtn} onClick={closeMob}>
              <Icon d={IC.close} size={14} />
            </button>
          )}
        </div>

        <div className={styles.divider} />

        <nav className={styles.nav}>
          {SIDEBAR_GROUPS.map((group) => {
            if (!group.children) {
              return (
                <button
                  key={group.id}
                  className={`${styles.navItem} ${section === group.section ? styles.navItemActive : ""}`}
                  onClick={() => { setSection(group.section); closeMob(); }}
                  title={!sideOpen && !mobOpen ? group.label : ""}
                >
                  <span className={styles.navIco}>
                    <Icon d={group.icon} size={15} />
                  </span>
                  {(sideOpen || mobOpen) && (
                    <span className={styles.navLabel}>{group.label}</span>
                  )}
                </button>
              );
            }

            const isOpen = openGroup === group.id;
            const isActive = group.children.some((c) => c.section === section);

            return (
              <div key={group.id}>
                <button
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => (sideOpen || mobOpen) && toggleGroup(group.id)}
                  title={!sideOpen && !mobOpen ? group.label : ""}
                >
                  <span className={styles.navIco}>
                    <Icon d={group.icon} size={15} />
                  </span>

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
                    {group.children.map((child) => (
                      <button
                        key={child.id}
                        className={`${styles.navChild} ${
                          section === (child.section || child.id) ? styles.navChildActive : ""
                        }`}
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
              <div className={styles.sideUserInfo}>
                <p className={styles.sideName}>Admin</p>
                <p className={styles.sideRole}>Super Admin</p>
              </div>
              <div className={styles.onlineDot} />
            </div>
          )}
        </div>
      </aside>

      <div className={`${styles.main} ${!isMobile && !sideOpen ? styles.mainCollapsed : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <button className={styles.menuBtn} onClick={handleMobileMenuToggle}>
              <Icon d={IC.menu} size={18} />
            </button>

            <div className={styles.topTitle}>
              <span className={styles.topSub}>Admin Panel</span>
              <span className={styles.topSection}>{sectionTitle()}</span>
            </div>
          </div>

          <div className={styles.topRight}>
            {/* ─── UPDATED: Activity button now toggles a dropdown ─── */}
            <div style={{ position: "relative" }} ref={activityRef}>
              <button
                className={styles.actBtn}
                onClick={() => setActivityDropOpen((p) => !p)}
              >
                <span className={styles.livePulse} />
                <Icon d={IC.activity} size={14} />
                <span className={styles.actBtnTxt}>Recent Activity</span>
              </button>

              {activityDropOpen && (
                <div style={activityDropdownStyle}>
                  {/* Header */}
                  <div style={actDropHeadStyle}>
                    <span style={actDropTitleStyle}>Recent Activity</span>
                    <button
                      style={actDropViewAllStyle}
                      onClick={() => {
                        setActivityDropOpen(false);
                        setSection("activity");
                      }}
                    >
                      View all →
                    </button>
                  </div>

                  {/* Last 5 activities */}
                  {RECENT_ACTIVITIES.slice(0, 5).map((a) => (
                    <div key={a.id} style={actDropItemStyle}>
                      <div style={actDropIcoStyle(a.color)}>
                        <Icon d={a.icon} size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={actDropTxtStyle}>{a.title}</p>
                        <p style={actDropDescStyle}>{a.desc}</p>
                        <span style={actDropTimeStyle}>{a.time}</span>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "2px 7px",
                          borderRadius: "20px",
                          background: `${a.color}15`,
                          color: a.color,
                          flexShrink: 0,
                          alignSelf: "flex-start",
                          marginTop: "2px",
                        }}
                      >
                        {a.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.notifWrap} ref={notifRef}>
              <button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                onClick={() => setNotifOpen((p) => !p)}
              >
                <Icon d={IC.bell} size={15} />
                <span className={styles.notifBadge}>4</span>
              </button>

              {notifOpen && (
                <div className={styles.notifPanel}>
                  <div className={styles.notifHead}>
                    <span>Notifications</span>
                    <span className={styles.notifCount}>4 new</span>
                  </div>

                  {MOCK_NOTIF.map((a, i) => (
                    <div key={i} className={styles.notifItem}>
                      <span
                        className={styles.notifIco}
                        style={{ color: a.color, background: `${a.color}15` }}
                      >
                        <Icon d={a.icon} size={12} />
                      </span>
                      <div>
                        <p className={styles.notifTxt}>{a.text}</p>
                        <p className={styles.notifTime}>{a.time}</p>
                      </div>
                    </div>
                  ))}

                  <button
                    className={styles.notifAll}
                    onClick={() => {
                      setNotifOpen(false);
                      setSection("activity");
                    }}
                  >
                    View all activity →
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content}>
          {section === "overview" && (
            <div className={styles.overview}>
              <div className={styles.statsGrid}>
                {STATS.map((s, i) => (
                  <button
                    key={i}
                    className={styles.statCard}
                    style={{ "--ac": s.color }}
                    onClick={() => navigate("/Enterprise")}
                  >
                    <div className={styles.statTop}>
                      <div className={styles.statIco} style={{ background: `${s.color}18`, color: s.color }}>
                        <Icon d={s.icon} size={18} />
                      </div>
                      <span className={`${styles.trend} ${s.up ? styles.trendUp : styles.trendDn}`}>
                        <Icon d={s.up ? IC.arrowUp : IC.arrowDown} size={10} />
                        {s.trend}
                      </span>
                    </div>

                    <div className={styles.statVal} style={{ color: s.color }}>{s.value}</div>
                    <div className={styles.statLbl}>{s.label}</div>
                    <SparkBar data={s.spark} color={s.color} />
                    <div className={styles.statClick}>Click to explore →</div>
                  </button>
                ))}
              </div>

              <div className={styles.chartsRow}>
                <div className={styles.chartPanel}>
                  <WeeklyChart data={CHART_DATA} />
                </div>

                <div className={styles.donutPanel}>
                  <div className={styles.panelHead}>
                    <h3 className={styles.panelTitle}>Space Mix</h3>
                    <span className={styles.panelSub}>By category type</span>
                  </div>
                  <DonutChart data={DONUT_SEGS} />
                </div>
              </div>

              <div className={styles.quickPanel}>
                <div className={styles.quickHead}>
                  <div>
                    <h3 className={styles.panelTitle}>Recent Support Tickets</h3>
                    <p className={styles.panelSub}>Latest issues raised by users</p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => setSection("tickets")}>
                    View All →
                  </button>
                </div>

                <div className={styles.ticketList}>
                  {MOCK_TICKETS.slice(0, 4).map((t, i) => (
                    <div key={i} className={styles.ticketRow}>
                      <span className={styles.ticketId}>{t.id}</span>

                      <div className={styles.ticketMain}>
                        <span className={styles.ticketSubject}>{t.subject}</span>
                        <span className={styles.ticketUser}>
                          <Icon d={IC.users} size={10} />
                          {t.user}
                        </span>
                      </div>

                      <span
                        className={`${styles.pri} ${
                          t.priority === "high" ? styles.priHigh : t.priority === "medium" ? styles.priMed : styles.priLow
                        }`}
                      >
                        {t.priority}
                      </span>

                      <span
                        className={`${styles.statusBadge} ${
                          t.status === "open" ? styles.stOpen : t.status === "in_progress" ? styles.stProg : styles.stDone
                        }`}
                      >
                        {t.status === "open" ? "Open" : t.status === "in_progress" ? "In Progress" : "Resolved"}
                      </span>

                      <span className={styles.ticketTime}>
                        <Icon d={IC.clock} size={10} />
                        {t.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "users" && (
            <div className={styles.section}>
              <AdminUsers />
            </div>
          )}

          {section === "owners" && (
            <div className={styles.section}>
              <CreateOwner />
            </div>
          )}

          {section === "workspaces" && (
            <div className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco} style={{ background: "#f59e0b18", color: "#f59e0b" }}>
                  <Icon d={IC.workspace} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Management</h2>
                  <p className={styles.secSub}>Add, edit and delete workspace records.</p>
                </div>
                <span className={styles.countPill}>{workspaces.length} Total</span>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <span className={styles.formHeadIco}>
                    <Icon d={editId ? IC.edit : IC.add} size={13} />
                  </span>
                  <span>{editId ? `Editing Workspace #${editId}` : "Add New Workspace"}</span>
                </div>

                <div className={styles.formGrid}>
                  {[
                    { ph: "Workspace Name *", key: "name" },
                    { ph: "City *", key: "city" },
                    { ph: "Location / Area", key: "location" },
                    { ph: "Price (₹) *", key: "price" },
                    { ph: "Description", key: "description" },
                    { ph: "Image URL", key: "image" },
                  ].map((f) => (
                    <input
                      key={f.key}
                      className={styles.inp}
                      placeholder={f.ph}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  ))}

                  <select
                    className={styles.selectField}
                    value={form.is_available ? "available" : "unavailable"}
                    onChange={(e) => setForm({ ...form, is_available: e.target.value === "available" })}
                  >
                    <option value="available">✅ Available</option>
                    <option value="unavailable">❌ Unavailable</option>
                  </select>
                </div>

                <div className={styles.formActs}>
                  <button className={styles.btnPrimary} onClick={handleSubmit}>
                    <Icon d={editId ? IC.edit : IC.add} size={13} />
                    {editId ? " Update Workspace" : " Add Workspace"}
                  </button>

                  {editId && (
                    <button
                      className={styles.btnGhost}
                      onClick={() => {
                        setEditId(null);
                        setForm({ name: "", city: "", location: "", price: "", image: "", description: "", is_available: true });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.tableBar}>
                <div className={styles.tableSearch}>
                  <Icon d={IC.search} size={13} />
                  <input
                    className={styles.searchInp}
                    placeholder="Search workspaces..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                  />
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
                        <td className={styles.tdAccent}>₹{item.price}</td>
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
                      <tr>
                        <td colSpan="7" className={styles.tdEmpty}>No workspaces found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "categories" && (
            <div className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco} style={{ background: "#6366f118", color: "#6366f1" }}>
                  <Icon d={IC.category} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Categories</h2>
                  <p className={styles.secSub}>Create and manage categories and pricing tiers.</p>
                </div>
                <span className={styles.countPill}>{categories.length} Total</span>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <span className={styles.formHeadIco}>
                    <Icon d={IC.add} size={13} />
                  </span>
                  <span>Add New Category</span>
                </div>

                <div className={styles.formGrid}>
                  <input
                    className={styles.inp}
                    placeholder="Category Name *"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />

                  <select
                    className={styles.inp}
                    value={catForm.owner || ""}
                    onChange={(e) => setCatForm({ ...catForm, owner: e.target.value })}
                  >
                    <option value="">Assign Owner</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>{o.username}</option>
                    ))}
                  </select>

                  <select
                    className={styles.inp}
                    value={catForm.category}
                    onChange={(e) => setCatForm({ ...catForm, category: e.target.value })}
                  >
                    <option value="">Select Category Type *</option>
                    <option value="day_pass">Day Pass</option>
                    <option value="meeting">Meeting Rooms</option>
                    <option value="fixed">Fixed Seats</option>
                    <option value="cabin">Cabins</option>
                  </select>

                  <input className={styles.inp} placeholder="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                  <input className={styles.inp} placeholder="Image URL" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} />
                  <input className={styles.inp} placeholder="Hourly Price (₹)" value={catForm.hourly_price} onChange={(e) => setCatForm({ ...catForm, hourly_price: e.target.value })} />
                  <input className={styles.inp} placeholder="Daily Price (₹)" value={catForm.daily_price} onChange={(e) => setCatForm({ ...catForm, daily_price: e.target.value })} />
                  <input className={styles.inp} placeholder="Monthly Price (₹)" value={catForm.monthly_price} onChange={(e) => setCatForm({ ...catForm, monthly_price: e.target.value })} />

                  <select
                    className={styles.inp}
                    value={String(catForm.is_available)}
                    onChange={(e) => setCatForm({ ...catForm, is_available: e.target.value === "true" })}
                  >
                    <option value="true">✅ Available</option>
                    <option value="false">❌ Not Available</option>
                  </select>
                </div>

                <div className={styles.formActs}>
                  <button className={styles.btnPrimary} onClick={handleAddCat}>
                    <Icon d={IC.add} size={13} /> Add Category
                  </button>
                </div>
              </div>

              <div className={styles.catGrid}>
                {categories.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><Icon d={IC.category} size={32} /></div>
                    <p className={styles.emptyTitle}>No categories yet</p>
                    <p className={styles.emptySub}>Add your first workspace category above.</p>
                  </div>
                ) : (
                  categories.map((item) => (
                    <div key={item.id} className={styles.catCard}>
                      {item.image && (
                        <div className={styles.catImgWrap}>
                          <img src={item.image} alt={item.name} className={styles.catImg} />
                        </div>
                      )}

                      <div className={styles.catTop}>
                        <div>
                          <h4 className={styles.catName}>{item.name}</h4>
                          <span className={styles.catType}>{item.category?.replace("_", " ")}</span>
                        </div>
                        <span className={`${styles.statusBadge} ${item.is_available ? styles.stDone : styles.stOpen}`}>
                          {item.is_available ? "Available" : "Off"}
                        </span>
                      </div>

                      {item.ownername && (
                        <div className={styles.catOwner}>
                          <Icon d={IC.users} size={11} /> {item.ownername}
                        </div>
                      )}

                      <p className={styles.catDesc}>{item.description || "No description provided."}</p>

                      <div className={styles.catPrices}>
                        {[["Hourly", item.hourly_price], ["Daily", item.daily_price], ["Monthly", item.monthly_price]].map(([lbl, val]) => (
                          <div key={lbl} className={styles.priceBox}>
                            <span className={styles.priceLbl}>{lbl}</span>
                            <span className={styles.priceVal}>₹{val || 0}</span>
                          </div>
                        ))}
                      </div>

                      <button className={styles.delBtn} style={{ marginTop: 12, width: "100%" }} onClick={() => handleDeleteCat(item.id)}>
                        <Icon d={IC.trash} size={11} /> Delete Category
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === "leads" && (
            <div className={styles.sectionWrapper}>
              <AdminLeads />
            </div>
          )}

          {section === "offerleads" && (
            <div className={styles.section}>
              <AdminLeadss />
            </div>
          )}

          {section === "enterprise" && (
            <div className={styles.section}>
              <AdminDashboardEnterprise />
            </div>
          )}

          {section === "hyderabad-leads" && (
            <div className={styles.section}>
              <AdminDashboards />
            </div>
          )}

          {section === "company-leads" && (
            <div className={styles.section}>
              <AdminCompanyLeads />
            </div>
          )}

          {section === "bookings" && (
            <div className={styles.section}>
              <AdminBookings />
            </div>
          )}

          {section === "tickets" && (
            <div className={styles.section}>
              <AdminTickets />
            </div>
          )}

          {section === "amenities" && (
            <div className={styles.section}>
              <AdminAmenities />
            </div>
          )}

          {section === "activity" && (
            <div className={styles.section}>
              <RecentActivity />
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastErr : ""}`}>
          <span className={styles.toastIcon}>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
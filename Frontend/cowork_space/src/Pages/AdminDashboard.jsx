import React, { useEffect, useMemo, useRef, useState } from "react";
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
import AdminQuotationLeads from "./AdminQuotationLeads";

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
  // Eye open (active/visible)
  eyeOn: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  // Eye off (inactive/hidden)
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22",
  // Approve (check circle)
  approveCircle: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  // Reject (x circle)
  rejectCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
};

const SIDEBAR_GROUPS = [
  { id: "dashboard", label: "Dashboard", icon: IC.dashboard, section: "overview", children: null },
  { id: "manage-users", label: "Manage Users", icon: IC.users, section: "users" },
  { id: "workspaces", label: "Workspaces", icon: IC.workspace, section: "workspaces", children: null },
  {
    id: "leads-group",
    label: "Leads",
    icon: IC.leads,
    children: [
      { id: "view-leads", label: "View Leads", icon: IC.leads, section: "leads" },
      { id: "offerleads", label: "Offer Leads", icon: IC.offers, section: "offerleads" },
      { id: "enterprise", label: "Customise Leads", icon: IC.enterprise, section: "enterprise" },
      { id: "quotation-leads", label: "Quotation Leads", icon: IC.leads, section: "quotation-leads" },
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
  { id: "bookings", label: "Bookings", icon: IC.bookings, section: "bookings", children: null },
  { id: "support", label: "Support", icon: IC.support, section: "tickets", children: null },
  { id: "activity", label: "Recent Activity", icon: IC.activity, section: "activity", children: null },
  { id: "amenities", label: "Amenities", icon: IC.amenities, section: "amenities", children: null },
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
  { id: "T-201", subject: "AC not working in Cabin 3", status: "open", priority: "high", user: "Aarav M.", time: "10m ago" },
  { id: "T-202", subject: "WiFi disconnecting frequently", status: "inprogress", priority: "medium", user: "Priya S.", time: "25m ago" },
  { id: "T-203", subject: "Invoice discrepancy - May", status: "open", priority: "high", user: "Kiran D.", time: "1h ago" },
  { id: "T-204", subject: "Parking slot not assigned", status: "resolved", priority: "low", user: "Sneha R.", time: "3h ago" },
  { id: "T-205", subject: "Meeting room double booked", status: "inprogress", priority: "medium", user: "Rahul K.", time: "5h ago" },
  { id: "T-206", subject: "Printer paper jam", status: "resolved", priority: "low", user: "Meera T.", time: "1d ago" },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: "booking", icon: IC.bookings, title: "New booking confirmed", desc: "Workspace Horizon Hub booked by Aarav M. for 3 days", time: "2 min ago", color: "#f59e0b", badge: "Booking" },
  { id: 2, type: "lead", icon: IC.leads, title: "New lead assigned", desc: "Lead 4821 from Priya S. assigned to sales team", time: "8 min ago", color: "#6366f1", badge: "Lead" },
  { id: 3, type: "ticket", icon: IC.tickets, title: "Support ticket resolved", desc: "Ticket T-204 Parking slot not assigned marked resolved", time: "15 min ago", color: "#10b981", badge: "Ticket" },
  { id: 4, type: "workspace", icon: IC.workspace, title: "New workspace added", desc: "TechNest Madhapur workspace added by admin", time: "34 min ago", color: "#f43f5e", badge: "Space" },
  { id: 5, type: "user", icon: IC.users, title: "New user registered", desc: "Kiran D. created an account and verified email", time: "1 hr ago", color: "#6366f1", badge: "User" },
  { id: 6, type: "payment", icon: IC.bookings, title: "Payment received", desc: "12,500 received for Booking 1042 via Razorpay", time: "1.5 hr ago", color: "#10b981", badge: "Payment" },
  { id: 7, type: "owner", icon: IC.owners, title: "Owner account created", desc: "New owner Rahul K. onboarded for Gachibowli branch", time: "2 hr ago", color: "#f59e0b", badge: "Owner" },
  { id: 8, type: "category", icon: IC.category, title: "Category updated", desc: "Meeting Rooms pricing updated - hourly 350 420", time: "3 hr ago", color: "#6366f1", badge: "Category" },
  { id: 9, type: "lead", icon: IC.leads, title: "Enterprise lead converted", desc: "Swiggy Technologies converted from lead to enterprise client", time: "4 hr ago", color: "#f59e0b", badge: "Lead" },
  { id: 10, type: "ticket", icon: IC.tickets, title: "High priority ticket opened", desc: "Ticket T-203 Invoice discrepancy marked high priority", time: "5 hr ago", color: "#f43f5e", badge: "Ticket" },
  { id: 11, type: "booking", icon: IC.bookings, title: "Booking cancelled", desc: "Booking 1039 cancelled - refund of 4,200 initiated", time: "6 hr ago", color: "#f43f5e", badge: "Booking" },
  { id: 12, type: "workspace", icon: IC.workspace, title: "Workspace availability updated", desc: "Hitech Hub marked unavailable for maintenance", time: "8 hr ago", color: "#f59e0b", badge: "Space" },
  { id: 13, type: "user", icon: IC.users, title: "User profile updated", desc: "Sneha R. updated contact info and billing address", time: "10 hr ago", color: "#6366f1", badge: "User" },
  { id: 14, type: "payment", icon: IC.bookings, title: "Refund processed", desc: "2,800 refund processed for Booking 1035", time: "Yesterday", color: "#f43f5e", badge: "Payment" },
  { id: 15, type: "owner", icon: IC.owners, title: "Owner slot released", desc: "Meera T. released slots for Financial District space", time: "Yesterday", color: "#10b981", badge: "Owner" },
];

const WORKSPACE_TYPES = [

  "Hot Desk",

  "Dedicated Desk",

  "Private Office Space",

  "Private Cabin",

  "Meeting Room",

  "Board Room",

  "Event Space",

  "Podcast",

  "Virtual Office",

];

const LOCATIONS = [

  "Hitech City",

  "Gachibowli",

  "Madhapur",

  "Financial District",

  "Kondapur",

];


// ─── Weekly Chart ────────────────────────────────────────────────────────────
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
          <p className={styles.chartSub}>Bookings & Revenue this week</p>
        </div>
        <div className={styles.chartLegend}>
          <span className={styles.legendDot} style={{ background: "#f59e0b" }} />
          <span className={styles.legendTxt}>Bookings</span>
          <span className={styles.legendDot} style={{ background: "#6366f1" }} />
          <span className={styles.legendTxt}>Revenue k</span>
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
                    height: `${animate ? (d.revenue / maxR) * 100 : 0}%`,
                    background: "linear-gradient(180deg,#6366f1 0%,rgba(99,102,241,0.15) 100%)",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${animate ? (d.bookings / maxB) * 100 : 0}%`,
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

// ─── Donut Chart ─────────────────────────────────────────────────────────────
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
        <circle cx="64" cy="64" r="40" fill="var(--card-bg, #fff)" />
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

// ─── Spark Bar ───────────────────────────────────────────────────────────────
const mkSpark = (n, mx) => Array.from({ length: n }, () => Math.floor(Math.random() * mx) + 4);

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
            opacity: i === data.length - 1 ? 0.75 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

// ─── Management Panel (Unified Users + Owners) ───────────────────────────────
function ManagementPanel({ defaultTab = "users", owners = [], onOwnerCreated, showToast }) {
  const [tab, setTab] = useState(defaultTab);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [ownerForm, setOwnerForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchUsers = () => {
    axiosInstance
      .get("leads/users/all")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        setUsers(list);
        setUserCount(list.length);
      })
      .catch(() => {
        setUsers([]);
        setUserCount(0);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const activeUsers = users.filter((u) => u.is_active !== false).length;
  const ownerCount = owners.length;
  const verifiedOwners = owners.filter((o) => o.is_verified || o.verified).length;

  const handleCreateUser = () => {
    if (!userForm.username || !userForm.email) {
      showToast("Username and email are required", "error");
      return;
    }
    axiosInstance
      .post("users/create/", userForm)
      .then(() => {
        showToast("User created successfully");
        setShowUserForm(false);
        setUserForm({ username: "", email: "", phone: "", password: "" });
        fetchUsers();
      })
      .catch(() => showToast("Failed to create user", "error"));
  };

  const handleCreateOwner = () => {
    if (!ownerForm.username || !ownerForm.email) {
      showToast("Username and email are required", "error");
      return;
    }
    axiosInstance
      .post("owners/create/", ownerForm)
      .then(() => {
        showToast("Owner created successfully");
        setShowOwnerForm(false);
        setOwnerForm({ username: "", email: "", phone: "", password: "" });
        if (onOwnerCreated) onOwnerCreated();
      })
      .catch(() => showToast("Failed to create owner", "error"));
  };

  return (
    <div className={styles.section}>
      {/* ── Stats Row ── */}
      <div className={styles.statsGrid} style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Users", value: userCount, color: "#6366f1", icon: IC.users },
          { label: "Total Owners", value: ownerCount, color: "#f59e0b", icon: IC.owners },
          { label: "Active Users", value: activeUsers, color: "#10b981", icon: IC.check },
          { label: "Verified Owners", value: verifiedOwners, color: "#f43f5e", icon: IC.check },
        ].map((s, i) => (
          <div
            key={i}
            className={styles.statCard}
            style={{ "--ac": s.color, cursor: "default" }}
          >
            <div className={styles.statTop}>
              <div
                className={styles.statIco}
                style={{ background: `${s.color}18`, color: s.color }}
              >
                <Icon d={s.icon} size={18} />
              </div>
            </div>
            <div className={styles.statVal} style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={styles.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={tab === "users" ? styles.btnPrimary : styles.btnGhost}
          onClick={() => setTab("users")}
        >
          <Icon d={IC.users} size={13} />
          &nbsp;Manage Users
        </button>
        <button
          className={tab === "owners" ? styles.btnPrimary : styles.btnGhost}
          style={
            tab === "owners"
              ? { background: "#f59e0b", borderColor: "#f59e0b" }
              : {}
          }
          onClick={() => setTab("owners")}
        >
          <Icon d={IC.owners} size={13} />
          &nbsp;Manage Owners
        </button>
      </div>

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <div className={styles.section}>
          <AdminUsers />
        </div>
      )}

      {/* ── Owners Tab ── */}
      {tab === "owners" && (
        <div className={styles.section}>
          <CreateOwner />
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard (Main) ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities,
setAmenities] =
useState([]);
  const [form, setForm] = useState({

  name: "",

  city: "",

  location: "",

  price: "",

  image: "",

  description: "",

  amenities: [],

  isavailable: true,

});

  const [editId, setEditId] = useState(null);
  const [catForm, setCatForm] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    hourlyprice: "",
    dailyprice: "",
    monthlyprice: "",
    isavailable: true,
    owner: "",
  });

  const [section, setSection] = useState("overview");
  const [sideOpen, setSideOpen] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [notifOpen, setNotifOpen] = useState(false);
  const [actFilter, setActFilter] = useState("all");
  const [activityDropOpen, setActivityDropOpen] = useState(false);
  const notifRef = useRef(null);
  const activityRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const buildAdminNotifications = (company = [], hyd = [], offer = []) => {
    let items = [];

    company.forEach((l) => {
      items.push({
        id: `company-${l.id}`,
        type: "Company Lead",
        name: l.name,
        workspace: l.company || "-",
        section: "company-leads",
        time: "New Lead",
      });
    });

    hyd.forEach((l) => {
      items.push({
        id: `hyd-${l.id}`,
        type: "Hyderabad Lead",
        name: l.name,
        workspace: l.workspace_type,
        section: "hyderabad-leads",
        time: "New Lead",
      });
    });

    offer.forEach((l) => {
      items.push({
        id: `offer-${l.id}`,
        type: "Offer Lead",
        name: l.name,
        workspace: l.workspace_type,
        section: "offerleads",
        time: "New Lead",
      });
    });

    const filtered = items.filter(
      (item) => !viewedAdminNotifications.includes(item.id)
    );

    setAdminNotifications(filtered);
  };

  const [mgmtDefaultTab, setMgmtDefaultTab] = useState("users");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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
      .get("workspaces/admin/workspaces")
      .then((r) => setWorkspaces(Array.isArray(r.data) ? r.data : []))
      .catch(() => setWorkspaces([]));

  const fetchCat = () =>
    axiosInstance
      .get("workspaces/categories")
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]));

  const fetchOwners = () =>
    axiosInstance
      .get("owners")
      .then((r) => setOwners(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOwners([]));

  useEffect(() => {
    fetchOwners();
    fetchWS();
    fetchCat();
    axiosInstance
.get("amenities/")
.then((res) => {

  setAmenities(
    res.data || []
  );

})
.catch((err) => {

  console.log(err);

});
    Promise.all([
      axiosInstance.get("leads/company/admin/"),
      axiosInstance.get("hyderabad/admin/"),
      axiosInstance.get("leads/offers/admin/leads/"),
    ]).then(([c, h, o]) => {
      buildAdminNotifications(c.data || [], h.data || [], o.data || []);
    });

    const syncFromHash = () => {
      const rawHash = window.location.hash || "";
      const [hashSection, hashQuery] = rawHash.replace("#", "").split("?");

      if (hashSection === "workspaces") {
        setSection("workspaces");
      }

      if (hashQuery) {
        const params = new URLSearchParams(hashQuery);
        const ownerFromUrl = params.get("owner");

        if (ownerFromUrl) {
          setOwnerFilter(ownerFromUrl);
          setSearchQ(ownerFromUrl);
          setSection("workspaces");
        }
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
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
        showToast(editId ? "Updated successfully" : "Workspace added succesfully and make a approval for visible in website");
        setEditId(null);
        setForm({
          name: "",
          city: "",
          location: "",
          price: "",
          image: "",
          description: "",
          isavailable: true,
        });
        fetchWS();
      })
      .catch(() => showToast("Operation failed", "error"));
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      city: item.city || "",
      location: item.location || "",
      price: item.price || "",
      image: item.image || "",
      description: item.description || "",
      isavailable: item.isavailable ?? true,
    });
    setEditId(item.id);
    setSection("workspaces");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── NEW: Toggle Active / Inactive ───────────────────────────────────────
  // When set to inactive: is_approved becomes false → hidden from website
  // When set to active:   is_approved becomes true  → visible on website
 const handleToggleActive = (item) => {

  const isCurrentlyActive =
    item.isavailable !== false;

  const newStatus =
    !isCurrentlyActive;

  axiosInstance

    .put(

      `workspaces/update/${item.id}/`,

      {

        ...item,

        isavailable: newStatus,

        // ✅ KEEP APPROVAL SAME

        is_approved:
          item.is_approved,

      }

    )

    .then(() => {

      showToast(

        newStatus

          ? "Workspace Activated"

          : "Workspace Inactivated"

      );

      fetchWS();

    })

    .catch(() =>

      showToast(

        "Failed to update workspace",

        "error"

      )

    );

};

  const handleApprove = (id) => {
    axiosInstance
      .put(`workspaces/approve/${id}/`)
      .then(() => {
        showToast("Workspace Approved");
        fetchWS();
      })
      .catch(() => {
        showToast("Approval Failed", "error");
      });
  };

  const handleReject = (id) => {
    axiosInstance
      .put(`workspaces/reject/${id}/`)
      .then(() => {
        showToast("Workspace Rejected");
        fetchWS();
      })
      .catch(() => {
        showToast("Reject Failed", "error");
      });
  };

  const handleAddCat = () => {
    axiosInstance
      .post("workspaces/categories/add", catForm)
      .then(() => {
        showToast("Category added");
        setCatForm({
          name: "",
          category: "",
          description: "",
          image: "",
          hourlyprice: "",
          dailyprice: "",
          monthlyprice: "",
          isavailable: true,
          owner: "",
        });
        fetchCat();
      })
      .catch(() => showToast("Failed to add", "error"));
  };

  const handleDeleteCat = (id) => {
    if (!window.confirm("Delete this category?")) return;
    axiosInstance
      .delete(`workspaces/categories/delete/${id}`)
      .then(() => {
        showToast("Deleted");
        fetchCat();
      })
      .catch(() => showToast("Delete failed", "error"));
  };

  const toggleGroup = (id) => setOpenGroup((prev) => (prev === id ? null : id));

  const goNav = (item) => {
    if (item.path) {
      navigate(item.path);
      setMobOpen(false);
      return;
    }
    if (item.section) {
      if (item.section === "users") {
        setMgmtDefaultTab("users");
        setSection("management");
      } else if (item.section === "owners") {
        setMgmtDefaultTab("owners");
        setSection("management");
      } else {
        setSection(item.section);
      }
      setMobOpen(false);
    }
  };

  const closeMob = () => setMobOpen(false);

  const handleMobileMenuToggle = () => {
    if (isMobile) setMobOpen((p) => !p);
    else setSideOpen((p) => !p);
  };

  const ownerOptions = useMemo(() => {
    const names = [
      ...new Set(
        workspaces
          .map((w) => w.ownername || w.owner_name || w.owner?.username || w.owner?.name || "")
          .filter(Boolean)
      ),
    ];
    return names.sort((a, b) => a.localeCompare(b));
  }, [workspaces]);

  const workspaceTypeOptions = useMemo(() => {
    const types = [
      ...new Set(
        workspaces
          .map(
            (w) =>
              w.usertype ||
              w.workspace_type ||
              w.workspacetype ||
              w.category ||
              w.name ||
              ""
          )
          .filter(Boolean)
      ),
    ];
    return types.sort((a, b) => a.localeCompare(b));
  }, [workspaces]);

  const filteredWS = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return workspaces.filter((w) => {
      const ownerName = (
        w.ownername ||
        w.owner_name ||
        w.owner?.username ||
        w.owner?.name ||
        ""
      )
        .toString()
        .toLowerCase();

      const workspaceType = (
        w.usertype ||
        w.workspace_type ||
        w.workspacetype ||
        w.category ||
        w.name ||
        ""
      )
        .toString()
        .toLowerCase();

      const matchesSearch =
        !q ||
        w.name?.toLowerCase().includes(q) ||
        w.city?.toLowerCase().includes(q) ||
        w.location?.toLowerCase().includes(q) ||
        ownerName.includes(q) ||
        workspaceType.includes(q);

      const matchesOwner =
        !ownerFilter || ownerName === ownerFilter.toLowerCase();

      const matchesType =
        !workspaceTypeFilter || workspaceType === workspaceTypeFilter.toLowerCase();

      return matchesSearch && matchesOwner && matchesType;
    });
  }, [workspaces, searchQ, ownerFilter, workspaceTypeFilter]);

  const filteredTickets =
    ticketFilter === "all"
      ? MOCK_TICKETS
      : MOCK_TICKETS.filter((t) => t.status === ticketFilter);

  const filteredActivity =
    actFilter === "all"
      ? RECENT_ACTIVITIES
      : RECENT_ACTIVITIES.filter((a) => a.type === actFilter);

  const STATS = [
    {
      label: "Total Workspaces",
      value: workspaces.length,
      color: "#f59e0b",
      spark: SPARKS.ws,
      trend: 12,
      up: true,
      icon: IC.workspace,
    },
    {
      label: "Categories",
      value: 9,
      color: "#6366f1",
      spark: SPARKS.cat,
      trend: 8,
      up: true,
      icon: IC.category,
    },
    {
      label: "Total Owners",
      value: owners.length,
      color: "#10b981",
      spark: SPARKS.own,
      trend: 3,
      up: true,
      icon: IC.owners,
    },
  ];

  const [adminNotifications, setAdminNotifications] = useState([]);

  const [viewedAdminNotifications, setViewedAdminNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem("adminViewedNotifications")) || [];
  });

  useEffect(() => {
    localStorage.setItem(
      "adminViewedNotifications",
      JSON.stringify(viewedAdminNotifications)
    );
  }, [viewedAdminNotifications]);

  const sectionTitle = (() => {
    const map = {
      overview: "Dashboard Overview",
      management: "Management",
      workspaces: "Workspace Management",
      categories: "Category Management",
      tickets: "Support Tickets",
      activity: "Recent Activity",
    };
    return map[section] || "Dashboard";
  })();

  const activityTypes = ["all", "booking", "lead", "ticket", "workspace", "user", "payment", "owner", "category"];

  const handleTopNavClick = (group) => {
    if (group.section === "users") {
      setMgmtDefaultTab("users");
      setSection("management");
    } else if (group.section === "owners") {
      setMgmtDefaultTab("owners");
      setSection("management");
    } else {
      setSection(group.section);
    }
    closeMob();
  };

  return (
    <div className={styles.root}>
      {mobOpen && <div className={styles.mobOverlay} onClick={closeMob} />}

      {/* ── Sidebar ── */}
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
              Co<span className={styles.logoAccent}>Work</span>
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
              const isActive =
                section === group.section ||
                (group.section === "overview" && section === "overview");

              return (
                <button
                  key={group.id}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => handleTopNavClick(group)}
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
            const isActive = group.children.some(
              (c) =>
                c.section === section ||
                (section === "management" &&
                  (c.section === "users" || c.section === "owners"))
            );

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
                    <span className={styles.navLabel}>{group.label}</span>
                  )}
                  {(sideOpen || mobOpen) && (
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                      <Icon d={IC.chevDown} size={11} />
                    </span>
                  )}
                </button>

                {(sideOpen || mobOpen) && isOpen && (
                  <div className={styles.navChildren}>
                    {group.children.map((child) => {
                      const childActive =
                        section === child.section ||
                        (section === "management" && child.section === mgmtDefaultTab) ||
                        (section === "management" &&
                          child.section === "users" &&
                          mgmtDefaultTab === "users") ||
                        (section === "management" &&
                          child.section === "owners" &&
                          mgmtDefaultTab === "owners");

                      return (
                        <button
                          key={child.id}
                          className={`${styles.navChild} ${childActive ? styles.navChildActive : ""}`}
                          onClick={() => goNav(child)}
                        >
                          <span className={styles.childDot} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
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

      {/* ── Main Content ── */}
      <div className={`${styles.main} ${!isMobile && !sideOpen ? styles.mainCollapsed : ""}`}>
        {/* ── Topbar ── */}
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <button className={styles.menuBtn} onClick={handleMobileMenuToggle}>
              <Icon d={IC.menu} size={18} />
            </button>
            <div className={styles.topTitle}>
              <span className={styles.topSub}>Admin Panel</span>
              <span className={styles.topSection}>{sectionTitle}</span>
            </div>
          </div>

          <div className={styles.topRight}>
            {/* Notification Bell */}
            <div className={styles.notifWrap} ref={notifRef}>
              <button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                onClick={() => setNotifOpen((p) => !p)}
              >
                <Icon d={IC.bell} size={15} />
                {adminNotifications.length > 0 && (
                  <span className={styles.notifBadge}>{adminNotifications.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className={styles.notifPanel}>
                  <div className={styles.notifHead}>
                    Notifications
                    <span className={styles.notifCount}>{adminNotifications.length}</span>
                  </div>

                  {adminNotifications.map((n) => (
                    <div key={n.id} className={styles.notifItem}>
                      <div
                        className={styles.notifIco}
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          color: "#6366f1",
                        }}
                      >
                        <Icon d={IC.bell} size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={styles.notifTxt}>
                          <strong>{n.type}</strong>
                          <br />
                          {n.name}
                        </div>
                        <div className={styles.notifTime}>{n.workspace}</div>
                      </div>
                      <button
                        className={styles.viewBtn}
                        onClick={() => {
                          setSection(n.section);

                          const sameSectionIds = adminNotifications
                            .filter((item) => item.section === n.section)
                            .map((item) => item.id);

                          const updatedViewed = [
                            ...new Set([...viewedAdminNotifications, ...sameSectionIds]),
                          ];

                          setViewedAdminNotifications(updatedViewed);

                          setAdminNotifications((prev) =>
                            prev.filter((item) => item.section !== n.section)
                          );

                          setNotifOpen(false);
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className={styles.content}>

          {/* Dashboard Overview */}
          {section === "overview" && (
            <section className={styles.overview}>
              <div className={styles.statsGrid}>
                {STATS.map((s, i) => (
                  <button
                    key={i}
                    className={styles.statCard}
                    style={{ "--ac": s.color }}
                    onClick={() => navigate("/enterprise")}
                  >
                    <div className={styles.statTop}>
                      <div
                        className={styles.statIco}
                        style={{ background: `${s.color}18`, color: s.color }}
                      >
                        <Icon d={s.icon} size={18} />
                      </div>
                      <span
                        className={`${styles.trend} ${s.up ? styles.trendUp : styles.trendDn}`}
                      >
                        <Icon d={s.up ? IC.arrowUp : IC.arrowDown} size={10} />
                        {s.trend}%
                      </span>
                    </div>
                    <div className={styles.statVal} style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className={styles.statLbl}>{s.label}</div>
                    <SparkBar data={s.spark} color={s.color} />
                    <div className={styles.statClick}>Click to explore</div>
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
                  <button
                    className={styles.viewAllBtn}
                    onClick={() => setSection("tickets")}
                  >
                    View All
                  </button>
                </div>

                <div className={styles.ticketList}>
                  {MOCK_TICKETS.slice(0, 4).map((t, i) => (
                    <div key={i} className={styles.ticketRow}>
                      <span className={styles.ticketId}>{t.id}</span>
                      <div className={styles.ticketMain}>
                        <span className={styles.ticketSubject}>{t.subject}</span>
                        <span className={styles.ticketUser}>
                          <Icon d={IC.users} size={10} /> {t.user}
                        </span>
                      </div>
                      <span
                        className={`${styles.pri} ${
                          t.priority === "high"
                            ? styles.priHigh
                            : t.priority === "medium"
                            ? styles.priMed
                            : styles.priLow
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${
                          t.status === "open"
                            ? styles.stOpen
                            : t.status === "inprogress"
                            ? styles.stProg
                            : styles.stDone
                        }`}
                      >
                        {t.status === "open"
                          ? "Open"
                          : t.status === "inprogress"
                          ? "In Progress"
                          : "Resolved"}
                      </span>
                      <span className={styles.ticketTime}>
                        <Icon d={IC.clock} size={10} /> {t.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Unified Management Section ── */}
          {section === "management" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div
                  className={styles.secIco}
                  style={{ background: "#6366f118", color: "#6366f1" }}
                >
                  <Icon d={IC.users} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Management</h2>
                  <p className={styles.secSub}>
                    Manage users and owners from one place.
                  </p>
                </div>
              </div>
              <ManagementPanel
                defaultTab={mgmtDefaultTab}
                owners={owners}
                showToast={showToast}
                onOwnerCreated={fetchOwners}
              />
            </section>
          )}

          {/* Workspaces */}
          {section === "workspaces" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div
                  className={styles.secIco}
                  style={{ background: "#f59e0b18", color: "#f59e0b" }}
                >
                  <Icon d={IC.workspace} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Workspaces</h2>
                  <p className={styles.secSub}>
                    Owner filtered workspace details view in admin dashboard.
                  </p>
                </div>
                <span className={styles.countPill}>
                  {ownerFilter
                    ? `${filteredWS.length} for ${ownerFilter}`
                    : `${filteredWS.length} Filtered`}
                </span>
              </div>

              {/* Add / Edit Form */}
              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <span className={styles.formHeadIco}>
                    <Icon d={editId ? IC.edit : IC.add} size={13} />
                  </span>
                  <span>{editId ? `Editing Workspace #${editId}` : "Add New Workspace"}</span>
                </div>

                <div className={styles.formGrid}>
             
                {/* Workspace Type */}

<select
  className={styles.selectField}
  value={form.name}
  onChange={(e) =>
    setForm({
      ...form,
      name: e.target.value,
    })
  }
>

  <option value="">
    Select Workspace Type
  </option>

  {WORKSPACE_TYPES.map((type) => (

    <option
      key={type}
      value={type}
    >

      {type}

    </option>

  ))}

</select>

{/* Location */}

<select
  className={styles.selectField}
  value={form.city}
  onChange={(e) =>
    setForm({
      ...form,
      city: e.target.value,
    })
  }
>

  <option value="">
    Select Location
  </option>

  {LOCATIONS.map((loc) => (

    <option
      key={loc}
      value={loc}
    >

      {loc}

    </option>

  ))}

</select>

{/* Location Area */}

<input
  className={styles.inp}
  placeholder="Location Area"
  value={form.location}
  onChange={(e) =>
    setForm({
      ...form,
      location: e.target.value,
    })
  }
/>

{/* Price */}

<input
  className={styles.inp}
  placeholder="Price"
  value={form.price}
  onChange={(e) =>
    setForm({
      ...form,
      price: e.target.value,
    })
  }
/>

{/* Description */}

<input
  className={styles.inp}
  placeholder="Description"
  value={form.description}
  onChange={(e) =>
    setForm({
      ...form,
      description: e.target.value,
    })
  }
/>

{/* Image URL */}

<input
  className={styles.inp}
  placeholder="Image URL"
  value={form.image}
  onChange={(e) =>
    setForm({
      ...form,
      image: e.target.value,
    })
  }
/>
{/* Amenities */}

<div className={styles.fieldGroup}>

  {/* <label>
    Amenities
  </label> */}

  <div
    className={styles.amenitiesGrid}
  >

    {amenities.map((a) => (

      <label
        key={a.id}
        className={
          styles.amenityItem
        }
      >

        <input

          type="checkbox"

          checked={
            form.amenities?.includes(
              a.id
            )
          }

          onChange={(e) => {

            if (e.target.checked) {

              setForm({

                ...form,

                amenities: [

                  ...(form.amenities || []),

                  a.id,

                ],

              });

            } else {

              setForm({

                ...form,

                amenities:

                  form.amenities.filter(

                    (id) =>
                      id !== a.id

                  ),

              });

            }

          }}

        />

        {a.name}

      </label>

    ))}

  </div>

</div>
                  {/* <select
                    className={styles.selectField}
                    value={form.isavailable ? "available" : "unavailable"}
                    onChange={(e) =>
                      setForm({ ...form, isavailable: e.target.value === "available" })
                    }
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select> */}
                </div>

                <div className={styles.formActs}>
                  <button className={styles.btnPrimary} onClick={handleSubmit}>
                    <Icon d={editId ? IC.edit : IC.add} size={13} />
                    {editId ? "Update Workspace" : "Add Workspace"}
                  </button>

                  {editId && (
                    <button
                      className={styles.btnGhost}
                      onClick={() => {
                        setEditId(null);
                        setForm({
                          name: "",
                          city: "",
                          location: "",
                          price: "",
                          image: "",
                          description: "",
                          isavailable: true,
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div
                className={styles.tableBar}
                style={{ gap: "12px", flexWrap: "wrap" }}
              >
                <div className={styles.tableSearch}>
                  <Icon d={IC.search} size={13} />
                  <input
                    className={styles.searchInp}
                    placeholder="Search workspace, city, owner..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                  />
                </div>

                <select
                  className={styles.selectField}
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <option value="">All Owners</option>
                  {ownerOptions.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.selectField}
                  value={workspaceTypeFilter}
                  onChange={(e) => setWorkspaceTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {workspaceTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <button
                  className={styles.btnGhost}
                  onClick={() => {
                    setSearchQ("");
                    setOwnerFilter("");
                    setWorkspaceTypeFilter("");
                    window.location.hash = "workspaces";
                  }}
                >
                  <Icon d={IC.refresh} size={13} />
                  Reset Filters
                </button>

                <span className={styles.tableCount}>{filteredWS.length} records</span>
              </div>

              {/* Table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Owner Name</th>
                      <th>Workspace Type</th>
                      <th>Name</th>
                      <th>City</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Approval</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWS.map((item, i) => {
                      const ownerName =
                        item.ownername ||
                        item.owner_name ||
                        item.owner?.username ||
                        item.owner?.name ||
                        "No Owner";

                      const workspaceType =
                        item.usertype ||
                        item.workspace_type ||
                        item.workspacetype ||
                        item.category ||
                        item.name ||
                        "-";

                      const isActive = item.isavailable !== false;

                      return (
                        <tr
                          key={item.id}
                          style={
                            !isActive
                              ? { opacity: 0.55, background: "rgba(0,0,0,0.02)" }
                              : {}
                          }
                        >
                          <td className={styles.tdSerial}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td className={styles.tdBold}>{ownerName}</td>
                          <td className={styles.tdMuted}>{workspaceType}</td>
                          <td className={styles.tdBold}>{item.name}</td>
                          <td>{item.city}</td>
                          <td className={styles.tdMuted}>{item.location}</td>
                          <td className={styles.tdAccent}>{item.price}</td>

                          {/* Approval column */}
                          <td>
                            {item.is_approved ? (
                              <span className={styles.approvedBadge}>Approved</span>
                            ) : (
                              <span className={styles.pendingBadge}>Pending</span>
                            )}
                          </td>

                          {/* Active / Inactive status column */}
                          <td>
                            {isActive ? (
                              <span
                                className={styles.approvedBadge}
                                style={{ background: "#10b98118", color: "#10b981", border: "1px solid #10b98130" }}
                              >
                                Active
                              </span>
                            ) : (
                              <span
                                className={styles.pendingBadge}
                                style={{ background: "#6b728018", color: "#6b7280", border: "1px solid #6b728030" }}
                              >
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions — icons only */}
                          <td>
                            <div className={styles.actCell}>

                              {/* Edit icon */}
                              <button
                                className={styles.editBtn}
                                title="Edit Workspace"
                                onClick={() => handleEdit(item)}
                                style={{ padding: "5px 7px" }}
                              >
                                <Icon d={IC.edit} size={13} />
                              </button>

                              {/* Approve / Reject icon */}
                              {!item.is_approved ? (
                                <button
                                  className={styles.approveBtn}
                                  title="Approve Workspace"
                                  onClick={() => handleApprove(item.id)}
                                  style={{ padding: "5px 7px" }}
                                >
                                  <Icon d={IC.approveCircle} size={13} />
                                </button>
                              ) : (
                                <button
                                  className={styles.rejectBtn}
                                  title="Reject / Revoke Approval"
                                  onClick={() => handleReject(item.id)}
                                  style={{ padding: "5px 7px" }}
                                >
                                  <Icon d={IC.rejectCircle} size={13} />
                                </button>
                              )}

                              {/* Active / Inactive toggle icon */}
                              <button
                                title={isActive ? "Set Inactive (hide from website)" : "Set Active (show on website)"}
                                onClick={() => handleToggleActive(item)}
                                style={{
                                  padding: "5px 7px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  border: "none",
                                  cursor: "pointer",
                                  background: isActive ? "#10b98118" : "#6b728018",
                                  color: isActive ? "#10b981" : "#6b7280",
                                  transition: "all 0.18s ease",
                                }}
                              >
                                <Icon d={isActive ? IC.eyeOn : IC.eyeOff} size={13} />
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredWS.length === 0 && (
                      <tr>
                        <td colSpan={10} className={styles.tdEmpty}>
                          No workspaces found for selected owner/type filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Categories */}
          {section === "categories" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div
                  className={styles.secIco}
                  style={{ background: "#6366f118", color: "#6366f1" }}
                >
                  <Icon d={IC.category} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Categories</h2>
                  <p className={styles.secSub}>
                    Create and manage categories and pricing tiers.
                  </p>
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
                    placeholder="Category Name"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />

                  <select
                    className={styles.inp}
                    value={catForm.owner}
                    onChange={(e) => setCatForm({ ...catForm, owner: e.target.value })}
                  >
                    <option value="">Assign Owner</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.username}
                      </option>
                    ))}
                  </select>

                  <select
                    className={styles.inp}
                    value={catForm.category}
                    onChange={(e) =>
                      setCatForm({ ...catForm, category: e.target.value })
                    }
                  >
                    <option value="">Select Category Type</option>
                    <option value="daypass">Day Pass</option>
                    <option value="meeting">Meeting Rooms</option>
                    <option value="fixed">Fixed Seats</option>
                    <option value="cabin">Cabins</option>
                  </select>

                  <input
                    className={styles.inp}
                    placeholder="Description"
                    value={catForm.description}
                    onChange={(e) =>
                      setCatForm({ ...catForm, description: e.target.value })
                    }
                  />
                  <input
                    className={styles.inp}
                    placeholder="Image URL"
                    value={catForm.image}
                    onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  />
                  <input
                    className={styles.inp}
                    placeholder="Hourly Price"
                    value={catForm.hourlyprice}
                    onChange={(e) =>
                      setCatForm({ ...catForm, hourlyprice: e.target.value })
                    }
                  />
                  <input
                    className={styles.inp}
                    placeholder="Daily Price"
                    value={catForm.dailyprice}
                    onChange={(e) =>
                      setCatForm({ ...catForm, dailyprice: e.target.value })
                    }
                  />
                  <input
                    className={styles.inp}
                    placeholder="Monthly Price"
                    value={catForm.monthlyprice}
                    onChange={(e) =>
                      setCatForm({ ...catForm, monthlyprice: e.target.value })
                    }
                  />
                  <select
                    className={styles.inp}
                    value={String(catForm.isavailable)}
                    onChange={(e) =>
                      setCatForm({ ...catForm, isavailable: e.target.value === "true" })
                    }
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                <div className={styles.formActs}>
                  <button className={styles.btnPrimary} onClick={handleAddCat}>
                    <Icon d={IC.add} size={13} />
                    Add Category
                  </button>
                </div>
              </div>

              <div className={styles.catGrid}>
                {categories.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Icon d={IC.category} size={32} />
                    </div>
                    <p className={styles.emptyTitle}>No categories yet</p>
                    <p className={styles.emptySub}>
                      Add your first workspace category above.
                    </p>
                  </div>
                ) : (
                  categories.map((item) => (
                    <div key={item.id} className={styles.catCard}>
                      {item.image && (
                        <div className={styles.catImgWrap}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className={styles.catImg}
                          />
                        </div>
                      )}

                      <div className={styles.catTop}>
                        <div>
                          <h4 className={styles.catName}>{item.name}</h4>
                          <span className={styles.catType}>
                            {item.category?.replace("_", " ")}
                          </span>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            item.isavailable ? styles.stDone : styles.stOpen
                          }`}
                        >
                          {item.isavailable ? "Available" : "Off"}
                        </span>
                      </div>

                      {item.ownername && (
                        <div className={styles.catOwner}>
                          <Icon d={IC.users} size={11} /> {item.ownername}
                        </div>
                      )}

                      <p className={styles.catDesc}>
                        {item.description || "No description provided."}
                      </p>

                      <div className={styles.catPrices}>
                        {[
                          ["Hourly", item.hourlyprice],
                          ["Daily", item.dailyprice],
                          ["Monthly", item.monthlyprice],
                        ].map(([lbl, val]) => (
                          <div key={lbl} className={styles.priceBox}>
                            <span className={styles.priceLbl}>{lbl}</span>
                            <span className={styles.priceVal}>{val || 0}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        className={styles.delBtn}
                        style={{ marginTop: 12, width: "100%" }}
                        onClick={() => handleDeleteCat(item.id)}
                      >
                        <Icon d={IC.trash} size={11} />
                        Delete Category
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Quotation Leads */}
          {section === "quotation-leads" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div>
                  <h2 className={styles.secTitle}>Quotation Leads</h2>
                  <p className={styles.secSub}>
                    All quotation leads with owner and location details
                  </p>
                </div>
              </div>
              <AdminQuotationLeads />
            </section>
          )}

          {/* Other Sections */}
          {section === "leads" && (
            <section className={styles.sectionWrapper}>
              <AdminLeads />
            </section>
          )}
          {section === "offerleads" && (
            <section className={styles.section}>
              <AdminLeadss />
            </section>
          )}
          {section === "enterprise" && (
            <section className={styles.section}>
              <AdminDashboardEnterprise />
            </section>
          )}
          {section === "hyderabad-leads" && (
            <section className={styles.section}>
              <AdminDashboards />
            </section>
          )}
          {section === "company-leads" && (
            <section className={styles.section}>
              <AdminCompanyLeads />
            </section>
          )}
          {section === "bookings" && (
            <section className={styles.section}>
              <AdminBookings />
            </section>
          )}
          {section === "tickets" && (
            <section className={styles.section}>
              <AdminTickets />
            </section>
          )}
          {section === "amenities" && (
            <section className={styles.section}>
              <AdminAmenities />
            </section>
          )}

          {/* Recent Activity Full Page */}
          {section === "activity" && (
            <section className={styles.section}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                {activityTypes.map((type) => (
                  <button
                    key={type}
                    className={type === actFilter ? styles.btnPrimary : styles.btnGhost}
                    onClick={() => setActFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <RecentActivity activities={filteredActivity} />
            </section>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "error" ? styles.toastErr : ""}`}
        >
          <span className={styles.toastIcon}>•</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

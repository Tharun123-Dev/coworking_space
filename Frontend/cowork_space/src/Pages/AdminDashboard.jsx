import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
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

// ─── Icon ────────────────────────────────────────────────────────────────────
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
  eyeOn: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22",
  approveCircle: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  rejectCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
  userPlus: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M8.5 11a4 4 0 100-8 4 4 0 000 8 M20 8v6 M23 11h-6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  mapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
};



const SIDEBAR_GROUPS = [
  { id: "dashboard", label: "Dashboard", icon: IC.dashboard, section: "overview", children: null },
  { id: "manage-users", label: "Manage Users", icon: IC.users, section: "management" },
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
      // { id: "company-leads", label: "Company Leads", icon: IC.leads, section: "company-leads" },
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
  "Hot Desk", "Dedicated Desk", "Private Office Space", "Private Cabin",
  "Meeting Room", "Board Room", "Event Space", "Podcast", "Virtual Office",
];

const LOCATIONS = [
  "Hitech City", "Gachibowli", "Madhapur", "Financial District", "Kondapur",
];

// ─── Weekly Chart ─────────────────────────────────────────────────────────────
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

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 128 128" width="130" height="130">
        {data.map((seg, i) => {
          const dash = (seg.pct / 100) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth="18" strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx="64" cy="64" r="40" fill="var(--card-bg, #fff)" />
        <text x="64" y="60" textAnchor="middle" fill="#1E1A08" fontSize="11" fontWeight="700">Space</text>
        <text x="64" y="75" textAnchor="middle" fill="#A89A6A" fontSize="9">Mix</text>
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

// ─── Spark Bar ────────────────────────────────────────────────────────────────
const mkSpark = (n, mx) => Array.from({ length: n }, () => Math.floor(Math.random() * mx) + 4);

function SparkBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className={styles.spark}>
      {data.map((v, i) => (
        <div key={i} className={styles.sparkBar}
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

// ─── UNIFIED MANAGEMENT PANEL ─────────────────────────────────────────────────
function UnifiedManagementPanel({ showToast, initialRoleFilter = "all" }) {
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [activeStat, setActiveStat] = useState(initialRoleFilter === "owners" ? "owners" : "all");

  const [formMode, setFormMode] = useState(null);

  const [userForm, setUserForm] = useState({ username: "", email: "", phone: "", password: "" });
  const [editUserId, setEditUserId] = useState(null);

  const ownerFormInit = { username: "", email: "", password: "", location: "" };
  const [ownerForm, setOwnerForm] = useState(ownerFormInit);
  const [editOwnerId, setEditOwnerId] = useState(null);

  useEffect(() => {
    setRoleFilter(initialRoleFilter);
    setActiveStat(initialRoleFilter === "owners" ? "owners" : "all");
  }, [initialRoleFilter]);

  const fetchUsers = () => {
    axiosInstance.get("leads/users/all/")
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setUsers([]));
  };

  const fetchOwners = () => {
    axiosInstance.get("owners/")
      .then((r) => setOwners(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOwners([]));
  };

  useEffect(() => {
    fetchUsers();
    fetchOwners();
  }, []);

  const activeUsers = users.filter((u) => u.is_active !== false).length;
  const adminUsers = users.filter((u) => u.is_admin || u.is_superuser).length;

  const combined = useMemo(() => {
    const q = search.toLowerCase().trim();
    const ownerEmails = owners.map((o) => o.email?.toLowerCase());
    const filteredUsers = users.filter((u) => !ownerEmails.includes(u.email?.toLowerCase()));
    const uList = filteredUsers.map((u) => ({ ...u, _type: "user" }));
    const oList = owners.map((o) => ({ ...o, _type: "owner" }));
    let merged = [...uList, ...oList];

    if (activeStat === "owners") merged = oList;

    if (roleFilter === "users") merged = uList;
    else if (roleFilter === "owners") merged = oList;
    else if (roleFilter === "admins") merged = uList.filter((u) => u.is_admin || u.is_superuser);

    if (q) {
      merged = merged.filter((item) =>
        [item.username, item.email, item.phone, item.location]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }
    return merged;
  }, [users, owners, search, roleFilter, activeStat]);

  const resetForms = () => {
    setFormMode(null);
    setUserForm({ username: "", email: "", phone: "", password: "" });
    setOwnerForm(ownerFormInit);
    setEditUserId(null);
    setEditOwnerId(null);
  };

  const openEditUser = (u) => {
    setEditUserId(u.id);
    setUserForm({
      username: u.username || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      is_admin: u.is_admin ?? u.is_superuser ?? false,
    });
    setFormMode("editUser");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditOwner = (o) => {
    setEditOwnerId(o.id);
    setOwnerForm({
      username: o.username || "",
      email: o.email || "",
      password: "",
      location: o.location || "",
    });
    setFormMode("editOwner");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateUser = async () => {
    if (!userForm.username || !userForm.email) { showToast("Username and email are required", "error"); return; }
    try {
      setLoading(true);
      await axiosInstance.post("leads/users/create/", userForm);
      showToast("User created successfully");
      resetForms();
      fetchUsers();
    } catch { showToast("Failed to create user", "error"); }
    finally { setLoading(false); }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`leads/users/update/${editUserId}/`, {
        username: userForm.username,
        email: userForm.email,
        phone: userForm.phone,
        is_admin: userForm.is_admin || false,
      });
      showToast("User updated successfully");
      resetForms();
      fetchUsers();
    } catch { showToast("Failed to update user", "error"); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axiosInstance.delete(`leads/users/delete/${id}/`);
      showToast("User deleted");
      fetchUsers();
    } catch { showToast("Failed to delete user", "error"); }
  };

  const handleCreateOwner = async () => {
    if (!ownerForm.username || !ownerForm.email || !ownerForm.password) {
      showToast("Username, email and password are required", "error"); return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("admin/create-owner/", ownerForm);
      showToast("Owner created successfully");
      resetForms();
      fetchOwners();
    } catch { showToast("Failed to create owner", "error"); }
    finally { setLoading(false); }
  };

  const handleUpdateOwner = async () => {
    try {
      setLoading(true);
      const payload = { username: ownerForm.username, email: ownerForm.email, location: ownerForm.location };
      if (ownerForm.password.trim()) payload.password = ownerForm.password;
      await axiosInstance.put(`owners/update/${editOwnerId}/`, payload);
      showToast("Owner updated successfully");
      resetForms();
      fetchOwners();
    } catch { showToast("Failed to update owner", "error"); }
    finally { setLoading(false); }
  };

  const handleDeleteOwner = async (id) => {
    if (!window.confirm("Delete this owner?")) return;
    try {
      await axiosInstance.delete(`owners/delete/${id}/`);
      showToast("Owner deleted");
      fetchOwners();
    } catch { showToast("Failed to delete owner", "error"); }
  };

  const isUserForm = formMode === "addUser" || formMode === "editUser";
  const isOwnerForm = formMode === "addOwner" || formMode === "editOwner";
  const isEditMode = formMode === "editUser" || formMode === "editOwner";

  const S = {
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "12px",
      marginBottom: "20px",
    },
    statCard: (color, active) => ({
      border: `1px solid ${active ? color : color + "25"}`,
      borderRadius: "12px",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      cursor: "pointer",
      background: active ? `${color}08` : "transparent",
      transition: "all 0.18s",
    }),
    statIco: (color) => ({
      width: 36,
      height: 36,
      borderRadius: "8px",
      background: `${color}18`,
      color: "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "4px",
    }),
    statVal: () => ({ fontSize: "22px", fontWeight: 700, color: "#000", lineHeight: 1 }),
    statLbl: { fontSize: "11px", color: "#000", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
    actionBar: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
    addUserBtn: {
      display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px",
      borderRadius: "8px", border: "none", background: "#6366f1", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "opacity 0.18s",
    },
    addOwnerBtn: {
      display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px",
      borderRadius: "8px", border: "none", background: "#f59e0b", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "opacity 0.18s",
    },
    formCard: (accent) => ({
      background: "var(--card-bg, #fff)", border: `1.5px solid ${accent}30`, borderRadius: "12px",
      padding: "20px", marginBottom: "20px", boxShadow: `0 2px 12px ${accent}08`,
    }),
    formTitle: (accent) => ({
      fontSize: "15px", fontWeight: 700, color: accent, marginBottom: "16px",
      display: "flex", alignItems: "center", gap: "8px",
    }),
    formGrid: {
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "12px", marginBottom: "16px",
    },
    inp: {
      padding: "9px 12px", borderRadius: "8px", border: "1.5px solid var(--border, #e5e7eb)",
      fontSize: "13px", width: "100%", outline: "none", color: "#000", background: "#fff", boxSizing: "border-box",
    },
    checkRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "9px 0" },
    formActions: { display: "flex", gap: "10px", flexWrap: "wrap" },
    submitBtn: (color) => ({
      display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px",
      borderRadius: "8px", border: "none", background: color, color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer",
    }),
    cancelBtn: {
      display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px",
      borderRadius: "8px", border: "1.5px solid #000", background: "#fff", color: "#000", fontWeight: 600, fontSize: "13px", cursor: "pointer",
    },
    filterBar: { display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" },
    searchWrap: {
      display: "flex", alignItems: "center", gap: "8px", background: "var(--card-bg, #fff)",
      border: "1.5px solid var(--border, #e5e7eb)", borderRadius: "8px", padding: "7px 12px", flex: "1", minWidth: "200px",
    },
    searchInp: { border: "none", outline: "none", fontSize: "13px", color: "black", width: "100%", background: "transparent" },
    roleBtn: (active) => ({
      padding: "7px 14px", borderRadius: "8px",
      border: active ? "none" : "1.5px solid var(--border, #e5e7eb)",
      background: active ? "#6366f1" : "transparent",
      color: active ? "#fff" : "#555",
      fontWeight: 600, fontSize: "12px", cursor: "pointer", transition: "all 0.18s",
    }),
    tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1.5px solid var(--border, #e5e7eb)" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    th: {
      padding: "11px 14px", textAlign: "left", color: "var(--muted, #252020)", fontWeight: 600,
      fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em",
      borderBottom: "1.5px solid var(--border, #e5e7eb)", whiteSpace: "nowrap",
    },
    td: { padding: "11px 14px", borderBottom: "1px solid var(--border-light, #f3f4f6)", color: "#000", verticalAlign: "middle" },
    avatarCell: (color) => ({
      width: 32, height: 32, borderRadius: "50%", background: `${color}20`, color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: "13px", flexShrink: 0,
    }),
    userBadge: {
      display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px",
      borderRadius: "20px", background: "#6366f115", color: "#6366f1", fontSize: "11px", fontWeight: 600, border: "1px solid #6366f125",
    },
    ownerBadge: {
      display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px",
      borderRadius: "20px", background: "#f59e0b15", color: "#f59e0b", fontSize: "11px", fontWeight: 600, border: "1px solid #f59e0b25",
    },
    adminBadge: {
      display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px",
      borderRadius: "20px", background: "#10b98115", color: "#10b981", fontSize: "11px", fontWeight: 600, border: "1px solid #10b98125",
    },
    editBtn: {
      padding: "5px 10px", borderRadius: "6px", border: "none", background: "#6366f115",
      color: "#000", cursor: "pointer", fontSize: "12px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: "4px",
    },
    delBtn: {
      padding: "5px 10px", borderRadius: "6px", border: "none", background: "#f43f5e15",
      color: "#f43f5e", cursor: "pointer", fontSize: "12px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: "4px",
    },
    emptyRow: { padding: "40px", textAlign: "center", color: "var(--muted, #aaa)", fontSize: "14px" },
    countBadge: {
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "20px", background: "var(--badge-bg, #f3f4f6)", color: "var(--muted, #888)", fontSize: "11px", fontWeight: 600, marginLeft: "8px",
    },
  };

  const statsConfig = [
    { label: "Total Users", value: users.length, color: "#6366f1", icon: IC.users, filterKey: "all", statKey: "all" },
    { label: "Total Owners", value: owners.length, color: "#f59e0b", icon: IC.owners, filterKey: "owners", statKey: "owners" },
    { label: "Active Users", value: activeUsers, color: "#10b981", icon: IC.check, filterKey: "users", statKey: "users" },
    // { label: "Admin Users", value: adminUsers, color: "#f43f5e", icon: IC.shield, filterKey: "admins", statKey: "admins" },
  ];

  return (
    <div>
      {/* ── Stats Row ── */}
      <div style={S.statsRow}>
        {statsConfig.map((s, i) => (
          <div
            key={i}
            style={S.statCard(s.color, activeStat === s.statKey)}
            onClick={() => {
              setActiveStat(s.statKey);
              setRoleFilter(s.filterKey);
            }}
          >
            <div style={S.statIco(s.color)}>
              <Icon d={s.icon} size={17} />
            </div>
            <div style={S.statVal()}>{s.value}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Action Buttons ── */}
      <div style={S.actionBar}>
        <button
          style={{ ...S.addUserBtn, opacity: formMode === "addUser" ? 0.75 : 1, outline: formMode === "addUser" ? "2px solid #6366f1" : "none" }}
          onClick={() => { resetForms(); setFormMode(formMode === "addUser" ? null : "addUser"); }}
        >
          <Icon d={IC.userPlus} size={14} />
          {formMode === "addUser" ? "Close Form" : "Add User"}
        </button>
        <button
          style={{ ...S.addOwnerBtn, opacity: formMode === "addOwner" ? 0.75 : 1, outline: formMode === "addOwner" ? "2px solid #f59e0b" : "none" }}
          onClick={() => { resetForms(); setFormMode(formMode === "addOwner" ? null : "addOwner"); }}
        >
          <Icon d={IC.owners} size={14} />
          {formMode === "addOwner" ? "Close Form" : "Add Owner"}
        </button>
      </div>

      {/* ── Inline Form: User ── */}
      {isUserForm && (
        <div style={S.formCard("#6366f1")}>
          <div style={S.formTitle("#6366f1")}>
            <Icon d={isEditMode ? IC.edit : IC.userPlus} size={16} />
            {isEditMode ? `Edit User — ${userForm.username}` : "Add New User"}
          </div>
          <div style={S.formGrid}>
            <input style={S.inp} placeholder="Username *" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
            <input style={S.inp} placeholder="Email *" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            <input style={S.inp} placeholder="Phone" value={userForm.phone || ""} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
            {!isEditMode && (
              <input style={S.inp} placeholder="Password *" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            )}
          </div>
          {isEditMode && (
            <label style={S.checkRow}>
              <input type="checkbox" checked={userForm.is_admin || false} onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#6366f1" }} />
              Grant Admin Access
            </label>
          )}
          <div style={S.formActions}>
            <button style={S.submitBtn("#6366f1")} disabled={loading} onClick={isEditMode ? handleUpdateUser : handleCreateUser}>
              <Icon d={isEditMode ? IC.check : IC.add} size={13} />
              {loading ? "Saving..." : isEditMode ? "Update User" : "Create User"}
            </button>
            <button style={S.cancelBtn} onClick={resetForms}><Icon d={IC.close} size={13} /> Cancel</button>
          </div>
        </div>
      )}

      {/* ── Inline Form: Owner ── */}
      {isOwnerForm && (
        <div style={S.formCard("#f59e0b")}>
          <div style={S.formTitle("#f59e0b")}>
            <Icon d={isEditMode ? IC.edit : IC.owners} size={16} />
            {isEditMode ? `Edit Owner — ${ownerForm.username}` : "Add New Owner"}
          </div>
          <div style={S.formGrid}>
            <input style={S.inp} placeholder="Username *" value={ownerForm.username} onChange={(e) => setOwnerForm({ ...ownerForm, username: e.target.value })} />
            <input style={S.inp} placeholder="Email *" type="email" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} />
            <select style={S.inp} value={ownerForm.location} onChange={(e) => setOwnerForm({ ...ownerForm, location: e.target.value })}>
              <option value="">Select Location</option>
              <option value="Hitech City">Hitech City</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Kondapur">Kondapur</option>
              <option value="Financial District">Financial District</option>
            </select>
            <input style={S.inp} placeholder={isEditMode ? "New Password (leave blank to keep)" : "Password *"} type="password" value={ownerForm.password} onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })} />
          </div>
          <div style={S.formActions}>
            <button style={S.submitBtn("#f59e0b")} disabled={loading} onClick={isEditMode ? handleUpdateOwner : handleCreateOwner}>
              <Icon d={isEditMode ? IC.check : IC.add} size={13} />
              {loading ? "Saving..." : isEditMode ? "Update Owner" : "Create Owner"}
            </button>
            <button style={S.cancelBtn} onClick={resetForms}><Icon d={IC.close} size={13} /> Cancel</button>
          </div>
        </div>
      )}

      {/* ── Filter + Search ── */}
      <div style={S.filterBar}>
        {[
          { key: "all", label: "All" },
          { key: "users", label: "Users" },
          { key: "owners", label: "Owners" },
          { key: "admins", label: "Admins" },
        ].map((r) => (
          <button key={r.key} style={S.roleBtn(roleFilter === r.key)} onClick={() => { setRoleFilter(r.key); setActiveStat(r.key); }}>
            {r.label}
          </button>
        ))}
        {/* <button style={S.roleBtn(false)} onClick={() => { setActiveStat("all"); setRoleFilter("all"); }}>
          Show All
        </button> */}
        <div style={S.searchWrap}>
          <Icon d={IC.search} size={13} />
          <input style={S.searchInp} placeholder="Search by name, email, phone, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted,#aaa)", padding: 0 }} onClick={() => setSearch("")}>
              <Icon d={IC.close} size={12} />
            </button>
          )}
        </div>
        <span style={S.countBadge}>{combined.length} records</span>
      </div>

      {/* ── Table ── */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Name</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Phone / Location</th>
              <th style={S.th}>Role</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {combined.length === 0 ? (
              <tr>
                <td colSpan={6} style={S.emptyRow}>No records found for the selected filter / search.</td>
              </tr>
            ) : (
              combined.map((item, i) => {
                const isOwner = item._type === "owner";
                const isAdmin = !isOwner && (item.is_admin || item.is_superuser);
                const accent = isOwner ? "#f59e0b" : isAdmin ? "#10b981" : "#6366f1";
                const initial = (item.username || "?").charAt(0).toUpperCase();
                const phoneOrLoc = isOwner ? item.location || "-" : item.phone || "-";
                return (
                  <tr key={`${item._type}-${item.id}`} style={{ background: i % 2 === 0 ? "transparent" : "var(--row-alt, rgba(0,0,0,0.01))", transition: "background 0.15s" }}>
                    <td style={{ ...S.td, color: "#000", fontSize: "12px" }}>{String(i + 1).padStart(2, "0")}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={S.avatarCell(accent)}>{initial}</div>
                        <span style={{ fontWeight: 600, color: "#000" }}>{item.username}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: "#000", fontWeight: 600, fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Icon d={IC.mail} size={11} />{item.email}
                      </div>
                    </td>
                    <td style={{ ...S.td, color: "#000", fontWeight: 600, fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Icon d={isOwner ? IC.mapPin : IC.phone} size={11} />{phoneOrLoc}
                      </div>
                    </td>
                    <td style={S.td}>
                      {isOwner ? (
                        <span style={S.ownerBadge}><Icon d={IC.owners} size={10} /> Owner</span>
                      ) : isAdmin ? (
                        <span style={S.adminBadge}><Icon d={IC.shield} size={10} /> Admin</span>
                      ) : (
                        <span style={S.userBadge}><Icon d={IC.users} size={10} /> User</span>
                      )}
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={S.editBtn} title="Edit" onClick={() => isOwner ? openEditOwner(item) : openEditUser(item)}>
                          <Icon d={IC.edit} size={12} /> Edit
                        </button>
                        <button style={S.delBtn} title="Delete" onClick={() => isOwner ? handleDeleteOwner(item.id) : handleDeleteUser(item.id)}>
                          <Icon d={IC.trash} size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin Dashboard (Main) ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
  const role = localStorage.getItem("role");

  localStorage.clear();

  if (role === "admin") {
    window.location.href = "/auth?type=admin";
  } else if (role === "owner") {
    window.location.href = "/auth?type=owner";
  } else {
    window.location.href = "/auth?type=user";
  }
};
  const [owners, setOwners] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const [form, setForm] = useState({
    name: "", city: "", location: "", price: "",
    image: "", description: "", amenities: [], isavailable: true,
  });
  const [editId, setEditId] = useState(null);
  // ── NEW: toggle Add Workspace form visibility ─────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);

  const [catForm, setCatForm] = useState({
    name: "", category: "", description: "", image: "",
    hourlyprice: "", dailyprice: "", monthlyprice: "", isavailable: true, owner: "",
  });

  const [section, setSection] = useState("overview");
  const [managementFilter, setManagementFilter] = useState("all");

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
  const notifRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [viewedAdminNotifications, setViewedAdminNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem("adminViewedNotifications")) || [];
  });

  const buildAdminNotifications = (company = [], hyd = [], offer = [], workspaces=[]) => {
    let items = [];
    company.forEach((l) => items.push({ id: `company-${l.id}`, type: "Company Lead", name: l.name, workspace: l.company || "-", section: "company-leads", time: "New Lead" }));
    hyd.forEach((l) => items.push({ id: `hyd-${l.id}`, type: "Hyderabad Lead", name: l.name, workspace: l.workspace_type, section: "hyderabad-leads", time: "New Lead" }));
    offer.forEach((l) => items.push({ id: `offer-${l.id}`, type: "Offer Lead", name: l.name, workspace: l.workspace_type, section: "offerleads", time: "New Lead" }));
    // Workspace Notifications
workspaces.forEach((w) =>

  items.push({

    id: `workspace-${w.id}`,

    type: "Workspace Added",

    name: w.name,

    workspace: w.location || "-",

    section: "workspaces",

    time: "New Workspace",

  })

);
    const filtered = items.filter((item) => !viewedAdminNotifications.includes(item.id));
    setAdminNotifications(filtered);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const SPARKS = { ws: mkSpark(10, 8), cat: mkSpark(10, 6), own: mkSpark(10, 4) };

  const fetchWS = () =>
    axiosInstance.get("workspaces/admin/workspaces")
      .then((r) => setWorkspaces(Array.isArray(r.data) ? r.data : []))
      .catch(() => setWorkspaces([]));

  const fetchCat = () =>
    axiosInstance.get("workspaces/categories")
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]));

  const fetchOwners = () =>
    axiosInstance.get("owners")
      .then((r) => setOwners(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOwners([]));
  const [companyLeads, setCompanyLeads] = useState([]);
const [hydLeads, setHydLeads] = useState([]);
const [offerLeads, setOfferLeads] = useState([]);

useEffect(() => {

  buildAdminNotifications(

    companyLeads,

    hydLeads,

    offerLeads,

    workspaces

  );

}, [

  companyLeads,

  hydLeads,

  offerLeads,

  workspaces,

]);
  useEffect(() => {
    fetchOwners();
    fetchWS();
    fetchCat();
    axiosInstance.get("amenities/")
      .then((res) => setAmenities(res.data || []))
      .catch((err) => console.log(err));

    Promise.all([
      axiosInstance.get("leads/company/admin/"),
      axiosInstance.get("hyderabad/admin/"),
      axiosInstance.get("leads/offers/admin/leads/"),
    ]).then(([c, h, o]) => {
     setCompanyLeads(c.data || []);
setHydLeads(h.data || []);
setOfferLeads(o.data || []);
    });

    const syncFromHash = () => {
      const rawHash = window.location.hash || "";
      const [hashSection, hashQuery] = rawHash.replace("#", "").split("?");
      if (hashSection === "workspaces") setSection("workspaces");
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
    localStorage.setItem("adminViewedNotifications", JSON.stringify(viewedAdminNotifications));
  }, [viewedAdminNotifications]);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) { showToast("Fill required fields", "error"); return; }
    const req = editId
      ? axiosInstance.put(`workspaces/update/${editId}/`, form)
      : axiosInstance.post("workspaces/add/", form);
    req.then(() => {
      showToast(editId ? "Updated successfully" : "Workspace added successfully");
      setEditId(null);
      setShowAddForm(false);
      setForm({ name: "", city: "", location: "", price: "", image: "", description: "", isavailable: true });
      fetchWS();
    }).catch(() => showToast("Operation failed", "error"));
  };

  const handleEdit = (item) => {
    setForm({ name: item.name || "", city: item.city || "", location: item.location || "", price: item.price || "", image: item.image || "", description: item.description || "", isavailable: item.isavailable ?? true });
    setEditId(item.id);
    setShowAddForm(true);
    setSection("workspaces");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = (item) => {
    const newStatus = !(item.isavailable !== false);
    axiosInstance.put(`workspaces/update/${item.id}/`, { ...item, isavailable: newStatus, is_approved: item.is_approved })
      .then(() => { showToast(newStatus ? "Workspace Activated" : "Workspace Inactivated"); fetchWS(); })
      .catch(() => showToast("Failed to update workspace", "error"));
  };

  const handleApprove = (id) => {
    axiosInstance.put(`workspaces/approve/${id}/`)
      .then(() => { showToast("Workspace Approved"); fetchWS(); })
      .catch(() => showToast("Approval Failed", "error"));
  };

  const handleReject = (id) => {
    axiosInstance.put(`workspaces/reject/${id}/`)
      .then(() => { showToast("Workspace Rejected"); fetchWS(); })
      .catch(() => showToast("Reject Failed", "error"));
  };

  const handleAddCat = () => {
    axiosInstance.post("workspaces/categories/add", catForm)
      .then(() => {
        showToast("Category added");
        setCatForm({ name: "", category: "", description: "", image: "", hourlyprice: "", dailyprice: "", monthlyprice: "", isavailable: true, owner: "" });
        fetchCat();
      }).catch(() => showToast("Failed to add", "error"));
  };

  const handleDeleteCat = (id) => {
    if (!window.confirm("Delete this category?")) return;
    axiosInstance.delete(`workspaces/categories/delete/${id}`)
      .then(() => { showToast("Deleted"); fetchCat(); })
      .catch(() => showToast("Delete failed", "error"));
  };

  const toggleGroup = (id) => setOpenGroup((prev) => (prev === id ? null : id));

  const goNav = (item) => {
    if (item.path) { navigate(item.path); setMobOpen(false); return; }
    if (item.section) { setSection(item.section); setMobOpen(false); }
  };

  const closeMob = () => setMobOpen(false);

  const handleMobileMenuToggle = () => {
    if (isMobile) setMobOpen((p) => !p);
    else setSideOpen((p) => !p);
  };

  const ownerOptions = useMemo(() => {
    const names = [...new Set(workspaces.map((w) => w.ownername || w.owner_name || w.owner?.username || w.owner?.name || "").filter(Boolean))];
    return names.sort((a, b) => a.localeCompare(b));
  }, [workspaces]);

  const workspaceTypeOptions = useMemo(() => {
    const types = [...new Set(workspaces.map((w) => w.usertype || w.workspace_type || w.workspacetype || w.category || w.name || "").filter(Boolean))];
    return types.sort((a, b) => a.localeCompare(b));
  }, [workspaces]);

  const filteredWS = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return workspaces.filter((w) => {
      const ownerName = (w.ownername || w.owner_name || w.owner?.username || w.owner?.name || "").toString().toLowerCase();
      const workspaceType = (w.usertype || w.workspace_type || w.workspacetype || w.category || w.name || "").toString().toLowerCase();
      const matchesSearch = !q || w.name?.toLowerCase().includes(q) || w.city?.toLowerCase().includes(q) || w.location?.toLowerCase().includes(q) || ownerName.includes(q) || workspaceType.includes(q);
      const matchesOwner = !ownerFilter || ownerName === ownerFilter.toLowerCase();
      const matchesType = !workspaceTypeFilter || workspaceType === workspaceTypeFilter.toLowerCase();
      return matchesSearch && matchesOwner && matchesType;
    });
  }, [workspaces, searchQ, ownerFilter, workspaceTypeFilter]);

  const filteredActivity = actFilter === "all" ? RECENT_ACTIVITIES : RECENT_ACTIVITIES.filter((a) => a.type === actFilter);

  const STATS = [
    {
      label: "Total Workspaces",
      value: workspaces.length,
      color: "#f59e0b",
      spark: SPARKS.ws,
      trend: 12,
      up: true,
      icon: IC.workspace,
      hint: "View all workspaces",
      onClick: () => setSection("workspaces"),
    },
    {
      label: "Total Categories",
      value: WORKSPACE_TYPES.length,
      color: "#6366f1",
      spark: SPARKS.cat,
      trend: 8,
      up: true,
      icon: IC.category,
      hint: "View all categories",
      onClick: () => {
        setWorkspaceTypeFilter("");
        setSection("workspaces");
      },
    },
    {
      label: "Total Owners",
      value: owners.length,
      color: "#10b981",
      spark: SPARKS.own,
      trend: 3,
      up: true,
      icon: IC.owners,
      hint: "Manage owners",
      onClick: () => {
        setManagementFilter("owners");
        setSection("management");
      },
    },
  ];

  const sectionTitle = (() => {
    const map = {
      overview: "Dashboard Overview",
      management: "User & Owner Management",
      workspaces: "Workspace Management",
      categories: "Category Management",
      tickets: "Support Tickets",
      activity: "Recent Activity",
    };
    return map[section] || "Dashboard";
  })();

  const activityTypes = ["all", "booking", "lead", "ticket", "workspace", "user", "payment", "owner", "category"];

  const handleTopNavClick = (group) => {
    setSection(group.section || "overview");
    closeMob();
  };

  const handleWorkspaceTypeStat = (type) => {
    setWorkspaceTypeFilter(type);
    setSection("workspaces");
  };

  // ── Workspace toolbar select style ────────────────────────────────────────
  const wsSelectStyle = {
    padding: "0 10px",
    height: "36px",
    borderRadius: "8px",
    border: "1.5px solid var(--border, #e5e7eb)",
    fontSize: "12px",
    color: "#333",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
    minWidth: "120px",
    maxWidth: "160px",
  };

  return (
    <div className={styles.root}>
      {mobOpen && <div className={styles.mobOverlay} onClick={closeMob} />}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : styles.sidebarCollapsed} ${mobOpen ? styles.sidebarMob : ""}`}>
        <div className={styles.logo}>
          <div className={styles.logoMark}><Icon d={IC.building} size={18} /></div>
          {(sideOpen || mobOpen) && (
            <span className={styles.logoText}>Co<span className={styles.logoAccent}>Work</span></span>
          )}
          {isMobile && mobOpen && (
            <button className={styles.sideCloseBtn} onClick={closeMob}><Icon d={IC.close} size={14} /></button>
          )}
        </div>

        <div className={styles.divider} />

        <nav className={styles.nav}>
          {SIDEBAR_GROUPS.map((group) => {
            if (!group.children) {
              const isActive = section === group.section;
              return (
                <button key={group.id}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  onClick={() => handleTopNavClick(group)}
                  title={!sideOpen && !mobOpen ? group.label : ""}
                >
                  <span className={styles.navIco}><Icon d={group.icon} size={15} /></span>
                  {(sideOpen || mobOpen) && <span className={styles.navLabel}>{group.label}</span>}
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
                  <span className={styles.navIco}><Icon d={group.icon} size={15} /></span>
                  {(sideOpen || mobOpen) && <span className={styles.navLabel}>{group.label}</span>}
                  {(sideOpen || mobOpen) && (
                    <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                      <Icon d={IC.chevDown} size={11} />
                    </span>
                  )}
                </button>
                {(sideOpen || mobOpen) && isOpen && (
                  <div className={styles.navChildren}>
                    {group.children.map((child) => (
                      <button key={child.id}
                        className={`${styles.navChild} ${section === child.section ? styles.navChildActive : ""}`}
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
                <p className={styles.sideRole}>  <strong>
    Hi {localStorage.getItem("username") || "Admin"}
  </strong></p>
              </div>
              <div className={styles.onlineDot} />
            </div>
          )}
          <div className={styles.logoutWrap}>
  <button
    className={styles.logoutBtn}
    onClick={handleLogout}
  >
    <Icon d={IC.logout} size={16} />

    {(sideOpen || mobOpen) && (
      <span>Logout</span>
    )}
  </button>
</div>
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
                    <div className={styles.notifHeading}>
                      <h3>Notifications</h3>
                      <span className={styles.notifCount}>{adminNotifications.length}</span>
                    </div>
                    <button className={styles.notifClose} onClick={() => setNotifOpen(false)}>✕</button>
                  </div>
                  {adminNotifications.map((n) => (
                    <div key={n.id} className={styles.notifItem}>
                      <div className={styles.notifIco} style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                        <Icon d={IC.bell} size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={styles.notifTxt}><strong>{n.type}</strong><br />{n.name}</div>
                        <div className={styles.notifTime}>{n.workspace}</div>
                      </div>
                      <button className={styles.viewBtn} onClick={() => {
                        setSection(n.section);
                        const sameSectionIds = adminNotifications.filter((item) => item.section === n.section).map((item) => item.id);
                        const updatedViewed = [...new Set([...viewedAdminNotifications, ...sameSectionIds])];
                        setViewedAdminNotifications(updatedViewed);
                        setAdminNotifications((prev) => prev.filter((item) => item.section !== n.section));
                        setNotifOpen(false);
                      }}>View</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className={styles.content}>

          {/* ── Dashboard Overview ── */}
          {section === "overview" && (
            <section className={styles.overview}>
              <div className={styles.statsGrid}>
                {STATS.map((s, i) => (
                  <button
                    key={i}
                    className={styles.statCard}
                    style={{ "--ac": s.color }}
                    onClick={() => {
                      if (s.label === "Workspace Types") {
                        setWorkspaceTypeFilter("");
                        setSection("workspaces");
                      } else {
                        s.onClick();
                      }
                    }}
                    title={s.hint}
                  >
                    <div className={styles.statTop}>
                      <div className={styles.statIco} style={{ background: `${s.color}18`, color: s.color }}>
                        <Icon d={s.icon} size={18} />
                      </div>
                      <span className={`${styles.trend} ${s.up ? styles.trendUp : styles.trendDn}`}>
                        <Icon d={s.up ? IC.arrowUp : IC.arrowDown} size={10} />
                        {s.trend}%
                      </span>
                    </div>
                    <div className={styles.statVal} style={{ color: s.color }}>{s.value}</div>
                    <div className={styles.statLbl}>{s.label}</div>
                    <SparkBar data={s.spark} color={s.color} />
                    <div className={styles.statClick}>{s.hint}</div>
                  </button>
                ))}
              </div>

              {/* ── Extra Quick-Action Stats Row ── */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
              }}>
                {[
                  { label: "Manage Users", icon: IC.users, color: "#6366f1", hint: "View users & owners", onClick: () => { setManagementFilter("all"); setSection("management"); } },
                  { label: "Manage Owners", icon: IC.owners, color: "#f59e0b", hint: "View owners only", onClick: () => { setManagementFilter("owners"); setSection("management"); } },
                  { label: "Bookings", icon: IC.bookings, color: "#10b981", hint: "View all bookings", onClick: () => setSection("bookings") },
                  { label: "Support Tickets", icon: IC.tickets, color: "#f43f5e", hint: "View tickets", onClick: () => setSection("tickets") },
                  { label: "Recent Activity", icon: IC.activity, color: "#8b5cf6", hint: "See activity log", onClick: () => setSection("activity") },
                  { label: "Amenities", icon: IC.amenities, color: "#0ea5e9", hint: "Manage amenities", onClick: () => setSection("amenities") },
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={q.onClick}
                    title={q.hint}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: `1px solid ${q.color}25`,
                      background: `${q.color}06`,
                      cursor: "pointer",
                      transition: "all 0.18s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${q.color}14`; e.currentTarget.style.borderColor = `${q.color}50`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${q.color}06`; e.currentTarget.style.borderColor = `${q.color}25`; }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: "8px",
                      background: `${q.color}18`, color: q.color,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon d={q.icon} size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#000", lineHeight: 1.2 }}>{q.label}</div>
                      <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>{q.hint}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Charts row */}
              <div className={styles.chartsRow}>
                <div className={styles.chartPanel}><WeeklyChart data={CHART_DATA} /></div>
                <div className={styles.donutPanel}>
                  <div className={styles.panelHead}>
                    <h3 className={styles.panelTitle}>Space Mix</h3>
                    <span className={styles.panelSub}>By category type</span>
                  </div>
                  <DonutChart data={DONUT_SEGS} />
                </div>
              </div>

              {/* Recent tickets preview */}
              <div className={styles.quickPanel}>
                <div className={styles.quickHead}>
                  <div>
                    <h3 className={styles.panelTitle}>Recent Support Tickets</h3>
                    <p className={styles.panelSub}>Latest issues raised by users</p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => setSection("tickets")}>View All</button>
                </div>
                <div className={styles.ticketList}>
                  {MOCK_TICKETS.slice(0, 4).map((t, i) => (
                    <div key={i} className={styles.ticketRow}>
                      <span className={styles.ticketId}>{t.id}</span>
                      <div className={styles.ticketMain}>
                        <span className={styles.ticketSubject}>{t.subject}</span>
                        <span className={styles.ticketUser}><Icon d={IC.users} size={10} /> {t.user}</span>
                      </div>
                      <span className={`${styles.pri} ${t.priority === "high" ? styles.priHigh : t.priority === "medium" ? styles.priMed : styles.priLow}`}>{t.priority}</span>
                      <span className={`${styles.statusBadge} ${t.status === "open" ? styles.stOpen : t.status === "inprogress" ? styles.stProg : styles.stDone}`}>
                        {t.status === "open" ? "Open" : t.status === "inprogress" ? "In Progress" : "Resolved"}
                      </span>
                      <span className={styles.ticketTime}><Icon d={IC.clock} size={10} /> {t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Management Section ── */}
          {section === "management" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco} style={{ background: "#6366f118", color: "#6366f1" }}>
                  <Icon d={IC.users} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>User & Owner Management</h2>
                  <p className={styles.secSub}>Create, edit, delete users and owners — all in one place.</p>
                </div>
              </div>
              <UnifiedManagementPanel showToast={showToast} initialRoleFilter={managementFilter} />
            </section>
          )}

          {/* ── Workspaces ── */}
          {section === "workspaces" && (
            <section className={styles.section}>
              {/* ── Section Header ── */}
              <div className={styles.secHead}>
                <div className={styles.secIco} style={{ background: "#f59e0b18", color: "#f59e0b" }}>
                  <Icon d={IC.workspace} size={18} />
                </div>
                <div>
                  <h2 className={styles.secTitle}>Workspaces</h2>
                  <p className={styles.secSub}>Owner filtered workspace details view in admin dashboard.</p>
                </div>
                <span className={styles.countPill}>{ownerFilter ? `${filteredWS.length} for ${ownerFilter}` : `${filteredWS.length} Filtered`}</span>
              </div>

              {/* ── UNIFIED TOOLBAR: Add Workspace btn + Search + Filters in ONE LINE ── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}>
                {/* Add / Cancel button */}
                <button
                  onClick={() => {
                    if (showAddForm && editId) {
                      setEditId(null);
                      setForm({ name: "", city: "", location: "", price: "", image: "", description: "", isavailable: true });
                    }
                    setShowAddForm((p) => !p);
                  }}
                  title={showAddForm ? "Close form" : editId ? "Editing workspace" : "Add new workspace"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: showAddForm ? "#f43f5e" : "#f59e0b",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "background 0.18s",
                  }}
                >
                  <Icon d={showAddForm ? IC.close : editId ? IC.edit : IC.add} size={13} />
                  {showAddForm ? "Close Form" : editId ? "Editing…" : "Add Workspace"}
                </button>

                {/* Search input */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flex: "1",
                  minWidth: "160px",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--border, #e5e7eb)",
                  background: "#fff",
                }}>
                  <Icon d={IC.search} size={13} />
                  <input
                    style={{ border: "none", outline: "none", fontSize: "12px", color: "#000", width: "100%", background: "transparent" }}
                    placeholder="Search workspace, city, owner..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                  />
                  {searchQ && (
                    <button style={{ border: "none", background: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }} onClick={() => setSearchQ("")}>
                      <Icon d={IC.close} size={11} />
                    </button>
                  )}
                </div>

                {/* All Owners select */}
                <select
                  style={wsSelectStyle}
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <option value="">All Owners</option>
                  {ownerOptions.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>

                {/* All Types select */}
                <select
                  style={wsSelectStyle}
                  value={workspaceTypeFilter}
                  onChange={(e) => setWorkspaceTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {workspaceTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Reset button */}
                <button
                  className={styles.btnGhost}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    height: "36px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    setSearchQ("");
                    setOwnerFilter("");
                    setWorkspaceTypeFilter("");
                    window.location.hash = "workspaces";
                  }}
                >
                  <Icon d={IC.refresh} size={13} /> Reset
                </button>

                {/* Record count pill */}
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 10px",
                  height: "36px",
                  borderRadius: "20px",
                  background: "var(--badge-bg, #f3f4f6)",
                  color: "var(--muted, #888)",
                  fontSize: "11px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {filteredWS.length} records
                </span>
              </div>

              {/* ── Collapsible Add / Edit Form ── */}
              {showAddForm && (
                <div className={styles.formCard} style={{ marginBottom: "16px" }}>
                  <div className={styles.formHead}>
                    <span className={styles.formHeadIco}><Icon d={editId ? IC.edit : IC.add} size={13} /></span>
                    <span>{editId ? `Editing Workspace #${editId}` : "Add New Workspace"}</span>
                  </div>
                  <div className={styles.formGrid}>
                    <select className={styles.selectField} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
                      <option value="">Select Workspace Type</option>
                      {WORKSPACE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select className={styles.selectField} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                      <option value="">Select Location</option>
                      {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <input className={styles.inp} placeholder="Location Area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    <input className={styles.inp} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <input className={styles.inp} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <input className={styles.inp} placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                    <div className={styles.fieldGroup}>
                      <div className={styles.amenitiesGrid}>
                        {amenities.map((a) => (
                          <label key={a.id} className={styles.amenityItem}>
                            <input type="checkbox" checked={form.amenities?.includes(a.id)}
                              onChange={(e) => {
                                if (e.target.checked) setForm({ ...form, amenities: [...(form.amenities || []), a.id] });
                                else setForm({ ...form, amenities: form.amenities.filter((id) => id !== a.id) });
                              }}
                            />
                            {a.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.formActs}>
                    <button className={styles.btnPrimary} onClick={handleSubmit}>
                      <Icon d={editId ? IC.edit : IC.add} size={13} />
                      {editId ? "Update Workspace" : "Add Workspace"}
                    </button>
                    {editId && (
                      <button className={styles.btnGhost} onClick={() => {
                        setEditId(null);
                        setShowAddForm(false);
                        setForm({ name: "", city: "", location: "", price: "", image: "", description: "", isavailable: true });
                      }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Table ── */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th><th>Owner Name</th><th>Workspace Type</th><th>Name</th>
                      <th>City</th><th>Location</th><th>Price</th><th>Approval</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWS.map((item, i) => {
                      const ownerName = item.ownername || item.owner_name || item.owner?.username || item.owner?.name || "No Owner";
                      const workspaceType = item.usertype || item.workspace_type || item.workspacetype || item.category || item.name || "-";
                      const isActive = item.isavailable !== false;
                      return (
                        <tr key={item.id} style={!isActive ? { opacity: 0.55, background: "rgba(0,0,0,0.02)" } : {}}>
                          <td className={styles.tdSerial}>{String(i + 1).padStart(2, "0")}</td>
                          <td className={styles.tdBold}>{ownerName}</td>
                          <td className={styles.tdMuted}>{workspaceType}</td>
                          <td className={styles.tdBold}>{item.name}</td>
                          <td>{item.city}</td>
                          <td className={styles.tdMuted}>{item.location}</td>
                          <td className={styles.tdAccent}>{item.price}</td>
                          <td>{item.is_approved ? <span className={styles.approvedBadge}>Approved</span> : <span className={styles.pendingBadge}>Pending</span>}</td>
                          <td>
                            {isActive
                              ? <span className={styles.approvedBadge} style={{ background: "#10b98118", color: "#10b981", border: "1px solid #10b98130" }}>Active</span>
                              : <span className={styles.pendingBadge} style={{ background: "#6b728018", color: "#6b7280", border: "1px solid #6b728030" }}>Inactive</span>
                            }
                          </td>
                          <td>
                            <div className={styles.actCell}>
                              <button className={styles.editBtn} title="Edit Workspace" onClick={() => handleEdit(item)} style={{ padding: "5px 7px" }}><Icon d={IC.edit} size={13} /></button>
                              {!item.is_approved
                                ? <button className={styles.approveBtn} title="Approve Workspace" onClick={() => handleApprove(item.id)} style={{ padding: "5px 7px" }}><Icon d={IC.approveCircle} size={13} /></button>
                                : <button className={styles.rejectBtn} title="Reject / Revoke Approval" onClick={() => handleReject(item.id)} style={{ padding: "5px 7px" }}><Icon d={IC.rejectCircle} size={13} /></button>
                              }
                              <button title={isActive ? "Set Inactive" : "Set Active"} onClick={() => handleToggleActive(item)}
                                style={{ padding: "5px 7px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", border: "none", cursor: "pointer", background: isActive ? "#10b98118" : "#6b728018", color: isActive ? "#10b981" : "#6b7280", transition: "all 0.18s ease" }}>
                                <Icon d={isActive ? IC.eyeOn : IC.eyeOff} size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredWS.length === 0 && (
                      <tr><td colSpan={10} className={styles.tdEmpty}>No workspaces found for selected filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Categories ── */}
          {section === "categories" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div className={styles.secIco} style={{ background: "#6366f118", color: "#6366f1" }}><Icon d={IC.category} size={18} /></div>
                <div>
                  <h2 className={styles.secTitle}>Workspace Categories</h2>
                  <p className={styles.secSub}>Create and manage categories and pricing tiers.</p>
                </div>
                <span className={styles.countPill}>{categories.length} Total</span>
              </div>

              <div className={styles.formCard}>
                <div className={styles.formHead}>
                  <span className={styles.formHeadIco}><Icon d={IC.add} size={13} /></span>
                  <span>Add New Category</span>
                </div>
                <div className={styles.formGrid}>
                  <input className={styles.inp} placeholder="Category Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                  <select className={styles.inp} value={catForm.owner} onChange={(e) => setCatForm({ ...catForm, owner: e.target.value })}>
                    <option value="">Assign Owner</option>
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.username}</option>)}
                  </select>
                  <select className={styles.inp} value={catForm.category} onChange={(e) => setCatForm({ ...catForm, category: e.target.value })}>
                    <option value="">Select Category Type</option>
                    <option value="daypass">Day Pass</option>
                    <option value="meeting">Meeting Rooms</option>
                    <option value="fixed">Fixed Seats</option>
                    <option value="cabin">Cabins</option>
                  </select>
                  <input className={styles.inp} placeholder="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                  <input className={styles.inp} placeholder="Image URL" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} />
                  <input className={styles.inp} placeholder="Hourly Price" value={catForm.hourlyprice} onChange={(e) => setCatForm({ ...catForm, hourlyprice: e.target.value })} />
                  <input className={styles.inp} placeholder="Daily Price" value={catForm.dailyprice} onChange={(e) => setCatForm({ ...catForm, dailyprice: e.target.value })} />
                  <input className={styles.inp} placeholder="Monthly Price" value={catForm.monthlyprice} onChange={(e) => setCatForm({ ...catForm, monthlyprice: e.target.value })} />
                  <select className={styles.inp} value={String(catForm.isavailable)} onChange={(e) => setCatForm({ ...catForm, isavailable: e.target.value === "true" })}>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
                <div className={styles.formActs}>
                  <button className={styles.btnPrimary} onClick={handleAddCat}><Icon d={IC.add} size={13} /> Add Category</button>
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
                      {item.image && <div className={styles.catImgWrap}><img src={item.image} alt={item.name} className={styles.catImg} /></div>}
                      <div className={styles.catTop}>
                        <div>
                          <h4 className={styles.catName}>{item.name}</h4>
                          <span className={styles.catType}>{item.category?.replace("_", " ")}</span>
                        </div>
                        <span className={`${styles.statusBadge} ${item.isavailable ? styles.stDone : styles.stOpen}`}>
                          {item.isavailable ? "Available" : "Off"}
                        </span>
                      </div>
                      {item.ownername && <div className={styles.catOwner}><Icon d={IC.users} size={11} /> {item.ownername}</div>}
                      <p className={styles.catDesc}>{item.description || "No description provided."}</p>
                      <div className={styles.catPrices}>
                        {[["Hourly", item.hourlyprice], ["Daily", item.dailyprice], ["Monthly", item.monthlyprice]].map(([lbl, val]) => (
                          <div key={lbl} className={styles.priceBox}>
                            <span className={styles.priceLbl}>{lbl}</span>
                            <span className={styles.priceVal}>{val || 0}</span>
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
            </section>
          )}

          {/* ── Quotation Leads ── */}
          {section === "quotation-leads" && (
            <section className={styles.section}>
              <div className={styles.secHead}>
                <div><h2 className={styles.secTitle}>Quotation Leads</h2><p className={styles.secSub}>All quotation leads with owner and location details</p></div>
              </div>
              <AdminQuotationLeads />
            </section>
          )}

          {section === "leads" && <section className={styles.sectionWrapper}><AdminLeads /></section>}
          {section === "offerleads" && <section className={styles.section}><AdminLeadss /></section>}
          {section === "enterprise" && <section className={styles.section}><AdminDashboardEnterprise /></section>}
          {section === "hyderabad-leads" && <section className={styles.section}><AdminDashboards /></section>}
          {section === "company-leads" && <section className={styles.section}><AdminCompanyLeads /></section>}
          {section === "bookings" && <section className={styles.section}><AdminBookings /></section>}
          {section === "tickets" && <section className={styles.section}><AdminTickets /></section>}
          {section === "amenities" && <section className={styles.section}><AdminAmenities /></section>}

          {/* ── Recent Activity ── */}
          {section === "activity" && (
            <section className={styles.section}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                {activityTypes.map((type) => (
                  <button key={type} className={type === actFilter ? styles.btnPrimary : styles.btnGhost} onClick={() => setActFilter(type)}>{type}</button>
                ))}
              </div>
              <RecentActivity activities={filteredActivity} />
            </section>
          )}
        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastErr : ""}`}>
          <span className={styles.toastIcon}>•</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

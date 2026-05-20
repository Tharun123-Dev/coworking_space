import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";

const AMENITY_ICONS = {
  wifi: "📶", coffee: "☕", "24hr": "⏰", security: "🛡️",
  parking: "🅿️", meeting: "🏢", games: "🎮", pantry: "🍽️",
  cleaning: "🧹", support: "💬",
};

const WORKSPACE_TYPES = [
  "Hot Desk","Dedicated Desk","Private Office Space","Private Cabin",
  "Meeting Room","Board Room","Event Space","Podcast","Virtual Office",
];
const MONTH_OPTIONS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const NAV_ICONS = {
  overview:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  workspaces:  "M3 21h18 M9 21V9l6-3v15 M3 7l9-4 9 4",
  manageUsers: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  slots:       "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  leads:       "M20 12V22H4V12 M22 7H2v5h20V7z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  bookings:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  offerWs:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  coupons:     "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  amenities:   "M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3",
  suggested:   "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  monthlySlots:"M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  hyderabad:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4",
  offerLeads:  "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  custom:      "M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  quotation:   "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  support:     "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z",
};

const NAV_GROUPS = [
  { key: "overview",     iconKey: "overview",     label: "Dashboard",        single: true },
  { key: "manageUsers",  iconKey: "manageUsers",  label: "Manage Users",     single: true },
  {
    key: "workspacesGroup", iconKey: "workspaces", label: "Workspaces",
    children: [
      { key: "workspaces",          iconKey: "workspaces",  label: "Workspaces" },
      { key: "offerWorkspaces",     iconKey: "offerWs",     label: "Offer Workspaces" },
      { key: "offerCoupons",        iconKey: "coupons",     label: "Offer Coupons" },
      { key: "additionalAmenities", iconKey: "amenities",   label: "Amenities" },
      { key: "suggestedWorkspaces", iconKey: "suggested",   label: "Suggested Workspaces" },
    ],
  },
  {
    key: "leadsGroup", iconKey: "leads", label: "Leads",
    children: [
      { key: "hyderabadLeads",     iconKey: "hyderabad",  label: "Hyderabad Leads" },
      { key: "offerLeads",         iconKey: "offerLeads", label: "Offer Leads" },
      { key: "customisationLeads", iconKey: "custom",     label: "Customisation Leads" },
      { key: "quotationLeads",     iconKey: "quotation",  label: "Quotation Leads" },
    ],
  },
  { key: "bookings", iconKey: "bookings", label: "Bookings", single: true },
  {
    key: "slotsGroup", iconKey: "slots", label: "Slot Management",
    children: [
      { key: "slots",        iconKey: "slots",        label: "Slot Management" },
      { key: "monthlySlots", iconKey: "monthlySlots", label: "Monthly Slots" },
    ],
  },
];
const LS_KEY = "ownerBookingStates";
const loadStates = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const saveState = (id, patch) => { const all = loadStates(); all[id] = { ...(all[id] || {}), ...patch }; localStorage.setItem(LS_KEY, JSON.stringify(all)); };

const NavIcon = ({ iconKey, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <path d={NAV_ICONS[iconKey] || NAV_ICONS.overview} />
  </svg>
);

const SVG = {
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  eyeOn: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22",
};

const getInitials = (name = "") => name.trim().charAt(0).toUpperCase() || "U";
const AVATAR_COLORS = ["#6366f1","#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316"];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function AccordionSection({ title, icon, isOpen, onToggle, openLabel = "+ Add New", closeLabel = "✕ Close", children }) {
  return (
    <div className={styles.accordSection}>
      <div className={styles.accordHeader} onClick={onToggle}>
        <div className={styles.accordTitleRow}>
          <span className={styles.accordDot} />
          <span className={styles.accordTitle}>{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{title}</span>
        </div>
        <button className={`${styles.accordToggleBtn} ${isOpen ? styles.accordToggleBtnOpen : ""}`} onClick={e => { e.stopPropagation(); onToggle(); }}>
          {isOpen ? closeLabel : openLabel}
        </button>
      </div>
      {isOpen && (
        <div className={styles.accordBody}>
          {children}
        </div>
      )}
    </div>
  );
}

function LeadFilterBar({ search, onSearch, filterTab, onFilter, tabs, counts, placeholder = "Search leads..." }) {
  return (
    <div className={styles.leadFilterBar}>
      <div className={styles.leadTabs}>
        {tabs.map(([key, label]) => (
          <button key={key} className={`${styles.leadTab} ${filterTab === key ? styles.leadTabActive : ""}`} onClick={() => onFilter(key)}>
            {label}
            <span className={styles.leadTabBadge}>{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className={styles.leadSearchWrap}>
        <span className={styles.leadSearchIcon}>🔍</span>
        <input className={styles.leadSearchInput} placeholder={placeholder} value={search} onChange={e => onSearch(e.target.value)} />
        {search && <button className={styles.leadSearchClear} onClick={() => onSearch("")}>✕</button>}
      </div>
    </div>
  );
}
// function HoverNavGroup({ group, activeSection, handleNav, sidebarCollapsed }) {
// }
// ─── HOVER NAV GROUP COMPONENT ─────────────────────────────────────────────
function DarkHoverNavGroup({ group, activeSection, handleNav, sidebarCollapsed }) {
  const [open, setOpen] = useState(false);
  const [flyout, setFlyout] = useState(false);
  const timeoutRef = useRef(null);
  const hasActiveChild = group.children.some(c => c.key === activeSection);

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  // ── COLLAPSED: hover flyout ──
  if (sidebarCollapsed) {
    return (
      <div
        style={{ position: "relative", marginBottom: 2 }}
        onMouseEnter={() => { clearTimeout(timeoutRef.current); setFlyout(true); }}
        onMouseLeave={() => { timeoutRef.current = setTimeout(() => setFlyout(false), 150); }}
      >
        <div style={{
          padding: "10px 12px",
          borderRadius: 10,
          cursor: "pointer",
          color: hasActiveChild ? "#C9A84C" : "#94a3b8",
          background: hasActiveChild ? "rgba(201,168,76,0.12)" : "transparent",
          display: "flex",
          justifyContent: "center",
          borderLeft: hasActiveChild ? "3px solid #C9A84C" : "3px solid transparent",
        }}>
          <NavIcon iconKey={group.iconKey} size={16} />
        </div>

        {flyout && (
          <div
            onMouseEnter={() => clearTimeout(timeoutRef.current)}
            onMouseLeave={() => { timeoutRef.current = setTimeout(() => setFlyout(false), 150); }}
            style={{
              position: "absolute",
              left: "calc(100% + 8px)",
              top: 0,
              zIndex: 9999,
              background: "#1e293b",
              borderRadius: 12,
              padding: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              minWidth: 190,
              border: "1px solid rgba(255,255,255,0.08)",
              pointerEvents: "all",
            }}
          >
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#C9A84C",
              padding: "4px 8px 8px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 4,
            }}>
              {group.label}
            </div>
            {group.children.map(child => (
              <button
                key={child.key}
                onClick={() => { handleNav(child.key); setFlyout(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "none",
                  marginBottom: 2,
                  background: activeSection === child.key ? "rgba(201,168,76,0.15)" : "transparent",
                  color: activeSection === child.key ? "#C9A84C" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeSection === child.key ? 700 : 500,
                  textAlign: "left",
                }}
              >
                <NavIcon iconKey={child.iconKey} size={14} />
                <span>{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── EXPANDED: hover accordion ──
  return (
    <div
      style={{ marginBottom: 2 }}
      onMouseEnter={() => { clearTimeout(timeoutRef.current); setOpen(true); }}
      onMouseLeave={() => { timeoutRef.current = setTimeout(() => setOpen(false), 150); }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 10,
          cursor: "pointer",
          background: hasActiveChild ? "rgba(201,168,76,0.08)" : open ? "rgba(255,255,255,0.04)" : "transparent",
          color: hasActiveChild ? "#C9A84C" : "#94a3b8",
          borderLeft: hasActiveChild ? "3px solid #C9A84C" : "3px solid transparent",
          transition: "all 0.15s",
        }}
      >
        <NavIcon iconKey={group.iconKey} size={16} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: hasActiveChild ? 700 : 500, textAlign: "left" }}>
          {group.label}
        </span>
        <svg
          width={12} height={12} viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {open && (
        <div style={{ paddingLeft: 16, marginTop: 2 }}>
          {group.children.map(child => (
            <button
              key={child.key}
              onClick={() => handleNav(child.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                marginBottom: 2,
                background: activeSection === child.key ? "rgba(201,168,76,0.15)" : "transparent",
                color: activeSection === child.key ? "#C9A84C" : "#64748b",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeSection === child.key ? 700 : 400,
                textAlign: "left",
                borderLeft: activeSection === child.key
                  ? "2px solid #C9A84C"
                  : "2px solid rgba(255,255,255,0.06)",
              }}
            >
              <NavIcon iconKey={child.iconKey} size={13} />
              <span>{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── PER-WORKSPACE REVENUE PANEL ───────────────────────────────────────────
function WorkspaceRevenuePanel({ workspaceId, workspaceName, bookings }) {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`cart/owner/workspace-revenue/${workspaceId}/`)
      .then(res => {
        setRevenueData(res.data);
        setLoading(false);
      })
      .catch(() => {
        const wsBookings = bookings.filter(b =>
          (b.workspace_id === workspaceId) ||
          (b.workspace?.trim() === workspaceName?.trim())
        );
        const total = wsBookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
        const confirmed = wsBookings.filter(b => b.status === "confirmed").reduce((s, b) => s + Number(b.total_price || 0), 0);
        const pending = wsBookings.filter(b => b.status === "pending").reduce((s, b) => s + Number(b.total_price || 0), 0);
        const cancelled = wsBookings.filter(b => b.status === "cancelled").reduce((s, b) => s + Number(b.total_price || 0), 0);
        setRevenueData({
          total_revenue: total,
          confirmed_revenue: confirmed,
          pending_revenue: pending,
          cancelled_revenue: cancelled,
          total_bookings: wsBookings.length,
          confirmed_bookings: wsBookings.filter(b => b.status === "confirmed").length,
          pending_bookings: wsBookings.filter(b => b.status === "pending").length,
          cancelled_bookings: wsBookings.filter(b => b.status === "cancelled").length,
        });
        setLoading(false);
      });
  }, [workspaceId, workspaceName]);

  if (loading) {
    return (
      <div style={panelStyles.loading}>
        <div style={panelStyles.spinner} />
        Loading revenue data…
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div style={panelStyles.empty}>No revenue data available for this workspace.</div>
    );
  }

  const {
    total_revenue = 0,
    confirmed_revenue = 0,
    total_bookings = 0,
    confirmed_bookings = 0,
  } = revenueData;

  const fillPct = total_bookings > 0 ? Math.round((confirmed_bookings / total_bookings) * 100) : 0;

  const stats = [
    { icon: "💰", label: "Total Revenue", value: `₹${Number(total_revenue).toLocaleString()}`, color: "#b8922a" },
    { icon: "✅", label: "Confirmed Revenue", value: `₹${Number(confirmed_revenue).toLocaleString()}`, color: "#16a34a" },
  ];

  return (
    <div style={panelStyles.panel}>
      <div style={panelStyles.titleRow}>
        <span style={panelStyles.dot} />
        <span style={panelStyles.title}>Revenue Breakdown — {workspaceName}</span>
      </div>
      <div style={panelStyles.grid}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...panelStyles.card, borderTopColor: s.color }}>
            <span style={panelStyles.cardIcon}>{s.icon}</span>
            <p style={panelStyles.cardValue}>{s.value}</p>
            <p style={panelStyles.cardLabel}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={panelStyles.badgeRow}>
        <span style={{ ...panelStyles.badge, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
          📋 {total_bookings} Total Bookings
        </span>
        <span style={{ ...panelStyles.badge, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
          ✅ {confirmed_bookings} Confirmed
        </span>
      </div>
      {total_bookings > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>
            Confirmation Rate: {fillPct}%
          </div>
          <div style={panelStyles.fillBar}>
            <div style={{
              ...panelStyles.fillBarInner,
              width: `${fillPct}%`,
              background: fillPct >= 75 ? "#16a34a" : fillPct >= 40 ? "#d97706" : "#dc2626"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

const panelStyles = {
  panel: {
    padding: "18px 24px",
    background: "linear-gradient(135deg, #faf5ff 0%, #f0fdf4 100%)",
    borderLeft: "4px solid #7c3aed",
    animation: "revenueFadeIn 0.22s ease",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "20px 24px",
    color: "#7c3aed",
    fontSize: "13px",
    fontWeight: 600,
    background: "#faf5ff",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #e9d5ff",
    borderTopColor: "#7c3aed",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  empty: {
    padding: "20px 24px",
    color: "#94a3b8",
    fontSize: "13px",
    background: "#faf5ff",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#7c3aed",
    display: "inline-block",
    flexShrink: 0,
  },
  title: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "12px",
  },
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px 14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderTop: "3px solid transparent",
    transition: "transform 0.18s ease",
  },
  cardIcon: {
    fontSize: "18px",
    display: "block",
    marginBottom: "4px",
  },
  cardValue: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 2px",
  },
  cardLabel: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    margin: 0,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "4px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
  },
  fillBar: {
    height: "5px",
    borderRadius: "3px",
    background: "#e5e7eb",
    overflow: "hidden",
  },
  fillBarInner: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.4s ease",
  },
};

function OwnerDashboard() {

  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [openRevenueId, setOpenRevenueId] = useState(null);
  const TODAY_STR = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
})();

const isSlotExpired = (dateStr) => !!dateStr && dateStr < TODAY_STR;

const isMonthlySlotExpired = (year, month) => {
  const d = new Date();
  return Number(year) < d.getFullYear() ||
    (Number(year) === d.getFullYear() && Number(month) < d.getMonth() + 1);
};

const expiredRowStyle = { opacity: 0.42, background: "#f7f7f7", filter: "grayscale(35%)" };
  const navigate = useNavigate();

  const handleLogout = () => {
    const role = localStorage.getItem("role");
    const savedViewedNotifications = localStorage.getItem(notificationKey);
    localStorage.clear();
    if (savedViewedNotifications) {
      localStorage.setItem(notificationKey, savedViewedNotifications);
    }
    if (role === "admin") {
      window.location.href = "/auth?type=admin";
    } else if (role === "owner") {
      window.location.href = "/auth?type=owner";
    } else {
      window.location.href = "/auth?type=user";
    }
  };

  const [workspaces, setWorkspaces] = useState([]);
  const [offerWorkspaces, setOfferWorkspaces] = useState([]);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [slots, setSlots] = useState([]);
  const [monthlySlots, setMonthlySlots] = useState([]);
  const [companyLeads, setCompanyLeads] = useState([]);
  const [hyderabadLeads, setHyderabadLeads] = useState([]);
  const [offerLeads, setOfferLeads] = useState([]);
  const [customisationLeads, setCustomisationLeads] = useState([]);
  const [quotationLeads, setQuotationLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ownerCity, setOwnerCity] = useState("");
  const [editMonthId, setEditMonthId] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [localStates, setLocalStates] = useState(loadStates);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingActiveTab, setBookingActiveTab] = useState("overview");
  const [animatingId, setAnimatingId] = useState(null);
  const [busyMap, setBusyMap] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [revenue, setRevenue] = useState({ total_revenue: 0, confirmed_revenue: 0, pending_revenue: 0, cancelled_count: 0 });
  const [notifications, setNotifications] = useState([]);
  const [workspaceNotifications, setWorkspaceNotifications] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const notificationKey = `viewedNotifications_${currentUser?.id}`;
  const [futureBookings, setFutureBookings] = useState([]);
const [showConflict, setShowConflict] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem(notificationKey)) || [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [additionalAmenities, setAdditionalAmenities] = useState([]);
  const [editAmenityId, setEditAmenityId] = useState(null);
  const [amenityForm, setAmenityForm] = useState({ workspace: "", title: "", description: "", price: "", price_type: "full_day" });
  const [monthlyForm, setMonthlyForm] = useState({ workspace_id: "", year: new Date().getFullYear(), months: [], capacity: 50, price: "" });
  const [form, setForm] = useState({ name: "", city: "", location: "", price: "", image: "", description: "", amenities: [] });
  const [editId, setEditId] = useState(null);
  const [slotForm, setSlotForm] = useState({ workspace_id: "", date: "", slot_type: "hour", start_time: 9, end_time: 18, capacity: 50, price: "" });
  const [offerForm, setOfferForm] = useState({ area: "", building: "", type: "", original_price: "", offer_price: "", seats: "", floor: "", image: "", amenities: [] });
  const [offerCoupons, setOfferCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ workspace: "", coupon_code: "", discount_percentage: "", capacity: "" });
  const [editSlotId, setEditSlotId] = useState(null);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [suggestSearch, setSuggestSearch] = useState("");
  const [editOfferId, setEditOfferId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "", phone: "", location: "" });
  const [editUserId, setEditUserId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFilterTab, setUserFilterTab] = useState("all");
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [companyLeadSearch, setCompanyLeadSearch] = useState("");
  const [companyLeadFilter, setCompanyLeadFilter] = useState("all");
  const [hyderabadLeadSearch, setHyderabadLeadSearch] = useState("");
  const [hyderabadLeadFilter, setHyderabadLeadFilter] = useState("all");
  const [offerLeadSearch, setOfferLeadSearch] = useState("");
  const [offerLeadFilter, setOfferLeadFilter] = useState("all");
  const [customLeadSearch, setCustomLeadSearch] = useState("");
  const [customLeadFilter, setCustomLeadFilter] = useState("all");
  const [quotationLeadSearch, setQuotationLeadSearch] = useState("");
  const [quotationLeadFilter, setQuotationLeadFilter] = useState("all");
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);
const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const approvedWorkspaces = useMemo(() => workspaces.filter(w => w.is_approved === true), [workspaces]);
  const setBusy = (id, value) => setBusyMap(prev => ({ ...prev, [id]: value }));
  const isBusy = (id) => !!busyMap[id];

  // ── NAV: close mobile sidebar after navigation ──
  const handleNav = (sectionKey, groupKey) => {
    setActiveSection(sectionKey);
    setMobileSidebarOpen(false);
  };

  const fetchUsers = async () => {
    try { const res = await axiosInstance.get("accounts/owner/users/"); setUsers(res.data); } catch (err) { console.log(err); }
  };

  const fetchOfferLeads = () => axiosInstance.get("leads/offers/leads/owner/").then(res => setOfferLeads(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Offer leads fetch error:", err));
  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };
  const pulse = (id) => { setAnimatingId(id); setTimeout(() => setAnimatingId(null), 600); };
  const fetchAmenities = () => axiosInstance.get("workspaces/amenities/").then(res => setAmenitiesList(res.data)).catch(err => console.error("Amenities fetch error:", err));
  const fetchWorkspaces = () => axiosInstance.get("workspaces/?owner=true").then(res => setWorkspaces(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Workspace fetch error:", err));
  const fetchAllWorkspaces = () => axiosInstance.get("workspaces/").then(res => setAllWorkspaces(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("All workspaces fetch error:", err));
  const fetchOfferWorkspaces = () => axiosInstance.get("workspaces/offers/owner/").then(res => setOfferWorkspaces(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Offer workspace fetch error:", err));
  const fetchOfferCoupons = () => { axiosInstance.get("workspaces/offer-coupons/owner/").then(res => setOfferCoupons(Array.isArray(res.data) ? res.data : [])).catch(err => console.log("Coupons Fetch Error", err)); };
  const fetchAdditionalAmenities = () => { axiosInstance.get("workspaces/additional-amenities/owner/").then(res => setAdditionalAmenities(Array.isArray(res.data) ? res.data : [])).catch(err => console.log("Amenities Fetch Error:", err)); };
  const fetchRevenue = () => axiosInstance.get("cart/owner/revenue/").then(res => setRevenue(res.data)).catch(err => console.error("Revenue fetch error:", err));
  const fetchSlots = () => axiosInstance.get("workspaces/slots/owner/").then(res => setSlots(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Slot fetch error:", err));
  const fetchMonthlySlots = () => axiosInstance.get("workspaces/monthly-slots/").then(res => setMonthlySlots(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Monthly slots fetch error:", err));
  const fetchCompanyLeads = () => axiosInstance.get("leads/company/owner/").then(res => setCompanyLeads(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Company leads fetch error:", err));
  const fetchBookings = useCallback(() => {
    setLoadingBookings(true);
    axiosInstance.get("cart/owner/bookings/").then(res => setBookings(Array.isArray(res.data) ? res.data : [])).catch(err => { console.error("Bookings fetch error:", err); setBookings([]); }).finally(() => setLoadingBookings(false));
  }, []);
  const fetchCancelRequests = useCallback(() => axiosInstance.get("cart/booking/owner/cancel-requests/").then(res => setRequests(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Failed to fetch cancel requests:", err)), []);
  const fetchHyderabadLeads = () => axiosInstance.get("hyderabad/owner/").then(res => setHyderabadLeads(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Hyderabad leads fetch error:", err));
  const fetchCustomisationLeads = () => axiosInstance.get("leads/modern-leads/owner/").then(res => setCustomisationLeads(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Customisation leads fetch error:", err));
  const fetchQuotationLeads = () => axiosInstance.get("leads/quotation-leads/owner/").then(res => setQuotationLeads(Array.isArray(res.data) ? res.data : [])).catch(err => console.error("Quotation leads fetch error:", err));
  const fetchWorkspaceNotifications = () => {
    axiosInstance.get("workspaces/owner-notifications/").then((res) => {
      setWorkspaceNotifications(Array.isArray(res.data) ? res.data : []);
    }).catch((err) => { console.log(err); });
  };

  const handleEditOffer = (item) => {
    setOfferForm({ building: item.building, type: item.type, original_price: item.original_price, offer_price: item.offer_price, seats: item.seats, floor: item.floor, image: item.image, amenities: item.amenities || [] });
    setEditOfferId(item.id);
    setShowOfferForm(true);
  };
  const handleDeleteOffer = (id) => { if (!window.confirm("Delete this workspace?")) return; axiosInstance.delete(`workspaces/offers/delete/${id}/`).then(() => fetchOfferWorkspaces()).catch(err => console.error(err)); };
  const handleAddOfferWorkspace = () => {
    const request = editOfferId ? axiosInstance.put(`workspaces/offers/update/${editOfferId}/`, { ...offerForm, area: ownerCity }) : axiosInstance.post("workspaces/offers/create/", { ...offerForm, area: ownerCity });
    request.then(() => { fetchOfferWorkspaces(); setEditOfferId(null); setOfferForm({ building: "", type: "", original_price: "", offer_price: "", seats: "", floor: "", image: "", amenities: [] }); setShowOfferForm(false); alert(editOfferId ? "Workspace updated successfully" : "Offer workspace added successfully and waiting for an admin approval.."); }).catch(err => console.error(err));
  };

  const handleAddCoupon = () => {
    if (!couponForm.workspace || !couponForm.coupon_code || !couponForm.discount_percentage || !couponForm.capacity) { alert("Please fill all coupon fields"); return; }
    axiosInstance.post("workspaces/offer-coupons/create/", couponForm).then(() => { fetchOfferCoupons(); setCouponForm({ workspace: "", coupon_code: "", discount_percentage: "", capacity: "" }); setShowCouponForm(false); alert("Coupon Added Successfully"); }).catch(err => console.log(err));
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axiosInstance.delete(`/workspaces/coupon/${id}/`);
      setOfferCoupons(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.log(err); }
  };

  const handleAddAmenity = () => {
    if (!amenityForm.workspace || !amenityForm.title || !amenityForm.price) { alert("Please fill required fields"); return; }
    const existsInAdminAmenities = amenitiesList.some((a) => a.name?.trim().toLowerCase() === amenityForm.title.trim().toLowerCase());
    if (existsInAdminAmenities) { alert(`"${amenityForm.title}" already exists in Admin Amenities`); return; }
    const alreadyExists = additionalAmenities.some((a) => a.workspace === Number(amenityForm.workspace) && a.title?.trim().toLowerCase() === amenityForm.title.trim().toLowerCase() && a.price_type === amenityForm.price_type);
    if (alreadyExists) { alert(`"${amenityForm.title}" already exists for this workspace`); return; }
    const request = editAmenityId ? axiosInstance.put(`workspaces/additional-amenities/update/${editAmenityId}/`, amenityForm) : axiosInstance.post("workspaces/additional-amenities/create/", amenityForm);
    request.then(() => { fetchAdditionalAmenities(); setAmenityForm({ workspace: "", title: "", description: "", price: "", price_type: "full_day" }); setEditAmenityId(null); setShowAmenityForm(false); alert(editAmenityId ? "Amenity Updated" : "Amenity Added"); }).catch(err => console.log(err));
  };

  const handleDeleteAmenity = (id) => {
    if (!window.confirm("Delete this amenity?")) return;
    axiosInstance.delete(`workspaces/additional-amenities/delete/${id}/`).then(() => { fetchAdditionalAmenities(); alert("Deleted Successfully"); }).catch(err => console.log(err));
  };

  const handleViewNotification = async (notification) => {
    try {
      const sameSectionNotifications = notifications.filter((n) => n.section === notification.section);
      await Promise.all(
        sameSectionNotifications.map((n) => {
          if (n.original_id) {
            return axiosInstance.put(`workspaces/owner-notification-read/${n.original_id}/`);
          }
          return Promise.resolve();
        })
      );
      setActiveSection(notification.section);
      const updatedViewed = [
        ...new Set([
          ...viewedNotifications,
          notification.id,
          ...sameSectionNotifications.map((n) => n.id)
        ])
      ];
      setViewedNotifications(updatedViewed);
      localStorage.setItem(notificationKey, JSON.stringify(updatedViewed));
      setNotifications((prev) => prev.filter((n) => n.section !== notification.section));
      setShowNotifications(false);
    } catch (err) { console.log(err); }
  };

  const buildNotifications = () => {
    let items = [];
    companyLeads.forEach((l) => {
      const id = `company-${l.id}`;
      if (!viewedNotifications.includes(id)) {
        items.push({ id, type: "Company Lead", name: l.name, workspace: l.company || "-", location: l.location || "-", section: "companyLeads" });
      }
    });
    hyderabadLeads.forEach((l) => {
      const id = `hyd-${l.id}`;
      if (!viewedNotifications.includes(id)) {
        items.push({ id, type: "Hyderabad Lead", name: l.name, workspace: l.workspace_type, location: l.preferred_location, section: "hyderabadLeads" });
      }
    });
    offerLeads.forEach((l) => {
      const id = `offer-${l.id}`;
      if (!viewedNotifications.includes(id)) {
        items.push({ id, type: "Offer Lead", name: l.name, workspace: l.workspace_type, location: l.preferred_location, section: "offerLeads" });
      }
    });
    customisationLeads.forEach((l) => {
      const id = `custom-${l.id}`;
      if (!viewedNotifications.includes(id)) {
        items.push({ id, type: "Customisation Lead", name: l.name, workspace: l.company || "-", location: l.location || "-", section: "customisationLeads" });
      }
    });
    workspaceNotifications.forEach((w) => {
      const id = `workspace-${w.id}`;
      if (!viewedNotifications.includes(id)) {
        items.push({
          id, original_id: w.id, type: "Workspace Added By Admin", name: w.workspace_name, workspace: w.workspace_name,
          location: w.city || w.location, owner_role: w.owner_role,
          message: `${w.workspace_name} added in ${w.city || w.location} by ${w.owner_role === "admin" ? "Super Admin" : "Owner"}`,
          section: "workspaces",
        });
      }
    });
    setNotifications(items);
  };

  useEffect(() => { buildNotifications(); }, [companyLeads, hyderabadLeads, offerLeads, customisationLeads, workspaceNotifications, viewedNotifications]);
  useEffect(() => {
    localStorage.setItem(notificationKey, JSON.stringify(viewedNotifications));
  }, [viewedNotifications, notificationKey]);

  useEffect(() => {
    fetchWorkspaces(); fetchAllWorkspaces(); fetchWorkspaceNotifications(); fetchOfferWorkspaces(); fetchOfferCoupons(); fetchAdditionalAmenities(); fetchRevenue(); fetchSlots(); fetchAmenities(); fetchUsers(); fetchMonthlySlots(); fetchCompanyLeads(); fetchHyderabadLeads(); fetchCustomisationLeads(); fetchQuotationLeads(); fetchOfferLeads(); fetchBookings(); fetchCancelRequests();
  }, [fetchBookings, fetchCancelRequests]);

  useEffect(() => { const loc = localStorage.getItem("user_location"); if (loc) setOwnerCity(loc); }, []);

  // ── Resize: close mobile sidebar when going back to desktop ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mergedBookings = useMemo(() => bookings.map(b => { const ls = localStates[b.id] || {}; return { ...b, ...ls }; }), [bookings, localStates]);
  const bookingStats = useMemo(() => ({ total: mergedBookings.length, confirmed: mergedBookings.filter(b => b.status === "confirmed").length, pending: mergedBookings.filter(b => b.status === "pending").length, cancelled: mergedBookings.filter(b => b.status === "cancelled").length }), [mergedBookings]);

  const handleUserSubmit = () => {
    if (!userForm.username || !userForm.email) { alert("Fill required fields"); return; }
    const request = editUserId ? axiosInstance.put(`accounts/update-user/${editUserId}/`, userForm) : axiosInstance.post("accounts/create-user/", userForm);
    request.then(() => { fetchUsers(); setUserForm({ username: "", email: "", password: "", phone: "", location: "" }); setEditUserId(null); setShowUserForm(false); alert(editUserId ? "User Updated" : "User Created"); }).catch(err => console.log(err));
  };

  const handleEditUser = (u) => {
    setUserForm({ username: u.username || "", email: u.email || "", password: "", phone: u.phone || "", location: u.location || "" });
    setEditUserId(u.id);
    setShowUserForm(true);
    setActiveSection("manageUsers");
  };

  const handleInactiveUser = (user) => {
    axiosInstance.put(`accounts/update-user/${user.id}/`, { username: user.username, email: user.email, phone: user.phone, is_active: !user.is_active })
      .then(() => { fetchUsers(); alert(user.is_active ? "User Inactivated" : "User Activated"); })
      .catch(err => console.log(err));
  };

  const resetWorkspaceForm = () => { setForm({ name: "", city: "", location: "", price: "", image: "", description: "", amenities: [] }); setEditId(null); setShowWorkspaceForm(false); };
  const resetMonthlyForm = () => { setMonthlyForm({ workspace_id: "", year: new Date().getFullYear(), months: [], capacity: 50, price: "" }); setEditMonthId(null); setShowMonthlyForm(false); };
  const resetSlotForm = () => { setSlotForm({ workspace_id: "", date: "", slot_type: "hour", start_time: 9, end_time: 18, capacity: 50, price: "" }); setEditSlotId(null); setShowSlotForm(false); };

  const getAmenityLabel = (amenity) => {
    if (typeof amenity === "object" && amenity !== null) return amenity.name || "Amenity";
    const found = amenitiesList.find(a => a.id === Number(amenity));
    return found ? found.name : "Amenity";
  };
  const getAmenityIcon = (amenity) => {
    const label = typeof amenity === "object" && amenity !== null ? amenity.name : getAmenityLabel(amenity);
    const key = String(label || "").toLowerCase().trim();
    if (key.includes("wifi") || key.includes("wi-fi")) return AMENITY_ICONS.wifi;
    if (key.includes("coffee")) return AMENITY_ICONS.coffee;
    if (key.includes("24") || key.includes("hour")) return AMENITY_ICONS["24hr"];
    if (key.includes("security")) return AMENITY_ICONS.security;
    if (key.includes("parking")) return AMENITY_ICONS.parking;
    if (key.includes("meeting")) return AMENITY_ICONS.meeting;
    if (key.includes("games")) return AMENITY_ICONS.games;
    if (key.includes("pantry")) return AMENITY_ICONS.pantry;
    if (key.includes("cleaning")) return AMENITY_ICONS.cleaning;
    if (key.includes("support")) return AMENITY_ICONS.support;
    return "🔹";
  };

  const updateBookingState = (id, patch) => {
    saveState(id, patch);
    setLocalStates(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    setSelectedBooking(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const updateQuotationLeadStatus = (id, status) => {
    axiosInstance.patch(`leads/quotation-lead/${id}/status/`, { status }).then(() => fetchQuotationLeads()).catch(err => console.log(err));
  };

  const getLatestBooking = (id) => { const booking = bookings.find(b => b.id === id); if (!booking) return null; const ls = localStates[id] || {}; return { ...booking, ...ls }; };
  const openBookingModal = (item) => { const latest = getLatestBooking(item.id); setSelectedBooking(latest || item); setBookingActiveTab("overview"); };
  const closeBookingModal = () => setSelectedBooking(null);
  const getStatusClass = (s) => { if (!s) return styles.pendingText; const l = s.toLowerCase(); if (l === "confirmed") return styles.confirmedText; if (l === "cancelled") return styles.cancelledText; return styles.pendingText; };

  const approveCancelRequest = async (id) => {
    try { await axiosInstance.put(`cart/booking/cancel-approve/${id}/`); showToast("✅ Cancel request approved & refunded"); fetchBookings(); fetchCancelRequests(); }
    catch (error) { console.error("Failed to approve cancel request:", error); showToast("❌ Failed to approve cancel request"); }
  };

  const handleSubmit = () => {
    if (!form.name || !ownerCity || !form.price) { alert("Please fill required fields (Name, City, Price)"); return; }
    const payload = { ...form, city: ownerCity, price: Number(form.price), amenities: form.amenities.map(Number) };
    if (editId) { axiosInstance.put(`workspaces/update/${editId}/`, payload).then(() => { alert("Workspace Updated ✅"); resetWorkspaceForm(); fetchWorkspaces(); }).catch(err => { console.error(err); alert("Update failed"); }); }
    else { axiosInstance.post("workspaces/add/", payload).then(() => { alert("Workspace Added And Waiting For an admin approval... ✅"); resetWorkspaceForm(); fetchWorkspaces(); }).catch(err => { console.error(err); alert("Add failed"); }); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name || "", city: item.city || "", location: item.location || "", price: item.price || "", image: item.image || "", description: item.description || "", amenities: Array.isArray(item.amenities) ? item.amenities.map(a => typeof a === "object" ? a.id : a) : [] });
    setEditId(item.id);
    setShowWorkspaceForm(true);
    setActiveSection("workspaces");
    setMobileSidebarOpen(false);
  };

  const handleToggleActive = (item) => {
    const isCurrentlyActive = item.isavailable !== false;
    const newStatus = !isCurrentlyActive;
    axiosInstance.put(`workspaces/update/${item.id}/`, { ...item, isavailable: newStatus, is_approved: newStatus ? item.is_approved : false, amenities: Array.isArray(item.amenities) ? item.amenities.map(a => (typeof a === "object" ? a.id : a)) : [] })
      .then(() => { showToast(newStatus ? "✅ Workspace set to Active" : "🚫 Workspace set to Inactive"); fetchWorkspaces(); })
      .catch(() => showToast("❌ Failed to update workspace status"));
  };

  const myWorkspaceIds = useMemo(() => new Set(workspaces.map(w => w.id)), [workspaces]);
  const suggestedWorkspaces = useMemo(() => allWorkspaces.filter(w => !myWorkspaceIds.has(w.id)), [allWorkspaces, myWorkspaceIds]);
  const filteredMyWorkspaces = useMemo(() => { const q = workspaceSearch.toLowerCase().trim(); if (!q) return workspaces; return workspaces.filter(w => (w.name || "").toLowerCase().includes(q) || (w.city || "").toLowerCase().includes(q) || (w.location || "").toLowerCase().includes(q)); }, [workspaces, workspaceSearch]);
  const filteredSuggestedWorkspaces = useMemo(() => { const q = suggestSearch.toLowerCase().trim(); if (!q) return suggestedWorkspaces; return suggestedWorkspaces.filter(w => { const ownerName = (w.owner_name || w.ownername || "").toLowerCase(); return ownerName.includes(q) || (w.name || "").toLowerCase().includes(q) || (w.city || "").toLowerCase().includes(q) || (w.location || "").toLowerCase().includes(q); }); }, [suggestedWorkspaces, suggestSearch]);

  const totalLeads = companyLeads.length + hyderabadLeads.length + offerLeads.length + customisationLeads.length + quotationLeads.length;

  const filteredCompanyLeads = useMemo(() => {
    const q = companyLeadSearch.toLowerCase();
    return companyLeads.filter(l => {
      const matchFilter = companyLeadFilter === "all" || l.status?.toLowerCase() === companyLeadFilter.toLowerCase();
      const matchSearch = !q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q) || (l.phone||"").toLowerCase().includes(q) || (l.company||"").toLowerCase().includes(q) || (l.preferred_location||"").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [companyLeads, companyLeadSearch, companyLeadFilter]);

  const filteredHyderabadLeads = useMemo(() => {
    const q = hyderabadLeadSearch.toLowerCase();
    return hyderabadLeads.filter(l => {
      const matchFilter = hyderabadLeadFilter === "all" || l.status?.toLowerCase() === hyderabadLeadFilter.toLowerCase();
      const matchSearch = !q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q) || (l.phone||"").toLowerCase().includes(q) || (l.workspace_type||"").toLowerCase().includes(q) || (l.preferred_location||"").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [hyderabadLeads, hyderabadLeadSearch, hyderabadLeadFilter]);

  const filteredOfferLeads = useMemo(() => {
    const q = offerLeadSearch.toLowerCase();
    return offerLeads.filter(l => {
      const matchFilter = offerLeadFilter === "all" || l.status?.toLowerCase() === offerLeadFilter.toLowerCase();
      const matchSearch = !q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q) || (l.phone||"").toLowerCase().includes(q) || (l.workspace_type||"").toLowerCase().includes(q) || (l.preferred_location||"").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [offerLeads, offerLeadSearch, offerLeadFilter]);
const handleDeactivateWorkspace = async (workspace) => {
  try {
    const res = await axiosInstance.get(
      `cart/workspace-future-bookings/${workspace.id}/`
    );

    const futureBookings = res.data || [];

    if (futureBookings.length > 0) {
      setFutureBookings(futureBookings);
      setSelectedWorkspace(workspace);
      setShowDeactivatePopup(true);
      return;
    }

    await axiosInstance.put(
      `workspaces/update/${workspace.id}/`,
      {
        ...workspace,
        isavailable: false,
        amenities: Array.isArray(workspace.amenities)
          ? workspace.amenities.map((a) =>
              typeof a === "object" ? a.id : a
            )
          : [],
      }
    );

    fetchWorkspaces();

  } catch (err) {
    console.log(err);
  }
};

const confirmDeactivateWorkspace = async () => {
  try {

    await axiosInstance.put(
      `workspaces/update/${selectedWorkspace.id}/`,
      {
        ...selectedWorkspace,
        isavailable: false,
        amenities: Array.isArray(selectedWorkspace.amenities)
          ? selectedWorkspace.amenities.map((a) =>
              typeof a === "object" ? a.id : a
            )
          : [],
      }
    );

    setShowDeactivatePopup(false);
    setFutureBookings([]);
    setSelectedWorkspace(null);

    fetchWorkspaces();

  } catch (err) {
    console.log(err);
  }
};
  const filteredCustomLeads = useMemo(() => {
    const q = customLeadSearch.toLowerCase();
    return customisationLeads.filter(l => {
      const matchFilter = customLeadFilter === "all" || l.status?.toLowerCase() === customLeadFilter.toLowerCase();
      const matchSearch = !q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q) || (l.phone||"").toLowerCase().includes(q) || (l.company||"").toLowerCase().includes(q) || (l.preferred_location||"").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [customisationLeads, customLeadSearch, customLeadFilter]);

  const filteredQuotationLeads = useMemo(() => {
    const q = quotationLeadSearch.toLowerCase();
    return quotationLeads.filter(l => {
      const matchFilter = quotationLeadFilter === "all" || l.status?.toLowerCase() === quotationLeadFilter.toLowerCase();
      const matchSearch = !q || (l.name||"").toLowerCase().includes(q) || (l.email||"").toLowerCase().includes(q) || (l.phone||"").toLowerCase().includes(q) || (l.company||"").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [quotationLeads, quotationLeadSearch, quotationLeadFilter]);

  const renderOverview = () => {
  const activeSlots = slots.filter(s => !isSlotExpired(s.date));
  const activeMonthlySlots = monthlySlots.filter(s => !isMonthlySlotExpired(s.year, s.month));
  const expiredSlotsCount = slots.length - activeSlots.length;
  const expiredMonthlyCount = monthlySlots.length - activeMonthlySlots.length;

const WORKSPACE_TYPE_META = {
  "Hot Desk": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></linearGradient><linearGradient id="hd2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c7d2fe"/><stop offset="100%" stopColor="#818cf8"/></linearGradient><filter id="hdS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#4f46e5" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#hd1)" filter="url(#hdS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="8" y="14" width="28" height="5" rx="2.5" fill="url(#hd2)"/><rect x="8" y="14" width="28" height="2" rx="1" fill="rgba(255,255,255,0.4)"/><rect x="13" y="19" width="4" height="10" rx="2" fill="#6366f1"/><rect x="27" y="19" width="4" height="10" rx="2" fill="#6366f1"/><rect x="10" y="27" width="10" height="3" rx="1.5" fill="#4338ca"/><rect x="24" y="27" width="10" height="3" rx="1.5" fill="#4338ca"/><rect x="10" y="24" width="24" height="4" rx="2" fill="#a5b4fc"/><rect x="10" y="24" width="24" height="2" rx="1" fill="rgba(255,255,255,0.3)"/></svg>,
    color:"#6366f1", bg:"#ede9fe"
  },

  "Dedicated Desk": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="dd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#2563eb"/></linearGradient><linearGradient id="dd2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient><filter id="ddS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#dd1)" filter="url(#ddS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="9" y="26" width="26" height="5" rx="2" fill="url(#dd2)"/><rect x="9" y="26" width="26" height="2" rx="1" fill="rgba(255,255,255,0.35)"/><rect x="14" y="31" width="4" height="7" rx="2" fill="#1d4ed8"/><rect x="26" y="31" width="4" height="7" rx="2" fill="#1d4ed8"/><rect x="13" y="15" width="18" height="12" rx="3" fill="#bfdbfe"/><rect x="13" y="15" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/><rect x="15" y="20" width="14" height="2" rx="1" fill="#93c5fd"/><rect x="15" y="23" width="10" height="2" rx="1" fill="#93c5fd"/><rect x="28" y="17" width="5" height="7" rx="1.5" fill="#93c5fd"/><rect x="29" y="18" width="3" height="5" rx="1" fill="#60a5fa"/></svg>,
    color:"#3b82f6", bg:"#dbeafe"
  },

  "Private Office Space": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="po1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#0e7490"/></linearGradient><filter id="poS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#0e7490" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#po1)" filter="url(#poS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="8" y="30" width="28" height="4" rx="2" fill="#0e7490"/><polygon points="22,8 8,30 36,30" fill="#a5f3fc"/><polygon points="22,8 8,30 36,30" fill="url(#po1)" opacity="0.6"/><rect x="12" y="16" width="8" height="14" rx="1" fill="#cffafe"/><rect x="12" y="16" width="8" height="3" rx="1" fill="rgba(255,255,255,0.5)"/><rect x="24" y="16" width="8" height="14" rx="1" fill="#cffafe"/><rect x="24" y="16" width="8" height="3" rx="1" fill="rgba(255,255,255,0.5)"/><rect x="18" y="22" width="8" height="8" rx="1" fill="#67e8f9"/><circle cx="22" cy="26" r="1.5" fill="#0e7490"/><rect x="22" y="8" width="6" height="4" rx="1" fill="#67e8f9"/></svg>,
    color:"#0891b2", bg:"#cffafe"
  },

  "Private Cabin": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#6d28d9"/></linearGradient><filter id="pcS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#6d28d9" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#pc1)" filter="url(#pcS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="10" y="10" width="24" height="28" rx="3" fill="#ddd6fe"/><rect x="10" y="10" width="24" height="5" rx="2" fill="rgba(255,255,255,0.4)"/><rect x="10" y="10" width="24" height="28" rx="3" stroke="#7c3aed" strokeWidth="1.5"/><rect x="18" y="10" width="8" height="28" fill="#c4b5fd" opacity="0.4"/><circle cx="27" cy="24" r="2" fill="#7c3aed"/><rect x="10" y="32" width="24" height="4" rx="2" fill="#7c3aed" opacity="0.4"/><rect x="12" y="15" width="8" height="10" rx="2" fill="#ede9fe"/><rect x="12" y="15" width="8" height="3" rx="1" fill="rgba(255,255,255,0.5)"/></svg>,
    color:"#7c3aed", bg:"#f5f3ff"
  },

  "Meeting Room": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mr1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#15803d"/></linearGradient><filter id="mrS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#15803d" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#mr1)" filter="url(#mrS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><ellipse cx="22" cy="24" rx="13" ry="8" fill="#bbf7d0"/><ellipse cx="22" cy="24" rx="13" ry="8" stroke="#16a34a" strokeWidth="1.5"/><ellipse cx="22" cy="23" rx="13" ry="3" fill="rgba(255,255,255,0.2)"/><circle cx="12" cy="17" r="4" fill="#86efac"/><circle cx="12" cy="17" r="4" stroke="#16a34a" strokeWidth="1"/><circle cx="11" cy="16" r="1.5" fill="white" opacity="0.6"/><circle cx="22" cy="15" r="4" fill="#86efac"/><circle cx="22" cy="15" r="4" stroke="#16a34a" strokeWidth="1"/><circle cx="21" cy="14" r="1.5" fill="white" opacity="0.6"/><circle cx="32" cy="17" r="4" fill="#86efac"/><circle cx="32" cy="17" r="4" stroke="#16a34a" strokeWidth="1"/><circle cx="31" cy="16" r="1.5" fill="white" opacity="0.6"/></svg>,
    color:"#16a34a", bg:"#dcfce7"
  },

  "Board Room": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="br1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fcd34d"/><stop offset="100%" stopColor="#b45309"/></linearGradient><filter id="brS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#b45309" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#br1)" filter="url(#brS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="9" y="12" width="26" height="18" rx="2" fill="#fef3c7"/><rect x="9" y="12" width="26" height="4" rx="2" fill="rgba(255,255,255,0.4)"/><rect x="11" y="17" width="6" height="8" rx="1" fill="#fde68a"/><rect x="11" y="17" width="6" height="3" rx="0.5" fill="#C9A84C" opacity="0.5"/><rect x="19" y="17" width="6" height="8" rx="1" fill="#fde68a"/><rect x="27" y="17" width="6" height="8" rx="1" fill="#fde68a"/><rect x="11" y="26" width="22" height="2" rx="1" fill="#C9A84C" opacity="0.5"/><rect x="19" y="30" width="6" height="5" rx="1" fill="#C9A84C"/><rect x="14" y="35" width="16" height="2" rx="1" fill="#92400e"/></svg>,
    color:"#C9A84C", bg:"#fef3c7"
  },

  "Event Space": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="es1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#be185d"/></linearGradient><filter id="esS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#be185d" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#es1)" filter="url(#esS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><polygon points="22,10 24,17 31,17 26,22 28,29 22,25 16,29 18,22 13,17 20,17" fill="#fce7f3"/><polygon points="22,10 24,17 31,17 26,22 28,29 22,25 16,29 18,22 13,17 20,17" stroke="#db2777" strokeWidth="1"/><polygon points="22,10 24,17 31,17 26,22 28,29 22,25 16,29 18,22 13,17 20,17" fill="rgba(255,255,255,0.2)"/><circle cx="22" cy="19" r="3" fill="#fbcfe8"/><circle cx="22" cy="18" r="1.5" fill="white" opacity="0.6"/><circle cx="14" cy="12" r="2" fill="#fce7f3" opacity="0.8"/><circle cx="30" cy="11" r="1.5" fill="#fce7f3" opacity="0.8"/><circle cx="32" cy="30" r="2" fill="#fce7f3" opacity="0.8"/><circle cx="12" cy="31" r="1.5" fill="#fce7f3" opacity="0.8"/></svg>,
    color:"#db2777", bg:"#fce7f3"
  },

  "Podcast": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pd1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f87171"/><stop offset="100%" stopColor="#b91c1c"/></linearGradient><filter id="pdS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#b91c1c" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#pd1)" filter="url(#pdS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="17" y="8" width="10" height="16" rx="5" fill="#fecaca"/><rect x="17" y="8" width="10" height="6" rx="5" fill="rgba(255,255,255,0.4)"/><rect x="17" y="8" width="10" height="16" rx="5" stroke="#dc2626" strokeWidth="1"/><path d="M12 20 Q12 30 22 30 Q32 30 32 20" stroke="#fca5a5" strokeWidth="2" fill="none" strokeLinecap="round"/><rect x="21" y="30" width="2" height="6" rx="1" fill="#fca5a5"/><rect x="16" y="36" width="12" height="2" rx="1" fill="#ef4444"/><rect x="20" y="13" width="4" height="2" rx="1" fill="#dc2626" opacity="0.5"/><rect x="20" y="17" width="4" height="2" rx="1" fill="#dc2626" opacity="0.5"/></svg>,
    color:"#dc2626", bg:"#fee2e2"
  },

  "Virtual Office": {
    icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vo1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0369a1"/></linearGradient><filter id="voS"><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#0369a1" floodOpacity="0.5"/></filter></defs><rect width="44" height="44" rx="12" fill="url(#vo1)" filter="url(#voS)"/><rect x="1" y="1" width="42" height="20" rx="11" fill="rgba(255,255,255,0.15)"/><rect x="8" y="12" width="28" height="18" rx="3" fill="#e0f2fe"/><rect x="8" y="12" width="28" height="4" rx="2" fill="rgba(255,255,255,0.5)"/><rect x="8" y="12" width="28" height="18" rx="3" stroke="#0284c7" strokeWidth="1.5"/><circle cx="11" cy="14" r="1" fill="#f87171"/><circle cx="14" cy="14" r="1" fill="#fbbf24"/><circle cx="17" cy="14" r="1" fill="#4ade80"/><rect x="11" y="19" width="10" height="7" rx="1.5" fill="#bae6fd"/><rect x="11" y="19" width="10" height="2" rx="0.5" fill="rgba(255,255,255,0.5)"/><rect x="23" y="19" width="10" height="3" rx="1" fill="#7dd3fc"/><rect x="23" y="24" width="7" height="2" rx="1" fill="#7dd3fc"/><rect x="18" y="30" width="8" height="3" rx="1" fill="#0284c7"/><rect x="14" y="33" width="16" height="2" rx="1" fill="#0369a1"/></svg>,
    color:"#0284c7", bg:"#e0f2fe"
  },
};

  const wsTypeCounts = WORKSPACE_TYPES.map(type => ({
    type,
    count:    workspaces.filter(w => w.name === type).length,
    approved: workspaces.filter(w => w.name === type && w.is_approved).length,
    meta:     WORKSPACE_TYPE_META[type],
  }));
  const maxCount     = Math.max(...wsTypeCounts.map(t => t.count), 1);
  const totalWsCount = wsTypeCounts.reduce((s, t) => s + t.count, 0);

  const Icon3D = ({ type }) => {
    const icons = {
      revenue: (
        <svg width="25" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="3" fill="#fde68a" stroke="#C9A84C" strokeWidth="1.5"/>
          <rect x="5" y="4" width="14" height="6" rx="2" fill="#fef3c7" stroke="#C9A84C" strokeWidth="1.5"/>
          <rect x="8" y="10" width="8" height="5" rx="1" fill="#C9A84C" opacity="0.4"/>
          <circle cx="12" cy="16" r="2" fill="#C9A84C"/>
        </svg>
      ),
      workspaces: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe" stroke="#6366f1" strokeWidth="1.5"/>
          <rect x="6" y="6" width="5" height="5" rx="1.5" fill="#6366f1" opacity="0.5"/>
          <rect x="13" y="6" width="5" height="5" rx="1.5" fill="#6366f1" opacity="0.9"/>
          <rect x="6" y="13" width="5" height="5" rx="1.5" fill="#6366f1" opacity="0.9"/>
          <rect x="13" y="13" width="5" height="5" rx="1.5" fill="#6366f1" opacity="0.5"/>
        </svg>
      ),
      bookings: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="3" fill="#cffafe" stroke="#0891b2" strokeWidth="1.5"/>
          <path d="M7 2v4M17 2v4M3 10h18" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="7" y="13" width="3" height="3" rx="1" fill="#0891b2" opacity="0.5"/>
          <rect x="11" y="13" width="3" height="3" rx="1" fill="#0891b2" opacity="0.9"/>
          <rect x="15" y="13" width="3" height="3" rx="1" fill="#0891b2" opacity="0.5"/>
        </svg>
      ),
      confirmed: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
          <path d="M8 12l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      slots: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5"/>
          <path d="M12 7v5l3 2" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      monthlySlots: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="3" fill="#a5f3fc" stroke="#0891b2" strokeWidth="1.5"/>
          <path d="M7 2v4M17 2v4M3 10h18" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="15" r="2" fill="#0891b2" opacity="0.6"/>
        </svg>
      ),
      leads: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20 12V22H4V12M22 7H2v5h20V7z" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="#dc2626" strokeWidth="1.5"/>
        </svg>
      ),
      users: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3.5" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5"/>
          <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="17" cy="8" r="2.5" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5"/>
          <path d="M20 20c0-2.761-1.343-5-4-6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      offers: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      approved: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5"/>
          <path d="M8 12l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      coupons: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" fill="#fde68a" stroke="#C9A84C" strokeWidth="1.5"/>
          <circle cx="7" cy="7" r="1.5" fill="#C9A84C"/>
        </svg>
      ),
      amenities: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[type] || null;
  };

  const miniBarData = [40,55,45,70,60,80,65,100];

  const topCards = [
    {
      key: "revenue",
      value: `₹${revenue.total_revenue?.toLocaleString() ?? 0}`,
      label: "Total Revenue",
      iconType: "revenue",
      iconBg: "linear-gradient(135deg,#fef3c7,#fde68a)",
      barColor: "#C9A84C",
      barBg: "#fde68a",
      badgeText: "All time",
      badgeBg: "#fef3c7", badgeColor: "#92400e",
      numColor: "#C9A84C",
      borderTop: "linear-gradient(90deg,#C9A84C,#f0c040)",
      section: null,
      linkText: null,
    },
    {
      key: "workspaces",
      value: workspaces.length,
      label: "My Workspaces",
      iconType: "workspaces",
      iconBg: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
      barColor: "#6366f1",
      barBg: "#ddd6fe",
      badgeText: `${approvedWorkspaces.length} approved`,
      badgeBg: "#ede9fe", badgeColor: "#4338ca",
      numColor: "#6366f1",
      borderTop: "linear-gradient(90deg,#6366f1,#a78bfa)",
      section: "workspaces",
      linkText: "View all workspaces",
    },
    {
      key: "bookings",
      value: mergedBookings.length,
      label: "Total Bookings",
      iconType: "bookings",
      iconBg: "linear-gradient(135deg,#cffafe,#a5f3fc)",
      barColor: "#0891b2",
      barBg: "#a5f3fc",
      badgeText: `${bookingStats.confirmed} confirmed`,
      badgeBg: "#cffafe", badgeColor: "#164e63",
      numColor: "#0891b2",
      borderTop: "linear-gradient(90deg,#0891b2,#22d3ee)",
      section: "bookings",
      linkText: "View all bookings",
    },
  ];

  const quickCards = [
    // { iconType:"confirmed", iconBg:"#dcfce7", label:"Confirmed Revenue", sub:`₹${revenue.confirmed_revenue?.toLocaleString() ?? 0}`, section:"bookings" },
    { iconType:"slots",     iconBg:"#ede9fe", label:"Total Slots",       sub:`${activeSlots.length} active${expiredSlotsCount > 0 ? ` · ${expiredSlotsCount} exp` : ""}`, section:"slots" },
    { iconType:"monthlySlots", iconBg:"#cffafe", label:"Monthly Slots",  sub:`${activeMonthlySlots.length} active${expiredMonthlyCount > 0 ? ` · ${expiredMonthlyCount} exp` : ""}`, section:"monthlySlots" },
    // { iconType:"leads",     iconBg:"#fee2e2", label:"Total Leads",       sub:`${totalLeads} inquiries`, section:"hyderabadLeads" },
    // { iconType:"users",     iconBg:"#dbeafe", label:"Total Users",       sub:`${Array.isArray(users) ? users.length : 0} members`, section:"manageUsers" },
    { iconType:"offers",    iconBg:"#fce7f3", label:"Offer Workspaces",  sub:`${offerWorkspaces.length} active`, section:"offerWorkspaces" },
    { iconType:"approved",  iconBg:"#d1fae5", label:"Approved Spaces",   sub:`${approvedWorkspaces.length} live`, section:"workspaces" },
    { iconType:"coupons",   iconBg:"#fef3c7", label:"Offer Coupons",     sub:`${offerCoupons.length} coupons`, section:"offerCoupons" },
    { iconType:"amenities", iconBg:"#f3e8ff", label:"Extra Amenities",   sub:`${additionalAmenities.length} added`, section:"additionalAmenities" },
  ];

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Top 3 stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, marginBottom:16 }}>
        {topCards.map(card => (
          <div key={card.key}
            onClick={() => card.section && handleNav(card.section)}
            style={{
              background:"#fff", borderRadius:16, padding:20,
              border:"1px solid #e5e7eb", position:"relative", overflow:"hidden",
              cursor: card.section ? "pointer" : "default",
              transition:"box-shadow 0.15s",
            }}
            onMouseEnter={e => { if(card.section) e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
          >
            {/* top color bar */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:card.borderTop }} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, marginTop:4 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:card.iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon3D type={card.iconType} />
              </div>
              <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:card.badgeBg, color:card.badgeColor }}>
                ↑ {card.badgeText}
              </span>
            </div>

            <div style={{ fontSize:28, fontWeight:800, color:card.numColor, marginBottom:2 }}>{card.value}</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:14 }}>{card.label}</div>

            {/* spark bars */}
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:36 }}>
              {miniBarData.map((h, i) => (
                <div key={i} style={{
                  flex:1, borderRadius:3,
                  height:`${h}%`,
                  background: i === miniBarData.length-1 ? card.barColor : card.barBg,
                }} />
              ))}
            </div>

            {card.linkText && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, paddingTop:12, borderTop:"1px solid #f3f4f6", fontSize:12, fontWeight:600, color:"#9ca3af" }}>
                <span>{card.linkText}</span>
                <span>→</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Quick stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
        {quickCards.map(card => (
          <div key={card.label}
            onClick={() => handleNav(card.section)}
            style={{
              background:"#fff", borderRadius:12, padding:"14px 12px",
              border:"1px solid #e5e7eb", cursor:"pointer", transition:"box-shadow 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
          >
            <div style={{ width:35, height:35, borderRadius:10, background:card.iconBg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
              <Icon3D type={card.iconType} />
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:2, lineHeight:1.3 }}>{card.label}</div>
            <div style={{ fontSize:10, color:"#0c0f14" }}>{card.sub}</div>
            <div style={{ fontSize:11, color:"#d1d5db", marginTop:6, textAlign:"right" }}>↗</div>
          </div>
        ))}
      </div>

      {/* ── Bottom: Quick Access + Workspace Types ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Quick Access */}
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#C9A84C" }} />
            <span style={{ fontSize:14, fontWeight:700, color:"#111" }}>Quick Access</span>
            <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af", fontWeight:600 }}>6 shortcuts</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { iconType:"workspaces", iconBg:"#ede9fe", label:"Workspaces",   sub:"Manage listings",   section:"workspaces" },
              { iconType:"users",      iconBg:"#dcfce7", label:"Users",         sub:"Manage accounts",   section:"manageUsers" },
              { iconType:"bookings",   iconBg:"#cffafe", label:"Bookings",      sub:"View all requests", section:"bookings" },
              { iconType:"slots",      iconBg:"#fef3c7", label:"Slots",         sub:"Manage timings",    section:"slots" },
              { iconType:"leads",      iconBg:"#fee2e2", label:"Leads",         sub:"View inquiries",    section:"hyderabadLeads" },
              { iconType:"amenities",  iconBg:"#f3e8ff", label:"Amenities",     sub:"Extra add-ons",     section:"additionalAmenities" },
            ].map(item => (
              <div key={item.label}
                onClick={() => handleNav(item.section)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:12, borderRadius:10, background:"#fafafa", border:"1px solid #f3f4f6", cursor:"pointer", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#f0f0f0"}
                onMouseLeave={e => e.currentTarget.style.background="#fafafa"}
              >
                <div style={{ width:32, height:32, borderRadius:8, background:item.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon3D type={item.iconType} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#111" }}>{item.label}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Types */}
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#C9A84C" }} />
            <span style={{ fontSize:14, fontWeight:700, color:"#111" }}>Workspace Types</span>
            <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af", fontWeight:600 }}>{totalWsCount} spaces</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {wsTypeCounts.map(({ type, count, approved, meta }) => {
              const pct = Math.round((count / maxCount) * 100);
              const isEmpty = count === 0;
              return (
                <div key={type}
                  onClick={() => handleNav("workspaces")}
                  style={{ borderRadius:10, overflow:"hidden", border:"1px solid #f3f4f6", cursor:"pointer", opacity: isEmpty ? 0.45 : 1 }}
                >
                  <div style={{ height:4, background: isEmpty ? "#e5e7eb" : meta.color }} />
                  <div style={{ padding:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ width:28, height:28, borderRadius:7, background: isEmpty ? "#f1f5f9" : meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
                        {meta.icon}
                      </div>
                      <span style={{ fontSize:16, fontWeight:800, color: isEmpty ? "#cbd5e1" : meta.color }}>{count}</span>
                    </div>
                    <div style={{ fontSize:10, color:"#6b7280", marginBottom:6, fontWeight:600, lineHeight:1.2 }}>{type}</div>
                    <div style={{ height:3, borderRadius:2, background:"#f3f4f6", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: isEmpty ? "#e5e7eb" : meta.color, borderRadius:2 }} />
                    </div>
                    {!isEmpty && (
                      <div style={{ display:"flex", gap:4, marginTop:5 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:"#059669", background:"#d1fae5", padding:"2px 5px", borderRadius:4 }}>✔ {approved}</span>
                        {count - approved > 0 && <span style={{ fontSize:9, fontWeight:700, color:"#d97706", background:"#fef3c7", padding:"2px 5px", borderRadius:4 }}>{count - approved}p</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderManageUsers = () => {
    const allUsers = Array.isArray(users) ? users : [];
    const totalUsers = allUsers.length;
    const activeUsersCount = allUsers.filter(u => u.is_active).length;
    const inactiveUsersCount = allUsers.filter(u => !u.is_active).length;
    const filteredUsers = allUsers.filter(u => {
      const search = userSearch.toLowerCase();
      const matchSearch = (u.username || "").toLowerCase().includes(search) || (u.email || "").toLowerCase().includes(search) || (u.phone || "").toLowerCase().includes(search) || (u.location || "").toLowerCase().includes(search);
      if (!matchSearch) return false;
      if (userFilterTab === "active") return u.is_active;
      if (userFilterTab === "inactive") return !u.is_active;
      return true;
    });

    return (
      <div className={styles.sectionBody}>
        <div className={styles.muPageHeader}>
          <div className={styles.muPageTitle}>
            <div className={styles.muTitleIcon}>👥</div>
            <div><h2>Manage Users</h2><p>Add, edit and manage users — all in one place.</p></div>
          </div>
          <button className={styles.muAddBtn} onClick={() => { setShowUserForm(true); setEditUserId(null); setUserForm({ username: "", email: "", password: "", phone: "", location: "" }); }}>
            <span>＋</span> Add User
          </button>
        </div>
        <div className={styles.muStatsRow}>
          <div className={`${styles.muStatCard} ${styles.muStatActive}`} onClick={() => setUserFilterTab("all")}><div className={styles.muStatIcon}>👤</div><div className={styles.muStatNum}>{totalUsers}</div><div className={styles.muStatLabel}>TOTAL USERS</div></div>
          <div className={`${styles.muStatCard} ${styles.muStatGreen}`} onClick={() => setUserFilterTab("active")}><div className={styles.muStatIcon}>✔️</div><div className={styles.muStatNum}>{activeUsersCount}</div><div className={styles.muStatLabel}>ACTIVE USERS</div></div>
          <div className={`${styles.muStatCard} ${styles.muStatRed}`} onClick={() => setUserFilterTab("inactive")}><div className={styles.muStatIcon}>⛔</div><div className={styles.muStatNum}>{inactiveUsersCount}</div><div className={styles.muStatLabel}>INACTIVE USERS</div></div>
        </div>
        {showUserForm && (
          <div className={styles.muFormPanel}>
            <div className={styles.muFormPanelHeader}><h3>{editUserId ? "✏️ Edit User" : "➕ Add New User"}</h3><button className={styles.muFormClose} onClick={() => { setShowUserForm(false); setEditUserId(null); }}>✕</button></div>
            <div className={styles.muFormGrid}>
              <div className={styles.fieldGroup}><label>Username *</label><input placeholder="johndoe" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Email *</label><input placeholder="john@example.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Phone</label><input placeholder="9876543210" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Location</label><input placeholder="Hyderabad" value={userForm.location} onChange={e => setUserForm({ ...userForm, location: e.target.value })} /></div>
              {!editUserId && (<div className={styles.fieldGroup}><label>Password *</label><input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /></div>)}
            </div>
            <div className={styles.formActions}>
              <button className={styles.submitBtn} onClick={handleUserSubmit}>{editUserId ? "Update User" : "Add User"}</button>
              <button className={styles.cancelBtn} onClick={() => { setShowUserForm(false); setEditUserId(null); }}>Cancel</button>
            </div>
          </div>
        )}
        <div className={styles.muFilterBar}>
          <div className={styles.muTabs}>
            {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([key, label]) => (
              <button key={key} className={`${styles.muTab} ${userFilterTab === key ? styles.muTabActive : ""}`} onClick={() => setUserFilterTab(key)}>
                {label}<span className={styles.muTabBadge}>{key === "all" ? totalUsers : key === "active" ? activeUsersCount : inactiveUsersCount}</span>
              </button>
            ))}
          </div>
          <div className={styles.muSearchWrap}>
            <span className={styles.muSearchIcon}>🔍</span>
            <input className={styles.muSearchInput} placeholder="Search by name, email, phone, location..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            <span className={styles.muRecordCount}>{filteredUsers.length} records</span>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone / Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: "#94a3b8", fontWeight: 600, fontSize: "13px" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td><div className={styles.muUserCell}><div className={styles.muAvatar} style={{ background: getAvatarColor(u.username) }}>{getInitials(u.username)}</div><strong>{u.username}</strong></div></td>
                  <td><div className={styles.muEmailCell}><span className={styles.muEmailIcon}>✉</span><a href={`mailto:${u.email}`} className={styles.emailLink}>{u.email}</a></div></td>
                  <td><div className={styles.muPhoneCell}>{u.phone && <div><span className={styles.muPhoneIcon}>📞</span> {u.phone}</div>}{u.location && <div><span className={styles.muPhoneIcon}>📍</span> {u.location}</div>}{!u.phone && !u.location && <span style={{ color: "#94a3b8" }}>—</span>}</div></td>
                  <td>{u.is_active ? <span className={styles.activeBadge}>Active</span> : <span className={styles.inactiveBadge}>Inactive</span>}</td>
                  <td><div className={styles.muActions}><button className={styles.muEditBtn} onClick={() => handleEditUser(u)}>✏ Edit</button><button className={u.is_active ? styles.muInactiveBtn : styles.muActiveBtn} onClick={() => handleInactiveUser(u)}>{u.is_active ? "Deactivate" : "Activate"}</button></div></td>
                </tr>
              )) : (<tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No users found</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const iconBtnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "32px", height: "32px", borderRadius: "6px", border: "none",
    cursor: "pointer", transition: "all 0.18s ease", flexShrink: 0,
  };

  const renderWorkspaces = () => (
    <div className={styles.sectionBody}>
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
      <AccordionSection title={editId ? "Edit Workspace" : "Add New Workspace"} isOpen={showWorkspaceForm} onToggle={() => { if (showWorkspaceForm && editId) resetWorkspaceForm(); else setShowWorkspaceForm(prev => !prev); }} openLabel="+ Add Workspace" closeLabel={editId ? "✕ Cancel Edit" : "✕ Close Form"}>
        <div className={styles.wsFormGrid}>
          <div className={styles.fieldGroup}><label>Workspace Type *</label><select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}><option value="">Select Type</option>{WORKSPACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className={styles.fieldGroup}><label>City *</label><select value={ownerCity} disabled><option value={ownerCity}>{ownerCity}</option></select></div>
          <div className={styles.fieldGroup}><label>Location / Address</label><input placeholder="Enter address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Price (₹) *</label><input type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}><label>Description</label><textarea rows="3" placeholder="Describe this workspace…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}><label>Select Amenities</label><div className={styles.amenitiesBox}>{amenitiesList.length === 0 ? <p>No amenities found</p> : amenitiesList.map(a => (<label key={a.id} className={styles.amenityChip}><input type="checkbox" value={a.id} checked={form.amenities.includes(a.id)} onChange={e => { if (e.target.checked) setForm({ ...form, amenities: [...form.amenities, a.id] }); else setForm({ ...form, amenities: form.amenities.filter(id => id !== a.id) }); }} />{a.name}</label>))}</div></div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}><label>Image URL</label><input placeholder="https://…" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
        </div>
        <div className={styles.wsFormActions}><button className={styles.wsSubmitBtn} onClick={handleSubmit}>{editId ? "Update Workspace" : "Add Workspace"}</button><button className={styles.wsCancelBtn} onClick={resetWorkspaceForm}>Cancel</button></div>
      </AccordionSection>

      <div className={styles.tableTopBar}>
        <input className={styles.searchInput} placeholder="Search my workspaces..." value={workspaceSearch} onChange={e => setWorkspaceSearch(e.target.value)} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th><th>Workspace</th><th>Owner / Landlord</th><th>Added By</th>
              <th>City</th><th>Rent</th><th>Lease</th><th>Price</th>
              <th>Approval</th><th>Status</th><th>Revenue</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMyWorkspaces.map((w, i) => {
              const isActive = w.isavailable !== false;
              const ownerDetails = w.owner_details || null;
              const isRevenueOpen = openRevenueId === w.id;
              return (
                <>
                  <tr key={w.id} style={!isActive ? { opacity: 0.6, background: "#f8fafc" } : {}}>
                    <td>{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <strong>{w.name}</strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{w.location || "No location"}</span>
                      </div>
                    </td>
                    <td>
                      {ownerDetails ? (
                        <button type="button" onClick={() => { setSelectedOwner(ownerDetails); setShowOwnerDetails(true); }} style={{ border: "none", background: "#eff6ff", color: "#2563eb", padding: "6px 10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}>
                          👤 {ownerDetails.owner_name}
                        </button>
                      ) : (
                        <span style={{ background: "#fef2f2", color: "#dc2626", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600 }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>{w.owner_display_name || "Unknown"}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: w.owner_role === "admin" ? "#dc2626" : "#2563eb" }}>
                          {w.owner_role === "admin" ? "Added By Admin" : "Added By Manager"}
                        </span>
                      </div>
                    </td>
                    <td>{w.city}</td>
                    <td>{ownerDetails?.rent_amount ? <span style={{ color: "#059669", fontWeight: 700 }}>₹{Number(ownerDetails.rent_amount).toLocaleString()}</span> : "—"}</td>
                    <td>{ownerDetails?.agreement_type ? <span style={{ background: "#f1f5f9", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "#334155" }}>{ownerDetails.agreement_type}</span> : "—"}</td>
                    <td style={{ fontWeight: 700, color: "#7c3aed" }}>₹{Number(w.price || 0).toLocaleString()}</td>
                    <td>{w.is_approved ? <span className={styles.approvedBadge}>Approved</span> : <span className={styles.pendingBadge}>Pending</span>}</td>
                    <td>
                      {isActive ? (
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>Active</span>
                      ) : (
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <button
                        title={isRevenueOpen ? "Hide Revenue" : "View Revenue"}
                        onClick={() => setOpenRevenueId(isRevenueOpen ? null : w.id)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "5px 10px", borderRadius: "8px",
                          border: `1.5px solid ${isRevenueOpen ? "#7c3aed" : "#a78bfa"}`,
                          background: isRevenueOpen ? "#7c3aed" : "#f5f3ff",
                          color: isRevenueOpen ? "#fff" : "#7c3aed",
                          fontSize: "11px", fontWeight: 700, cursor: "pointer",
                          transition: "all 0.18s ease", whiteSpace: "nowrap",
                        }}
                      >
                        {isRevenueOpen ? "▲ Hide" : "💰 Revenue"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
 <button title="Edit" onClick={() => handleEdit(w)} style={{ ...iconBtnBase, background: "#dbeafe", color: "#2563eb" }}>
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={SVG.edit} />
  </svg>
</button>
<button
  title={isActive ? "Deactivate" : "Activate"}
  onClick={() => { if (isActive) { handleDeactivateWorkspace(w); } else { handleToggleActive(w); } }}
  style={{ ...iconBtnBase, background: isActive ? "#dcfce7" : "#f1f5f9", color: isActive ? "#16a34a" : "#475569" }}
>
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={isActive ? SVG.eyeOn : SVG.eyeOff} />
  </svg>
</button>
                        {showConflict && futureBookings.length > 0 && (
  <div className={styles.bookingConflictBox}>
    <div className={styles.bookingConflictTitle}>
      Future Bookings Found
    </div>

    {futureBookings.map((b, i) => (
      <div key={i} className={styles.bookingConflictCard}>

        <div className={styles.bookingConflictRow}>
          <span className={styles.bookingConflictLabel}>User:</span>
          <span className={styles.bookingConflictValue}>
            {b.user_name}
          </span>
        </div>

        <div className={styles.bookingConflictRow}>
          <span className={styles.bookingConflictLabel}>Date:</span>
          <span className={styles.bookingConflictValue}>
            {b.booking_date}
          </span>
        </div>

        <div className={styles.bookingConflictRow}>
          <span className={styles.bookingConflictLabel}>Time:</span>
          <span className={styles.bookingConflictValue}>
            {b.start_time} - {b.end_time}
          </span>
        </div>

        <div className={styles.bookingConflictRow}>
          <span className={styles.bookingConflictLabel}>Type:</span>
          <span className={styles.bookingConflictValue}>
            {b.booking_type}
          </span>
        </div>

      </div>
    ))}
  </div>
)}
                      </div>
                    </td>
                  </tr>
                  {isRevenueOpen && (
                    <tr key={`revenue-${w.id}`} style={{ background: "linear-gradient(135deg,#faf5ff,#f0fdf4)", borderLeft: "4px solid #7c3aed" }}>
                      <td colSpan={12} style={{ padding: 0 }}>
                        <WorkspaceRevenuePanel workspaceId={w.id} workspaceName={w.name} bookings={mergedBookings} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filteredMyWorkspaces.length === 0 && (
              <tr><td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No workspaces found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOfferWorkspaces = () => (
    <div className={styles.sectionBody}>
      <AccordionSection title={editOfferId ? "Edit Offer Workspace" : "Add Offer Workspace"} icon="🔥" isOpen={showOfferForm} onToggle={() => { setShowOfferForm(prev => !prev); if (showOfferForm) { setEditOfferId(null); setOfferForm({ building:"",type:"",original_price:"",offer_price:"",seats:"",floor:"",image:"",amenities:[] }); } }} openLabel="+ Add Offer Workspace" closeLabel={editOfferId?"✕ Cancel Edit":"✕ Close Form"}>
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}><label>Area</label><input type="text" value={ownerCity} readOnly className={styles.readonlyInput} /></div>
          <div className={styles.fieldGroup}><label>Building</label><input value={offerForm.building} onChange={e => setOfferForm({ ...offerForm, building: e.target.value })} /></div>
         <div className={styles.fieldGroup}>
  <label>Workspace Type</label>
  <select
    value={offerForm.type}
    onChange={e => {
      const selectedName = e.target.value;
      const selectedWs = approvedWorkspaces.find(
        ws => (ws.workspacename || ws.name || ws.title) === selectedName
      );
      setOfferForm({
        ...offerForm,
        type: selectedName,
        image: selectedWs?.image || offerForm.image,  // ← auto-fill image
      });
    }}
  >
    <option value="">Select Workspace</option>
    {approvedWorkspaces.map(ws => (
      <option key={ws.id} value={ws.workspacename||ws.name||ws.title}>
        {ws.city} | {ws.location} | {ws.workspacename||ws.name||ws.title}
      </option>
    ))}
  </select>
</div>
          <div className={styles.fieldGroup}><label>Original Price</label><input type="number" value={offerForm.original_price} onChange={e => setOfferForm({ ...offerForm, original_price: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Offer Price</label><input type="number" value={offerForm.offer_price} onChange={e => setOfferForm({ ...offerForm, offer_price: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Seats</label><input type="number" value={offerForm.seats} onChange={e => setOfferForm({ ...offerForm, seats: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Floor</label><input value={offerForm.floor} onChange={e => setOfferForm({ ...offerForm, floor: e.target.value })} /></div>
         {/* Replace the Image URL input with a preview */}
{offerForm.image && (
  <div className={styles.fieldGroup}>
    <label>Workspace Image (auto-filled)</label>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src={offerForm.image}
        alt="workspace"
        style={{
          width: 80, height: 60, objectFit: "cover",
          borderRadius: 8, border: "1px solid #e5e7eb"
        }}
        onError={e => e.target.style.display = "none"}
      />
      <span style={{ fontSize: 12, color: "#64748b", wordBreak: "break-all" }}>
        {offerForm.image}
      </span>
    </div>
  </div>
)}
        </div>
        <div className={styles.formActions}><button className={styles.submitBtn} onClick={handleAddOfferWorkspace}>{editOfferId?"Update Offer Workspace":"Add Offer Workspace"}</button><button className={styles.cancelBtn} onClick={() => { setShowOfferForm(false); setEditOfferId(null); setOfferForm({ building:"",type:"",original_price:"",offer_price:"",seats:"",floor:"",image:"",amenities:[] }); }}>Cancel</button></div>
      </AccordionSection>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Area</th><th>Building</th><th>Type</th><th>Price</th><th>Offer</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{offerWorkspaces.map(item => (<tr key={item.id}><td>{item.area}</td><td>{item.building}</td><td>{item.type}</td><td>₹{item.original_price}</td><td>₹{item.offer_price}</td><td>{item.is_approved?<span className={styles.approvedBadge}>Approved</span>:<span className={styles.pendingBadge}>Pending</span>}</td><td><div className={styles.actionBtns}><button className={styles.editBtn} onClick={() => handleEditOffer(item)}>Edit</button><button className={styles.deleteBtn} onClick={() => handleDeleteOffer(item.id)}>Delete</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );

  const renderOfferCoupons = () => (
    <div className={styles.sectionBody}>
      <AccordionSection title="Add Offer Coupon" icon="🎟️" isOpen={showCouponForm} onToggle={() => setShowCouponForm(prev => !prev)} openLabel="+ Add Coupon" closeLabel="✕ Close Form">
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}><label>Select Workspace</label><select value={couponForm.workspace} onChange={e => setCouponForm({ ...couponForm, workspace: e.target.value })}><option value="">Select Workspace</option>{offerWorkspaces.map(ws => (<option key={ws.id} value={ws.id}>{ws.area} | {ws.building||"No Location"} | {ws.type}</option>))}</select></div>
          <div className={styles.fieldGroup}><label>Coupon Code</label><input placeholder="CLAIM50" value={couponForm.coupon_code} onChange={e => setCouponForm({ ...couponForm, coupon_code: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Discount %</label><select value={couponForm.discount_percentage} onChange={e => setCouponForm({ ...couponForm, discount_percentage: e.target.value })}><option value="">Select %</option><option value="10">10%</option><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option></select></div>
          <div className={styles.fieldGroup}><label>Coupon Capacity</label><input type="number" placeholder="2" value={couponForm.capacity} onChange={e => setCouponForm({ ...couponForm, capacity: e.target.value })} /></div>
        </div>
        <div className={styles.formActions}><button className={styles.submitBtn} onClick={handleAddCoupon}>Add Coupon</button><button className={styles.cancelBtn} onClick={() => { setShowCouponForm(false); setCouponForm({ workspace:"",coupon_code:"",discount_percentage:"",capacity:"" }); }}>Cancel</button></div>
      </AccordionSection>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Workspace</th><th>Coupon</th><th>Discount</th><th>Capacity</th><th>Used</th><th>Left</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{offerCoupons.map(item => { const left = Number(item.capacity) - Number(item.used_count||0); return (<tr key={item.id}><td>{item.workspace_name||item.workspace}</td><td><span className={styles.couponCode}>{item.coupon_code}</span></td><td>{item.discount_percentage}%</td><td>{item.capacity}</td><td>{item.used_count||0}</td><td>{left}</td><td>{left>0?<span className={styles.activeBadge}>Active</span>:<span className={styles.inactiveBadge}>Expired</span>}</td><td><button className={styles.deleteBtn} onClick={() => handleDeleteCoupon(item.id)}>Delete</button></td></tr>); })}</tbody>
        </table>
      </div>
    </div>
  );

  const renderSuggestedWorkspaces = () => (
    <div className={styles.sectionBody}>
      <div className={styles.accordSection} style={{ background:"#fff",borderRadius:"14px",padding:"20px 24px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin:"0 0 6px",fontSize:"15px",fontWeight:700,color:"#1a2235" }}>Suggested Workspaces</h3>
        <p style={{ margin:0,color:"#667085",fontSize:"13px" }}>View workspaces added by other managers. This is only for reference.</p>
      </div>
      <div className={styles.tableTopBar}><input className={styles.searchInput} placeholder="Search by manager, workspace, city, or location..." value={suggestSearch} onChange={e => setSuggestSearch(e.target.value)} /></div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Manager</th><th>Name</th><th>City</th><th>Location</th><th>Price</th><th>Amenities</th></tr></thead>
          <tbody>{filteredSuggestedWorkspaces.map((w, i) => (<tr key={w.id}><td>{i+1}</td><td>{w.owner_name||w.ownername||"—"}</td><td><strong>{w.name}</strong></td><td>{w.city}</td><td>{w.location||"—"}</td><td className={styles.priceCell}>₹{parseFloat(w.price||0).toLocaleString()}</td><td><div className={styles.amenityList}>{Array.isArray(w.amenities)&&w.amenities.length>0?w.amenities.map((amenity,idx)=><span key={typeof amenity==="object"?amenity.id||idx:idx} className={styles.amenityTag}><span>{getAmenityIcon(amenity)}</span><span>{getAmenityLabel(amenity)}</span></span>):<span className={styles.noData}>No amenities</span>}</div></td></tr>))}</tbody>
        </table>
        {filteredSuggestedWorkspaces.length === 0 && <div className={styles.empty}>No suggested workspaces available from other managers.</div>}
      </div>
    </div>
  );

  const renderSlots = () => {
    const totalSlots = slots.length;
    const hourlySlots = slots.filter(s => s.slot_type === "hour").length;
    const fullDaySlots = slots.filter(s => s.slot_type === "day").length;
    const totalCapacity = slots.reduce((sum, s) => sum + Number(s.capacity || 0), 0);
    const totalBooked = slots.reduce((sum, s) => sum + Number(s.booked_seats ?? s.booked_slots ?? s.booked ?? s.booked_count ?? 0), 0);
    const totalRemaining = Math.max(totalCapacity - totalBooked, 0);

    return (
      <div className={styles.sectionBody}>
        {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
        <div className={styles.overviewGrid}>
          <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>⏰</span><div><p className={styles.statValue}>{totalSlots}</p><p className={styles.statLabel}>Total Slots</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>🕐</span><div><p className={styles.statValue}>{hourlySlots}</p><p className={styles.statLabel}>Hourly Slots</p></div></div>
          <div className={`${styles.statCard} ${styles.amber}`}><span className={styles.statIcon}>☀️</span><div><p className={styles.statValue}>{fullDaySlots}</p><p className={styles.statLabel}>Full Day Slots</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>✅</span><div><p className={styles.statValue}>{totalBooked}</p><p className={styles.statLabel}>Booked Seats</p></div></div>
          <div className={`${styles.statCard} ${styles.red}`}><span className={styles.statIcon}>🪑</span><div><p className={styles.statValue}>{totalRemaining}</p><p className={styles.statLabel}>Remaining Seats</p></div></div>
          <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>👥</span><div><p className={styles.statValue}>{totalCapacity}</p><p className={styles.statLabel}>Total Capacity</p></div></div>
        </div>
        <AccordionSection title={editSlotId?"Edit Slot":"Create New Slot"} icon="⏰" isOpen={showSlotForm} onToggle={() => { if (showSlotForm&&editSlotId) resetSlotForm(); else setShowSlotForm(prev=>!prev); }} openLabel="+ Create Slot" closeLabel={editSlotId?"✕ Cancel Edit":"✕ Close Form"}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}><label>Workspace</label><select value={slotForm.workspace_id} onChange={e => setSlotForm({ ...slotForm, workspace_id: e.target.value })}><option value="">Select Workspace</option>{approvedWorkspaces.map(w => (<option key={w.id} value={w.id}>{w.name} • {w.city} • {w.location}</option>))}</select>{approvedWorkspaces.length===0&&<small style={{ color:"#f87171",marginTop:"4px",display:"block" }}>No approved workspaces yet.</small>}</div>
            <div className={styles.fieldGroup}><label>Date</label><input type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} /></div>
            <div className={styles.fieldGroup}><label>Slot Type</label><select value={slotForm.slot_type} onChange={e => setSlotForm({ ...slotForm, slot_type: e.target.value })}><option value="hour">Hourly</option><option value="day">Full Day</option></select></div>
            <div className={styles.fieldGroup}><label>Capacity</label><input type="number" placeholder="50" value={slotForm.capacity} onChange={e => setSlotForm({ ...slotForm, capacity: e.target.value })} /></div>
            {slotForm.slot_type==="hour"&&(<><div className={styles.fieldGroup}><label>Start Hour</label><input type="number" placeholder="9" value={slotForm.start_time} onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })} /></div><div className={styles.fieldGroup}><label>End Hour</label><input type="number" placeholder="18" value={slotForm.end_time} onChange={e => setSlotForm({ ...slotForm, end_time: e.target.value })} /></div></>)}
            <div className={styles.fieldGroup}><label>Price (₹)</label><input type="number" placeholder="0" value={slotForm.price} onChange={e => setSlotForm({ ...slotForm, price: e.target.value })} /></div>
          </div>
          <div className={styles.formActions}><button className={styles.submitBtn} onClick={createSlot}>{editSlotId?"Update Slot":"Create Slot"}</button><button className={styles.cancelBtn} onClick={resetSlotForm}>Cancel</button></div>
        </AccordionSection>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Workspace</th><th>Date</th><th>Type</th><th>Time</th><th>Capacity</th><th>Booked</th><th>Remaining</th><th>Price</th><th>Actions</th></tr></thead>
            <tbody>
            {slots.map(s => {
  const booked = Number(s.booked_seats ?? s.booked_slots ?? s.booked ?? s.booked_count ?? 0);
  const capacity = Number(s.capacity || 0);
  const remaining = Math.max(capacity - booked, 0);
  const pct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
  const expired = isSlotExpired(s.date);

  return (
    <tr key={s.id} style={expired ? expiredRowStyle : {}}>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <strong style={{ color: expired ? "#9ca3af" : "#111827", fontSize: "13px" }}>
            {s.workspace_name}
          </strong>
          <span style={{ fontSize: "11px", color: expired ? "#9ca3af" : "#6b7280" }}>
            📍 {s.location || "No Location"}{s.city ? `, ${s.city}` : ""}
          </span>
        </div>
      </td>
      <td>
        <span style={{ color: expired ? "#9ca3af" : "#374151", fontWeight: 600 }}>{s.date}</span>
        {expired && <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, marginTop: 1 }}>Past date</div>}
      </td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>
        {s.slot_type === "hour" ? "Hourly" : "Full Day"}
      </td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>
        {s.slot_type === "hour" ? `${s.start_time} – ${s.end_time}` : "All Day"}
      </td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>{capacity}</td>
      <td>
        <span style={{
          display: "inline-block", padding: "2px 10px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 600,
          background: expired ? "#f3f4f6" : booked > 0 ? "#eff6ff" : "#f3f4f6",
          color: expired ? "#9ca3af" : booked > 0 ? "#2563eb" : "#6b7280",
          border: `1px solid ${expired ? "#e5e7eb" : booked > 0 ? "#bfdbfe" : "#e5e7eb"}`
        }}>{booked}</span>
      </td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{
            display: "inline-block", padding: "2px 10px", borderRadius: "20px",
            fontSize: "11px", fontWeight: 600,
            background: expired ? "#f3f4f6" : remaining === 0 ? "#fef2f2" : remaining < capacity * 0.2 ? "#fff7ed" : "#f0fdf4",
            color: expired ? "#9ca3af" : remaining === 0 ? "#dc2626" : remaining < capacity * 0.2 ? "#ea580c" : "#16a34a",
            border: `1px solid ${expired ? "#e5e7eb" : remaining === 0 ? "#fecaca" : remaining < capacity * 0.2 ? "#fed7aa" : "#bbf7d0"}`
          }}>
            {expired ? "—" : remaining === 0 ? "Full" : `${remaining} left`}
          </span>
          <div style={{ height: "4px", borderRadius: "2px", background: "#e5e7eb", overflow: "hidden", width: "60px" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: "2px",
              background: expired ? "#d1d5db" : pct >= 80 ? "#dc2626" : pct >= 50 ? "#ea580c" : "#16a34a",
              transition: "width 0.3s"
            }} />
          </div>
        </div>
      </td>
      <td className={styles.priceCell} style={{ color: expired ? "#9ca3af" : "#7c3aed" }}>₹{s.price}</td>
      <td>
        <button onClick={() => { handleEditSlot(s); setShowSlotForm(true); }} className={styles.editBtn}>Edit</button>
        <button onClick={() => deleteSlot(s.id)} className={styles.deleteBtn}>Delete</button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
          {slots.length===0&&<div className={styles.empty}>No slots yet. Create one above!</div>}
        </div>
      </div>
    );
  };

  const renderMonthlySlots = () => {
    const totalMonthly = monthlySlots.length;
    const totalMonthlyCapacity = monthlySlots.reduce((sum,s)=>sum+Number(s.capacity||0),0);
    const totalMonthlyBooked = monthlySlots.reduce((sum,s)=>sum+Number(s.booked||0),0);
    const totalMonthlyRemaining = totalMonthlyCapacity - totalMonthlyBooked;
    const activeMonthlySlots = monthlySlots.filter(s=>Number(s.booked||0)<Number(s.capacity||0)).length;
    const fullMonthlySlots = monthlySlots.filter(s=>Number(s.booked||0)>=Number(s.capacity||0)).length;

    return (
      <div className={styles.sectionBody}>
        <div className={styles.overviewGrid}>
          <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>📅</span><div><p className={styles.statValue}>{totalMonthly}</p><p className={styles.statLabel}>Total Monthly Slots</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>✅</span><div><p className={styles.statValue}>{activeMonthlySlots}</p><p className={styles.statLabel}>Available Slots</p></div></div>
          <div className={`${styles.statCard} ${styles.red}`}><span className={styles.statIcon}>🔴</span><div><p className={styles.statValue}>{fullMonthlySlots}</p><p className={styles.statLabel}>Full / Sold Out</p></div></div>
          <div className={`${styles.statCard} ${styles.amber}`}><span className={styles.statIcon}>🪑</span><div><p className={styles.statValue}>{totalMonthlyBooked}</p><p className={styles.statLabel}>Booked Seats</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>🟢</span><div><p className={styles.statValue}>{totalMonthlyRemaining}</p><p className={styles.statLabel}>Remaining Seats</p></div></div>
          <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>👥</span><div><p className={styles.statValue}>{totalMonthlyCapacity}</p><p className={styles.statLabel}>Total Capacity</p></div></div>
        </div>
        <AccordionSection title={editMonthId?"Edit Monthly Slot":"Create Monthly Slots"} icon="📅" isOpen={showMonthlyForm} onToggle={() => { if (showMonthlyForm&&editMonthId) resetMonthlyForm(); else setShowMonthlyForm(prev=>!prev); }} openLabel="+ Create Monthly Slots" closeLabel={editMonthId?"✕ Cancel Edit":"✕ Close Form"}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}><label>Workspace</label><select value={monthlyForm.workspace_id} onChange={e => setMonthlyForm({ ...monthlyForm, workspace_id: e.target.value })} disabled={!!editMonthId}><option value="">Select Workspace</option>{approvedWorkspaces.map(w=>(<option key={w.id} value={w.id}>{w.city} •{w.name}•{w.location}</option>))}</select></div>
            <div className={styles.fieldGroup}><label>Year</label><input type="number" value={monthlyForm.year} onChange={e => setMonthlyForm({ ...monthlyForm, year: e.target.value })} disabled={!!editMonthId} /></div>
            <div className={styles.fieldGroup}><label>Select Months</label><select multiple value={monthlyForm.months} className={styles.monthSelect} onChange={e => { const selected=Array.from(e.target.selectedOptions,opt=>opt.value); setMonthlyForm({ ...monthlyForm, months: selected }); }} disabled={!!editMonthId}>{MONTH_OPTIONS.map((month,i)=><option key={i} value={String(i+1)}>{month}</option>)}</select></div>
            <div className={styles.fieldGroup}><label>Capacity</label><input type="number" value={monthlyForm.capacity} onChange={e => setMonthlyForm({ ...monthlyForm, capacity: e.target.value })} /></div>
            <div className={styles.fieldGroup}><label>Price per Seat</label><input type="number" value={monthlyForm.price} onChange={e => setMonthlyForm({ ...monthlyForm, price: e.target.value })} /></div>
          </div>
          <div className={styles.formActions}>{editMonthId?(<><button className={styles.submitBtn} onClick={updateMonthlySlot}>Update Monthly Slot</button><button className={styles.cancelBtn} onClick={resetMonthlyForm}>Cancel</button></>):(<><button className={styles.submitBtn} onClick={createMonthlySlots}>Create Monthly Slots</button><button className={styles.cancelBtn} onClick={() => setShowMonthlyForm(false)}>Cancel</button></>)}</div>
        </AccordionSection>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Workspace</th><th>City</th><th>Month</th><th>Year</th><th>Capacity</th><th>Booked</th><th>Remaining</th><th>Fill %</th><th>Price</th><th>Actions</th></tr></thead>
            <tbody>
             {monthlySlots.map(s => {
  const booked = Number(s.booked || 0);
  const capacity = Number(s.capacity || 0);
  const remaining = capacity - booked;
  const pct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
  const isFull = remaining <= 0;
  const expired = isMonthlySlotExpired(s.year, s.month);

  return (
    <tr key={s.id} style={expired ? expiredRowStyle : {}}>
      <td>
        <strong style={{ color: expired ? "#9ca3af" : "#111827" }}>
          {workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.city || "No City"} |{" "}
          {workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.location || "No Location"} |{" "}
          {s.workspace_name}
        </strong>
      </td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>{s.city}</td>
      <td>
        <span style={{ color: expired ? "#9ca3af" : undefined }}>
          {MONTH_OPTIONS[Number(s.month) - 1] || s.month}
        </span>
        {expired && <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, marginTop: 2 }}>Past month</div>}
      </td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>{s.year}</td>
      <td style={{ color: expired ? "#9ca3af" : undefined }}>{capacity}</td>
      <td>
        <span style={{
          display: "inline-block", padding: "2px 10px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 600,
          background: expired ? "#f3f4f6" : booked > 0 ? "#eff6ff" : "#f3f4f6",
          color: expired ? "#9ca3af" : booked > 0 ? "#2563eb" : "#6b7280",
          border: `1px solid ${expired ? "#e5e7eb" : booked > 0 ? "#bfdbfe" : "#e5e7eb"}`
        }}>{booked}</span>
      </td>
      <td>
        <span style={{
          display: "inline-block", padding: "2px 10px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 600,
          background: expired ? "#f3f4f6" : isFull ? "#fef2f2" : remaining < capacity * 0.2 ? "#fff7ed" : "#f0fdf4",
          color: expired ? "#9ca3af" : isFull ? "#dc2626" : remaining < capacity * 0.2 ? "#ea580c" : "#16a34a",
          border: `1px solid ${expired ? "#e5e7eb" : isFull ? "#fecaca" : remaining < capacity * 0.2 ? "#fed7aa" : "#bbf7d0"}`
        }}>
          {expired ? "—" : isFull ? "Full" : `${remaining} left`}
        </span>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ height: "6px", borderRadius: "3px", background: "#e5e7eb", overflow: "hidden", width: "56px" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: "3px",
              background: expired ? "#d1d5db" : pct >= 100 ? "#dc2626" : pct >= 75 ? "#ea580c" : pct >= 50 ? "#f59e0b" : "#16a34a"
            }} />
          </div>
          <span style={{ fontSize: "11px", color: expired ? "#9ca3af" : "#6b7280", minWidth: "30px" }}>{pct}%</span>
        </div>
      </td>
      <td style={{ color: expired ? "#9ca3af" : "#7c3aed", fontWeight: 700 }}>₹{s.price}</td>
      <td>
        <button className={styles.editBtn} onClick={() => { handleEditMonth(s); setShowMonthlyForm(true); }}>Edit</button>
        <button className={styles.deleteBtn} onClick={() => deleteMonthlySlot(s.id)}>Delete</button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
          {monthlySlots.length===0&&<div className={styles.empty}>No monthly slots yet. Create one above!</div>}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    const confirmedRevenue = mergedBookings.filter(b=>b.status==="confirmed").reduce((sum,b)=>sum+Number(b.total_price||0),0);
    return (
      <div className={styles.sectionBody}>
        {toastMsg&&<div className={styles.toast}>{toastMsg}</div>}
        <div className={styles.overviewGrid}>
          <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>📋</span><div><p className={styles.statValue}>{bookingStats.total}</p><p className={styles.statLabel}>Total</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>✅</span><div><p className={styles.statValue}>{bookingStats.confirmed}</p><p className={styles.statLabel}>Confirmed</p></div></div>
          <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>💰</span><div><p className={styles.statValue}>₹{confirmedRevenue.toLocaleString()}</p><p className={styles.statLabel}>Confirmed Revenue</p></div></div>
        </div>
        <div className={styles.tableWrap}>
          {loadingBookings?(<div className={styles.empty}>Loading bookings…</div>):mergedBookings.length===0?(<div className={styles.empty}><div>📋</div><p>No bookings yet</p></div>):(
            <table className={styles.table}>
              <thead><tr><th>Workspace</th><th>Customer</th><th>City</th><th>Date</th><th>Slot</th><th>Booked Seats</th><th>Additional Amenities</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{mergedBookings.map(item => {
                const isConfirmed=item.status==="confirmed";const isCancelled=item.status==="cancelled";const isPulsing=animatingId===item.id;
                return (<tr key={item.id} className={isPulsing?styles.rowPulse:""}>
                  <td><div className={styles.bookingWorkspace} onClick={()=>openBookingModal(item)}><img src={item.image} alt={item.workspace} className={styles.bookingThumb}/><span className={styles.bookingWorkspaceTitle}>{item.workspace}</span></div></td>
                  <td>{item.user}</td>
                  <td>
                    <div style={{ display:"flex",flexDirection:"column",gap:"3px" }}>
                      <strong style={{ color:"#111827",fontSize:"13px" }}>{item.workspace}</strong>
                      <span style={{ fontSize:"11px",color:"#6b7280" }}>📍 {item.location || "No Location"}{item.city ? `, ${item.city}` : ""}</span>
                    </div>
                  </td>
                  <td>{item.date}</td>
                  <td><div><strong>{item.slot_type}</strong><br/><small>{item.slot_time}</small></div></td>
                  <td><span className={styles.capacityBadge}>💺 {item.seats||1} / {item.capacity||0}</span></td>
                  <td>{Array.isArray(item.amenities)&&item.amenities.length>0?<div className={styles.bookingAmenities}>{item.amenities.map((a,i)=>(<div key={i} className={styles.bookingAmenityItem}><span>☕</span><div><strong>{a.title}</strong><small>{a.persons} Person • ₹{a.total}</small></div></div>))}</div>:<span className={styles.noAmenities}>No Amenities</span>}</td>
                  <td className={styles.priceCell}>₹{Number(item.total_price||0).toLocaleString()}</td>
                  <td><span className={styles.statusPill}>{item.status||"pending"}</span></td>
                  <td><div className={styles.bookingActionBox}>{isConfirmed&&<span className={styles.statusPill}>✓Confirmed</span>}{isCancelled&&<span className={styles.statusPill}>✕ Cancelled</span>}{!isConfirmed&&!isCancelled&&<span className={styles.statusPill}>Pending</span>}</div></td>
                </tr>);
              })}</tbody>
            </table>
          )}
        </div>
        {requests.length>0&&(
          <div className={styles.tableWrap}>
            <div className={styles.cancelRequestHead}><h3>Pending Cancel Requests</h3><span className={styles.statusPill}>{requests.length}</span></div>
            <table className={styles.table}><thead><tr><th>Workspace</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Action</th></tr></thead>
            <tbody>{requests.map(r=>(<tr key={r.id}><td>{r.workspace}</td><td>{r.user}</td><td><strong>₹{r.amount}</strong></td><td>{r.reason}</td><td>{r.status==="PENDING"?<button className={styles.submitBtn} onClick={()=>approveCancelRequest(r.id)}>Accept & Refund</button>:<span className={styles.statusPill}>Approved</span>}</td></tr>))}</tbody></table>
          </div>
        )}
        {selectedBooking&&(
          <div className={styles.modalOverlay} onClick={closeBookingModal}>
            <div className={styles.bookingModal} onClick={e=>e.stopPropagation()}>
              <button onClick={closeBookingModal} className={styles.modalCloseBtn}>✕</button>
              <div className={styles.modalHero}><img src={selectedBooking.image} alt={selectedBooking.workspace} className={styles.modalHeroImage}/><div className={styles.modalHeroOverlay}/><div className={styles.modalHeroContent}><span className={styles.heroTag}>Premium Workspace</span><h2>{selectedBooking.workspace}</h2><p>Booked by <strong>{selectedBooking.user}</strong> on {selectedBooking.date}</p></div></div>
              <div className={styles.modalBody}>
                <div className={styles.modalTabs}>{["overview","features","pricing"].map(tab=>(<button key={tab} onClick={()=>setBookingActiveTab(tab)} className={`${styles.modalTabBtn} ${bookingActiveTab===tab?styles.modalTabActive:""}`}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>))}</div>
                {bookingActiveTab==="overview"&&(<><div className={styles.overviewMetaGrid}>{[["Customer",selectedBooking.user],["Date",selectedBooking.date],["Slot",`${selectedBooking.slot_type} ${selectedBooking.slot_time||""}`],["City",selectedBooking.city],["Status",selectedBooking.status||"pending"]].map(([label,val])=>(<div key={label} className={styles.metaCard}><span>{label}</span><strong className={label==="Status"?getStatusClass(val):""}>{val}</strong></div>))}</div><div className={styles.bookingSummaryBox}><h4>Booking Summary</h4><p>This booking is for <strong>{selectedBooking.workspace}</strong>. Review the customer request and schedule details directly inside the dashboard.</p></div></>)}
                {bookingActiveTab==="features"&&(<div className={styles.featureGrid}>{[["📶","High-Speed WiFi","Stable internet for work and meetings."],["🪑","Modern Setup","Comfortable desk and seating support."],["❄️","Fully Air Conditioned","Comfortable environment all day."],["☕","Refreshments","Tea, coffee and basic pantry access."]].map(([icon,title,desc])=>(<div key={title} className={styles.featureCard}><div className={styles.featureIcon}>{icon}</div><h4>{title}</h4><p>{desc}</p></div>))}</div>)}
                {bookingActiveTab==="pricing"&&(<div className={styles.pricingCard}><span>Booking Amount</span><h2>₹{selectedBooking.total_price}</h2><p>For {selectedBooking.slot_type} {selectedBooking.slot_time} on {selectedBooking.date}</p><div className={styles.pricingList}><div>Workspace reserved for selected slot</div><div>Booking tracked inside dashboard</div><div>Direct manager visibility</div></div></div>)}
                {selectedBooking?.amenities?.length>0&&(<div className={styles.modalAmenities}><h4>Additional Amenities</h4>{selectedBooking.amenities.map((a,i)=>(<div key={i} className={styles.modalAmenityItem}><span>☕</span><div><strong>{a.title}</strong><small>{a.persons} Person • ₹{a.total}</small></div></div>))}</div>)}
              </div>
              <div className={styles.modalFooter}><div><strong>₹{selectedBooking.total_price}</strong><small>Total Booking Value</small></div><div>{selectedBooking.status==="confirmed"&&<span className={styles.statusPill}>Booking Confirmed</span>}{selectedBooking.status==="cancelled"&&<span className={styles.statusPill}>Booking Cancelled</span>}{selectedBooking.status!=="confirmed"&&selectedBooking.status!=="cancelled"&&<span className={styles.statusPill}>Pending Booking</span>}</div></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getLeadCounts = (leads, statusOptions) => {
    const counts = { all: leads.length };
    statusOptions.forEach(([key]) => { if (key!=="all") counts[key]=leads.filter(l=>l.status?.toLowerCase()===key.toLowerCase()).length; });
    return counts;
  };

  const renderCompanyLeads = () => {
    const tabs=[["all","All"],["pending","Pending"],["contacted","Contacted"],["closed","Closed"]];
    const counts=getLeadCounts(companyLeads,tabs);
    return (<div className={styles.sectionBody}><LeadFilterBar search={companyLeadSearch} onSearch={setCompanyLeadSearch} filterTab={companyLeadFilter} onFilter={setCompanyLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company, location..."/><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Team Size</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Preferred Workspace</th><th>Company</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredCompanyLeads.map(item=>(<tr key={item.id}><td>{item.team_size}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td>{item.preferred_location}</td><td>{item.workspace_type||"—"}</td><td>{item.company}</td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e=>updateCompanyLeadStatus(item.id,e.target.value)} className={styles.statusSelect}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}{filteredCompanyLeads.length===0&&<tr><td colSpan="9" style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No company leads found</td></tr>}</tbody></table></div></div>);
  };

  const renderHyderabadLeads = () => {
    const tabs=[["all","All"],["New","New"],["Contacted","Contacted"],["Interested","Interested"],["Converted","Converted"]];
    const counts=getLeadCounts(hyderabadLeads,tabs);
    return (<div className={styles.sectionBody}><LeadFilterBar search={hyderabadLeadSearch} onSearch={setHyderabadLeadSearch} filterTab={hyderabadLeadFilter} onFilter={setHyderabadLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, workspace type..."/><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Company Size</th><th>Name</th><th>Phone</th><th>Email</th><th>Workspace Type</th><th>Preferred Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredHyderabadLeads.map(item=>(<tr key={item.id}><td>{item.company_size}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td>{item.workspace_type}</td><td><span className={styles.statusPill}>{item.preferred_location}</span></td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e=>updateHyderabadLeadStatus(item.id,e.target.value)} className={styles.statusSelect}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option></select></td></tr>))}{filteredHyderabadLeads.length===0&&<tr><td colSpan="8" style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No Hyderabad leads found</td></tr>}</tbody></table></div></div>);
  };

  const renderOfferLeads = () => {
    const tabs=[["all","All"],["New","New"],["Contacted","Contacted"],["Interested","Interested"],["Converted","Converted"]];
    const counts=getLeadCounts(offerLeads,tabs);
    return (<div className={styles.sectionBody}><LeadFilterBar search={offerLeadSearch} onSearch={setOfferLeadSearch} filterTab={offerLeadFilter} onFilter={setOfferLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, workspace..."/><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Workspace</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Team Size</th><th>Price Details</th><th>Coupon</th><th>Discount</th><th>Final Price</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredOfferLeads.map(item=>{const matchedWorkspace=offerWorkspaces.find(w=>(w.type||"").trim().toLowerCase()===(item.workspace_type||"").trim().toLowerCase());const matchedCoupon=offerCoupons.find(c=>(c.coupon_code||"").trim().toLowerCase()===(item.coupon_code||"").trim().toLowerCase());return(<tr key={item.id}><td>{matchedWorkspace?.type||item.workspace_type||"Workspace"}</td><td><strong>{item.name}</strong></td><td>{item.phone}</td><td>{item.email}</td><td>{item.preferred_location}</td><td>{item.team_size}</td><td>₹{item.original_price||matchedWorkspace?.original_price||0}</td><td><strong className={styles.couponCode}>{item.coupon_code||"No Coupon"}</strong></td><td>{item.discount_percentage?`${item.discount_percentage}% OFF`:"-"}</td><td><strong>₹{item.final_price||matchedWorkspace?.offer_price||0}</strong></td><td><span className={item.status==="Converted"?styles.activeBadge:styles.pendingBadge}>{item.status}</span></td><td><select value={item.status} onChange={e=>updateOfferLeadStatus(item.id,e.target.value)} className={styles.statusSelect}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option></select></td></tr>);})}{filteredOfferLeads.length===0&&<tr><td colSpan="12" style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No offer leads found</td></tr>}</tbody></table></div></div>);
  };

  const renderCustomisationLeads = () => {
    const tabs=[["all","All"],["new","New"],["contacted","Contacted"],["closed","Closed"]];
    const counts=getLeadCounts(customisationLeads,tabs);
    return (<div className={styles.sectionBody}><LeadFilterBar search={customLeadSearch} onSearch={setCustomLeadSearch} filterTab={customLeadFilter} onFilter={setCustomLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company, location..."/><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Company</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredCustomLeads.map(item=>(<tr key={item.id}><td>{item.company}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td><span className={styles.statusPill}>{item.preferred_location}</span></td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e=>updateCustomisationLeadStatus(item.id,e.target.value)} className={styles.statusSelect}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}{filteredCustomLeads.length===0&&<tr><td colSpan="7" style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No customisation leads found</td></tr>}</tbody></table></div></div>);
  };

  const renderQuotationLeads = () => {
    const tabs=[["all","All"],["pending","Pending"],["contacted","Contacted"],["closed","Closed"]];
    const counts=getLeadCounts(quotationLeads,tabs);
    return (<div className={styles.sectionBody}><LeadFilterBar search={quotationLeadSearch} onSearch={setQuotationLeadSearch} filterTab={quotationLeadFilter} onFilter={setQuotationLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company..."/><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Company</th><th>Location</th><th>Workspace</th><th>Workspace Details</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredQuotationLeads.map(item=>(<tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.phone}</td><td>{item.email}</td><td>{item.company}</td><td>{item.preferred_location}</td><td>{item.workspace_type}</td><td>{item.quotation_details?.map((q,index)=>(<div key={index}>{q.name} — {q.units} units</div>))}</td><td>₹{item.total_amount}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e=>updateQuotationLeadStatus(item.id,e.target.value)} className={styles.statusSelect}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}{filteredQuotationLeads.length===0&&<tr><td colSpan="11" style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No quotation leads found</td></tr>}</tbody></table></div></div>);
  };

  const createSlot = () => {
    if (!slotForm.workspace_id||!slotForm.date||!slotForm.price) { alert("Fill all fields"); return; }
    const payload={...slotForm,workspace_id:Number(slotForm.workspace_id),start_time:slotForm.slot_type==="hour"?Number(slotForm.start_time):null,end_time:slotForm.slot_type==="hour"?Number(slotForm.end_time):null,capacity:Number(slotForm.capacity),price:Number(slotForm.price)};
    if (editSlotId) { axiosInstance.put(`workspaces/slot/update/${editSlotId}/`,payload).then(()=>{ alert("Slot Updated ✅"); resetSlotForm(); fetchSlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Slot update failed"); }); }
    else { axiosInstance.post("workspaces/slot/create/",payload).then(()=>{ alert("Slot Created ✅"); resetSlotForm(); fetchSlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Slot create failed"); }); }
  };

  const handleEditSlot = (s) => { setSlotForm({ workspace_id:s.workspace_id||"",date:s.date||"",slot_type:s.slot_type||"hour",start_time:s.start_time||9,end_time:s.end_time||18,capacity:s.capacity||50,price:s.price||"" }); setEditSlotId(s.id); setActiveSection("slots"); setMobileSidebarOpen(false); };
  const deleteSlot = (id) => { if (!window.confirm("Delete slot?")) return; axiosInstance.delete(`workspaces/slot/delete/${id}/`).then(()=>{ alert("Deleted ✅"); fetchSlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Delete slot failed"); }); };
  const createMonthlySlots = () => {
    if (!monthlyForm.workspace_id||!monthlyForm.year||monthlyForm.months.length===0||!monthlyForm.capacity||!monthlyForm.price) { alert("Please fill all monthly slot fields"); return; }
    const payload={workspace_id:Number(monthlyForm.workspace_id),year:Number(monthlyForm.year),months:monthlyForm.months.map(Number),capacity:Number(monthlyForm.capacity),price:Number(monthlyForm.price)};
    axiosInstance.post("workspaces/month-slots/create/",payload).then(()=>{ alert("Monthly slots created ✅"); resetMonthlyForm(); fetchMonthlySlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Error creating monthly slots"); });
  };
  const handleEditMonth = (slot) => { setMonthlyForm({ workspace_id:String(slot.workspace_id||""),year:slot.year||new Date().getFullYear(),months:[String(slot.month)],capacity:slot.capacity||50,price:slot.price||"" }); setEditMonthId(slot.id); setActiveSection("monthlySlots"); setMobileSidebarOpen(false); };
  const updateMonthlySlot = () => { if (!editMonthId) return; axiosInstance.put(`workspaces/monthly-slot/update/${editMonthId}/`,{ capacity:Number(monthlyForm.capacity),price:Number(monthlyForm.price) }).then(()=>{ alert("Updated ✅"); resetMonthlyForm(); fetchMonthlySlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Update failed"); }); };
  const deleteMonthlySlot = (id) => { if (!window.confirm("Delete this monthly slot?")) return; axiosInstance.delete(`workspaces/monthly-slot/delete/${id}/`).then(()=>{ alert("Deleted ✅"); fetchMonthlySlots(); }).catch(err=>{ console.error(err?.response?.data||err); alert("Delete failed"); }); };
  const updateCompanyLeadStatus = (id,status) => axiosInstance.put(`leads/company/status/${id}/`,{status}).then(()=>fetchCompanyLeads()).catch(err=>{ console.error(err?.response?.data||err); alert("Status update failed"); });
  const updateHyderabadLeadStatus = (id,status) => axiosInstance.put(`hyderabad/status/${id}/`,{status}).then(()=>fetchHyderabadLeads()).catch(err=>{ console.error(err?.response?.data||err); alert("Status update failed"); });
  const updateOfferLeadStatus = (id,status) => axiosInstance.put(`leads/offers/leads/status/${id}/`,{status}).then(()=>fetchOfferLeads()).catch(err=>{ console.error(err); alert("Status update failed"); });
  const updateCustomisationLeadStatus = (id,status) => axiosInstance.put(`leads/modern-lead/status/${id}/`,{status}).then(()=>fetchCustomisationLeads()).catch(err=>{ console.error(err); alert("Status update failed"); });

  const sectionTitles = {
    overview:{ icon:"⊞",title:"Overview",sub:"Revenue summary and quick stats" },
    workspaces:{ icon:"🏗️",title:"Workspace Management",sub:"Add, edit, and manage your listings" },
    offerWorkspaces:{ icon:"🔥",title:"Offer Workspaces",sub:"Manage offer workspace listings" },
    suggestedWorkspaces:{ icon:"🧭",title:"Suggested Workspaces",sub:"View workspaces added by other managers" },
   slots:{ 
  icon: <div style={{width:48,height:48,background:"linear-gradient(145deg,#ff6b35,#f7931e)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"4px 4px 10px rgba(255,107,53,0.4),-2px -2px 6px rgba(255,255,255,0.2),inset 0 1px 0 rgba(255,255,255,0.3)",transform:"perspective(200px) rotateX(10deg) rotateY(-5deg)",fontSize:26,animation:"float 3s ease-in-out infinite"}}><style>{`@keyframes float{0%,100%{transform:perspective(200px) rotateX(10deg) rotateY(-5deg) translateY(0px)}50%{transform:perspective(200px) rotateX(10deg) rotateY(-5deg) translateY(-6px)}}`}</style>⏰</div>,
  title:"Slot Management",
  sub:"Create and manage booking slots" 
},
    monthlySlots:{ icon:"📅",title:"Monthly Slots",sub:"Create, update, and manage monthly slot pricing" },
    bookings:{ icon:"📋",title:"My Bookings",sub:"View all booking requests and cancellation requests here" },
    companyLeads:{ icon:"🏷️",title:"Company Leads",sub:"Manage company inquiries and update their status" },
    hyderabadLeads:{ icon:"📍",title:"Hyderabad Leads",sub:"Manage Hyderabad preferred location leads" },
    offerLeads:{ icon:"🔥",title:"Offer Leads",sub:"Manage offer workspace leads" },
    customisationLeads:{ icon:"🎨",title:"Customisation Leads",sub:"Manage customisation inquiries" },
    quotationLeads:{ icon:"📄",title:"Quotation Leads",sub:"Manage quotation inquiries" },
    additionalAmenities:{ icon:"☕",title:"Additional Amenities",sub:"Manage additional amenities for your workspaces" },
    manageUsers:{ icon:"👥",title:"Manage Users",sub:"Add, edit and manage users" },
    offerCoupons:{ icon:"🎟️",title:"Offer Coupons",sub:"Create and manage discount coupons" },
  };

  const current = sectionTitles[activeSection];

  // ── Determine sidebar class: on mobile never apply collapsed ──
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const sidebarClass = [
    styles.sidebar,
    !isMobile && sidebarCollapsed ? styles.collapsed : "",
    mobileSidebarOpen ? styles.mobileOpen : "",
  ].filter(Boolean).join(" ");

  const mainClass = [
    styles.main,
    !isMobile && sidebarCollapsed ? styles.mainCollapsed : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.shell}>
      {/* Mobile overlay — clicking it closes the sidebar */}
      {mobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={sidebarClass} style={{
  background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
  borderRight: "1px solid rgba(255,255,255,0.06)",
}}>
  {/* Header */}
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)"
  }}>
    {(!sidebarCollapsed || mobileSidebarOpen) && (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg,#b8922a, #b8922a)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>🏢</div>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>
          Co<span style={{ color: "#b8922a" }}>Work</span>
        </span>
      </div>
    )}
    <button onClick={() => setSidebarCollapsed(prev => !prev)}
      style={{
        width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.06)", color: "#94a3b8",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, flexShrink: 0
      }}>
      {sidebarCollapsed && !mobileSidebarOpen ? "›" : "‹"}
    </button>
    <button className={styles.mobileSidebarClose}
      onClick={() => setMobileSidebarOpen(false)}
      style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
      ✕
    </button>
  </div>

  {/* Nav */}
  <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
    {NAV_GROUPS.map(group => {
      if (group.single) {
        const isActive = activeSection === group.key;
        return (
          <button key={group.key} onClick={() => handleNav(group.key)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 12, padding: "10px 12px", borderRadius: 10, border: "none",
              background: isActive ? "rgba(245,158,11,0.15)" : "transparent",
              color: isActive ? "#cfa228" : "#94a3b8",
              cursor: "pointer", marginBottom: 2, transition: "all 0.15s",
              borderLeft: isActive ? "3px solid #d2a21c" : "3px solid transparent",
            }}>
            <NavIcon iconKey={group.iconKey} size={16} />
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{group.label}</span>
            )}
          </button>
        );
      }

      // Group with children
      return (
        <DarkHoverNavGroup
          key={group.key}
          group={group}
          activeSection={activeSection}
          handleNav={handleNav}
          sidebarCollapsed={sidebarCollapsed && !mobileSidebarOpen}
        />
      );
    })}
  </nav>

  {/* Bottom user card */}
  {(!sidebarCollapsed || mobileSidebarOpen) && (
    <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 12,
        background: "rgba(255,255,255,0.05)", marginBottom: 10
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #cca12d, #cca12a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, color: "#fff"
        }}>
          {(localStorage.getItem("username") || "A").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", truncate: "ellipsis" }}>
            {localStorage.getItem("username") || "Admin"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>
              Hi {localStorage.getItem("username") || "Fis"}
            </span>
          </div>
        </div>
      </div>
      <button onClick={handleLogout} style={{
        width: "100%", padding: "11px", borderRadius: 12, border: "none",
        background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
      }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/>
        </svg>
        Logout
      </button>
    </div>
  )}
</aside>

      {/* ── MAIN CONTENT ── */}
      <main className={mainClass}>
        <header className={styles.mainHeader}>
          <div className={styles.pageHeading}>
            {/* Hamburger — visible only on mobile via CSS */}
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileSidebarOpen(true)}
              title="Open menu"
            >
              ☰
            </button>
            <span className={styles.headIcon}>{current?.icon}</span>
            <div><h1>{current?.title}</h1><p>{current?.sub}</p></div>
          </div>
          <div className={styles.headerRevenue}><span>Total Revenue</span><strong>₹{revenue.total_revenue?.toLocaleString()}</strong></div>
          <div className={styles.notificationWrap}>
            <div className={styles.topRightSection}>
              <span className={styles.managerName}>Hi, {localStorage.getItem("username") || "Manager"}</span>
            </div>
            <button className={styles.notificationBtn} onClick={() => setShowNotifications(!showNotifications)}>
              🔔{notifications.length > 0 && <span className={styles.notificationCount}>{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}><span>Notifications</span><button className={styles.closeNotificationBtn} onClick={() => setShowNotifications(false)}>✕</button></div>
                {notifications.length === 0 && <div className={styles.notificationEmpty}>No Notifications</div>}
                <div className={styles.notificationScroll}>
                  {notifications.map(n => (<div key={n.id} className={styles.notificationItem}><div className={styles.notificationInfo}><strong>{n.type}</strong><p>{n.name}</p><small>{n.workspace}</small></div><button className={styles.viewBtn} onClick={() => handleViewNotification(n)}>View</button></div>))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className={styles.content}>
          {activeSection === "overview" && renderOverview()}
          {activeSection === "manageUsers" && renderManageUsers()}
          {activeSection === "workspaces" && renderWorkspaces()}
          {activeSection === "offerWorkspaces" && renderOfferWorkspaces()}
          {activeSection === "offerCoupons" && renderOfferCoupons()}
          {activeSection === "slots" && renderSlots()}
          {activeSection === "monthlySlots" && renderMonthlySlots()}
          {activeSection === "bookings" && renderBookings()}
          {activeSection === "companyLeads" && renderCompanyLeads()}
          {activeSection === "hyderabadLeads" && renderHyderabadLeads()}
          {activeSection === "offerLeads" && renderOfferLeads()}
          {activeSection === "customisationLeads" && renderCustomisationLeads()}
          {activeSection === "quotationLeads" && renderQuotationLeads()}
          {activeSection === "suggestedWorkspaces" && renderSuggestedWorkspaces()}
          {activeSection === "additionalAmenities" && (
            <div className={styles.sectionBody}>
              <AccordionSection title={editAmenityId?"Edit Amenity":"Add Additional Amenity"} icon="☕" isOpen={showAmenityForm} onToggle={() => { setShowAmenityForm(prev=>!prev); if (showAmenityForm) { setEditAmenityId(null); setAmenityForm({ workspace:"",title:"",description:"",price:"",price_type:"full_day" }); } }} openLabel="+ Add Amenity" closeLabel={editAmenityId?"✕ Cancel Edit":"✕ Close Form"}>
                <div className={styles.amenityFormGrid}>
                  <select className={`${styles.amenitySelect} ${!amenityForm.workspace?styles.placeholderSelect:""}`} value={amenityForm.workspace} onChange={e=>setAmenityForm({...amenityForm,workspace:e.target.value})}><option value="" disabled hidden>Select Workspace</option>{approvedWorkspaces.map(ws=>(<option key={ws.id} value={ws.id}>{ws.city} | {ws.location} | {ws.workspacename||ws.name||ws.title}</option>))}</select>
                  {approvedWorkspaces.length===0&&<small style={{ color:"#f87171",gridColumn:"1 / -1" }}>No approved workspaces yet.</small>}
                  <input className={styles.amenityInput} type="text" placeholder="Amenity Name" value={amenityForm.title} onChange={e=>setAmenityForm({...amenityForm,title:e.target.value})}/>
                  <input className={styles.amenityInput} type="text" placeholder="Description" value={amenityForm.description} onChange={e=>setAmenityForm({...amenityForm,description:e.target.value})}/>
                  <input className={styles.amenityInput} type="number" placeholder="Price" value={amenityForm.price} onChange={e=>setAmenityForm({...amenityForm,price:e.target.value})}/>
                  <select className={styles.amenitySelect} value={amenityForm.price_type} onChange={e=>setAmenityForm({...amenityForm,price_type:e.target.value})}><option value="half_day">Half Day</option><option value="full_day">Full Day</option><option value="monthly">Monthly</option></select>
                  <div style={{ display:"flex",gap:"10px",gridColumn:"1 / -1" }}><button className={styles.amenityBtn} onClick={handleAddAmenity}>{editAmenityId?"Update Amenity":"Add Amenity"}</button><button className={styles.wsCancelBtn} style={{ height:"54px",borderRadius:"14px" }} onClick={()=>{ setShowAmenityForm(false); setEditAmenityId(null); setAmenityForm({ workspace:"",title:"",description:"",price:"",price_type:"full_day" }); }}>Cancel</button></div>
                </div>
              </AccordionSection>
              <div className={styles.amenitiesTable}>
                <table><thead><tr><th>Workspace</th><th>Amenity</th><th>Description</th><th>Price</th><th>Type</th><th>Action</th></tr></thead>
                <tbody>{additionalAmenities.map(item=>(<tr key={item.id}><td><strong>{workspaces.find(w=>w.name?.trim()===item.workspace_name?.trim())?.city||"No City"} | {workspaces.find(w=>w.name?.trim()===item.workspace_name?.trim())?.location||"No Location"} | {item.workspace_name}</strong></td><td>{item.title}</td><td>{item.description}</td><td>₹{item.price}</td><td>{item.price_type?.replace("_"," ")}</td><td><div className={styles.actionBtns}><button className={styles.editBtn} onClick={()=>{ setEditAmenityId(item.id); setAmenityForm({ workspace:item.workspace,title:item.title,description:item.description,price:item.price,price_type:item.price_type }); setShowAmenityForm(true); }}>Edit</button><button className={styles.deleteBtn} onClick={()=>handleDeleteAmenity(item.id)}>Delete</button></div></td></tr>))}</tbody></table>
                {additionalAmenities.length===0&&<div className={styles.empty}>No additional amenities yet.</div>}
              </div>
            </div>
          )}

          {/* OWNER DETAILS MODAL */}
          {showOwnerDetails && selectedOwner && (
            <div
              onClick={() => setShowOwnerDetails(false)}
              style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",justifyContent:"center",alignItems:"center",padding:"20px" }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width:"100%",maxWidth:"700px",background:"#fff",borderRadius:"18px",padding:"24px",maxHeight:"90vh",overflowY:"auto" }}
              >
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
                  <h2>Owner / Landlord Details</h2>
                  <button onClick={() => setShowOwnerDetails(false)} style={{ border:"none",background:"#ef4444",color:"#fff",padding:"8px 14px",borderRadius:"8px",cursor:"pointer" }}>Close</button>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"18px" }}>
                  <div><strong>Owner Name</strong><p>{selectedOwner.owner_name}</p></div>
                  <div><strong>Email</strong><p>{selectedOwner.owner_email}</p></div>
                  <div><strong>Phone</strong><p>{selectedOwner.owner_phone}</p></div>
                  <div><strong>PAN Number</strong><p>{selectedOwner.pan_number}</p></div>
                  <div><strong>GST Number</strong><p>{selectedOwner.gst_number}</p></div>
                  <div><strong>Rent Amount</strong><p>₹{selectedOwner.rent_amount}</p></div>
                  <div><strong>Lease Type</strong><p>{selectedOwner.agreement_type}</p></div>
                  <div><strong>Revenue Share</strong><p>{selectedOwner.revenue_share_pct}%</p></div>
                  <div><strong>Bank Name</strong><p>{selectedOwner.bank_name}</p></div>
                  <div><strong>Account Number</strong><p>{selectedOwner.account_number}</p></div>
                  <div><strong>IFSC Code</strong><p>{selectedOwner.ifsc_code}</p></div>
                  <div><strong>Contract Start</strong><p>{selectedOwner.contract_start}</p></div>
                  <div><strong>Contract End</strong><p>{selectedOwner.contract_end}</p></div>
                </div>
                <div style={{ marginTop:"20px" }}>
                  <strong>Notes</strong>
                  <p>{selectedOwner.notes || "No notes"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {showDeactivatePopup && (
  <div className={styles.deactivateModalOverlay}>

    <div className={styles.deactivateModal}>

      <h2 className={styles.deactivateTitle}>
        Future Bookings Found
      </h2>

      <p className={styles.deactivateSubtitle}>
        Users already booked this workspace.
        Do you still want to deactivate?
      </p>

      <div className={styles.bookingList}>
        {futureBookings.map((b, i) => (
          <div key={i} className={styles.bookingCard}>

            <p><strong>User:</strong> {b.user_name}</p>

            <p><strong>Date:</strong> {b.booking_date}</p>

            <p>
              <strong>Time:</strong>
              {b.start_time} - {b.end_time}
            </p>

            <p>
              <strong>Type:</strong>
              {b.booking_type}
            </p>

          </div>
        ))}
      </div>

      <div className={styles.deactivateActions}>

        <button
          className={styles.cancelDeactivateBtn}
          onClick={() => {
            setShowDeactivatePopup(false);
            setFutureBookings([]);
          }}
        >
          Cancel
        </button>

        <button
          className={styles.confirmDeactivateBtn}
          onClick={confirmDeactivateWorkspace}
        >
          OK Deactivate
        </button>

      </div>

    </div>

  </div>
)}
      </main>
    </div>
  );
}

export default OwnerDashboard;

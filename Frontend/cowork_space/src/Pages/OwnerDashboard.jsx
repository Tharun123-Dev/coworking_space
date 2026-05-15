import { useEffect, useMemo, useState, useCallback } from "react";
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

const NAV_GROUPS = [
  { key: "overview", icon: "⊞", label: "Overview", single: true },
  {
    key: "workspacesGroup", icon: "🏢", label: "Workspaces",
    children: [
      { key: "workspaces", icon: "🏗️", label: "Workspaces" },
      { key: "offerWorkspaces", icon: "🔥", label: "Offer Workspaces" },
      { key: "offerCoupons", icon: "🎟️", label: "Offer Coupons" },
      { key: "additionalAmenities", icon: "☕", label: "Additional Amenities" },
      { key: "suggestedWorkspaces", icon: "🧭", label: "Suggested Workspaces" },
    ],
  },
  { key: "manageUsers", icon: "👥", label: "Manage Users", single: true },
  {
    key: "slotsGroup", icon: "⏰", label: "Slot Management",
    children: [
      { key: "slots", icon: "⏰", label: "Slot Management" },
      { key: "monthlySlots", icon: "📅", label: "Monthly Slots" },
    ],
  },
  {
    key: "leadsGroup", icon: "🏷️", label: "Leads",
    children: [
      // { key: "companyLeads", icon: "🏷️", label: "Company Leads" },
      { key: "hyderabadLeads", icon: "📍", label: "Hyderabad Leads" },
      { key: "offerLeads", icon: "🔥", label: "Offer Leads" },
      { key: "customisationLeads", icon: "🎨", label: "Customisation Leads" },
      { key: "quotationLeads", icon: "📄", label: "Quotation Leads" },
    ],
  },
  { key: "bookings", icon: "📋", label: "My Bookings", single: true },
];

const LS_KEY = "ownerBookingStates";
const loadStates = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const saveState = (id, patch) => { const all = loadStates(); all[id] = { ...(all[id] || {}), ...patch }; localStorage.setItem(LS_KEY, JSON.stringify(all)); };

const SvgIcon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d={d} />
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

// ─── ACCORDION SECTION WRAPPER ─────────────────────────────────────────────
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

// ─── LEAD FILTER BAR ───────────────────────────────────────────────────────
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

function OwnerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const role = localStorage.getItem("role");
    localStorage.clear();
    if (role === "admin") window.location.href = "/auth?type=admin";
    else if (role === "owner") window.location.href = "/auth?type=owner";
    else window.location.href = "/auth?type=user";
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
  const [viewedNotifications, setViewedNotifications] = useState(() => JSON.parse(localStorage.getItem("viewedNotifications")) || []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [additionalAmenities, setAdditionalAmenities] = useState([]);
  const [editAmenityId, setEditAmenityId] = useState(null);
  const [amenityForm, setAmenityForm] = useState({ workspace: "", title: "", description: "", price: "", price_type: "full_day" });
  const [openGroups, setOpenGroups] = useState({ workspacesGroup: true, slotsGroup: false, leadsGroup: false });
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
  const [hoveredGroup, setHoveredGroup] = useState(null);

  // ── ACCORDION OPEN STATES ──
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);

  // ── LEAD FILTER STATES ──
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

  const approvedWorkspaces = useMemo(() => workspaces.filter(w => w.is_approved === true), [workspaces]);
  const setBusy = (id, value) => setBusyMap(prev => ({ ...prev, [id]: value }));
  const isBusy = (id) => !!busyMap[id];

  const toggleGroup = (groupKey) => {
    if (sidebarCollapsed) return;
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleNav = (sectionKey, groupKey) => {
    setActiveSection(sectionKey);
    setMobileSidebarOpen(false);
    if (groupKey) setOpenGroups(prev => ({ ...prev, [groupKey]: true }));
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
  const handleEditCoupon = (coupon) => {

  setEditCoupon(coupon);

  setCouponCode(coupon.coupon_code);

  setDiscountPercentage(
    coupon.discount_percentage
  );

  setMaxClaims(coupon.max_claims);

};
const handleDeleteCoupon = async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete this coupon?"
    );

  if (!confirmDelete) return;

  try {

    const response =
      await axiosInstance.delete(
        `/workspaces/coupon/${id}/`
      );

    console.log(response.data);

    // ✅ REMOVE FROM UI

    setCoupons((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );

  } catch (err) {

    console.log(err);

  }

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

  const buildNotifications = () => {
    let items = [];
    companyLeads.forEach(l => items.push({ id: `company-${l.id}`, type: "Company Lead", name: l.name, workspace: l.company || "-", location: l.location || "-", section: "companyLeads" }));
    hyderabadLeads.forEach(l => items.push({ id: `hyd-${l.id}`, type: "Hyderabad Lead", name: l.name, workspace: l.workspace_type, location: l.preferred_location, section: "hyderabadLeads" }));
    offerLeads.forEach(l => items.push({ id: `offer-${l.id}`, type: "Offer Lead", name: l.name, workspace: l.workspace_type, location: l.preferred_location, section: "offerLeads" }));
    customisationLeads.forEach(l => items.push({ id: `custom-${l.id}`, type: "Customisation Lead", name: l.name, workspace: l.company || "-", location: l.location || "-", section: "customisationLeads" }));
    setNotifications(items.filter(item => !viewedNotifications.includes(item.id)));
  };

  const handleViewNotification = (notification) => {
    setActiveSection(notification.section);
    if (["companyLeads", "hyderabadLeads", "offerLeads", "customisationLeads", "quotationLeads"].includes(notification.section)) {
      setOpenGroups((prev) => ({ ...prev, leadsGroup: true }));
    }
    let updatedViewed = [...viewedNotifications];
    const sameSectionIds = notifications.filter((n) => n.section === notification.section).map((n) => n.id);
    updatedViewed = [...new Set([...updatedViewed, ...sameSectionIds])];
    setViewedNotifications(updatedViewed);
    localStorage.setItem("viewedNotifications", JSON.stringify(updatedViewed));
    setNotifications((prev) => prev.filter((n) => n.section !== notification.section));
    setShowNotifications(false);
  };

  useEffect(() => { buildNotifications(); }, [companyLeads, hyderabadLeads, offerLeads, customisationLeads]);
  useEffect(() => { localStorage.setItem("viewedNotifications", JSON.stringify(viewedNotifications)); }, [viewedNotifications]);
  useEffect(() => {
    fetchWorkspaces(); fetchAllWorkspaces(); fetchOfferWorkspaces(); fetchOfferCoupons(); fetchAdditionalAmenities(); fetchRevenue(); fetchSlots(); fetchAmenities(); fetchUsers(); fetchMonthlySlots(); fetchCompanyLeads(); fetchHyderabadLeads(); fetchCustomisationLeads(); fetchQuotationLeads(); fetchOfferLeads(); fetchBookings(); fetchCancelRequests();
  }, [fetchBookings, fetchCancelRequests]);
  useEffect(() => { const loc = localStorage.getItem("user_location"); if (loc) setOwnerCity(loc); }, []);
  useEffect(() => { const handleResize = () => { if (window.innerWidth > 640) setMobileSidebarOpen(false); }; window.addEventListener("resize", handleResize); return () => window.removeEventListener("resize", handleResize); }, []);

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

  // ─── FILTERED LEADS ────────────────────────────────────────────────────────
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

  // ─── RENDER OVERVIEW ─────────────────────────────────────────────────────
  const renderOverview = () => {
    const overviewCards = [
      { value: `₹${revenue.total_revenue?.toLocaleString()}`, label: "Total Revenue", sub: "All time earnings", section: null, accent: "#b8922a", icon: "💰" },
      { value: `₹${revenue.confirmed_revenue?.toLocaleString()}`, label: "Confirmed Revenue", sub: "Paid & settled", section: "bookings", accent: "#16a34a", icon: "✅" },
      { value: workspaces.length, label: "My Workspaces", sub: "Listed spaces", section: "workspaces", accent: "#6366f1", icon: "🏗️" },
      { value: approvedWorkspaces.length, label: "Approved Workspaces", sub: "Live on platform", section: "workspaces", accent: "#14b8a6", icon: "✔️" },
      { value: slots.length, label: "Total Slots", sub: "Bookable hours", section: "slots", accent: "#a855f7", icon: "⏰" },
      { value: monthlySlots.length, label: "Monthly Slots", sub: "Active months", section: "monthlySlots", accent: "#06b6d4", icon: "📅" },
      { value: mergedBookings.length, label: "Total Bookings", sub: "All reservations", section: "bookings", accent: "#3b82f6", icon: "📋" },
      { value: totalLeads, label: "Total Leads", sub: "Inquiries received", section: "companyLeads", accent: "#f97316", icon: "🏷️" },
      { value: Array.isArray(users) ? users.length : 0, label: "Total Users", sub: "Registered members", section: "manageUsers", accent: "#ec4899", icon: "👥" },
      { value: offerWorkspaces.length, label: "Offer Workspaces", sub: "Active deals", section: "offerWorkspaces", accent: "#f43f5e", icon: "🔥" },
    ];

    return (
      <div className={styles.overviewWrap}>
        <div className={styles.overviewStatsGrid}>
          {overviewCards.map((card, i) => (
            <div
              key={i}
              className={`${styles.statCardNew} ${card.section ? styles.clickableStat : ""}`}
              style={{ "--card-accent": card.accent, animationDelay: `${i * 0.07}s` }}
              onClick={() => card.section && handleNav(card.section,
                card.section === "slots" || card.section === "monthlySlots" ? "slotsGroup" :
                card.section === "companyLeads" ? "leadsGroup" :
                card.section === "offerWorkspaces" ? "workspacesGroup" : undefined
              )}
            >
              <div className={styles.statCardAccentBar} style={{ background: card.accent }} />
              <div className={styles.statCardBody}>
                <div className={styles.statCardIcon} style={{ background: card.accent + "20", color: card.accent }}>{card.icon}</div>
                <p className={styles.statCardValue}>{card.value}</p>
                <p className={styles.statCardLabel}>{card.label}</p>
                <p className={styles.statCardSub}>{card.sub}</p>
              </div>
              {card.section && (
                <div className={styles.statCardArrow} style={{ color: card.accent }}>→</div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.overviewBottomRow}>
          <div className={styles.overviewInfo}>
            <h3>Quick Summary</h3>
            <p>{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} listed &nbsp;•&nbsp; {approvedWorkspaces.length} approved</p>
            <p>{slots.length} slot{slots.length !== 1 ? "s" : ""} &nbsp;•&nbsp; {monthlySlots.length} monthly slot{monthlySlots.length !== 1 ? "s" : ""}</p>
            <p>{mergedBookings.length} booking{mergedBookings.length !== 1 ? "s" : ""} received</p>
            <p>{totalLeads} total lead{totalLeads !== 1 ? "s" : ""}</p>
          </div>

          <div className={styles.workspaceTypeSummary}>
            <h3>Workspace Types</h3>
            <div className={styles.wsTypeGrid}>
              {WORKSPACE_TYPES.map(type => {
                const count = workspaces.filter(w => w.name === type).length;
                return (
                  <div key={type} className={styles.wsTypeChip} onClick={() => handleNav("workspaces", "workspacesGroup")}>
                    <span className={styles.wsTypeCount}>{count}</span>
                    <span className={styles.wsTypeName}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER MANAGE USERS ─────────────────────────────────────────────────
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
            <div>
              <h2>Manage Users</h2>
              <p>Add, edit and manage users — all in one place.</p>
            </div>
          </div>
          <button
            className={styles.muAddBtn}
            onClick={() => { setShowUserForm(true); setEditUserId(null); setUserForm({ username: "", email: "", password: "", phone: "", location: "" }); }}
          >
            <span>＋</span> Add User
          </button>
        </div>

        <div className={styles.muStatsRow}>
          <div className={`${styles.muStatCard} ${styles.muStatActive}`} onClick={() => setUserFilterTab("all")}>
            <div className={styles.muStatIcon}>👤</div>
            <div className={styles.muStatNum}>{totalUsers}</div>
            <div className={styles.muStatLabel}>TOTAL USERS</div>
          </div>
          <div className={`${styles.muStatCard} ${styles.muStatGreen}`} onClick={() => setUserFilterTab("active")}>
            <div className={styles.muStatIcon}>✔️</div>
            <div className={styles.muStatNum}>{activeUsersCount}</div>
            <div className={styles.muStatLabel}>ACTIVE USERS</div>
          </div>
          <div className={`${styles.muStatCard} ${styles.muStatRed}`} onClick={() => setUserFilterTab("inactive")}>
            <div className={styles.muStatIcon}>⛔</div>
            <div className={styles.muStatNum}>{inactiveUsersCount}</div>
            <div className={styles.muStatLabel}>INACTIVE USERS</div>
          </div>
        </div>

        {showUserForm && (
          <div className={styles.muFormPanel}>
            <div className={styles.muFormPanelHeader}>
              <h3>{editUserId ? "✏️ Edit User" : "➕ Add New User"}</h3>
              <button className={styles.muFormClose} onClick={() => { setShowUserForm(false); setEditUserId(null); }}>✕</button>
            </div>
            <div className={styles.muFormGrid}>
              <div className={styles.fieldGroup}><label>Username *</label><input placeholder="johndoe" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Email *</label><input placeholder="john@example.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Phone</label><input placeholder="9876543210" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} /></div>
              <div className={styles.fieldGroup}><label>Location</label><input placeholder="Hyderabad" value={userForm.location} onChange={e => setUserForm({ ...userForm, location: e.target.value })} /></div>
              {!editUserId && (
                <div className={styles.fieldGroup}><label>Password *</label><input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /></div>
              )}
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
                {label}
                <span className={styles.muTabBadge}>
                  {key === "all" ? totalUsers : key === "active" ? activeUsersCount : inactiveUsersCount}
                </span>
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
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Phone / Location</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: "#94a3b8", fontWeight: 600, fontSize: "13px" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <div className={styles.muUserCell}>
                      <div className={styles.muAvatar} style={{ background: getAvatarColor(u.username) }}>{getInitials(u.username)}</div>
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td>
                    <div className={styles.muEmailCell}>
                      <span className={styles.muEmailIcon}>✉</span>
                      <a href={`mailto:${u.email}`} className={styles.emailLink}>{u.email}</a>
                    </div>
                  </td>
                  <td>
                    <div className={styles.muPhoneCell}>
                      {u.phone && <div><span className={styles.muPhoneIcon}>📞</span> {u.phone}</div>}
                      {u.location && <div><span className={styles.muPhoneIcon}>📍</span> {u.location}</div>}
                      {!u.phone && !u.location && <span style={{ color: "#94a3b8" }}>—</span>}
                    </div>
                  </td>
                  <td>{u.is_active ? <span className={styles.activeBadge}>Active</span> : <span className={styles.inactiveBadge}>Inactive</span>}</td>
                  <td>
                    <div className={styles.muActions}>
                      <button className={styles.muEditBtn} onClick={() => handleEditUser(u)}>✏ Edit</button>
                      <button className={u.is_active ? styles.muInactiveBtn : styles.muActiveBtn} onClick={() => handleInactiveUser(u)}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No users found</td></tr>
              )}
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

  // ─── RENDER WORKSPACES ────────────────────────────────────────────────────
  const renderWorkspaces = () => (
    <div className={styles.sectionBody}>
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}

      <AccordionSection
        title={editId ? "Edit Workspace" : "Add New Workspace"}
        isOpen={showWorkspaceForm}
        onToggle={() => { if (showWorkspaceForm && editId) resetWorkspaceForm(); else setShowWorkspaceForm(prev => !prev); }}
        openLabel="+ Add Workspace"
        closeLabel={editId ? "✕ Cancel Edit" : "✕ Close Form"}
      >
        <div className={styles.wsFormGrid}>
          <div className={styles.fieldGroup}>
            <label>Workspace Type *</label>
            <select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}>
              <option value="">Select Type</option>
              {WORKSPACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label>City *</label>
            <select value={ownerCity} disabled><option value={ownerCity}>{ownerCity}</option></select>
          </div>
          <div className={styles.fieldGroup}>
            <label>Location / Address</label>
            <input placeholder="Enter address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className={styles.fieldGroup}>
            <label>Price (₹) *</label>
            <input type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Description</label>
            <textarea rows="3" placeholder="Describe this workspace…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Select Amenities</label>
            <div className={styles.amenitiesBox}>
              {amenitiesList.length === 0 ? <p>No amenities found</p> : amenitiesList.map(a => (
                <label key={a.id} className={styles.amenityChip}>
                  <input type="checkbox" value={a.id} checked={form.amenities.includes(a.id)}
                    onChange={e => { if (e.target.checked) setForm({ ...form, amenities: [...form.amenities, a.id] }); else setForm({ ...form, amenities: form.amenities.filter(id => id !== a.id) }); }} />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Image URL</label>
            <input placeholder="https://…" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
          </div>
        </div>
        <div className={styles.wsFormActions}>
          <button className={styles.wsSubmitBtn} onClick={handleSubmit}>{editId ? "Update Workspace" : "Add Workspace"}</button>
          <button className={styles.wsCancelBtn} onClick={resetWorkspaceForm}>Cancel</button>
        </div>
      </AccordionSection>

      <div className={styles.tableTopBar}>
        <input className={styles.searchInput} placeholder="Search my workspaces..." value={workspaceSearch} onChange={e => setWorkspaceSearch(e.target.value)} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>#</th><th>Name</th><th>City</th><th>Location</th><th>Price</th><th>Approval</th><th>Status</th><th>Amenities</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredMyWorkspaces.map((w, i) => {
              const isActive = w.isavailable !== false;
              return (
                <tr key={w.id} style={!isActive ? { opacity: 0.55, background: "rgba(0,0,0,0.02)" } : {}}>
                  <td>{i + 1}</td>
                  <td><strong>{w.name}</strong></td>
                  <td>{w.city}</td>
                  <td>{w.location || "—"}</td>
                  <td className={styles.priceCell}>₹{parseFloat(w.price || 0).toLocaleString()}</td>
                  <td>{w.is_approved ? <span className={styles.approvedBadge}>Approved</span> : <span className={styles.pendingBadge}>Pending</span>}</td>
                  <td>
                    {isActive
                      ? <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#10b98118", color: "#10b981", border: "1px solid #10b98130" }}>Active</span>
                      : <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#6b728018", color: "#6b7280", border: "1px solid #6b728030" }}>Inactive</span>}
                  </td>
                  <td>
                    <div className={styles.amenityList}>
                      {Array.isArray(w.amenities) && w.amenities.length > 0
                        ? w.amenities.map((amenity, idx) => (<span key={typeof amenity === "object" ? amenity.id || idx : idx} className={styles.amenityTag}><span>{getAmenityIcon(amenity)}</span><span>{getAmenityLabel(amenity)}</span></span>))
                        : <span className={styles.noData}>No amenities</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button title="Edit Workspace" onClick={() => handleEdit(w)} style={{ ...iconBtnBase, background: "rgba(99,102,241,0.1)", color: "#6366f1" }}><SvgIcon d={SVG.edit} size={14} /></button>
                      <button title={isActive ? "Set Inactive" : "Set Active"} onClick={() => handleToggleActive(w)} style={{ ...iconBtnBase, background: isActive ? "#10b98118" : "#6b728018", color: isActive ? "#10b981" : "#6b7280" }}><SvgIcon d={isActive ? SVG.eyeOn : SVG.eyeOff} size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMyWorkspaces.length === 0 && <div className={styles.empty}>No workspaces yet. Add one above!</div>}
      </div>
    </div>
  );

  const renderOfferWorkspaces = () => (
    <div className={styles.sectionBody}>
      <AccordionSection
        title={editOfferId ? "Edit Offer Workspace" : "Add Offer Workspace"}
        icon="🔥"
        isOpen={showOfferForm}
        onToggle={() => { setShowOfferForm(prev => !prev); if (showOfferForm) { setEditOfferId(null); setOfferForm({ building: "", type: "", original_price: "", offer_price: "", seats: "", floor: "", image: "", amenities: [] }); } }}
        openLabel="+ Add Offer Workspace"
        closeLabel={editOfferId ? "✕ Cancel Edit" : "✕ Close Form"}
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}><label>Area</label><input type="text" value={ownerCity} readOnly className={styles.readonlyInput} /></div>
          <div className={styles.fieldGroup}><label>Building</label><input value={offerForm.building} onChange={e => setOfferForm({ ...offerForm, building: e.target.value })} /></div>
          <div className={styles.fieldGroup}>
            <label>Workspace Type</label>
            <select value={offerForm.type} onChange={e => setOfferForm({ ...offerForm, type: e.target.value })}>
              <option value="">Select Workspace</option>
              {approvedWorkspaces.map(ws => (<option key={ws.id} value={ws.workspacename || ws.name || ws.title}>{ws.city} | {ws.location} | {ws.workspacename || ws.name || ws.title}</option>))}
            </select>
          </div>
          <div className={styles.fieldGroup}><label>Original Price</label><input type="number" value={offerForm.original_price} onChange={e => setOfferForm({ ...offerForm, original_price: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Offer Price</label><input type="number" value={offerForm.offer_price} onChange={e => setOfferForm({ ...offerForm, offer_price: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Seats</label><input type="number" value={offerForm.seats} onChange={e => setOfferForm({ ...offerForm, seats: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Floor</label><input value={offerForm.floor} onChange={e => setOfferForm({ ...offerForm, floor: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Image URL</label><input value={offerForm.image} onChange={e => setOfferForm({ ...offerForm, image: e.target.value })} /></div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.submitBtn} onClick={handleAddOfferWorkspace}>{editOfferId ? "Update Offer Workspace" : "Add Offer Workspace"}</button>
          <button className={styles.cancelBtn} onClick={() => { setShowOfferForm(false); setEditOfferId(null); setOfferForm({ building: "", type: "", original_price: "", offer_price: "", seats: "", floor: "", image: "", amenities: [] }); }}>Cancel</button>
        </div>
      </AccordionSection>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Area</th><th>Building</th><th>Type</th><th>Price</th><th>Offer</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{offerWorkspaces.map(item => (<tr key={item.id}><td>{item.area}</td><td>{item.building}</td>
          <td>{(() => { const mw = workspaces.find(w => (w.workspacename || w.name || w.title || "").trim().toLowerCase() === (item.type || "").trim().toLowerCase()); return (<div className={styles.workspaceInfo}><strong className={styles.workspaceTitle}>{item.type}</strong><small className={styles.workspaceLocation}>{mw?.city || item.area || "Hyderabad"} | {mw?.location || `${item.building} Street 5`} | {item.type}</small></div>); })()}</td>
          <td>₹{item.original_price}</td><td>₹{item.offer_price}</td>
          <td>{item.is_approved ? <span className={styles.approvedBadge}>Approved</span> : <span className={styles.pendingBadge}>Pending</span>}</td>
          <td><div className={styles.actionBtns}><button className={styles.editBtn} onClick={() => handleEditOffer(item)}>Edit</button><button className={styles.deleteBtn} onClick={() => handleDeleteOffer(item.id)}>Delete</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );

  const renderOfferCoupons = () => (
    <div className={styles.sectionBody}>
      <AccordionSection
        title="Add Offer Coupon"
        icon="🎟️"
        isOpen={showCouponForm}
        onToggle={() => setShowCouponForm(prev => !prev)}
        openLabel="+ Add Coupon"
        closeLabel="✕ Close Form"
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}><label>Select Workspace</label><select value={couponForm.workspace} onChange={e => setCouponForm({ ...couponForm, workspace: e.target.value })}><option value="">Select Workspace</option>{offerWorkspaces.map(ws => (<option key={ws.id} value={ws.id}>{ws.area} | {ws.building || "No Location"} | {ws.type}</option>))}</select></div>
          <div className={styles.fieldGroup}><label>Coupon Code</label><input placeholder="CLAIM50" value={couponForm.coupon_code} onChange={e => setCouponForm({ ...couponForm, coupon_code: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Discount %</label><select value={couponForm.discount_percentage} onChange={e => setCouponForm({ ...couponForm, discount_percentage: e.target.value })}><option value="">Select %</option><option value="10">10%</option><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option></select></div>
          <div className={styles.fieldGroup}><label>Coupon Capacity</label><input type="number" placeholder="2" value={couponForm.capacity} onChange={e => setCouponForm({ ...couponForm, capacity: e.target.value })} /></div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.submitBtn} onClick={handleAddCoupon}>Add Coupon</button>
          <button className={styles.cancelBtn} onClick={() => { setShowCouponForm(false); setCouponForm({ workspace: "", coupon_code: "", discount_percentage: "", capacity: "" }); }}>Cancel</button>
        </div>
      </AccordionSection>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Workspace</th><th>Coupon</th><th>Discount</th><th>Capacity</th><th>Used</th><th>Left</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{offerCoupons.map(item => { const left = Number(item.capacity) - Number(item.used_count || 0); return (<tr key={item.id}><td>{(() => { const mw = offerWorkspaces.find(w => w.id === item.workspace); return (<div className={styles.workspaceInfo}><strong className={styles.workspaceTitle}>{mw?.type || item.workspace_name}</strong><small className={styles.workspaceLocation}><span className={styles.cityText}>{mw?.area || "No City"}</span><span className={styles.separator}>|</span><span className={styles.locationText}>{mw?.location || mw?.building || "No Location"}</span><span className={styles.separator}>|</span>{mw?.type || item.workspace_name}</small></div>); })()}</td><td><span className={styles.couponCode}>{item.coupon_code}</span></td><td>{item.discount_percentage}%</td><td>{item.capacity}</td><td>{item.used_count || 0}</td><td>{left}</td><td>{left > 0 ? <span className={styles.activeBadge}>Active</span> : <span className={styles.inactiveBadge}>Expired</span>}</td><td>

  <div className={styles.actionButtons}>

    {/* <button
      className={styles.editBtn}
      onClick={() => handleEditCoupon(item)}
    >
      Edit
    </button> */}

    <button
      className={styles.deleteBtn}
      onClick={() => handleDeleteCoupon(item.id)}
    >
      Delete
    </button>

  </div>

</td></tr>); })}</tbody>
        </table>
      </div>
    </div>
  );

  const renderSuggestedWorkspaces = () => (
    <div className={styles.sectionBody}>
      <div className={styles.accordSection} style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#1a2235" }}>Suggested Workspaces</h3>
        <p style={{ margin: 0, color: "#667085", fontSize: "13px" }}>View workspaces added by other managers. This is only for reference.</p>
      </div>
      <div className={styles.tableTopBar}><input className={styles.searchInput} placeholder="Search by manager, workspace, city, or location..." value={suggestSearch} onChange={e => setSuggestSearch(e.target.value)} /></div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Manager</th><th>Name</th><th>City</th><th>Location</th><th>Price</th><th>Amenities</th></tr></thead>
          <tbody>{filteredSuggestedWorkspaces.map((w, i) => (<tr key={w.id}><td>{i + 1}</td><td>{w.owner_name || w.ownername || "—"}</td><td><strong>{w.name}</strong></td><td>{w.city}</td><td>{w.location || "—"}</td><td className={styles.priceCell}>₹{parseFloat(w.price || 0).toLocaleString()}</td><td><div className={styles.amenityList}>{Array.isArray(w.amenities) && w.amenities.length > 0 ? w.amenities.map((amenity, idx) => <span key={typeof amenity === "object" ? amenity.id || idx : idx} className={styles.amenityTag}><span>{getAmenityIcon(amenity)}</span><span>{getAmenityLabel(amenity)}</span></span>) : <span className={styles.noData}>No amenities</span>}</div></td></tr>))}</tbody>
        </table>
        {filteredSuggestedWorkspaces.length === 0 && <div className={styles.empty}>No suggested workspaces available from other managers.</div>}
      </div>
    </div>
  );

  const renderSlots = () => (
    <div className={styles.sectionBody}>
      <AccordionSection
        title={editSlotId ? "Edit Slot" : "Create New Slot"}
        icon="⏰"
        isOpen={showSlotForm}
        onToggle={() => { if (showSlotForm && editSlotId) { resetSlotForm(); } else { setShowSlotForm(prev => !prev); } }}
        openLabel="+ Create Slot"
        closeLabel={editSlotId ? "✕ Cancel Edit" : "✕ Close Form"}
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label>Workspace</label>
            <select value={slotForm.workspace_id} onChange={e => setSlotForm({ ...slotForm, workspace_id: e.target.value })}>
              <option value="">Select Workspace</option>
              {approvedWorkspaces.map(w => (<option key={w.id} value={w.id}>{w.name} • {w.city} • {w.location}</option>))}
            </select>
            {approvedWorkspaces.length === 0 && <small style={{ color: "#f87171", marginTop: "4px", display: "block" }}>No approved workspaces yet.</small>}
          </div>
          <div className={styles.fieldGroup}><label>Date</label><input type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Slot Type</label><select value={slotForm.slot_type} onChange={e => setSlotForm({ ...slotForm, slot_type: e.target.value })}><option value="hour">Hourly</option><option value="day">Full Day</option></select></div>
          <div className={styles.fieldGroup}><label>Capacity</label><input type="number" placeholder="50" value={slotForm.capacity} onChange={e => setSlotForm({ ...slotForm, capacity: e.target.value })} /></div>
          {slotForm.slot_type === "hour" && (<><div className={styles.fieldGroup}><label>Start Hour</label><input type="number" placeholder="9" value={slotForm.start_time} onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })} /></div><div className={styles.fieldGroup}><label>End Hour</label><input type="number" placeholder="18" value={slotForm.end_time} onChange={e => setSlotForm({ ...slotForm, end_time: e.target.value })} /></div></>)}
          <div className={styles.fieldGroup}><label>Price (₹)</label><input type="number" placeholder="0" value={slotForm.price} onChange={e => setSlotForm({ ...slotForm, price: e.target.value })} /></div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.submitBtn} onClick={createSlot}>{editSlotId ? "Update Slot" : "Create Slot"}</button>
          <button className={styles.cancelBtn} onClick={resetSlotForm}>Cancel</button>
        </div>
      </AccordionSection>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Workspace</th><th>Date</th><th>Type</th><th>Time</th><th>Capacity</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>{slots.map(s => (<tr key={s.id}><td><strong>{workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.city || "No City"} | {workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.location || "No Location"} | {s.workspace_name}</strong></td><td>{s.date}</td><td>{s.slot_type === "hour" ? "Hourly" : "Full Day"}</td><td>{s.slot_type === "hour" ? `${s.start_time} – ${s.end_time}` : "All Day"}</td><td>{s.capacity}</td><td className={styles.priceCell}>₹{s.price}</td><td><button onClick={() => { handleEditSlot(s); setShowSlotForm(true); }} className={styles.editBtn}>Edit</button><button onClick={() => deleteSlot(s.id)} className={styles.deleteBtn}>Delete</button></td></tr>))}</tbody>
        </table>
        {slots.length === 0 && <div className={styles.empty}>No slots yet. Create one above!</div>}
      </div>
    </div>
  );

  const renderMonthlySlots = () => (
    <div className={styles.sectionBody}>
      <AccordionSection
        title={editMonthId ? "Edit Monthly Slot" : "Create Monthly Slots"}
        icon="📅"
        isOpen={showMonthlyForm}
        onToggle={() => { if (showMonthlyForm && editMonthId) { resetMonthlyForm(); } else { setShowMonthlyForm(prev => !prev); } }}
        openLabel="+ Create Monthly Slots"
        closeLabel={editMonthId ? "✕ Cancel Edit" : "✕ Close Form"}
      >
        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}><label>Workspace</label><select value={monthlyForm.workspace_id} onChange={e => setMonthlyForm({ ...monthlyForm, workspace_id: e.target.value })} disabled={!!editMonthId}><option value="">Select Workspace</option>{approvedWorkspaces.map(w => (<option key={w.id} value={w.id}>{w.city} •{w.name}•{w.location}</option>))}</select>{approvedWorkspaces.length === 0 && <small style={{ color: "#f87171", marginTop: "4px", display: "block" }}>No approved workspaces yet.</small>}</div>
          <div className={styles.fieldGroup}><label>Year</label><input type="number" value={monthlyForm.year} onChange={e => setMonthlyForm({ ...monthlyForm, year: e.target.value })} disabled={!!editMonthId} /></div>
          <div className={styles.fieldGroup}><label>Select Months</label><select multiple value={monthlyForm.months} className={styles.monthSelect} onChange={e => { const selected = Array.from(e.target.selectedOptions, opt => opt.value); setMonthlyForm({ ...monthlyForm, months: selected }); }} disabled={!!editMonthId}>{MONTH_OPTIONS.map((month, i) => <option key={i} value={String(i + 1)}>{month}</option>)}</select></div>
          <div className={styles.fieldGroup}><label>Capacity</label><input type="number" value={monthlyForm.capacity} onChange={e => setMonthlyForm({ ...monthlyForm, capacity: e.target.value })} /></div>
          <div className={styles.fieldGroup}><label>Price per Seat</label><input type="number" value={monthlyForm.price} onChange={e => setMonthlyForm({ ...monthlyForm, price: e.target.value })} /></div>
        </div>
        <div className={styles.formActions}>
          {editMonthId ? (<><button className={styles.submitBtn} onClick={updateMonthlySlot}>Update Monthly Slot</button><button className={styles.cancelBtn} onClick={resetMonthlyForm}>Cancel</button></>) : (<><button className={styles.submitBtn} onClick={createMonthlySlots}>Create Monthly Slots</button><button className={styles.cancelBtn} onClick={() => setShowMonthlyForm(false)}>Cancel</button></>)}
        </div>
      </AccordionSection>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Workspace</th><th>City</th><th>Month</th><th>Year</th><th>Capacity</th><th>Booked</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>{monthlySlots.map(s => (<tr key={s.id}><td><strong>{workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.city || "No City"} | {workspaces.find(w => w.name?.trim() === s.workspace_name?.trim())?.location || "No Location"} | {s.workspace_name}</strong></td><td>{s.city}</td><td>{MONTH_OPTIONS[Number(s.month) - 1] || s.month}</td><td>{s.year}</td><td>{s.capacity}</td><td>{s.booked}</td><td>₹{s.price}</td><td><button className={styles.editBtn} onClick={() => { handleEditMonth(s); setShowMonthlyForm(true); }}>Edit</button><button className={styles.deleteBtn} onClick={() => deleteMonthlySlot(s.id)}>Delete</button></td></tr>))}</tbody>
        </table>
        {monthlySlots.length === 0 && <div className={styles.empty}>No monthly slots yet. Create one above!</div>}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className={styles.sectionBody}>
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
      <div className={styles.overviewGrid}>
        <div className={`${styles.statCard} ${styles.gold}`}><span className={styles.statIcon}>📋</span><div><p className={styles.statValue}>{bookingStats.total}</p><p className={styles.statLabel}>Total</p></div></div>
        <div className={`${styles.statCard} ${styles.green}`}><span className={styles.statIcon}>✅</span><div><p className={styles.statValue}>{bookingStats.confirmed}</p><p className={styles.statLabel}>Confirmed</p></div></div>
        <div className={`${styles.statCard} ${styles.amber}`}><span className={styles.statIcon}>⏳</span><div><p className={styles.statValue}>{bookingStats.pending}</p><p className={styles.statLabel}>Pending</p></div></div>
        <div className={`${styles.statCard} ${styles.red}`}><span className={styles.statIcon}>❌</span><div><p className={styles.statValue}>{bookingStats.cancelled}</p><p className={styles.statLabel}>Cancelled</p></div></div>
      </div>
      <div className={styles.tableWrap}>
        {loadingBookings ? <div className={styles.empty}>Loading bookings…</div> : mergedBookings.length === 0 ? <div className={styles.empty}><div>📋</div><p>No bookings yet</p></div> : (
          <table className={styles.table}>
            <thead><tr><th>Workspace</th><th>Customer</th><th>City</th><th>Date</th><th>Slot</th><th>Additional Amenities</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{mergedBookings.map(item => { const isConfirmed = item.status === "confirmed"; const isCancelled = item.status === "cancelled"; const isPulsing = animatingId === item.id; return (<tr key={item.id} className={isPulsing ? styles.rowPulse : ""}><td><div className={styles.bookingWorkspace} onClick={() => openBookingModal(item)}><img src={item.image} alt={item.workspace} className={styles.bookingThumb} /><span className={styles.bookingWorkspaceTitle}>{item.workspace}</span></div></td><td>{item.user}</td><td><span>{workspaces.find(w => w.name?.trim() === item.workspace?.trim())?.city || "No City"} | {workspaces.find(w => w.name?.trim() === item.workspace?.trim())?.location || "No Location"} | {item.workspace}</span></td><td>{item.date}</td><td><div><strong>{item.slot_type}</strong><br /><small>{item.slot_time}</small></div></td><td>{Array.isArray(item.amenities) && item.amenities.length > 0 ? <div className={styles.bookingAmenities}>{item.amenities.map((a, i) => (<div key={i} className={styles.bookingAmenityItem}><span>☕</span><div><strong>{a.title}</strong><small>{a.persons} Person • ₹{a.total}</small></div></div>))}</div> : <span className={styles.noAmenities}>No Amenities</span>}</td><td className={styles.priceCell}>₹{Number(item.total_price || 0).toLocaleString()}</td><td><span className={styles.statusPill}>{item.status || "pending"}</span></td><td><div className={styles.bookingActionBox}>{isConfirmed && <span className={styles.statusPill}>✓ Confirmed</span>}{isCancelled && <span className={styles.statusPill}>✕ Cancelled</span>}{!isConfirmed && !isCancelled && <span className={styles.statusPill}>Pending</span>}</div></td></tr>); })}</tbody>
          </table>
        )}
      </div>
      {requests.length > 0 && (
        <div className={styles.tableWrap}>
          <div className={styles.cancelRequestHead}><h3>Pending Cancel Requests</h3><span className={styles.statusPill}>{requests.length}</span></div>
          <table className={styles.table}>
            <thead><tr><th>Workspace</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Action</th></tr></thead>
            <tbody>{requests.map(r => (<tr key={r.id}><td>{r.workspace}</td><td>{r.user}</td><td><strong>₹{r.amount}</strong></td><td>{r.reason}</td><td>{r.status === "PENDING" ? <button className={styles.submitBtn} onClick={() => approveCancelRequest(r.id)}>Accept & Refund</button> : <span className={styles.statusPill}>Approved</span>}</td></tr>))}</tbody>
          </table>
        </div>
      )}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={closeBookingModal}>
          <div className={styles.bookingModal} onClick={e => e.stopPropagation()}>
            <button onClick={closeBookingModal} aria-label="Close" className={styles.modalCloseBtn}>✕</button>
            <div className={styles.modalHero}><img src={selectedBooking.image} alt={selectedBooking.workspace} className={styles.modalHeroImage} /><div className={styles.modalHeroOverlay} /><div className={styles.modalHeroContent}><span className={styles.heroTag}>Premium Workspace</span><h2>{selectedBooking.workspace}</h2><p>Booked by <strong>{selectedBooking.user}</strong> on {selectedBooking.date}</p></div></div>
            <div className={styles.modalBody}>
              <div className={styles.modalTabs}>{["overview", "features", "pricing"].map(tab => <button key={tab} onClick={() => setBookingActiveTab(tab)} className={`${styles.modalTabBtn} ${bookingActiveTab === tab ? styles.modalTabActive : ""}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>)}</div>
              {bookingActiveTab === "overview" && (<><div className={styles.overviewMetaGrid}>{[["Customer", selectedBooking.user], ["Date", selectedBooking.date], ["Slot", `${selectedBooking.slot_type} ${selectedBooking.slot_time || ""}`], ["City", selectedBooking.city], ["Status", selectedBooking.status || "pending"]].map(([label, val]) => <div key={label} className={styles.metaCard}><span>{label}</span><strong className={label === "Status" ? getStatusClass(val) : ""}>{val}</strong></div>)}</div><div className={styles.bookingSummaryBox}><h4>Booking Summary</h4><p>This booking is for <strong>{selectedBooking.workspace}</strong>. Review the customer request and schedule details directly inside the dashboard.</p></div></>)}
              {bookingActiveTab === "features" && <div className={styles.featureGrid}>{[["📶","High-Speed WiFi","Stable internet for work and meetings."],["🪑","Modern Setup","Comfortable desk and seating support."],["❄️","Fully Air Conditioned","Comfortable environment all day."],["☕","Refreshments","Tea, coffee and basic pantry access."]].map(([icon, title, desc]) => <div key={title} className={styles.featureCard}><div className={styles.featureIcon}>{icon}</div><h4>{title}</h4><p>{desc}</p></div>)}</div>}
              {bookingActiveTab === "pricing" && <div className={styles.pricingCard}><span>Booking Amount</span><h2>₹{selectedBooking.total_price}</h2><p>For {selectedBooking.slot_type} {selectedBooking.slot_time} on {selectedBooking.date}</p><div className={styles.pricingList}><div>Workspace reserved for selected slot</div><div>Booking tracked inside dashboard</div><div>Direct manager visibility</div></div></div>}
              {selectedBooking?.amenities?.length > 0 && (<div className={styles.modalAmenities}><h4>Additional Amenities</h4>{selectedBooking.amenities.map((a, i) => (<div key={i} className={styles.modalAmenityItem}><span>☕</span><div><strong>{a.title}</strong><small>{a.persons} Person • ₹{a.total}</small></div></div>))}</div>)}
            </div>
            <div className={styles.modalFooter}><div><strong>₹{selectedBooking.total_price}</strong><small>Total Booking Value</small></div><div>{selectedBooking.status === "confirmed" && <span className={styles.statusPill}>Booking Confirmed</span>}{selectedBooking.status === "cancelled" && <span className={styles.statusPill}>Booking Cancelled</span>}{selectedBooking.status !== "confirmed" && selectedBooking.status !== "cancelled" && <span className={styles.statusPill}>Pending Booking</span>}</div></div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── LEADS ────────────────────────────────────────────────────────────────
  const getLeadCounts = (leads, statusOptions) => {
    const counts = { all: leads.length };
    statusOptions.forEach(([key]) => { if (key !== "all") counts[key] = leads.filter(l => l.status?.toLowerCase() === key.toLowerCase()).length; });
    return counts;
  };

  const renderCompanyLeads = () => {
    const tabs = [["all","All"],["pending","Pending"],["contacted","Contacted"],["closed","Closed"]];
    const counts = getLeadCounts(companyLeads, tabs);
    return (
      <div className={styles.sectionBody}>
        <LeadFilterBar search={companyLeadSearch} onSearch={setCompanyLeadSearch} filterTab={companyLeadFilter} onFilter={setCompanyLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company, location..." />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Team Size</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Preferred Workspace</th><th>Company</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filteredCompanyLeads.map(item => (<tr key={item.id}><td>{item.team_size}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td>{item.preferred_location}</td><td>{item.workspace_type || "—"}</td><td>{item.company}</td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e => updateCompanyLeadStatus(item.id, e.target.value)} className={styles.statusSelect}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}
            {filteredCompanyLeads.length === 0 && <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No company leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHyderabadLeads = () => {
    const tabs = [["all","All"],["New","New"],["Contacted","Contacted"],["Interested","Interested"],["Converted","Converted"]];
    const counts = getLeadCounts(hyderabadLeads, tabs);
    return (
      <div className={styles.sectionBody}>
        <LeadFilterBar search={hyderabadLeadSearch} onSearch={setHyderabadLeadSearch} filterTab={hyderabadLeadFilter} onFilter={setHyderabadLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, workspace type..." />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Company Size</th><th>Name</th><th>Phone</th><th>Email</th><th>Workspace Type</th><th>Preferred Location</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filteredHyderabadLeads.map(item => (<tr key={item.id}><td>{item.company_size}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td>{item.workspace_type}</td><td><span className={styles.statusPill}>{item.preferred_location}</span></td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e => updateHyderabadLeadStatus(item.id, e.target.value)} className={styles.statusSelect}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option></select></td></tr>))}
            {filteredHyderabadLeads.length === 0 && <tr><td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No Hyderabad leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOfferLeads = () => {
    const tabs = [["all","All"],["New","New"],["Contacted","Contacted"],["Interested","Interested"],["Converted","Converted"]];
    const counts = getLeadCounts(offerLeads, tabs);
    return (
      <div className={styles.sectionBody}>
        <LeadFilterBar search={offerLeadSearch} onSearch={setOfferLeadSearch} filterTab={offerLeadFilter} onFilter={setOfferLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, workspace..." />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Workspace</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Team Size</th><th>Price Details</th><th>Coupon</th><th>Discount</th><th>Final Price</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filteredOfferLeads.map(item => {
              const matchedWorkspace = offerWorkspaces.find(w => (w.type || "").trim().toLowerCase() === (item.workspace_type || "").trim().toLowerCase());
              const matchedCoupon = offerCoupons.find(c => (c.coupon_code || "").trim().toLowerCase() === (item.coupon_code || "").trim().toLowerCase());
              const remainingCoupons = Number(matchedCoupon?.capacity || 0) - Number(matchedCoupon?.used_count || 0);
              return (<tr key={item.id}>
                <td><div className={styles.workspaceInfo}><strong className={styles.workspaceTitle}>{matchedWorkspace?.type || item.workspace_type || "Workspace"}</strong><small className={styles.workspaceLocation}><span className={styles.cityText}>{matchedWorkspace?.area || item.preferred_location || "Hyderabad"}</span><span className={styles.separator}>|</span><span className={styles.locationText}>{matchedWorkspace?.building}</span><span className={styles.separator}>|</span>{matchedWorkspace?.type || item.workspace_type}</small></div></td>
                <td><strong>{item.name}</strong></td><td>{item.phone}</td><td>{item.email}</td>
                <td><span className={styles.statusPill}>{item.preferred_location}</span></td>
                <td>{item.team_size}</td>
                <td><div className={styles.priceInfo}><small>Original: ₹{item.original_price || matchedWorkspace?.original_price || 0}</small></div></td>
                <td><div className={styles.couponBox}><strong className={styles.couponCode}>{item.coupon_code || "No Coupon"}</strong>{matchedCoupon && <small className={styles.remainingCoupons}>Remaining: {remainingCoupons}</small>}</div></td>
                <td><div className={styles.discountInfo}><strong className={styles.discountText}>{item.discount_percentage ? `${item.discount_percentage}% OFF` : "-"}</strong><small>Save ₹{item.discount_amount || 0}</small></div></td>
                <td><div className={styles.finalPriceBox}><strong className={styles.finalPrice}>₹{item.final_price || matchedWorkspace?.offer_price || 0}</strong></div></td>
                <td><span className={item.status === "Converted" ? styles.activeBadge : styles.pendingBadge}>{item.status}</span></td>
                <td><select value={item.status} onChange={e => updateOfferLeadStatus(item.id, e.target.value)} className={styles.statusSelect}><option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option><option value="Converted">Converted</option></select></td>
              </tr>);
            })}
            {filteredOfferLeads.length === 0 && <tr><td colSpan="12" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No offer leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomisationLeads = () => {
    const tabs = [["all","All"],["new","New"],["contacted","Contacted"],["closed","Closed"]];
    const counts = getLeadCounts(customisationLeads, tabs);
    return (
      <div className={styles.sectionBody}>
        <LeadFilterBar search={customLeadSearch} onSearch={setCustomLeadSearch} filterTab={customLeadFilter} onFilter={setCustomLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company, location..." />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Company</th><th>Name</th><th>Phone</th><th>Email</th><th>Preferred Location</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filteredCustomLeads.map(item => (<tr key={item.id}><td>{item.company}</td><td><strong>{item.name}</strong></td><td><a href={`tel:${item.phone}`} className={styles.phoneLink}>{item.phone}</a></td><td><a href={`mailto:${item.email}`} className={styles.emailLink}>{item.email}</a></td><td><span className={styles.statusPill}>{item.preferred_location}</span></td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e => updateCustomisationLeadStatus(item.id, e.target.value)} className={styles.statusSelect}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}
            {filteredCustomLeads.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No customisation leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderQuotationLeads = () => {
    const tabs = [["all","All"],["pending","Pending"],["contacted","Contacted"],["closed","Closed"]];
    const counts = getLeadCounts(quotationLeads, tabs);
    return (
      <div className={styles.sectionBody}>
        <LeadFilterBar search={quotationLeadSearch} onSearch={setQuotationLeadSearch} filterTab={quotationLeadFilter} onFilter={setQuotationLeadFilter} tabs={tabs} counts={counts} placeholder="Search by name, email, phone, company..." />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Company</th><th>Location</th><th>Workspace</th><th>Workspace Details</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{filteredQuotationLeads.map(item => (<tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.phone}</td><td>{item.email}</td><td>{item.company}</td><td>{item.preferred_location}</td><td>{item.workspace_type}</td><td>{item.quotation_details?.map((q, index) => (<div key={index}>{q.name} — {q.units} units</div>))}</td><td>₹{item.total_amount}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><span className={styles.statusPill}>{item.status}</span></td><td><select value={item.status} onChange={e => updateQuotationLeadStatus(item.id, e.target.value)} className={styles.statusSelect}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td></tr>))}
            {filteredQuotationLeads.length === 0 && <tr><td colSpan="11" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No quotation leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const createSlot = () => {
    if (!slotForm.workspace_id || !slotForm.date || !slotForm.price) { alert("Fill all fields"); return; }
    const payload = { ...slotForm, workspace_id: Number(slotForm.workspace_id), start_time: slotForm.slot_type === "hour" ? Number(slotForm.start_time) : null, end_time: slotForm.slot_type === "hour" ? Number(slotForm.end_time) : null, capacity: Number(slotForm.capacity), price: Number(slotForm.price) };
    if (editSlotId) { axiosInstance.put(`workspaces/slot/update/${editSlotId}/`, payload).then(() => { alert("Slot Updated ✅"); resetSlotForm(); fetchSlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Slot update failed"); }); }
    else { axiosInstance.post("workspaces/slot/create/", payload).then(() => { alert("Slot Created ✅"); resetSlotForm(); fetchSlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Slot create failed"); }); }
  };

  const handleEditSlot = (s) => { setSlotForm({ workspace_id: s.workspace_id || "", date: s.date || "", slot_type: s.slot_type || "hour", start_time: s.start_time || 9, end_time: s.end_time || 18, capacity: s.capacity || 50, price: s.price || "" }); setEditSlotId(s.id); setActiveSection("slots"); setMobileSidebarOpen(false); };
  const deleteSlot = (id) => { if (!window.confirm("Delete slot?")) return; axiosInstance.delete(`workspaces/slot/delete/${id}/`).then(() => { alert("Deleted ✅"); fetchSlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Delete slot failed"); }); };
  const createMonthlySlots = () => {
    if (!monthlyForm.workspace_id || !monthlyForm.year || monthlyForm.months.length === 0 || !monthlyForm.capacity || !monthlyForm.price) { alert("Please fill all monthly slot fields"); return; }
    const payload = { workspace_id: Number(monthlyForm.workspace_id), year: Number(monthlyForm.year), months: monthlyForm.months.map(Number), capacity: Number(monthlyForm.capacity), price: Number(monthlyForm.price) };
    axiosInstance.post("workspaces/month-slots/create/", payload).then(() => { alert("Monthly slots created ✅"); resetMonthlyForm(); fetchMonthlySlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Error creating monthly slots"); });
  };
  const handleEditMonth = (slot) => { setMonthlyForm({ workspace_id: String(slot.workspace_id || ""), year: slot.year || new Date().getFullYear(), months: [String(slot.month)], capacity: slot.capacity || 50, price: slot.price || "" }); setEditMonthId(slot.id); setActiveSection("monthlySlots"); setMobileSidebarOpen(false); };
  const updateMonthlySlot = () => { if (!editMonthId) return; axiosInstance.put(`workspaces/monthly-slot/update/${editMonthId}/`, { capacity: Number(monthlyForm.capacity), price: Number(monthlyForm.price) }).then(() => { alert("Updated ✅"); resetMonthlyForm(); fetchMonthlySlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Update failed"); }); };
  const deleteMonthlySlot = (id) => { if (!window.confirm("Delete this monthly slot?")) return; axiosInstance.delete(`workspaces/monthly-slot/delete/${id}/`).then(() => { alert("Deleted ✅"); fetchMonthlySlots(); }).catch(err => { console.error(err?.response?.data || err); alert("Delete failed"); }); };
  const updateCompanyLeadStatus = (id, status) => axiosInstance.put(`leads/company/status/${id}/`, { status }).then(() => fetchCompanyLeads()).catch(err => { console.error(err?.response?.data || err); alert("Status update failed"); });
  const updateHyderabadLeadStatus = (id, status) => axiosInstance.put(`hyderabad/status/${id}/`, { status }).then(() => fetchHyderabadLeads()).catch(err => { console.error(err?.response?.data || err); alert("Status update failed"); });
  const updateOfferLeadStatus = (id, status) => axiosInstance.put(`leads/offers/leads/status/${id}/`, { status }).then(() => fetchOfferLeads()).catch(err => { console.error(err); alert("Status update failed"); });
  const updateCustomisationLeadStatus = (id, status) => axiosInstance.put(`leads/modern-lead/status/${id}/`, { status }).then(() => fetchCustomisationLeads()).catch(err => { console.error(err); alert("Status update failed"); });

  const sectionTitles = {
    overview: { icon: "⊞", title: "Overview", sub: "Revenue summary and quick stats" },
    workspaces: { icon: "🏗️", title: "Workspace Management", sub: "Add, edit, and manage your listings" },
    offerWorkspaces: { icon: "🔥", title: "Offer Workspaces", sub: "Manage offer workspace listings" },
    suggestedWorkspaces: { icon: "🧭", title: "Suggested Workspaces", sub: "View workspaces added by other managers" },
    slots: { icon: "⏰", title: "Slot Management", sub: "Create and manage booking slots" },
    monthlySlots: { icon: "📅", title: "Monthly Slots", sub: "Create, update, and manage monthly slot pricing" },
    bookings: { icon: "📋", title: "My Bookings", sub: "View all booking requests and cancellation requests here" },
    companyLeads: { icon: "🏷️", title: "Company Leads", sub: "Manage company inquiries and update their status" },
    hyderabadLeads: { icon: "📍", title: "Hyderabad Leads", sub: "Manage Hyderabad preferred location leads" },
    offerLeads: { icon: "🔥", title: "Offer Leads", sub: "Manage offer workspace leads" },
    customisationLeads: { icon: "🎨", title: "Customisation Leads", sub: "Manage customisation inquiries" },
    quotationLeads: { icon: "📄", title: "Quotation Leads", sub: "Manage quotation inquiries" },
    additionalAmenities: { icon: "☕", title: "Additional Amenities", sub: "Manage additional amenities for your workspaces" },
    manageUsers: { icon: "👥", title: "Manage Users", sub: "Add, edit and manage users" },
    offerCoupons: { icon: "🎟️", title: "Offer Coupons", sub: "Create and manage discount coupons" },
  };

  const current = sectionTitles[activeSection];

  const groupTitleStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 16px", cursor: "pointer", userSelect: "none",
    color: "#94a3b8", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
    textTransform: "uppercase", borderRadius: "6px", margin: "2px 8px",
    transition: "background 0.15s",
  };
  const childItemStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "8px 12px 8px 32px", border: "none", width: "calc(100% - 16px)", textAlign: "left",
    background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
    color: isActive ? "#a5b4fc" : "#cbd5e1",
    borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    borderLeft: isActive ? "2px solid #818cf8" : "2px solid transparent",
    transition: "all 0.15s", margin: "1px 8px",
  });
  const singleItemStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 16px", border: "none", width: "calc(100% - 16px)", textAlign: "left",
    background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
    color: isActive ? "#a5b4fc" : "#e2e8f0",
    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
    borderLeft: isActive ? "2px solid #818cf8" : "2px solid transparent",
    transition: "all 0.15s", margin: "2px 8px",
  });
  const chevronStyle = (open) => ({
    transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)",
    fontSize: "10px", opacity: 0.6,
  });

  return (
    <div className={styles.shell}>
      {mobileSidebarOpen && <div className={styles.mobileOverlay} onClick={() => setMobileSidebarOpen(false)} />}

      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${mobileSidebarOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>{sidebarCollapsed ? "M" : "Manager Panel"}</div>
          <button className={styles.collapseBtn} onClick={() => setSidebarCollapsed(prev => !prev)}>{sidebarCollapsed ? "→" : "←"}</button>
        </div>

        <nav className={styles.nav} style={{ padding: "8px 0" }}>
          {NAV_GROUPS.map(group => {
            if (group.single) {
              const isActive = activeSection === group.key;
              return (
                <button key={group.key} style={singleItemStyle(isActive)} onClick={() => handleNav(group.key)} title={group.label}>
                  <span style={{ fontSize: "15px" }}>{group.icon}</span>
                  {!sidebarCollapsed && <span>{group.label}</span>}
                </button>
              );
            }
            const isOpen = openGroups[group.key];
            const hasActiveChild = group.children.some(c => c.key === activeSection);
            return (
              <div key={group.key}>
                <div
                  style={{ ...groupTitleStyle, background: hasActiveChild ? "rgba(99,102,241,0.08)" : (hoveredGroup === group.key ? "rgba(255,255,255,0.05)" : "transparent"), color: hasActiveChild ? "#a5b4fc" : "#94a3b8" }}
                  onClick={() => toggleGroup(group.key)}
                  onMouseEnter={() => setHoveredGroup(group.key)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  title={group.label}
                >
                  {sidebarCollapsed ? (
                    <span style={{ fontSize: "15px", margin: "0 auto" }}>{group.icon}</span>
                  ) : (
                    <><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "15px" }}>{group.icon}</span><span>{group.label}</span></div><span style={chevronStyle(isOpen)}>▶</span></>
                  )}
                </div>
                {!sidebarCollapsed && isOpen && (
                  <div style={{ overflow: "hidden" }}>
                    {group.children.map(child => {
                      const isActive = activeSection === child.key;
                      return (<button key={child.key} style={childItemStyle(isActive)} onClick={() => handleNav(child.key, group.key)} title={child.label}><span style={{ fontSize: "13px" }}>{child.icon}</span><span>{child.label}</span></button>);
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarStats}>
              <div><strong>{workspaces.length}</strong><span>My Spaces</span></div>
              <div><strong>{mergedBookings.length}</strong><span>Bookings</span></div>
              <div><strong>{Array.isArray(users) ? users.length : 0}</strong><span>Users</span></div>
              <div><strong>{slots.length}</strong><span>Slots</span></div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </aside>

      <main className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ""}`}>
        <header className={styles.mainHeader}>
          <div className={styles.pageHeading}>
            <button className={styles.mobileMenuBtn} onClick={() => setMobileSidebarOpen(true)}>☰</button>
            <span className={styles.headIcon}>{current?.icon}</span>
            <div><h1>{current?.title}</h1><p>{current?.sub}</p></div>
          </div>
          <div className={styles.headerRevenue}><span>Total Revenue</span><strong>₹{revenue.total_revenue?.toLocaleString()}</strong></div>
          <div className={styles.notificationWrap}>
            <button className={styles.notificationBtn} onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {notifications.length > 0 && <span className={styles.notificationCount}>{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <span>Notifications</span>
                  <button className={styles.closeNotificationBtn} onClick={() => setShowNotifications(false)}>✕</button>
                </div>
                {notifications.length === 0 && <div className={styles.notificationEmpty}>No Notifications</div>}
                <div className={styles.notificationScroll}>
                  {notifications.map(n => (
                    <div key={n.id} className={styles.notificationItem}>
                      <div className={styles.notificationInfo}><strong>{n.type}</strong><p>{n.name}</p><small>{n.workspace}</small></div>
                      <button className={styles.viewBtn} onClick={() => handleViewNotification(n)}>View</button>
                    </div>
                  ))}
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
              <AccordionSection
                title={editAmenityId ? "Edit Amenity" : "Add Additional Amenity"}
                icon="☕"
                isOpen={showAmenityForm}
                onToggle={() => { setShowAmenityForm(prev => !prev); if (showAmenityForm) { setEditAmenityId(null); setAmenityForm({ workspace: "", title: "", description: "", price: "", price_type: "full_day" }); } }}
                openLabel="+ Add Amenity"
                closeLabel={editAmenityId ? "✕ Cancel Edit" : "✕ Close Form"}
              >
                <div className={styles.amenityFormGrid}>
                  <select className={`${styles.amenitySelect} ${!amenityForm.workspace ? styles.placeholderSelect : ""}`} value={amenityForm.workspace} onChange={e => setAmenityForm({ ...amenityForm, workspace: e.target.value })}>
                    <option value="" disabled hidden>Select Workspace</option>
                    {approvedWorkspaces.map(ws => (<option key={ws.id} value={ws.id}>{ws.city} | {ws.location} | {ws.workspacename || ws.name || ws.title}</option>))}
                  </select>
                  {approvedWorkspaces.length === 0 && <small style={{ color: "#f87171", gridColumn: "1 / -1" }}>No approved workspaces yet.</small>}
                  <input className={styles.amenityInput} type="text" placeholder="Amenity Name" value={amenityForm.title} onChange={e => setAmenityForm({ ...amenityForm, title: e.target.value })} />
                  <input className={styles.amenityInput} type="text" placeholder="Description" value={amenityForm.description} onChange={e => setAmenityForm({ ...amenityForm, description: e.target.value })} />
                  <input className={styles.amenityInput} type="number" placeholder="Price" value={amenityForm.price} onChange={e => setAmenityForm({ ...amenityForm, price: e.target.value })} />
                  <select className={styles.amenitySelect} value={amenityForm.price_type} onChange={e => setAmenityForm({ ...amenityForm, price_type: e.target.value })}>
                    <option value="half_day">Half Day</option>
                    <option value="full_day">Full Day</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <div style={{ display: "flex", gap: "10px", gridColumn: "1 / -1" }}>
                    <button className={styles.amenityBtn} onClick={handleAddAmenity}>{editAmenityId ? "Update Amenity" : "Add Amenity"}</button>
                    <button className={styles.wsCancelBtn} style={{ height: "54px", borderRadius: "14px" }} onClick={() => { setShowAmenityForm(false); setEditAmenityId(null); setAmenityForm({ workspace: "", title: "", description: "", price: "", price_type: "full_day" }); }}>Cancel</button>
                  </div>
                </div>
              </AccordionSection>

              <div className={styles.amenitiesTable}>
                <table>
                  <thead><tr><th>Workspace</th><th>Amenity</th><th>Description</th><th>Price</th><th>Type</th><th>Action</th></tr></thead>
                  <tbody>{additionalAmenities.map(item => (<tr key={item.id}><td><strong>{workspaces.find(w => w.name?.trim() === item.workspace_name?.trim())?.city || "No City"} | {workspaces.find(w => w.name?.trim() === item.workspace_name?.trim())?.location || "No Location"} | {item.workspace_name}</strong></td><td>{item.title}</td><td>{item.description}</td><td>₹{item.price}</td><td>{item.price_type?.replace("_", " ")}</td><td><div className={styles.actionBtns}><button className={styles.editBtn} onClick={() => { setEditAmenityId(item.id); setAmenityForm({ workspace: item.workspace, title: item.title, description: item.description, price: item.price, price_type: item.price_type }); setShowAmenityForm(true); }}>Edit</button><button className={styles.deleteBtn} onClick={() => handleDeleteAmenity(item.id)}>Delete</button></div></td></tr>))}</tbody>
                </table>
                {additionalAmenities.length === 0 && <div className={styles.empty}>No additional amenities yet.</div>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerDashboard;

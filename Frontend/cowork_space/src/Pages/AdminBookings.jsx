import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminBookings.css";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    axiosInstance
      .get("cart/admin/bookings/")
      .then((res) => setBookings(res.data || []))
      .finally(() => setLoading(false));
  };

  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  const filteredBookings = bookings.filter((item) => {
    const matchesSearch =
      (item.owner || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.user || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.workspace || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s === "pending") return "pending";
    if (s === "confirmed") return "confirmed";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const handleImageClick = (item) => {
    setSelectedBooking(item);
    setActiveTab("overview");
    setShowDetails(true);
  };

  const closeModal = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedBooking(null);
      setActiveTab("overview");
    }, 200);
  };

  const bookingFeatures = useMemo(() => {
    if (!selectedBooking) return [];
    return ["1Gbps WiFi", "24/7 Access", "AC", "Backup Power", "Parking"];
  }, [selectedBooking]);

  const bookingPriceLabel = useMemo(() => {
    if (!selectedBooking) return "";
    return selectedBooking.duration > 1 ? `${selectedBooking.duration}-Day` : "1-Day";
  }, [selectedBooking]);

  return (
    <div className="admin-bookings">

      {/* ── HEADER ── */}
      <div className="header">
        <div>
          <p className="admin-badge">⬡ Admin Panel</p>
          <h2>Admin Booking Tracking</h2>
          <p className="admin-subtext">
            Monitor workspace bookings, review user details, and inspect card-style workspace information.
          </p>
        </div>
        <button onClick={fetchBookings} className="refresh" type="button">
          ↻ Refresh
        </button>
      </div>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        {[
          { label: "Total",     value: stats.total,     color: "#f4c430", active: filter === "All"       },
          { label: "Pending",   value: stats.pending,   color: "#f59e0b", active: filter === "pending"   },
          { label: "Confirmed", value: stats.confirmed, color: "#22c55e", active: filter === "confirmed" },
          { label: "Cancelled", value: stats.cancelled, color: "#ef4444", active: filter === "cancelled" },
        ].map(s => (
          <div
            key={s.label}
            className={`stat-pill ${s.active ? "stat-pill-active" : ""}`}
            style={{ "--pill-color": s.color }}
            onClick={() => setFilter(s.label === "Total" ? "All" : s.label.toLowerCase())}
          >
            <span className="stat-pill-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-pill-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── CONTROLS ── */}
      <div className="controls">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search owner / user / workspace / location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* result count */}
      <div className="result-count">
        Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
      </div>

      {/* ── STATES ── */}
      {loading ? (
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <p className="loading">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🔍</div>
          <h3>No bookings found</h3>
          <p>Try changing the search or filter to view more records.</p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Owner</th>
                  <th>User</th>
                  <th>Workspace</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.workspace || "workspace"}
                        className="owner-booking-thumb"
                        onClick={() => handleImageClick(item)}
                      />
                    </td>
                    <td>
                      <div className="cell-name">
                        <div className="cell-avatar" style={{ background: avatarBg(item.owner) }}>
                          {initials(item.owner)}
                        </div>
                        {item.owner || "-"}
                      </div>
                    </td>
                    <td>{item.user || "-"}</td>
                    <td><strong className="ws-name">{item.workspace || "-"}</strong></td>
                    <td><span className="location-chip">📍 {item.location || "-"}</span></td>
                    <td>{item.date || "-"}</td>
                    <td><span className="duration-chip">{item.duration} day</span></td>
                    <td><span className="price-text">₹{item.price}</span></td>
                    <td>
                      <span className={`status ${getStatusClass(item.status)}`}>
                        <span className="status-dot" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="mobile-cards">
            {filteredBookings.map((item) => (
              <div key={item.id} className="mobile-booking-card">
                <div className="mobile-card-img-wrap" onClick={() => handleImageClick(item)}>
                  <img src={item.image} alt={item.workspace || "workspace"} className="mobile-card-img" />
                  <span className={`status mobile-card-status ${getStatusClass(item.status)}`}>
                    <span className="status-dot" />{item.status}
                  </span>
                </div>
                <div className="mobile-card-body">
                  <div className="mobile-card-top">
                    <strong className="ws-name">{item.workspace || "-"}</strong>
                    <span className="price-text">₹{item.price}</span>
                  </div>
                  <span className="location-chip" style={{ marginBottom: 10 }}>📍 {item.location || "-"}</span>
                  <div className="mobile-card-grid">
                    {[
                      { label: "Owner",    value: item.owner || "-"    },
                      { label: "User",     value: item.user || "-"     },
                      { label: "Date",     value: item.date || "-"     },
                      { label: "Duration", value: `${item.duration} day` },
                    ].map(r => (
                      <div key={r.label} className="mobile-card-row">
                        <span className="mobile-row-label">{r.label}</span>
                        <span className="mobile-row-value">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mobile-detail-btn" onClick={() => handleImageClick(item)}>
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          MODAL
      ══════════════════════════════════════ */}
      {showDetails && selectedBooking && (
        <div className="workspace-modal-overlay" onClick={closeModal}>
          <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="workspace-close-btn"
              onClick={closeModal}
              aria-label="Close workspace details"
            >✕</button>

            {/* hero */}
            <div className="workspace-hero">
              <img
                src={selectedBooking.image}
                alt={selectedBooking.workspace || "workspace"}
                className="workspace-hero-image"
              />
              <div className="workspace-hero-gradient" />
              <div className="workspace-top-badges">
                <span className="hero-chip warm">📅 {bookingPriceLabel}</span>
                <span className="hero-chip cool">📍 HYD</span>
                <span className="hero-chip gold">⭐ 4.8 (120+)</span>
              </div>
              <div className="workspace-hero-content">
                <span className="workspace-mini-badge">Workspace Preview</span>
                <h3>{selectedBooking.workspace || "Workspace"}</h3>
                <p>{selectedBooking.location || "Location unavailable"}</p>
              </div>
            </div>

            {/* body */}
            <div className="workspace-modal-body">
              <div className="workspace-tabs">
                {["overview", "features", "pricing"].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    className={`workspace-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* overview */}
              {activeTab === "overview" && (
                <div className="workspace-dark-card">
                  <div className="workspace-card-inner">
                    <div className="workspace-card-image-wrap">
                      <img
                        src={selectedBooking.image}
                        alt={selectedBooking.workspace || "workspace"}
                        className="workspace-card-image"
                      />
                      <div className="workspace-image-badges">
                        <span className="mini-tag">📅 {bookingPriceLabel}</span>
                        <span className="mini-tag">📍 HYD</span>
                        <span className="mini-tag rating">⭐ 4.8 (120+)</span>
                      </div>
                    </div>
                    <div className="workspace-card-content">
                      <h4>{selectedBooking.workspace || "Workspace"}</h4>
                      <p className="workspace-location-line">📍 {selectedBooking.location || "-"}</p>
                      <p className="workspace-location-line">🏢 Owner: {selectedBooking.owner || "-"}</p>
                      <p className="workspace-location-line">👤 User: {selectedBooking.user || "-"}</p>
                      <div className="feature-pill-wrap">
                        {bookingFeatures.map((feature, index) => (
                          <span key={index} className="feature-pill">{feature}</span>
                        ))}
                      </div>
                      <div className="workspace-price-row">
                        <div className="workspace-price-block">
                          <strong>₹{selectedBooking.price}</strong>
                          <span>/day</span>
                        </div>
                        <span className="duration-tag">{bookingPriceLabel}</span>
                      </div>
                      <div className="workspace-added-strip">
                        🛒 Booking tracked in admin panel
                      </div>
                      <div className="workspace-actions-row">
                        <button type="button" className="action-light-btn">Know More</button>
                        <button type="button" className="action-green-btn">View Booking</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* features */}
              {activeTab === "features" && (
                <div className="workspace-info-grid">
                  <div className="info-card">
                    <span className="info-label">Workspace Type</span>
                    <strong>{selectedBooking.workspace || "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Location</span>
                    <strong>{selectedBooking.location || "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Booking Date</span>
                    <strong>{selectedBooking.date || "-"}</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Booking Status</span>
                    <strong className={`status-text ${getStatusClass(selectedBooking.status)}`}>
                      {selectedBooking.status || "pending"}
                    </strong>
                  </div>
                  <div className="info-card full">
                    <span className="info-label">Available Features</span>
                    <div className="feature-pill-wrap modal-pills">
                      {bookingFeatures.map((feature, index) => (
                        <span key={index} className="feature-pill">{feature}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* pricing */}
              {activeTab === "pricing" && (
                <div className="workspace-info-grid">
                  <div className="info-card">
                    <span className="info-label">Price</span>
                    <strong>₹{selectedBooking.price}</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Duration</span>
                    <strong>{selectedBooking.duration} day</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Billing Type</span>
                    <strong>Per Day</strong>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Package</span>
                    <strong>{bookingPriceLabel}</strong>
                  </div>
                  <div className="info-card full">
                    <span className="info-label">Summary</span>
                    <p className="pricing-summary">
                      This workspace booking is priced at ₹{selectedBooking.price} for {selectedBooking.duration} day booking duration.
                      You can use this preview to inspect the same card-style presentation as your landing page.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="workspace-modal-footer">
              <div>
                <span className="footer-title">{selectedBooking.workspace}</span>
                <small>{selectedBooking.location}</small>
              </div>
              <div className="footer-actions">
                <span className={`status footer-status ${getStatusClass(selectedBooking.status)}`}>
                  <span className="status-dot" />
                  {selectedBooking.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helpers ── */
const AVATAR_PALETTE = ["#f4c430","#38bdf8","#8b5cf6","#22c55e","#ef4444","#ec4899","#14b8a6","#fb923c"];
function avatarBg(str = "") {
  let s = 0; for (let c of str) s += c.charCodeAt(0);
  return AVATAR_PALETTE[s % AVATAR_PALETTE.length] + "22";
}
function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default AdminBookings;
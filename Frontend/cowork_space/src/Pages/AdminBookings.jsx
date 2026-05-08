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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("cart/admin/bookings/");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status = "") => status.toLowerCase().trim();

  const getStatusClass = (status) => {
    const s = normalizeStatus(status);
    if (s === "confirmed") return "confirmed";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => normalizeStatus(b.status) === "pending").length,
      confirmed: bookings.filter((b) => normalizeStatus(b.status) === "confirmed").length,
      cancelled: bookings.filter((b) => normalizeStatus(b.status) === "cancelled").length,
    }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        (item.owner || "").toLowerCase().includes(query) ||
        (item.user || "").toLowerCase().includes(query) ||
        (item.workspace || "").toLowerCase().includes(query) ||
        (item.location || "").toLowerCase().includes(query) ||
        (item.city || "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || normalizeStatus(item.status) === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

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
    }, 180);
  };

  const bookingFeatures = useMemo(() => {
    if (!selectedBooking) return [];
    return ["1Gbps WiFi", "24/7 Access", "Air Conditioning", "Power Backup", "Parking"];
  }, [selectedBooking]);

  const bookingPriceLabel = useMemo(() => {
    if (!selectedBooking) return "";

    if (selectedBooking.booking_type === "month") {
      return "Monthly Booking";
    }

    if ((selectedBooking.slot_type || "").toLowerCase() === "hourly") {
      return "Hourly Booking";
    }

    return "Full Day Booking";
  }, [selectedBooking]);

  const bookingDurationText = (item) => {
    if (!item) return "-";
    if (item.booking_type === "month") return "Monthly Booking";
    return item.slot_type && item.slot_time
      ? `${item.slot_type} (${item.slot_time})`
      : item.slot_type || item.slot_time || "-";
  };

  const billingType = (item) => {
    if (!item) return "-";
    if (item.booking_type === "month") return "Per Month";
    if ((item.slot_type || "").toLowerCase() === "hourly") return "Per Hour";
    return "Per Day";
  };

  return (
    <div className="admin-bookings">
      <div className="admin-bookings-shell">
        <div className="header">
          <div className="header-copy">
            <p className="admin-badge">Admin Panel</p>
            <h2>Admin Booking Tracking</h2>
            <p className="admin-subtext">
              Monitor workspace bookings, review user details, and inspect complete booking information.
            </p>
          </div>

          <button onClick={fetchBookings} className="refresh" type="button">
            ↻ Refresh
          </button>
        </div>

        <div className="stats-bar">
          {[
            { label: "Total", value: stats.total, color: "var(--accent-gold)", key: "All" },
            { label: "Pending", value: stats.pending, color: "var(--accent-orange)", key: "pending" },
            { label: "Confirmed", value: stats.confirmed, color: "var(--accent-green)", key: "confirmed" },
            { label: "Cancelled", value: stats.cancelled, color: "var(--accent-red)", key: "cancelled" },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              className={`stat-pill ${filter === s.key ? "stat-pill-active" : ""}`}
              style={{ "--pill-color": s.color }}
              onClick={() => setFilter(s.key)}
            >
              <span className="stat-pill-value">{s.value}</span>
              <span className="stat-pill-label">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search owner / user / workspace / location / city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")} type="button">
                ✕
              </button>
            )}
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="result-count">
          Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="loading-spinner"></div>
            <p className="loading">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon">📂</div>
            <h3>No bookings found</h3>
            <p>No bookings match your current search or filter.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Owner</th>
                    <th>User</th>
                    <th>Workspace</th>
                    <th>Location</th>
                    <th>City</th>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Additional Amenities</th>
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
                          <div
                            className="cell-avatar"
                            style={{ background: avatarBg(item.owner) }}
                          >
                            {initials(item.owner)}
                          </div>
                          <span>{item.owner || "-"}</span>
                        </div>
                      </td>

                      <td>{item.user || "-"}</td>
                      <td>
                        <strong className="ws-name">{item.workspace || "-"}</strong>
                      </td>
                      <td>
                        <span className="location-chip">📍 {item.location || "-"}</span>
                      </td>
                      <td>{item.city || "-"}</td>
                      <td>{item.date || "-"}</td>
                      <td>
                        <div className="duration-chip">
                          <strong>
                            {item.booking_type === "month" ? "Monthly" : item.slot_type || "-"}
                          </strong>
                          <small>
                            {item.booking_type === "month"
                              ? "Monthly Booking"
                              : item.slot_time || "-"}
                          </small>
                        </div>
                      </td>
<td>

{

Array.isArray(item.amenities) &&
item.amenities.length > 0

?

<div className="booking-amenities">

  {

    item.amenities.map(
      (a, i) => (

      <div
        key={i}
        className="booking-amenity-item"
      >

        <span>
          ☕
        </span>

        <div>

          <strong>
            {a.title}
          </strong>

          <small>

            {a.persons}
            Person

            •

            ₹{a.total}

          </small>

        </div>

      </div>

    ))

  }

</div>

:

<span className="no-amenities">

No Amenities

</span>

}

</td>

<td>

  <span className="price-text">

    ₹{
      item.total_price ||
      item.price ||
      0
    }

  </span>

</td>
                      <td>
                        <span className="price-text">₹{item.price || 0}</span>
                      </td>
                      <td>
                        <span className={`status ${getStatusClass(item.status)}`}>
                          <span className="status-dot" />
                          {item.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {filteredBookings.map((item) => (
                <div key={item.id} className="mobile-booking-card">
                  <div className="mobile-card-img-wrap" onClick={() => handleImageClick(item)}>
                    <img
                      src={item.image}
                      alt={item.workspace || "workspace"}
                      className="mobile-card-img"
                    />
                    <span className={`status mobile-card-status ${getStatusClass(item.status)}`}>
                      <span className="status-dot" />
                      {item.status || "pending"}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-top">
                      <strong className="ws-name">{item.workspace || "-"}</strong>
                      <span className="price-text">₹{item.price || 0}</span>
                    </div>

                    <span className="location-chip">📍 {item.location || "-"}</span>

                    <div className="mobile-card-grid">
                      {[
                        { label: "Owner", value: item.owner || "-" },
                        { label: "User", value: item.user || "-" },
                        { label: "City", value: item.city || "-" },
                        { label: "Date", value: item.date || "-" },
                        { label: "Slot", value: bookingDurationText(item) },
                      ].map((row) => (
                        <div key={row.label} className="mobile-card-row">
                          <span className="mobile-row-label">{row.label}</span>
                          <span className="mobile-row-value">{row.value}</span>
                        </div>
                      ))}
                    </div>
   {

Array.isArray(item.amenities) &&
item.amenities.length > 0 && (

<div className="mobile-amenities">

  {

    item.amenities.map(
      (a, i) => (

      <div
        key={i}
        className="mobile-amenity-item"
      >

        ☕ {a.title}

        •

        {a.persons} Person

        •

        ₹{a.total}

      </div>

    ))

  }

</div>

)}
                    <button
                      className="mobile-detail-btn"
                      type="button"
                      onClick={() => handleImageClick(item)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showDetails && selectedBooking && (
          <div className="workspace-modal-overlay" onClick={closeModal}>
            <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="workspace-close-btn"
                onClick={closeModal}
                aria-label="Close workspace details"
              >
                ✕
              </button>

              <div className="workspace-hero">
                <img
                  src={selectedBooking.image}
                  alt={selectedBooking.workspace || "workspace"}
                  className="workspace-hero-image"
                />
                <div className="workspace-hero-gradient" />

                <div className="workspace-top-badges">
                  <span className="hero-chip warm">📅 {bookingPriceLabel}</span>
                  <span className="hero-chip cool">📍 {selectedBooking.city || "HYD"}</span>
                  <span className={`hero-chip status-chip ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status || "pending"}
                  </span>
                </div>

                <div className="workspace-hero-content">
                  <span className="workspace-mini-badge">Workspace Preview</span>
                  <h3>{selectedBooking.workspace || "Workspace"}</h3>
                  <p>{selectedBooking.location || "Location unavailable"}</p>
                </div>
              </div>

              <div className="workspace-modal-body">
                <div className="workspace-tabs">
                  {["overview", "features", "pricing"].map((tab) => (
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
                          <span className="mini-tag">📍 {selectedBooking.city || "HYD"}</span>
                          <span className={`mini-tag rating ${getStatusClass(selectedBooking.status)}`}>
                            {selectedBooking.status || "pending"}
                          </span>
                        </div>
                      </div>

                      <div className="workspace-card-content">
                        <h4>{selectedBooking.workspace || "Workspace"}</h4>
                        <p className="workspace-location-line">📍 {selectedBooking.location || "-"}</p>
                        <p className="workspace-location-line">🏢 Owner: {selectedBooking.owner || "-"}</p>
                        <p className="workspace-location-line">👤 User: {selectedBooking.user || "-"}</p>

                        <div className="feature-pill-wrap">
                          {bookingFeatures.map((feature, index) => (
                            <span key={index} className="feature-pill">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="workspace-price-row">
                          <div className="workspace-price-block">
                            <strong>₹{selectedBooking.price || 0}</strong>
                            <span>{billingType(selectedBooking)}</span>
                          </div>
                          <span className="duration-tag">{bookingPriceLabel}</span>
                        </div>
{

Array.isArray(
  selectedBooking?.amenities
) &&

selectedBooking.amenities
.length > 0 && (

<div className="modal-amenities">

  <h4>
    Additional Amenities
  </h4>

  {

    selectedBooking.amenities.map(
      (a, i) => (

      <div
        key={i}
        className="modal-amenity-item"
      >

        <span>
          ☕
        </span>

        <div>

          <strong>
            {a.title}
          </strong>

          <small>

            {a.persons}
            Person

            •

            ₹{a.total}

          </small>

        </div>

      </div>

    ))

  }

</div>

)}
                        <div className="workspace-added-strip">
                          Booking tracked in admin panel
                        </div>

                        <div className="workspace-actions-row">
                          <button type="button" className="action-light-btn">
                            Know More
                          </button>
                          <button type="button" className="action-green-btn">
                            View Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                          <span key={index} className="feature-pill">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "pricing" && (
                  <div className="workspace-info-grid">
                    <div className="info-card">
                      <span className="info-label">Price</span>
                      <strong>₹{selectedBooking.price || 0}</strong>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Duration</span>
                      <strong>{bookingDurationText(selectedBooking)}</strong>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Billing Type</span>
                      <strong>{billingType(selectedBooking)}</strong>
                    </div>

                    <div className="info-card">
                      <span className="info-label">Package</span>
                      <strong>{bookingPriceLabel}</strong>
                    </div>

                    <div className="info-card full">
                      <span className="info-label">Summary</span>
                      <p className="pricing-summary">
                        This workspace booking is priced at ₹{selectedBooking.price || 0} for{" "}
                        {bookingDurationText(selectedBooking)}. This preview helps admins inspect
                        the same booking card information in a clean and organized format.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="workspace-modal-footer">
                <div>
                  <span className="footer-title">{selectedBooking.workspace || "-"}</span>
                  <small>{selectedBooking.location || "-"}</small>
                </div>

                <div className="footer-actions">
                  <span className={`status footer-status ${getStatusClass(selectedBooking.status)}`}>
                    <span className="status-dot" />
                    {selectedBooking.status || "pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* helpers */
const AVATAR_PALETTE = [
  "#f4c430",
  "#38bdf8",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#fb923c",
];

function avatarBg(str = "") {
  let total = 0;
  for (let char of str) total += char.charCodeAt(0);
  return `${AVATAR_PALETTE[total % AVATAR_PALETTE.length]}22`;
}

function initials(name = "") {
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default AdminBookings;
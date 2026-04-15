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
    return [
      "1Gbps WiFi",
      "24/7 Access",
      "AC",
      "Backup Power",
      "Parking",
    ];
  }, [selectedBooking]);

  const bookingPriceLabel = useMemo(() => {
    if (!selectedBooking) return "";
    return selectedBooking.duration > 1 ? `${selectedBooking.duration}-Day` : "1-Day";
  }, [selectedBooking]);

  return (
    <div className="admin-bookings">
      <div className="header">
        <div>
          <p className="admin-badge">Admin Panel</p>
          <h2>Admin Booking Tracking</h2>
          <p className="admin-subtext">
            Monitor workspace bookings, review user details, and inspect card-style workspace information.
          </p>
        </div>

        <button onClick={fetchBookings} className="refresh" type="button">
          Refresh
        </button>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search owner / user / workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>pending</option>
          <option>confirmed</option>
          <option>cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <p className="loading">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-box">
          <h3>No bookings found</h3>
          <p>Try changing the search or filter to view more records.</p>
        </div>
      ) : (
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
                  <td>{item.owner || "-"}</td>
                  <td>{item.user || "-"}</td>
                  <td>{item.workspace || "-"}</td>
                  <td>{item.location || "-"}</td>
                  <td>{item.date || "-"}</td>
                  <td>{item.duration} day</td>
                  <td>₹{item.price}</td>
                  <td>
                    <span className={`status ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

              <div className="workspace-hero-gradient"></div>

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

            <div className="workspace-modal-body">
              <div className="workspace-tabs">
                <button
                  type="button"
                  className={`workspace-tab ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className={`workspace-tab ${activeTab === "features" ? "active" : ""}`}
                  onClick={() => setActiveTab("features")}
                >
                  Features
                </button>
                <button
                  type="button"
                  className={`workspace-tab ${activeTab === "pricing" ? "active" : ""}`}
                  onClick={() => setActiveTab("pricing")}
                >
                  Pricing
                </button>
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
                          <span key={index} className="feature-pill">
                            {feature}
                          </span>
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

            <div className="workspace-modal-footer">
              <div>
                <span className="footer-title">{selectedBooking.workspace}</span>
                <small>{selectedBooking.location}</small>
              </div>

              <div className="footer-actions">
                <span className={`status footer-status ${getStatusClass(selectedBooking.status)}`}>
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

export default AdminBookings;
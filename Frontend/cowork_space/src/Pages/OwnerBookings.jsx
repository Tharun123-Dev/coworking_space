import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/OwnerBookings.css";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    axiosInstance
      .get("cart/owner/bookings/")
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const confirmBooking = (id) => {
    axiosInstance.put(`cart/booking-confirm/${id}/`).then(() => {
      alert("Booking Confirmed ✅");
      fetchBookings();
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => ({ ...prev, status: "confirmed" }));
      }
    });
  };
const cancelBooking = async (item) => {
  try {
    // STEP 1: cancel booking
    await axiosInstance.put(`cart/booking-cancel/${item.id}/`);

    // STEP 2: REFUND (IMPORTANT)
    if (item.payment_id) {
      await axiosInstance.post("payment/refund/", {
        payment_id: item.payment_id
      });
    }

    alert("Booking Cancelled & Refund Initiated 💰");

    fetchBookings();

    if (selectedBooking?.id === item.id) {
      setSelectedBooking((prev) => ({ ...prev, status: "cancelled" }));
    }

  } catch (err) {
    console.log(err);
    alert("Cancel or Refund Failed");
  }
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

  const getStatusClass = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s === "confirmed") return "confirmed";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  return (
    <section className="owner-bookings-page">
      <div className="owner-bookings">
        <div className="owner-page-header">
          <div>
            <p className="owner-page-badge">Owner Dashboard</p>
            <h2>Booking Requests</h2>
            <p className="owner-page-subtext">
              Manage, review and respond to workspace booking requests from users.
            </p>
          </div>

          <div className="owner-header-stats">
            <span>{bookings.length}</span>
            <small>Total Requests</small>
          </div>
        </div>

        <div className="owner-booking-section">
          {loading ? (
            <div className="owner-loading-state">
              <div className="owner-loader-line"></div>
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="owner-empty-state">
              <h4>No bookings found</h4>
              <p>Booking requests will appear here when users book your workspace.</p>
            </div>
          ) : (
            <div className="owner-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>User</th>
                    <th>Workspace</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.workspace || "workspace"}
                          className="owner-booking-thumb"
                          onClick={() => handleImageClick(item)}
                        />
                      </td>

                      <td>{item.user}</td>
                      <td>{item.workspace}</td>
                      <td>{item.date}</td>
                      <td>{item.duration} day</td>
                      <td>₹{item.total_price}</td>

                      <td>
                        <span className={`owner-status ${getStatusClass(item.status)}`}>
                          {item.status === "pending" && "Pending"}
                          {item.status === "confirmed" && "Confirmed"}
                          {item.status === "cancelled" && "Cancelled"}
                        </span>
                      </td>

                      <td>
                        {item.status === "pending" ? (
                          <div className="owner-action-wrap">
                            <button
                              className="owner-action-btn confirm"
                              onClick={() => confirmBooking(item.id)}
                            >
                              Confirm
                            </button>
                         <button
  className="owner-action-btn cancel"
  onClick={() => cancelBooking(item)}
>
  Cancel
</button>
                          </div>
                        ) : item.status === "confirmed" ? (
                          <span className="owner-done confirmed">✅ Confirmed</span>
                        ) : (
                          <span className="owner-done cancelled">❌ Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedBooking && (
        <div className="landing-modal-overlay" onClick={closeModal}>
          <div className="landing-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="landing-close-btn"
              onClick={closeModal}
              type="button"
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="landing-hero-image-wrap">
              <img
                src={selectedBooking.image}
                alt={selectedBooking.workspace}
                className="landing-hero-image"
              />
              <div className="landing-hero-overlay"></div>

              <div className="landing-hero-content">
                <span className="landing-mini-chip">Premium Workspace</span>
                <h3>{selectedBooking.workspace}</h3>
                <p>
                  Booked by <strong>{selectedBooking.user}</strong> on {selectedBooking.date}
                </p>
              </div>
            </div>

            <div className="landing-modal-body">
              <div className="landing-tabs">
                <button
                  className={activeTab === "overview" ? "landing-tab active" : "landing-tab"}
                  onClick={() => setActiveTab("overview")}
                  type="button"
                >
                  Overview
                </button>

                <button
                  className={activeTab === "features" ? "landing-tab active" : "landing-tab"}
                  onClick={() => setActiveTab("features")}
                  type="button"
                >
                  Features
                </button>

                <button
                  className={activeTab === "pricing" ? "landing-tab active" : "landing-tab"}
                  onClick={() => setActiveTab("pricing")}
                  type="button"
                >
                  Pricing
                </button>
              </div>

              {activeTab === "overview" && (
                <div className="landing-detail-grid">
                  <div className="landing-detail-card">
                    <span className="landing-detail-label">Customer</span>
                    <strong>{selectedBooking.user}</strong>
                  </div>

                  <div className="landing-detail-card">
                    <span className="landing-detail-label">Date</span>
                    <strong>{selectedBooking.date}</strong>
                  </div>

                  <div className="landing-detail-card">
                    <span className="landing-detail-label">Duration</span>
                    <strong>{selectedBooking.duration} hrs</strong>
                  </div>

                  <div className="landing-detail-card">
                    <span className="landing-detail-label">Status</span>
                    <strong className={getStatusClass(selectedBooking.status)}>
                      {selectedBooking.status}
                    </strong>
                  </div>

                  <div className="landing-about-card full">
                    <h4>Booking Summary</h4>
                    <p>
                      This booking request is for <strong>{selectedBooking.workspace}</strong>. You
                      can review the customer request, verify the workspace schedule, and confirm
                      or cancel directly from this popup.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="landing-feature-grid">
                  <div className="landing-feature-box">
                    <span>⚡</span>
                    <h4>High-Speed WiFi</h4>
                    <p>Stable internet connection for work and meetings.</p>
                  </div>

                  <div className="landing-feature-box">
                    <span>🪑</span>
                    <h4>Modern Setup</h4>
                    <p>Comfortable workspace with desk and seating support.</p>
                  </div>

                  <div className="landing-feature-box">
                    <span>❄️</span>
                    <h4>Fully Air Conditioned</h4>
                    <p>Comfortable environment for daily productivity.</p>
                  </div>

                  <div className="landing-feature-box">
                    <span>☕</span>
                    <h4>Refreshments</h4>
                    <p>Tea, coffee and basic pantry access may be included.</p>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="landing-pricing-card">
                  <div className="landing-price-top">
                    <span className="landing-price-label">Booking Amount</span>
                    <h2>₹{selectedBooking.total_price}</h2>
                    <p>
                      For {selectedBooking.duration} hrs on {selectedBooking.date}
                    </p>
                  </div>

                  <div className="landing-price-points">
                    <div>✓ Workspace reserved for selected slot</div>
                    <div>✓ Owner approval based booking flow</div>
                    <div>✓ Direct management from dashboard</div>
                  </div>
                </div>
              )}
            </div>

            <div className="landing-modal-footer">
              <div className="landing-footer-left">
                <span className="landing-footer-price">₹{selectedBooking.total_price}</span>
                <small>Total Booking Value</small>
              </div>

              <div className="landing-footer-actions">
                {selectedBooking.status === "pending" && (
                  <>
                <button
  className="landing-footer-btn light"
  onClick={() => cancelBooking(selectedBooking)}
>
  Cancel
</button>
                    <button
                      className="landing-footer-btn dark"
                      onClick={() => confirmBooking(selectedBooking.id)}
                      type="button"
                    >
                      Confirm Booking
                    </button>
                  </>
                )}

                {selectedBooking.status === "confirmed" && (
                  <span className="owner-done confirmed">✅ Already Confirmed</span>
                )}

                {selectedBooking.status === "cancelled" && (
                  <span className="owner-done cancelled">❌ Already Cancelled</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OwnerBookings;
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/MyOrders.css";

function MyOrders() {
  const [showTicket, setShowTicket] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [ticketErrors, setTicketErrors] = useState({});
  const [tickets, setTickets] = useState([]);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [reason, setReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [ticket, setTicket] = useState({
    type: "",
    booking_id: "",
    special_id: "",
    issue_type: "",
    priority: "medium",
    subject: "",
    message: "",
  });

  const [orders, setOrders] = useState([]);
  const [special, setSpecial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecial, setLoadingSpecial] = useState(false);

  const [showWorkspaceDetails, setShowWorkspaceDetails] = useState(false);
  const [showSpecialDetails, setShowSpecialDetails] = useState(false);
  const [showSpecialInfo, setShowSpecialInfo] = useState(false);

  const [selectedWorkspaceCard, setSelectedWorkspaceCard] = useState(null);
  const [selectedSpecialCard, setSelectedSpecialCard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchOrders();
    fetchSpecial();
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    axiosInstance
      .get("leads/tickets/user/")
      .then((res) => setTickets(res.data || []))
      .catch(() => setTickets([]));
  };

  const fetchOrders = () => {
    setLoading(true);
    axiosInstance
      .get("cart/myorders/")
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const fetchSpecial = () => {
    setLoadingSpecial(true);
    axiosInstance
      .get("leads/special/user/")
      .then((res) => setSpecial(res.data || []))
      .catch(() => setSpecial([]))
      .finally(() => setLoadingSpecial(false));
  };

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "confirmed") return "confirmed";
  if (s === "cancelled") return "cancelled";
  if (s === "contacted") return "contacted";
  return "confirmed"; // default
};
const pendingOrdersForCancel = useMemo(() => {
  return orders.filter((item) => {
    const bookingStatus = String(item.status || "").toLowerCase();
    const paymentStatus = String(item.payment_status || "").toUpperCase();
    const cancelStatus = String(item.cancel_status || "").toUpperCase();

    const isConfirmed = bookingStatus === "confirmed";
    const notRefunded = paymentStatus !== "REFUNDED";
    const notCancelled = bookingStatus !== "cancelled";
    const noPendingCancelRequest = cancelStatus !== "PENDING";

    return isConfirmed && notRefunded && notCancelled && noPendingCancelRequest;
  });
}, [orders]);

  const selectedTicketBooking = useMemo(
    () => orders.find((o) => String(o.id) === String(ticket.booking_id)),
    [orders, ticket.booking_id]
  );

  const selectedTicketSpecial = useMemo(
    () => special.find((s) => String(s.id) === String(ticket.special_id)),
    [special, ticket.special_id]
  );

  const selectedCancelOrderData = useMemo(
    () =>
      pendingOrdersForCancel.find(
        (o) => String(o.id) === String(selectedOrder)
      ),
    [pendingOrdersForCancel, selectedOrder]
  );

  const resetTicketForm = () => {
    setTicket({
      type: "",
      booking_id: "",
      special_id: "",
      issue_type: "",
      priority: "medium",
      subject: "",
      message: "",
    });
    setTicketErrors({});
    setTicketSuccess("");
    setTicketSubmitting(false);
  };

  const openTicketModal = () => {
    resetTicketForm();
    setShowTicket(true);
  };

  const closeTicketModal = () => {
    setShowTicket(false);
    setTimeout(() => {
      resetTicketForm();
    }, 200);
  };

  const openCancelModal = () => {
    setShowCancel(true);
    setSelectedOrder(null);
    setReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    setShowCancel(false);
    setSelectedOrder(null);
    setReason("");
    setCancelError("");
    setCancelSubmitting(false);
  };

  const submitCancel = async () => {
    if (!selectedOrder) {
      setCancelError("Please select an order to cancel.");
      return;
    }

    if (!reason.trim()) {
      setCancelError("Please enter the cancellation reason.");
      return;
    }

    if (reason.trim().length < 8) {
      setCancelError("Reason should be at least 8 characters.");
      return;
    }

    try {
      setCancelSubmitting(true);
      setCancelError("");

      await axiosInstance.post("cart/booking/cancel-request/", {
        booking_id: selectedOrder,
        reason: reason.trim(),
      });

      alert("Cancel request sent to owner successfully");
      closeCancelModal();
      fetchOrders();
      fetchTickets();
    } catch {
      setCancelError("Failed to send cancel request. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;

    setTicket((prev) => {
      if (name === "type") {
        return {
          ...prev,
          type: value,
          booking_id: "",
          special_id: "",
        };
      }
      return { ...prev, [name]: value };
    });

    setTicketErrors((prev) => ({ ...prev, [name]: "" }));
    setTicketSuccess("");
  };

  const validateTicket = () => {
    const errors = {};

    if (!ticket.type) errors.type = "Please select ticket type";
    if (ticket.type === "booking" && !ticket.booking_id) {
      errors.booking_id = "Please select a booking";
    }
    if (ticket.type === "special" && !ticket.special_id) {
      errors.special_id = "Please select a special request";
    }
    if (!ticket.issue_type) errors.issue_type = "Please select issue category";

    if (!ticket.subject.trim()) {
      errors.subject = "Please enter ticket subject";
    } else if (ticket.subject.trim().length < 5) {
      errors.subject = "Subject should be at least 5 characters";
    }

    if (!ticket.message.trim()) {
      errors.message = "Please describe your issue";
    } else if (ticket.message.trim().length < 15) {
      errors.message = "Description should be at least 15 characters";
    }

    setTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitTicket = () => {
    if (!validateTicket()) return;

    setTicketSubmitting(true);

    const payload = {
      issue_type: ticket.issue_type,
      message: ticket.message,
      priority: ticket.priority,
      subject: ticket.subject,
    };

    if (ticket.type === "booking") {
      payload.booking_id = ticket.booking_id;
    }

    if (ticket.type === "special") {
      payload.special_id = ticket.special_id;
    }

    axiosInstance
      .post("leads/tickets/create/", payload)
      .then(() => {
        alert("Ticket raised successfully");
        setShowTicket(false);
        fetchTickets();
        resetTicketForm();
      })
      .catch(() => {
        alert("Error creating ticket");
      })
      .finally(() => {
        setTicketSubmitting(false);
      });
  };

  const handleWorkspaceImageClick = (item) => {
    const mappedWorkspace = {
      id: item.id,
      name: item.workspace || "Workspace",
      workspace: item.workspace || "Workspace",
      location: item.location || "-",
      city: item.city || "Hyderabad",
      area: item.area || item.location || "-",
      image:
        item.image ||
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
      rating: item.rating || 4.8,
      reviews: item.reviews || 120,
      price: item.price || item.total_price || 0,
      date: item.date || "-",
      duration: item.duration || 1,
      status: item.status || "pending",
      payment_status: item.payment_status || "PENDING",
      refund_amount: item.refund_amount || 0,
      cancel_status: item.cancel_status || "",
    };

    setSelectedWorkspaceCard(mappedWorkspace);
    setActiveTab("overview");
    setShowWorkspaceDetails(true);
  };

  const handleSpecialImageClick = (item) => {
    const mappedSpecial = {
      id: item.id,
      name: item.category || "Special Request",
      category: item.category || "Special Request",
      company: item.company || "",
      description: item.message || "Special workspace request details",
      message: item.message || "No message provided",
      image:
        item.image ||
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600",
      is_available: item.status?.toLowerCase() !== "cancelled",
      hourly_price: item.hourly_price || 199,
      daily_price: item.daily_price || 999,
      monthly_price: item.monthly_price || 19999,
      status: item.status || "pending",
    };

    setSelectedSpecialCard(mappedSpecial);
    setShowSpecialInfo(true);
  };

  return (
    <section className="myorders-page">
      <div className="myorders">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <p className="page-badge">My Dashboard</p>
              <h2>My Orders</h2>
              <p className="page-subtext">
                Track your workspace bookings and special workspace requests in one place.
              </p>
            </div>

            <button className="raise-ticket-btn" onClick={openTicketModal} type="button">
              <span className="raise-ticket-icon">🎫</span>
              <span>Raise Ticket</span>
            </button>
          </div>
        </div>

        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Workspace Bookings</h3>
            <span className="count-badge">{orders.length}</span>
          </div>

          {loading ? (
            <div className="table-loading-state">
              <div className="loader-line"></div>
              <p className="loading">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h4>No workspace bookings yet</h4>
              <p>Your confirmed  workspace bookings will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Workspace</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Refund Amount</th>
                    <th>Cancel Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((item) => {
                    const bookingStatus = String(item.status || "").toLowerCase();
                    const paymentStatus = String(item.payment_status || "").toUpperCase();

                    const isConfirmed = bookingStatus === "confirmed";
                    const isCancelled = bookingStatus === "cancelled";
                    const isRefunded = paymentStatus === "REFUNDED";

                    return (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={item.image}
                            alt="workspace"
                            onClick={() => handleWorkspaceImageClick(item)}
                            style={{
                              width: "70px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          />
                        </td>
                        <td>{item.workspace}</td>
                        <td>{item.location}</td>
                        <td>{item.date}</td>
                        <td>{item.duration} day</td>
                        <td>₹{item.price || item.total_price}</td>

                        <td>
                          <span className={`status ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>

                        <td>
  {isRefunded ? (
    <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
      💰 Refunded
    </span>
  ) : (
    <span style={{ color: "#00C853", fontWeight: "bold" }}>
      ✅ Paid
    </span>
  )}
</td>

                        <td>
                          {isRefunded ? (
                            <span style={{ color: "#FF9800", fontWeight: "bold" }}>
                              ₹{item.refund_amount || 0}
                            </span>
                          ) : isConfirmed ? (
                            <span style={{ color: "#2196F3", fontWeight: "bold" }}>
                              No Refund
                            </span>
                          ) : isCancelled ? (
                            <span style={{ color: "#9E9E9E", fontWeight: "bold" }}>
                              Pending Refund
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>
                          {item.cancel_status === "PENDING" ? (
                            <span style={{ color: "#ff9800", fontWeight: "bold" }}>
                              ⏳ Cancel Requested
                            </span>
                          ) : item.status === "cancelled" && item.payment_status === "REFUNDED" ? (
                            <span style={{ color: "red", fontWeight: "bold" }}>
                              ❌ Cancelled & 💰 Refunded ₹{item.refund_amount || 0}
                            </span>
                          ) : item.status === "confirmed" ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                              ✅ Active Booking
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="orders-section">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
            <button
              onClick={openCancelModal}
              style={{
                background: "#fff5f5",
                color: "#ff4d4f",
                border: "1px solid #ffb3b3",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(255, 77, 79, 0.18)",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "12px 18px",
                transition: "all 0.3s ease",
              }}
            >
              I want to cancel my order
            </button>
          </div>

          <div className="section-header">
            <h3 className="section-title">Support Tickets</h3>
            <span className="count-badge">{tickets.length}</span>
          </div>

          {tickets.length === 0 ? (
            <div className="empty-state">
              <h4>No tickets raised</h4>
              <p>Your support tickets will appear here</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Workspace / Category</th>
                    <th>Location</th>
                    <th>Booking Status</th>
                    <th>Date</th>
                    <th>Issue</th>
                    <th>Ticket Status</th>
                    <th>Admin Note</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.image ? (
                          <img
                            src={t.image}
                            alt="workspace"
                            style={{
                              width: "60px",
                              height: "45px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60";
                            }}
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        {t.workspace !== "-" ? (
                          <>
                            <strong>{t.workspace}</strong>
                            <div style={{ fontSize: "12px", color: "#aaa" }}>Workspace</div>
                          </>
                        ) : (
                          <>
                            <strong>{t.category}</strong>
                            <div style={{ fontSize: "12px", color: "#aaa" }}>Category</div>
                          </>
                        )}
                      </td>

                      <td>{t.location || "-"}</td>

                      <td>
                        <span className={`status ${getStatusClass(t.booking_status)}`}>
                          {t.booking_status || "-"}
                        </span>
                      </td>

                      <td>{t.date || "-"}</td>

                      <td style={{ textTransform: "capitalize" }}>
                        {t.issue_type || "-"}
                      </td>

                      <td>
                        <span className={`status ${getStatusClass(t.ticket_status)}`}>
                          {t.ticket_status || "-"}
                        </span>
                      </td>

                      <td>
                        {t.admin_note && t.admin_note !== "-" ? (
                          t.admin_note
                        ) : (
                          <span style={{ color: "#888" }}>Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Special Workspace Requests</h3>
            <span className="count-badge">{special.length}</span>
          </div>

          {loadingSpecial ? (
            <div className="table-loading-state">
              <div className="loader-line"></div>
              <p className="loading">Loading requests...</p>
            </div>
          ) : special.length === 0 ? (
            <div className="empty-state">
              <h4>No special requests yet</h4>
              <p>Your submitted special workspace requests will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Category</th>
                    <th>Company</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {special.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.image}
                          alt="workspace"
                          onClick={() => handleSpecialImageClick(item)}
                          style={{
                            width: "70px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td>{item.category}</td>
                      <td>{item.company || "-"}</td>
                      <td className="message-cell">{item.message || "-"}</td>
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
        </div>
      </div>

      {showCancel && (
        <div className="ticket-modal-overlay" onClick={closeCancelModal}>
          <div
            className="ticket-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "980px" }}
          >
            <div className="ticket-modal-top">
              <div>
                <p className="ticket-mini-badge">Cancel Booking</p>
                <h3>Request Order Cancellation</h3>
                <p className="ticket-subtext">
                  Only confirm bookings are shown here for cancellation.
                </p>
              </div>

              <button
                className="ticket-close-btn"
                onClick={closeCancelModal}
                type="button"
                aria-label="Close cancel modal"
              >
                ✕
              </button>
            </div>

            <div className="ticket-live-strip">
              <span className="live-dot"></span>
              <span>Booking cancellation support</span>
              <span className="ticket-live-sep"></span>
              <span>Confirmed, refunded, cancelled, and requested bookings are hidden</span>
            </div>

            {cancelError && <div className="ticket-error-box">{cancelError}</div>}

            <div style={{ marginTop: "18px" }}>
              <h4 style={{ marginBottom: "14px", color: "#1f2937" }}>Pending Booking List</h4>

              {pendingOrdersForCancel.length === 0 ? (
                <div className="empty-state">
                  <h4>No pending orders available</h4>
                  <p>
                    Only pending bookings that are not refunded and not already
                    cancel-requested are shown here.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    maxHeight: "320px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {pendingOrdersForCancel.map((item) => {
                    const isSelected = String(selectedOrder) === String(item.id);

                    return (
                      <label
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "24px 84px 1fr",
                          alignItems: "center",
                          gap: "14px",
                          padding: "14px",
                          borderRadius: "16px",
                          border: isSelected ? "2px solid #0f766e" : "1px solid #e5e7eb",
                          background: isSelected ? "#f0fdfa" : "#fff",
                          cursor: "pointer",
                          boxShadow: isSelected
                            ? "0 8px 20px rgba(15, 118, 110, 0.12)"
                            : "0 4px 12px rgba(15, 23, 42, 0.06)",
                        }}
                      >
                        <input
                          type="radio"
                          name="cancelOrder"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedOrder(item.id);
                            setCancelError("");
                          }}
                        />

                        <img
                          src={item.image}
                          alt={item.workspace}
                          style={{
                            width: "84px",
                            height: "64px",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />

                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                              flexWrap: "wrap",
                              marginBottom: "8px",
                            }}
                          >
                            <strong style={{ fontSize: "16px", color: "#111827" }}>
                              {item.workspace}
                            </strong>
                            <strong style={{ color: "#0f766e" }}>
                              ₹{item.price || item.total_price}
                            </strong>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                              gap: "8px 14px",
                              fontSize: "14px",
                              color: "#4b5563",
                            }}
                          >
                            <span><strong>Date:</strong> {item.date || "-"}</span>
                            <span><strong>Location:</strong> {item.location || "-"}</span>
                            <span><strong>Duration:</strong> {item.duration || 1} day</span>
                            <span><strong>Status:</strong> {item.status || "-"}</span>
                            <span><strong>Payment:</strong> {item.payment_status || "PENDING"}</span>
                            <span><strong>Cancel:</strong> Available to request</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCancelOrderData && (
              <div className="ticket-summary-card full" style={{ marginTop: "18px" }}>
                <div className="ticket-summary-title">Selected Booking Details</div>
                <div className="ticket-summary-grid">
                  <div>
                    <span className="summary-label">Workspace</span>
                    <strong>{selectedCancelOrderData.workspace || "-"}</strong>
                  </div>
                  <div>
                    <span className="summary-label">Location</span>
                    <strong>{selectedCancelOrderData.location || "-"}</strong>
                  </div>
                  <div>
                    <span className="summary-label">Date</span>
                    <strong>{selectedCancelOrderData.date || "-"}</strong>
                  </div>
                  <div>
                    <span className="summary-label">Duration</span>
                    <strong>{selectedCancelOrderData.duration || 1} day</strong>
                  </div>
                  <div>
                    <span className="summary-label">Amount</span>
                    <strong>
                      ₹{selectedCancelOrderData.price || selectedCancelOrderData.total_price || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="summary-label">Booking Status</span>
                    <strong>{selectedCancelOrderData.status || "-"}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="ticket-field full" style={{ marginTop: "18px" }}>
              <label>Cancellation Reason</label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setCancelError("");
                }}
                placeholder="Explain why you want to cancel this booking..."
                rows="5"
                className={cancelError ? "field-error" : ""}
              />
              <div className="ticket-text-meta">
                <span className="helper-text">
                  Add a clear reason so the owner can review the request quickly.
                </span>
                <span className="char-count">{reason.length}/500</span>
              </div>
            </div>

            <div className="ticket-actions">
              <button className="ticket-btn ticket-btn-light" onClick={closeCancelModal} type="button">
                Close
              </button>

              <button
                className={`ticket-btn ticket-btn-primary ${cancelSubmitting ? "is-loading" : ""}`}
                onClick={submitCancel}
                type="button"
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? "Submitting..." : "Submit Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTicket && (
        <div className="ticket-modal-overlay" onClick={closeTicketModal}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-modal-top">
              <div>
                <p className="ticket-mini-badge">Support Desk</p>
                <h3>Raise Support Ticket</h3>
                <p className="ticket-subtext">
                  Share the issue clearly and we will help you faster.
                </p>
              </div>

              <button
                className="ticket-close-btn"
                onClick={closeTicketModal}
                type="button"
                aria-label="Close ticket modal"
              >
                ✕
              </button>
            </div>

            <div className="ticket-live-strip">
              <span className="live-dot"></span>
              <span>Support desk online</span>
              <span className="ticket-live-sep"></span>
              <span>Typical response in 12–24 hrs</span>
            </div>

            {ticketSuccess && <div className="ticket-success-box">{ticketSuccess}</div>}
            {ticketErrors.submit && <div className="ticket-error-box">{ticketErrors.submit}</div>}

            <div className="ticket-form-grid">
              <div className="ticket-field full">
                <label>Ticket Type</label>
                <select
                  name="type"
                  value={ticket.type}
                  onChange={handleTicketChange}
                  className={ticketErrors.type ? "field-error" : ""}
                >
                  <option value="">Select Type</option>
                  <option value="booking">Workspace Booking</option>
                  <option value="special">Special Request</option>
                </select>
                {ticketErrors.type && <span className="error-text">{ticketErrors.type}</span>}
              </div>

              {ticket.type === "booking" && (
                <div className="ticket-field full">
                  <label>Select Booking</label>
                  <select
                    name="booking_id"
                    value={ticket.booking_id}
                    onChange={handleTicketChange}
                    className={ticketErrors.booking_id ? "field-error" : ""}
                  >
                    <option value="">Select Booking</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.workspace} - {o.location} - {o.date}
                      </option>
                    ))}
                  </select>
                  {ticketErrors.booking_id && (
                    <span className="error-text">{ticketErrors.booking_id}</span>
                  )}
                </div>
              )}

              {ticket.type === "special" && (
                <div className="ticket-field full">
                  <label>Select Special Request</label>
                  <select
                    name="special_id"
                    value={ticket.special_id}
                    onChange={handleTicketChange}
                    className={ticketErrors.special_id ? "field-error" : ""}
                  >
                    <option value="">Select Request</option>
                    {special.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.category} {s.company ? `- ${s.company}` : ""}
                      </option>
                    ))}
                  </select>
                  {ticketErrors.special_id && (
                    <span className="error-text">{ticketErrors.special_id}</span>
                  )}
                </div>
              )}

              {(selectedTicketBooking || selectedTicketSpecial) && (
                <div className="ticket-summary-card full">
                  <div className="ticket-summary-title">Selected Reference</div>

                  {selectedTicketBooking && (
                    <div className="ticket-summary-grid">
                      <div>
                        <span className="summary-label">Workspace</span>
                        <strong>{selectedTicketBooking.workspace}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Location</span>
                        <strong>{selectedTicketBooking.location}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Date</span>
                        <strong>{selectedTicketBooking.date}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Status</span>
                        <strong>{selectedTicketBooking.status}</strong>
                      </div>
                    </div>
                  )}

                  {selectedTicketSpecial && (
                    <div className="ticket-summary-grid">
                      <div>
                        <span className="summary-label">Category</span>
                        <strong>{selectedTicketSpecial.category}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Company</span>
                        <strong>{selectedTicketSpecial.company || "-"}</strong>
                      </div>
                      <div className="full">
                        <span className="summary-label">Message</span>
                        <strong>{selectedTicketSpecial.message || "-"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="ticket-field">
                <label>Issue Type</label>
                <select
                  name="issue_type"
                  value={ticket.issue_type}
                  onChange={handleTicketChange}
                  className={ticketErrors.issue_type ? "field-error" : ""}
                >
                  <option value="">Select Issue</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="refund">Refund Issue</option>
                  <option value="technical">Technical Issue</option>
                  <option value="cancel">Cancel Booking</option>
                  <option value="modify">Modify Booking</option>
                  <option value="pricing">Pricing Issue</option>
                  <option value="availability">Availability</option>
                  <option value="other">Other</option>
                </select>
                {ticketErrors.issue_type && (
                  <span className="error-text">{ticketErrors.issue_type}</span>
                )}
              </div>

              <div className="ticket-field">
                <label>Priority</label>
                <select
                  name="priority"
                  value={ticket.priority}
                  onChange={handleTicketChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="ticket-field full">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleTicketChange}
                  placeholder="Example: Need to reschedule my booking"
                  className={ticketErrors.subject ? "field-error" : ""}
                />
                {ticketErrors.subject && (
                  <span className="error-text">{ticketErrors.subject}</span>
                )}
              </div>

              <div className="ticket-field full">
                <label>Describe Your Issue</label>
                <textarea
                  name="message"
                  value={ticket.message}
                  onChange={handleTicketChange}
                  placeholder="Explain the issue in detail so the support team can help you quickly..."
                  rows="5"
                  className={ticketErrors.message ? "field-error" : ""}
                />
                <div className="ticket-text-meta">
                  {ticketErrors.message ? (
                    <span className="error-text">{ticketErrors.message}</span>
                  ) : (
                    <span className="helper-text">Add clear details for faster support.</span>
                  )}
                  <span className="char-count">{ticket.message.length}/500</span>
                </div>
              </div>
            </div>

            <div className="ticket-actions">
              <button className="ticket-btn ticket-btn-light" onClick={closeTicketModal} type="button">
                Cancel
              </button>
              <button
                className={`ticket-btn ticket-btn-primary ${ticketSubmitting ? "is-loading" : ""}`}
                onClick={submitTicket}
                type="button"
                disabled={ticketSubmitting}
              >
                {ticketSubmitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWorkspaceDetails && selectedWorkspaceCard && (
        <div className="hyd-details-overlay" onClick={() => setShowWorkspaceDetails(false)}>
          <div className="hyd-details-panel" onClick={(e) => e.stopPropagation()}>
            <div className="hyd-details-hero">
              <img
                src={selectedWorkspaceCard.image}
                alt={selectedWorkspaceCard.name}
                className="hyd-details-hero-img"
              />
              <div className="hyd-details-hero-grad"></div>
              <button
                className="hyd-details-close"
                onClick={() => setShowWorkspaceDetails(false)}
              >
                ✕
              </button>

              <div className="hyd-details-hero-badges">
                <span className="hyd-badge">1-Day Booking</span>
                <span className="hyd-badge">Hyderabad</span>
                <span className="hyd-badge">⭐ {selectedWorkspaceCard.rating}</span>
              </div>

              <div className="hyd-details-hero-info">
                <h2>{selectedWorkspaceCard.name}</h2>
                <p>
                  {selectedWorkspaceCard.location}, {selectedWorkspaceCard.city}
                </p>
              </div>
            </div>

            <div className="hyd-details-tabs">
              {["overview", "amenities", "pricing", "map"].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "hyd-tab active" : "hyd-tab"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="hyd-details-body">
              {activeTab === "overview" && (
                <div className="hyd-tab-content">
                  <div className="hyd-stats-grid">
                    {[
                      { icon: "📶", val: "1 Gbps", lbl: "WiFi Speed" },
                      { icon: "🕒", val: "24/7", lbl: "Access" },
                      { icon: "💺", val: "50+", lbl: "Seats" },
                      { icon: "⭐", val: selectedWorkspaceCard.rating, lbl: "Rating" },
                    ].map((s) => (
                      <div key={s.lbl} className="hyd-stat-card">
                        <span className="hyd-stat-icon">{s.icon}</span>
                        <span className="hyd-stat-val">{s.val}</span>
                        <span className="hyd-stat-lbl">{s.lbl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="hyd-details-section">
                    <h4>About This Space</h4>
                    <p>
                      A premium Hyderabad coworking experience designed for productivity and growth.
                      Located near {selectedWorkspaceCard.location}, this workspace supports focused
                      work, fast internet, comfortable seating, and flexible day booking.
                    </p>
                  </div>

                  <div className="hyd-details-section">
                    <h4>Location Details</h4>
                    <div className="hyd-location-card">
                      <div className="hyd-location-row">
                        <span>Workspace</span>
                        <span>{selectedWorkspaceCard.name}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Address</span>
                        <span>{selectedWorkspaceCard.location}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>City</span>
                        <span>{selectedWorkspaceCard.city}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Date</span>
                        <span>{selectedWorkspaceCard.date}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Status</span>
                        <span>{selectedWorkspaceCard.status}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Payment</span>
                        <span>{selectedWorkspaceCard.payment_status}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Refund Amount</span>
                        <span>₹{selectedWorkspaceCard.refund_amount || 0}</span>
                      </div>
                      <div className="hyd-location-row">
                        <span>Cancel Request</span>
                        <span>{selectedWorkspaceCard.cancel_status || "Not Requested"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "amenities" && (
                <div className="hyd-tab-content">
                  <div className="hyd-amenities-grid">
                    {[
                      { icon: "📶", label: "1Gbps Fiber WiFi", desc: "Lightning-fast connectivity" },
                      { icon: "🏢", label: "Meeting Rooms", desc: "Free for all members" },
                      { icon: "🕒", label: "24/7 Access", desc: "Round the clock entry" },
                      { icon: "🔋", label: "Power Backup", desc: "100% uptime guaranteed" },
                      { icon: "☕", label: "Cafeteria", desc: "Tea, coffee & snacks" },
                      { icon: "🖨️", label: "Printer & Scanner", desc: "High-speed machines" },
                      { icon: "🅿️", label: "Free Parking", desc: "Dedicated 2W / 4W" },
                      { icon: "❄️", label: "AC Workspace", desc: "Temperature controlled" },
                    ].map((a) => (
                      <div key={a.label} className="hyd-amenity-card">
                        <span className="hyd-amenity-emoji">{a.icon}</span>
                        <div>
                          <p className="hyd-amenity-label">{a.label}</p>
                          <p className="hyd-amenity-desc">{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="hyd-tab-content">
                  <div className="hyd-pricing-hero">
                    <div className="hyd-pricing-badge">1-Day Plan</div>
                    <div className="hyd-pricing-amount">
                      <span>₹</span>
                      <span>{selectedWorkspaceCard.price}</span>
                      <span>/day</span>
                    </div>
                    <p>Booking date: {selectedWorkspaceCard.date}</p>
                  </div>

                  <div className="hyd-pricing-includes">
                    <h4>What's Included</h4>
                    {[
                      "Full-day hot desk access",
                      "Unlimited high-speed WiFi",
                      "Meeting support access",
                      "Tea & coffee",
                      "Common area access",
                      "Power backup & AC",
                    ].map((item) => (
                      <div key={item} className="hyd-include-row">
                        <span>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "map" && (
                <div className="hyd-tab-content">
                  <div className="hyd-map-placeholder">
                    <div className="hyd-map-pin">📍</div>
                    <h4>{selectedWorkspaceCard.name}</h4>
                    <p>
                      {selectedWorkspaceCard.location}, {selectedWorkspaceCard.city}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        `${selectedWorkspaceCard.location}, ${selectedWorkspaceCard.city}, Hyderabad`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="hyd-details-footer">
              <div className="hyd-footer-price">
                <span>₹{selectedWorkspaceCard.price}</span>
                <span>/day</span>
              </div>
              <button className="hyd-footer-btn" type="button">
                Booked Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {showSpecialInfo && selectedSpecialCard && (
        <div className="special-popup-overlay" onClick={() => setShowSpecialInfo(false)}>
          <div className="special-popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="special-popup-image">
              <img src={selectedSpecialCard.image} alt={selectedSpecialCard.name} />
              <div className="special-popup-image-overlay"></div>
              <h2 className="special-popup-image-title">{selectedSpecialCard.name}</h2>

              <div className="special-popup-badges">
                <span className="special-popup-badge">Special</span>
                <span className="special-popup-badge">
                  {selectedSpecialCard.is_available ? "Available" : "Not Available"}
                </span>
              </div>

              <button
                className="special-popup-close"
                onClick={() => setShowSpecialInfo(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="special-popup-body">
              <button className="special-back-btn" onClick={() => setShowSpecialInfo(false)}>
                Back
              </button>

              <div className="special-popup-meta">
                <span>{selectedSpecialCard.company || "No company"}</span>
                <span>{selectedSpecialCard.category}</span>
                <span className="special-popup-price">₹{selectedSpecialCard.daily_price}/day</span>
              </div>

              <p className="special-popup-desc">{selectedSpecialCard.description}</p>

              <div className="special-pricing-section">
                <div className="special-price-item">
                  <span className="special-price-label">Hourly</span>
                  <span className="special-price-value">₹{selectedSpecialCard.hourly_price}</span>
                </div>
                <div className="special-price-item">
                  <span className="special-price-label">Daily</span>
                  <span className="special-price-value">₹{selectedSpecialCard.daily_price}</span>
                </div>
                <div className="special-price-item">
                  <span className="special-price-label">Monthly</span>
                  <span className="special-price-value">₹{selectedSpecialCard.monthly_price}</span>
                </div>
              </div>

              <div className="special-features">
                {[
                  "Flexible custom request",
                  "Workspace matching support",
                  "Dedicated response tracking",
                  "Premium setup options",
                  "Business-ready environment",
                  "Support follow-up available",
                ].map((f) => (
                  <div key={f} className="special-feature">
                    {f}
                  </div>
                ))}
              </div>

              <div className="special-message-box">
                <h4>Request Message</h4>
                <p>{selectedSpecialCard.message}</p>
              </div>

              <div className="special-popup-actions">
                <button
                  className="special-popup-details-btn"
                  onClick={() => {
                    setShowSpecialInfo(false);
                    setShowSpecialDetails(true);
                  }}
                >
                  View Full Details
                </button>
                <button className="special-popup-book-btn">
                  Current Status: {selectedSpecialCard.status}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSpecialDetails && selectedSpecialCard && (
        <div className="hyd-details-overlay" onClick={() => setShowSpecialDetails(false)}>
          <div
            className="hyd-details-panel special-details-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hyd-details-hero">
              <img
                src={selectedSpecialCard.image}
                alt={selectedSpecialCard.name}
                className="hyd-details-hero-img"
              />
              <div className="hyd-details-hero-grad"></div>
              <button
                className="hyd-details-close"
                onClick={() => setShowSpecialDetails(false)}
              >
                ✕
              </button>

              <div className="hyd-details-hero-info">
                <h2>{selectedSpecialCard.name}</h2>
                <p>{selectedSpecialCard.company || "Special workspace request"}</p>
              </div>
            </div>

            <div className="hyd-details-body">
              <div className="hyd-details-section">
                <h4>Request Overview</h4>
                <p>{selectedSpecialCard.message}</p>
              </div>

              <div className="hyd-pricing-includes">
                <h4>Pricing Details</h4>
                <div className="hyd-include-row">
                  <span>✓</span>
                  <span>Hourly Price: ₹{selectedSpecialCard.hourly_price}</span>
                </div>
                <div className="hyd-include-row">
                  <span>✓</span>
                  <span>Daily Price: ₹{selectedSpecialCard.daily_price}</span>
                </div>
                <div className="hyd-include-row">
                  <span>✓</span>
                  <span>Monthly Price: ₹{selectedSpecialCard.monthly_price}</span>
                </div>
                <div className="hyd-include-row">
                  <span>✓</span>
                  <span>Status: {selectedSpecialCard.status}</span>
                </div>
              </div>
            </div>

            <div className="hyd-details-footer">
              <div className="hyd-footer-price">
                <span>₹{selectedSpecialCard.daily_price}</span>
                <span>/day</span>
              </div>
              <button className="hyd-footer-btn" type="button">
                Special Request Opened
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MyOrders;
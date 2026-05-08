import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/MyOrders.css";
import Footer from "../Components/Footer";

const MOBILE_BREAKPOINT = 768;

function MyOrders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("orders");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

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
    issue_type: "",
    priority: "medium",
    subject: "",
    message: "",
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showWorkspaceDetails, setShowWorkspaceDetails] = useState(false);
  const [selectedWorkspaceCard, setSelectedWorkspaceCard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchOrders();
    fetchTickets();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobileView(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
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

  const getStatusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "confirmed") return "confirmed";
    if (s === "cancelled") return "cancelled";
    if (s === "contacted") return "contacted";
    return "confirmed";
  };

  const pendingOrdersForCancel = useMemo(() => {
    return orders.filter((item) => {
      const bookingStatus = String(item.status || "").toLowerCase();
      const paymentStatus = String(item.payment_status || "").toUpperCase();
      const cancelStatus = String(item.cancel_status || "").toUpperCase();

      return (
        bookingStatus === "confirmed" &&
        paymentStatus !== "REFUNDED" &&
        bookingStatus !== "cancelled" &&
        cancelStatus !== "PENDING"
      );
    });
  }, [orders]);

  const selectedTicketBooking = useMemo(
    () => orders.find((o) => String(o.id) === String(ticket.booking_id)),
    [orders, ticket.booking_id]
  );

  const selectedCancelOrderData = useMemo(
    () => pendingOrdersForCancel.find((o) => String(o.id) === String(selectedOrder)),
    [pendingOrdersForCancel, selectedOrder]
  );

  const resetTicketForm = () => {
    setTicket({
      type: "",
      booking_id: "",
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
    setSidebarOpen(false);
  };

  const closeTicketModal = () => {
    setShowTicket(false);
    setTimeout(resetTicketForm, 200);
  };

  const openCancelModal = () => {
    setShowCancel(true);
    setSelectedOrder(null);
    setReason("");
    setCancelError("");
    setSidebarOpen(false);
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
    } catch (error) {
      setCancelError("Failed to send cancel request. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;

    setTicket((prev) =>
      name === "type" ? { ...prev, type: value, booking_id: "" } : { ...prev, [name]: value }
    );

    setTicketErrors((prev) => ({ ...prev, [name]: "" }));
    setTicketSuccess("");
  };

  const validateTicket = () => {
    const errors = {};

    if (!ticket.type) errors.type = "Please select ticket type";
    if (ticket.type === "booking" && !ticket.booking_id) errors.booking_id = "Please select a booking";
    if (!ticket.issue_type) errors.issue_type = "Please select issue category";

    if (!ticket.subject.trim()) errors.subject = "Please enter ticket subject";
    else if (ticket.subject.trim().length < 5) errors.subject = "Subject should be at least 5 characters";

    if (!ticket.message.trim()) errors.message = "Please describe your issue";
    else if (ticket.message.trim().length < 15) errors.message = "Description should be at least 15 characters";

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

    axiosInstance
      .post("leads/tickets/create/", payload)
      .then(() => {
        alert("Ticket raised successfully");
        setShowTicket(false);
        fetchTickets();
        resetTicketForm();
      })
      .catch(() => alert("Error creating ticket"))
      .finally(() => setTicketSubmitting(false));
  };

  const handleWorkspaceImageClick = (item) => {
    setSelectedWorkspaceCard({
      id: item.id,
      name: item.workspace || "Workspace",
      workspace: item.workspace || "Workspace",
      location: item.location || "-",
      amenities:
item.amenities || [],
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
    });
    setActiveTab("overview");
    setShowWorkspaceDetails(true);
  };

  const navItems = [
    { id: "orders", label: "My Orders", icon: "📦", count: orders.length },
    { id: "tickets", label: "Support Tickets", icon: "🎫", count: tickets.length },
  ];

  const renderOrdersDesktop = () => (
    <div className="mo-table-wrap">
      <div className="mo-table-scroll">
        <table className="mo-table">
          <thead>
            <tr>
              <th>Space</th>
              <th>Location</th>
              <th>Date</th>
              <th>Slot</th>
              
              <th>Additional Amenities</th>
              <th>Status</th>
              <th> Total Price</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => {
              const paymentStatus = String(item.payment_status || "").toUpperCase();
              const isRefunded = paymentStatus === "REFUNDED";

              return (
                <tr key={item.id}>
                  <td>
                    <div className="mo-workspace-cell">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.workspace}
                          className="mo-thumb"
                          onClick={() => handleWorkspaceImageClick(item)}
                        />
                      ) : (
                        <div className="mo-thumb mo-thumb--empty">?</div>
                      )}
                      <div>
                        <div className="mo-ws-name">{item.workspace}</div>
                        <div className="mo-ws-sub">Workspace</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mo-location">{item.city || item.location || "-"}</span></td>
                  <td><span className="mo-date">{item.date || "-"}</span></td>
                  <td>
                    <span className="mo-slot">
                      {item.booking_type === "month"
                        ? "📅 Monthly"
                        : item.slot_type === "Hourly"
                        ? item.slot_time
                        : "Full Day"}
                    </span>
                  </td>
        
                  <td>

  {

    item.amenities?.length > 0

    ?

    item.amenities.map(
      (a, i) => (

      <div
        key={i}
        className="mo-amenityRow"
      >

        {a.title}

        •

        {a.persons} Person

        •

        ₹{a.total}

      </div>

    ))

    :

    "-"

  }

</td>
                  <td>
                    <span className={`mo-status mo-status--${getStatusClass(item.status)}`}>
                      {item.status || "-"}
                    </span>
                  </td>
                            <td><span className="mo-price">₹{item.price || item.total_price || 0}</span></td>
                  <td>
                    {isRefunded ? (
                      <span className="mo-payment mo-payment--refunded">💰 Refunded</span>
                    ) : (
                      <span className="mo-payment mo-payment--paid">✅ Paid</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrdersMobile = () => (
    <div className="mo-mobile-cards">
      {orders.map((item) => {
        const paymentStatus = String(item.payment_status || "").toUpperCase();
        const isRefunded = paymentStatus === "REFUNDED";

        return (
          <div className="mo-order-card" key={item.id}>
            <div className="mo-order-card-top">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.workspace}
                  className="mo-order-card-img"
                  onClick={() => handleWorkspaceImageClick(item)}
                />
              ) : (
                <div className="mo-order-card-img mo-thumb--empty">?</div>
              )}

              <div className="mo-order-card-info">
                <div className="mo-order-card-name">{item.workspace}</div>
                <div className="mo-order-card-city">{item.city || item.location || "-"}</div>
                <div className="mo-order-card-date">{item.date || "-"}</div>
              </div>

              <div className="mo-order-card-price">
                ₹{item.price || item.total_price || 0}
              </div>
            </div>

            <div className="mo-order-card-bottom">
              <span className="mo-slot">
                {item.booking_type === "month"
                  ? "📅 Monthly"
                  : item.slot_type === "Hourly"
                  ? item.slot_time
                  : "Full Day"}
              </span>

              <span className={`mo-status mo-status--${getStatusClass(item.status)}`}>
                {item.status || "-"}
              </span>

              {isRefunded ? (
                <span className="mo-payment mo-payment--refunded">💰 Refunded</span>
              ) : (
                <span className="mo-payment mo-payment--paid">✅ Paid</span>
              )}
            </div>
            {item.amenities?.length > 0 && (

  <div className="mo-mobileAmenities">

    {item.amenities.map(
      (a, i) => (

      <div
        key={i}
        className="mo-mobileAmenity"
      >

        {a.title}

        •

        {a.persons} Person

        •

        ₹{a.total}

      </div>

    ))}

  </div>

)}
          </div>
        );
      })}
    </div>
  );

  const renderTicketsDesktop = () => (
    <div className="mo-table-wrap">
      <div className="mo-table-scroll">
        <table className="mo-table mo-table--tickets">
          <thead>
            <tr>
              <th>Space</th>
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
                  <div className="mo-workspace-cell">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.workspace || "workspace"}
                        className="mo-thumb"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/60";
                        }}
                      />
                    ) : (
                      <div className="mo-thumb mo-thumb--empty">?</div>
                    )}
                    <div>
                      <div className="mo-ws-name">{t.workspace !== "-" ? t.workspace : t.category}</div>
                      <div className="mo-ws-sub">
                        {t.workspace !== "-" ? "Workspace" : "Category"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{t.location || "-"}</td>
                <td>
                  <span className={`mo-status mo-status--${getStatusClass(t.booking_status)}`}>
                    {t.booking_status || "-"}
                  </span>
                </td>
                <td>{t.date || "-"}</td>
                <td style={{ textTransform: "capitalize" }}>{t.issue_type || "-"}</td>
                <td>
                  <span className={`mo-status mo-status--${getStatusClass(t.ticket_status)}`}>
                    {t.ticket_status || "-"}
                  </span>
                </td>
                <td>
                  {t.admin_note && t.admin_note !== "-" ? (
                    t.admin_note
                  ) : (
                    <span className="mo-pending-note">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTicketsMobile = () => (
    <div className="mo-mobile-cards">
      {tickets.map((t) => (
        <div className="mo-order-card" key={t.id}>
          <div className="mo-order-card-top">
            {t.image ? (
              <img
                src={t.image}
                alt={t.workspace || "workspace"}
                className="mo-order-card-img"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/60";
                }}
              />
            ) : (
              <div className="mo-order-card-img mo-thumb--empty">?</div>
            )}

            <div className="mo-order-card-info">
              <div className="mo-order-card-name">
                {t.workspace !== "-" ? t.workspace : t.category}
              </div>
              <div className="mo-order-card-city">{t.location || "-"}</div>
              <div className="mo-order-card-date">{t.date || "-"}</div>
            </div>
          </div>

          <div className="mo-order-card-bottom">
            <span className={`mo-status mo-status--${getStatusClass(t.booking_status)}`}>
              {t.booking_status || "-"}
            </span>
            <span className={`mo-status mo-status--${getStatusClass(t.ticket_status)}`}>
              {t.ticket_status || "-"}
            </span>
            <span className="mo-slot" style={{ textTransform: "capitalize" }}>
              {t.issue_type || "-"}
            </span>
          </div>

          <div className="mo-mobile-note">
            {t.admin_note && t.admin_note !== "-" ? t.admin_note : "Pending"}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mo-page">
      <div className="mo-layout">
        {/* ── Sidebar ── */}
        <aside className={`mo-sidebar ${sidebarOpen ? "mo-sidebar--open" : ""}`}>
          <div className="mo-sidebar-brand">
            <span className="mo-brand-icon">◈</span>
            <span className="mo-brand-text">Dashboard</span>
          </div>

          <nav className="mo-sidebar-nav">
            <p className="mo-nav-label">Navigation</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mo-nav-item ${activeSection === item.id ? "mo-nav-item--active" : ""}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="mo-nav-icon">{item.icon}</span>
                <span className="mo-nav-text">{item.label}</span>
                {item.count > 0 && <span className="mo-nav-badge">{item.count}</span>}
              </button>
            ))}
          </nav>

          <div className="mo-sidebar-actions">
            <p className="mo-nav-label">Quick Actions</p>
            <button className="mo-action-btn mo-action-btn--ticket" onClick={openTicketModal}>
              <span>🎫</span>
              <span>Raise Ticket</span>
            </button>
            <button className="mo-action-btn mo-action-btn--cancel" onClick={openCancelModal}>
              <span>🚫</span>
              <span>Cancel Booking</span>
            </button>
          </div>

          <div className="mo-sidebar-footer">
            <div className="mo-user-chip">
              <div className="mo-user-avatar">U</div>
              <div>
                <p className="mo-user-name">My Account</p>
                <p className="mo-user-role">Member</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Mobile overlay ── */}
        {sidebarOpen && isMobileView && (
          <div className="mo-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main column (topbar + content + footer) ── */}
        <div className="mo-main">
          {/* Sticky topbar */}
          <header className="mo-topbar">
            <button
              className="mo-hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="mo-topbar-title">
              <h1>{navItems.find((n) => n.id === activeSection)?.label || "My Orders"}</h1>
              <p>Track your workspace bookings and support tickets</p>
            </div>

            {!isMobileView && (
              <div className="mo-topbar-actions">
                <button className="mo-topbar-btn mo-topbar-btn--ticket" onClick={openTicketModal}>
                  🎫 Raise Ticket
                </button>
                <button className="mo-topbar-btn mo-topbar-btn--cancel" onClick={openCancelModal}>
                  🚫 Cancel Order
                </button>
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="mo-content">
            {activeSection === "orders" && (
              <section className="mo-section">
                <div className="mo-section-header">
                  <div>
                    <span className="mo-section-badge">Workspace Bookings</span>
                    <h2 className="mo-section-title">My Orders</h2>
                    <p className="mo-section-sub">All your workspace bookings in one place</p>
                  </div>
                  <span className="mo-count-pill">{orders.length} Bookings</span>
                </div>

                {loading ? (
                  <div className="mo-loading">
                    <div className="mo-loading-bar"></div>
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="mo-empty">
                    <div className="mo-empty-icon">📦</div>
                    <h3>No bookings yet</h3>
                    <p>Your confirmed workspace bookings will appear here.</p>
                  </div>
                ) : isMobileView ? (
                  renderOrdersMobile()
                ) : (
                  renderOrdersDesktop()
                )}
              </section>
            )}

            {activeSection === "tickets" && (
              <section className="mo-section">
                <div className="mo-section-header">
                  <div>
                    <span className="mo-section-badge">Help & Support</span>
                    <h2 className="mo-section-title">Support Tickets</h2>
                    <p className="mo-section-sub">Track your raised support requests</p>
                  </div>
                  <span className="mo-count-pill">{tickets.length} Tickets</span>
                </div>

                {tickets.length === 0 ? (
                  <div className="mo-empty">
                    <div className="mo-empty-icon">🎫</div>
                    <h3>No tickets raised</h3>
                    <p>Your support tickets will appear here.</p>
                  </div>
                ) : isMobileView ? (
                  renderTicketsMobile()
                ) : (
                  renderTicketsDesktop()
                )}
              </section>
            )}
          </main>

          {/* ── Footer lives inside .mo-main so it is always to the right of sidebar ── */}
          <Footer />
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <div className="mo-modal-overlay" onClick={closeCancelModal}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-head">
              <div>
                <span className="mo-modal-badge">Cancel Booking</span>
                <h3>Request Order Cancellation</h3>
                <p>Only confirmed bookings with no pending cancel request are shown.</p>
              </div>
              <button className="mo-modal-close" onClick={closeCancelModal}>✕</button>
            </div>

            <div className="mo-live-strip">
              <span className="mo-live-dot"></span>
              <span>Booking cancellation support</span>
              <span className="mo-live-sep"></span>
              <span>Refunded & already-cancelled orders are hidden</span>
            </div>

            {cancelError && <div className="mo-error-box">{cancelError}</div>}

            <div className="mo-modal-body">
              <h4 className="mo-sub-heading">Select Booking to Cancel</h4>

              {pendingOrdersForCancel.length === 0 ? (
                <div className="mo-empty">
                  <div className="mo-empty-icon">🚫</div>
                  <h3>No eligible orders</h3>
                  <p>Only confirmed, non-refunded, non-cancelled bookings appear here.</p>
                </div>
              ) : (
                <div className="mo-cancel-list">
                  {pendingOrdersForCancel.map((item) => {
                    const isSelected = String(selectedOrder) === String(item.id);

                    return (
                      <label
                        key={item.id}
                        className={`mo-cancel-card ${isSelected ? "mo-cancel-card--selected" : ""}`}
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
                        <img src={item.image} alt={item.workspace} className="mo-cancel-img" />
                        <div className="mo-cancel-info">
                          <div className="mo-cancel-top">
                            <strong>{item.workspace}</strong>
                            <strong className="mo-cancel-price">₹{item.price || item.total_price}</strong>
                          </div>
                          <div className="mo-cancel-meta">
                            <span><b>Date:</b> {item.date || "-"}</span>
                            <span><b>Location:</b> {item.location || "-"}</span>
                            <span><b>Duration:</b> {item.duration || 1} day</span>
                            <span><b>Status:</b> {item.status || "-"}</span>
                            <span><b>Payment:</b> {item.payment_status || "PENDING"}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {selectedCancelOrderData && (
                <div className="mo-summary-card">
                  <p className="mo-summary-title">Selected Booking Details</p>
                  <div className="mo-summary-grid">
                    {[
                      ["Workspace", selectedCancelOrderData.workspace],
                      ["Location", selectedCancelOrderData.location],
                      ["Date", selectedCancelOrderData.date],
                      ["Duration", `${selectedCancelOrderData.duration || 1} day`],
                      ["Amount", `₹${selectedCancelOrderData.price || selectedCancelOrderData.total_price || 0}`],
                      ["Status", selectedCancelOrderData.status],
                    ].map(([label, value]) => (
                      <div key={label} className="mo-summary-item">
                        <span className="mo-summary-label">{label}</span>
                        <strong>{value || "-"}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mo-field">
                <label>Cancellation Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setCancelError("");
                  }}
                  placeholder="Explain why you want to cancel this booking..."
                  rows="4"
                  className={cancelError ? "mo-field-error" : ""}
                />
                <div className="mo-field-meta">
                  <span>Minimum 8 characters</span>
                  <span>{reason.length}/500</span>
                </div>
              </div>
            </div>

            <div className="mo-modal-footer">
              <button className="mo-btn mo-btn--ghost" onClick={closeCancelModal}>Close</button>
              <button
                className={`mo-btn mo-btn--danger ${cancelSubmitting ? "mo-btn--loading" : ""}`}
                onClick={submitCancel}
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? "Submitting..." : "Submit Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ticket Modal ── */}
      {showTicket && (
        <div className="mo-modal-overlay" onClick={closeTicketModal}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-head">
              <div>
                <span className="mo-modal-badge">Support Desk</span>
                <h3>Raise Support Ticket</h3>
                <p>Share the issue clearly and we will help you faster.</p>
              </div>
              <button className="mo-modal-close" onClick={closeTicketModal}>✕</button>
            </div>

            <div className="mo-live-strip">
              <span className="mo-live-dot"></span>
              <span>Support desk online</span>
              <span className="mo-live-sep"></span>
              <span>Typical response in 12–24 hrs</span>
            </div>

            {ticketSuccess && <div className="mo-success-box">{ticketSuccess}</div>}
            {ticketErrors.submit && <div className="mo-error-box">{ticketErrors.submit}</div>}

            <div className="mo-modal-body">
              <div className="mo-form-grid">
                <div className="mo-field mo-field--full">
                  <label>Ticket Type</label>
                  <select
                    name="type"
                    value={ticket.type}
                    onChange={handleTicketChange}
                    className={ticketErrors.type ? "mo-field-error" : ""}
                  >
                    <option value="">Select Type</option>
                    <option value="booking">Workspace Booking</option>
                    <option value="general">General Issue</option>
                  </select>
                  {ticketErrors.type && <span className="mo-err-text">{ticketErrors.type}</span>}
                </div>

                {ticket.type === "booking" && (
                  <div className="mo-field mo-field--full">
                    <label>Select Booking</label>
                    <select
                      name="booking_id"
                      value={ticket.booking_id}
                      onChange={handleTicketChange}
                      className={ticketErrors.booking_id ? "mo-field-error" : ""}
                    >
                      <option value="">Select Booking</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.workspace} — {o.location} — {o.date}
                        </option>
                      ))}
                    </select>
                    {ticketErrors.booking_id && (
                      <span className="mo-err-text">{ticketErrors.booking_id}</span>
                    )}
                  </div>
                )}

                {selectedTicketBooking && (
                  <div className="mo-summary-card mo-field--full">
                    <p className="mo-summary-title">Selected Booking</p>
                    <div className="mo-summary-grid">
                      {[
                        ["Workspace", selectedTicketBooking.workspace],
                        ["Location", selectedTicketBooking.location],
                        ["Date", selectedTicketBooking.date],
                        ["Status", selectedTicketBooking.status],
                      ].map(([label, value]) => (
                        <div key={label} className="mo-summary-item">
                          <span className="mo-summary-label">{label}</span>
                          <strong>{value || "-"}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mo-field">
                  <label>Issue Type</label>
                  <select
                    name="issue_type"
                    value={ticket.issue_type}
                    onChange={handleTicketChange}
                    className={ticketErrors.issue_type ? "mo-field-error" : ""}
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
                    <span className="mo-err-text">{ticketErrors.issue_type}</span>
                  )}
                </div>

                <div className="mo-field">
                  <label>Priority</label>
                  <select name="priority" value={ticket.priority} onChange={handleTicketChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="mo-field mo-field--full">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={ticket.subject}
                    onChange={handleTicketChange}
                    placeholder="e.g. Need to reschedule my booking"
                    className={ticketErrors.subject ? "mo-field-error" : ""}
                  />
                  {ticketErrors.subject && <span className="mo-err-text">{ticketErrors.subject}</span>}
                </div>

                <div className="mo-field mo-field--full">
                  <label>Describe Your Issue</label>
                  <textarea
                    name="message"
                    value={ticket.message}
                    onChange={handleTicketChange}
                    placeholder="Explain the issue in detail so the support team can help you quickly..."
                    rows="4"
                    className={ticketErrors.message ? "mo-field-error" : ""}
                  />
                  <div className="mo-field-meta">
                    {ticketErrors.message ? (
                      <span className="mo-err-text">{ticketErrors.message}</span>
                    ) : (
                      <span>Minimum 15 characters</span>
                    )}
                    <span>{ticket.message.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mo-modal-footer">
              <button className="mo-btn mo-btn--ghost" onClick={closeTicketModal}>Cancel</button>
              <button
                className={`mo-btn mo-btn--primary ${ticketSubmitting ? "mo-btn--loading" : ""}`}
                onClick={submitTicket}
                disabled={ticketSubmitting}
              >
                {ticketSubmitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Workspace Detail Panel ── */}
      {showWorkspaceDetails && selectedWorkspaceCard && (
        <div className="mo-modal-overlay" onClick={() => setShowWorkspaceDetails(false)}>
          <div className="mo-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mo-detail-hero">
              <img
                src={selectedWorkspaceCard.image}
                alt={selectedWorkspaceCard.name}
                className="mo-detail-hero-img"
              />
              <div className="mo-detail-hero-grad"></div>

              <button
                className="mo-modal-close mo-modal-close--hero"
                onClick={() => setShowWorkspaceDetails(false)}
              >
                ✕
              </button>

              <div className="mo-detail-hero-badges">
                <span className="mo-hero-badge">1-Day Booking</span>
                <span className="mo-hero-badge">⭐ {selectedWorkspaceCard.rating}</span>
              </div>

              <div className="mo-detail-hero-info">
                <h2>{selectedWorkspaceCard.name}</h2>
                <p>{selectedWorkspaceCard.location}, {selectedWorkspaceCard.city}</p>
              </div>
            </div>

            <div className="mo-detail-tabs">
              {["overview", "amenities", "pricing", "map"].map((tab) => (
                <button
                  key={tab}
                  className={`mo-detail-tab ${activeTab === tab ? "mo-detail-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mo-detail-body">
              {activeTab === "overview" && (
                <div>
                  <div className="mo-stats-grid">
                    {[
                      { icon: "📶", val: "1 Gbps", lbl: "WiFi" },
                      { icon: "🕒", val: "24/7", lbl: "Access" },
                      { icon: "💺", val: "50+", lbl: "Seats" },
                      { icon: "⭐", val: selectedWorkspaceCard.rating, lbl: "Rating" },
                    ].map((s) => (
                      <div key={s.lbl} className="mo-stat-card">
                        <span>{s.icon}</span>
                        <strong>{s.val}</strong>
                        <span>{s.lbl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mo-location-card">
                    {[
                      ["Workspace", selectedWorkspaceCard.name],
                      ["Address", selectedWorkspaceCard.location],
                      ["City", selectedWorkspaceCard.city],
                      ["Date", selectedWorkspaceCard.date],
                      ["Status", selectedWorkspaceCard.status],
                      ["Payment", selectedWorkspaceCard.payment_status],
                      ["Refund", `₹${selectedWorkspaceCard.refund_amount || 0}`],
                      ["Cancel Request", selectedWorkspaceCard.cancel_status || "Not Requested"],
                    ].map(([label, value]) => (
                      <div key={label} className="mo-location-row">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

           {activeTab === "amenities" && (

  <div className="mo-amenities-grid">

    {

      selectedWorkspaceCard
      ?.amenities
      ?.length > 0

      ?

      selectedWorkspaceCard.amenities.map(
        (a, i) => (

        <div
          key={i}
          className="mo-amenity-card"
        >

          <span className="mo-amenity-icon">
            ☕
          </span>

          <div>

            <p>
              {a.title}
            </p>

            <span>

              {a.persons}
              Person

              •

              ₹{a.total}

            </span>

          </div>

        </div>

      ))

      :

      <div className="mo-noAmenities">

        No additional amenities

      </div>

    }

  </div>

)}

              {activeTab === "pricing" && (
                <div>
                  <div className="mo-pricing-hero">
                    <div className="mo-pricing-badge">1-Day Plan</div>
                    <div className="mo-pricing-amount">
                      ₹{selectedWorkspaceCard.price}<span>/day</span>
                    </div>
                    <p>Booking date: {selectedWorkspaceCard.date}</p>
                  </div>

                  <div className="mo-includes">
                    {[
                      "Full-day hot desk access",
                      "Unlimited high-speed WiFi",
                      "Meeting support access",
                      "Tea & coffee",
                      "Common area access",
                      "Power backup & AC",
                    ].map((item) => (
                      <div key={item} className="mo-include-row">
                        <span>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "map" && (
                <div className="mo-map-placeholder">
                  <div className="mo-map-pin">📍</div>
                  <h4>{selectedWorkspaceCard.name}</h4>
                  <p>{selectedWorkspaceCard.location}, {selectedWorkspaceCard.city}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${selectedWorkspaceCard.location}, ${selectedWorkspaceCard.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mo-map-link"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              )}
            </div>

            <div className="mo-detail-footer">
              <div className="mo-footer-price">
                ₹{selectedWorkspaceCard.price}<span>/day</span>
              </div>
              <button className="mo-btn mo-btn--primary">Booked Workspace</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;

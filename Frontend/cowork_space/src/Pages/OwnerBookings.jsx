import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import "../Styles/OwnerBookings.css";

// ─── Persistent state helpers ───────────────────────────────────────────────
const LS_KEY = "ownerBookingStates";

const loadStates = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveState = (id, patch) => {
  const all = loadStates();
  all[id] = { ...(all[id] || {}), ...patch };
  localStorage.setItem(LS_KEY, JSON.stringify(all));
};
// ────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }) {
 const map = {
  confirmed: { label: "Confirmed", cls: "pill-confirmed" },
  cancelled: { label: "Cancelled", cls: "pill-cancelled" },
};
  const { label, cls } = map[status?.toLowerCase()] || map.pending;
  return <span className={`ob-pill ${cls}`}>{label}</span>;
}

function PaymentBadge({ status }) {
  if (status === "VERIFIED") {
    return (
      <span className="ob-badge badge-verified">
        <span className="ob-badge-dot" />
        Verified
      </span>
    );
  }

  if (status === "REFUNDED") {
    return (
      <span className="ob-badge badge-refunded">
        <span className="ob-badge-dot" />
        Refunded
      </span>
    );
  }

  return (
    <span className="ob-badge badge-pending-pay">
      <span className="ob-badge-dot" />
      Unverified
    </span>
  );
}

export default function OwnerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localStates, setLocalStates] = useState(loadStates);
  const [selectedBooking, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [toastMsg, setToastMsg] = useState("");
  const [animatingId, setAnimatingId] = useState(null);

  // Prevent multiple actions on same row at same time
  const [busyMap, setBusyMap] = useState({});

  const setBusy = (id, value) => {
    setBusyMap((prev) => ({ ...prev, [id]: value }));
  };

  const isBusy = (id) => !!busyMap[id];

  const merged = bookings.map((b) => {
    const ls = localStates[b.id] || {};
    return { ...b, ...ls };
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const pulse = (id) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 600);
  };

  const updateBookingState = (id, patch) => {
    saveState(id, patch);

    setLocalStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }));

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );

    setSelected((prev) =>
      prev?.id === id ? { ...prev, ...patch } : prev
    );
  };

  const fetchBookings = useCallback(() => {
    setLoading(true);
    axiosInstance
      .get("cart/owner/bookings/")
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchCancelRequests = useCallback(() => {
    axiosInstance
      .get("cart/booking/owner/cancel-requests/")
      .then((res) => setRequests(res.data || []))
      .catch((err) =>
        console.error("Failed to fetch cancel requests:", err)
      );
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchCancelRequests();
  }, [fetchCancelRequests]);

  const getLatestBooking = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return null;
    const ls = localStates[id] || {};
    return { ...booking, ...ls };
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  // const verifyBooking = async (id) => {
  //   const current = getLatestBooking(id);

  //   if (!current) return;
  //   if (isBusy(id)) return;

  //   if (current.status === "cancelled") {
  //     showToast("❌ Cancelled booking cannot be verified");
  //     return;
  //   }

  //   if (current.payment_status === "VERIFIED") {
  //     showToast("✅ Payment already verified");
  //     return;
  //   }

  //   setBusy(id, true);
  //   try {
  //     await axiosInstance.put(`cart/booking/verify/${id}/`);
  //     updateBookingState(id, { payment_status: "VERIFIED" });
  //     pulse(id);
  //     showToast("✅ Payment verified successfully");
  //   } catch (error) {
  //     console.error("Verification failed:", error);
  //     showToast("❌ Verification failed");
  //   } finally {
  //     setBusy(id, false);
  //   }
  // };

  // const confirmBooking = async (id) => {
  //   const current = getLatestBooking(id);

  //   if (!current) return;
  //   if (isBusy(id)) return;

  //   if (current.status !== "pending") {
  //     showToast("❌ This booking is no longer pending");
  //     return;
  //   }

  //   if (current.payment_status !== "VERIFIED") {
  //     showToast("❌ Verify payment before confirming");
  //     return;
  //   }

  //   setBusy(id, true);
  //   try {
  //     await axiosInstance.put(`cart/booking-confirm/${id}/`);
  //     updateBookingState(id, { status: "confirmed" });
  //     pulse(id);
  //     showToast("✅ Booking confirmed!");
  //   } catch (error) {
  //     console.error("Confirmation failed:", error);
  //     showToast("❌ Confirmation failed");
  //   } finally {
  //     setBusy(id, false);
  //   }
  // };

  // const cancelBooking = async (id) => {
  //   const current = getLatestBooking(id);

  //   if (!current) return;
  //   if (isBusy(id)) return;

  //   if (current.status !== "pending") {
  //     showToast("❌ This booking is no longer pending");
  //     return;
  //   }

  //   if (current.payment_status !== "VERIFIED") {
  //     showToast("❌ Verify payment before cancelling");
  //     return;
  //   }

  //   setBusy(id, true);
  //   try {
  //     await axiosInstance.put(`cart/booking-cancel/${id}/`);

  //     if (current.payment_id) {
  //       await axiosInstance.post("payment/refund/", {
  //         payment_id: current.payment_id,
  //       });

  //       updateBookingState(id, {
  //         status: "cancelled",
  //         payment_status: "REFUNDED",
  //       });
  //     } else {
  //       updateBookingState(id, {
  //         status: "cancelled",
  //       });
  //     }

  //     pulse(id);
  //     showToast("💰 Booking cancelled & refund initiated");
  //   } catch (error) {
  //     console.error("Cancel/refund failed:", error);
  //     showToast("❌ Cancel or refund failed");
  //   } finally {
  //     setBusy(id, false);
  //   }
  // };

  // ── Cancel Request Actions ───────────────────────────────────────────────

  const approve = async (id) => {
    try {
      await axiosInstance.put(`cart/booking/cancel-approve/${id}/`);
      showToast("✅ Cancel request approved & refunded");
      fetchBookings();
      fetchCancelRequests();
    } catch (error) {
      console.error("Failed to approve cancel request:", error);
      showToast("❌ Failed to approve cancel request");
    }
  };

  // ── Modal ────────────────────────────────────────────────────────────────

  const openModal = (item) => {
    const latest = getLatestBooking(item.id);
    setSelected(latest || item);
    setActiveTab("overview");
  };

  const closeModal = () => setSelected(null);

  const getStatusClass = (s) => {
    if (!s) return "pending";
    const l = s.toLowerCase();
    if (l === "confirmed") return "confirmed";
    if (l === "cancelled") return "cancelled";
    return "pending";
  };

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = {
    total: merged.length,
    confirmed: merged.filter((b) => b.status === "confirmed").length,
    // pending: merged.filter((b) => b.status === "pending").length,
    cancelled: merged.filter((b) => b.status === "cancelled").length,
  };

  return (
    <section className="ob-page">
      {toastMsg && <div className="ob-toast">{toastMsg}</div>}

      <div className="ob-wrap">
        {/* Header */}
        <div className="ob-header">
          <div className="ob-header-left">
            <span className="ob-badge-tag">Owner Dashboard</span>
            <h1>Booking Requests</h1>
            <p>
              view all confirmed booking and manage cancellation requests
            </p>
          </div>

          <div className="ob-stats-row">
            <div className="ob-stat-chip total">
              <strong>{stats.total}</strong>
              <small>Total</small>
            </div>
            <div className="ob-stat-chip conf">
              <strong>{stats.confirmed}</strong>
              <small>Confirmed</small>
            </div>
            <div className="ob-stat-chip pend">
              <strong>{stats.pending}</strong>
              <small>Pending</small>
            </div>
            <div className="ob-stat-chip canc">
              <strong>{stats.cancelled}</strong>
              <small>Cancelled</small>
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="ob-card">
          {loading ? (
            <div className="ob-loading">
              <div className="ob-shimmer" />
              <p>Loading bookings…</p>
            </div>
          ) : merged.length === 0 ? (
            <div className="ob-empty">
              <div className="ob-empty-icon">📋</div>
              <h4>No bookings yet</h4>
              <p>Requests will appear here when users book your workspace.</p>
            </div>
          ) : (
            <div className="ob-table-scroll">
              <div className="ob-table-header-actions">
                <button
                  className="ob-btn ob-btn-secondary"
                  onClick={() => navigate("/cancel-requests")}
                >
                  Cancel Requests ({requests.length})
                </button>
              </div>

              <table className="ob-table">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Amount</th>
                    <th>Status</th>
                    {/* <th>Payment</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {merged.map((item) => {
                    const pendingRow = isBusy(item.id);
                    // const isPending = item.status === "pending";
                    const isConfirmed = item.status === "confirmed";
                    const isCancelled = item.status === "cancelled";
                    // const isVerified = item.payment_status === "VERIFIED";
                    // const isRefunded = item.payment_status === "REFUNDED";
                    const isPulsing = animatingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`ob-row ${isPulsing ? "ob-row-pulse" : ""}`}
                      >
                        <td>
                          <div
                            className="ob-workspace-cell"
                            onClick={() => openModal(item)}
                          >
                            <img
                              src={item.image}
                              alt={item.workspace}
                              className="ob-thumb"
                            />
                            <span className="ob-ws-name">{item.workspace}</span>
                          </div>
                        </td>

                        <td className="ob-user-cell">{item.user}</td>
                        <td>{item.date}</td>
                        <td>
                          <div className="ob-dur-chip">
  <strong>{item.slot_type}</strong>
  <br />
  <small>{item.slot_time}</small>
</div>
                        </td>
                        <td>
                          <strong className="ob-price">₹{item.total_price}</strong>
                        </td>

                        <td>
                          <StatusPill status={item.status} />
                        </td>

               
                         
                       <td>
  <div className="ob-action-cell">

    {/* ✅ CONFIRMED */}
    {item.status === "confirmed" && (
      <span className="ob-done-badge done-confirmed">
        <span>✓</span> Confirmed
      </span>
    )}

    {/* ❌ CANCELLED */}
    {item.status === "cancelled" && (
      <span className="ob-done-badge done-cancelled">
        <span>✕</span> Cancelled
      </span>
    )}

  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cancel requests */}
        {requests.length > 0 && (
          <div className="ob-card ob-cancel-requests">
            <div className="ob-section-header">
              <h3>Pending Cancel Requests</h3>
              <span className="ob-badge ob-badge-warning">{requests.length}</span>
            </div>

            <div className="ob-table-scroll">
              <table className="ob-table ob-cancel-table">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.workspace}</td>
                      <td>{r.user}</td>
                      <td>
                        <strong>₹{r.amount}</strong>
                      </td>
                      <td>{r.reason}</td>
                      <td>
                        {r.status === "PENDING" && (
                          <button
                            className="ob-btn ob-btn-warning"
                            onClick={() => approve(r.id)}
                          >
                            Accept & Refund
                          </button>
                        )}

                        {r.status === "APPROVED" && (
                          <span className="ob-badge badge-approved">
                            Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="ob-overlay" onClick={closeModal}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ob-close" onClick={closeModal} aria-label="Close">
              ✕
            </button>

            <div className="ob-modal-hero">
              <img src={selectedBooking.image} alt={selectedBooking.workspace} />
              <div className="ob-modal-hero-overlay" />
              <div className="ob-modal-hero-content">
                <span className="ob-modal-chip">Premium Workspace</span>
                <h2>{selectedBooking.workspace}</h2>
                <p>
                  Booked by <strong>{selectedBooking.user}</strong> ·{" "}
                  {selectedBooking.date}
                </p>
              </div>
            </div>

            <div className="ob-modal-body">
              <div className="ob-modal-tabs">
                {["overview", "features", "pricing"].map((t) => (
                  <button
                    key={t}
                    className={`ob-modal-tab ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="ob-detail-grid">
                  {[
                    ["Customer", selectedBooking.user],
                    ["Date", selectedBooking.date],
                    ["Slot", `${selectedBooking.slot_type} (${selectedBooking.slot_time})`],
                    [
                      "Status",
                      <span
                        className={getStatusClass(selectedBooking.status)}
                        style={{ textTransform: "capitalize" }}
                      >
                        {selectedBooking.status}
                      </span>,
                    ],
                  ].map(([label, val]) => (
                    <div key={label} className="ob-detail-card">
                      <span className="ob-detail-label">{label}</span>
                      <strong>{val}</strong>
                    </div>
                  ))}

                  <div className="ob-detail-about">
                    <h4>Booking Summary</h4>
                    <p>
                      This booking is for <strong>{selectedBooking.workspace}</strong>.
                      Review the customer request, verify the schedule, and confirm
                      or cancel directly from this panel.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="ob-feature-grid">
                  {[
                    ["⚡", "High-Speed WiFi", "Stable internet for work and meetings."],
                    ["🪑", "Modern Setup", "Comfortable desk and seating support."],
                    ["❄️", "Fully Air Conditioned", "Comfortable environment all day."],
                    ["☕", "Refreshments", "Tea, coffee and basic pantry access."],
                  ].map(([icon, title, desc]) => (
                    <div key={title} className="ob-feature-box">
                      <span>{icon}</span>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="ob-pricing-card">
                  <span className="ob-pricing-label">Booking Amount</span>
                  <h2>₹{selectedBooking.total_price}</h2>
                  <p>
                   For {selectedBooking.slot_type} ({selectedBooking.slot_time}) on {selectedBooking.date}
                  </p>
                  <div className="ob-pricing-points">
                    <div>✓ Workspace reserved for selected slot</div>
                    <div>✓ confirm booking</div>
                    <div>✓ Direct management from dashboard</div>
                  </div>
                </div>
              )}
            </div>

            <div className="ob-modal-footer">
              <div className="ob-footer-price">
                <strong>₹{selectedBooking.total_price}</strong>
                <small>Total Booking Value</small>
              </div>

            <div className="ob-footer-actions">
  {selectedBooking.status === "confirmed" && (
    <span className="ob-done-badge done-confirmed">
      ✓ Booking Confirmed
    </span>
  )}

  {selectedBooking.status === "cancelled" && (
    <span className="ob-done-badge done-cancelled">
      ✕ Booking Cancelled
    </span>
  )}
</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
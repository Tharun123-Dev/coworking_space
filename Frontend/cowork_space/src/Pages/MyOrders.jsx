import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/MyOrders.css";

function MyOrders() {
  const [showTicket, setShowTicket] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [ticketErrors, setTicketErrors] = useState({});
  const [tickets,setTickets]=useState([]);
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
  const fetchTickets = () => {
axiosInstance.get("leads/tickets/user/")
.then(res=>setTickets(res.data))
};
  const [loading, setLoading] = useState(false);
  const [loadingSpecial, setLoadingSpecial] = useState(false);
  
  useEffect(() => {
    fetchOrders();
    fetchSpecial();
    fetchTickets();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axiosInstance
      .get("cart/myorders/")
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  const fetchSpecial = () => {
    setLoadingSpecial(true);
    axiosInstance
      .get("leads/special/user/")
      .then((res) => setSpecial(res.data || []))
      .finally(() => setLoadingSpecial(false));
  };

  const getStatusClass = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s === "pending") return "pending";
    if (s === "confirmed") return "confirmed";
    if (s === "contacted") return "contacted";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const selectedBooking = useMemo(
    () => orders.find((o) => String(o.id) === String(ticket.booking_id)),
    [orders, ticket.booking_id]
  );

  const selectedSpecial = useMemo(
    () => special.find((s) => String(s.id) === String(ticket.special_id)),
    [special, ticket.special_id]
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

    if (!ticket.type) {
      errors.type = "Please select ticket type";
    }

    if (ticket.type === "booking" && !ticket.booking_id) {
      errors.booking_id = "Please select a booking";
    }

    if (ticket.type === "special" && !ticket.special_id) {
      errors.special_id = "Please select a special request";
    }

    if (!ticket.issue_type) {
      errors.issue_type = "Please select issue category";
    }

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

const payload = {
issue_type: ticket.issue_type,
message: ticket.message
}

if(ticket.type === "booking"){
payload.booking_id = ticket.booking_id
}

if(ticket.type === "special"){
payload.special_id = ticket.special_id
}

axiosInstance.post("leads/tickets/create/", payload)
.then(()=>{
alert("Ticket raised successfully")

setShowTicket(false)

fetchTickets()

})
.catch(()=>{
alert("Error creating ticket")
})

}

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

        {/* Workspace Bookings */}
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
              <p>Your confirmed and pending workspace bookings will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((item) => (
                    <tr key={item.id}>
                      <td>{item.workspace}</td>
                      <td>{item.location}</td>
                      <td>{item.date}</td>
                      <td>{item.duration} hrs</td>
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
        </div>

        {/* Special Requests */}
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
                    <th>Category</th>
                    <th>Company</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {special.map((item) => (
                    <tr key={item.id}>
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

      {showTicket && (
        <div className="ticket-modal-overlay" onClick={closeTicketModal}>
          <div
            className="ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
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

              {(selectedBooking || selectedSpecial) && (
                <div className="ticket-summary-card full">
                  <div className="ticket-summary-title">Selected Reference</div>

                  {selectedBooking && (
                    <div className="ticket-summary-grid">
                      <div>
                        <span className="summary-label">Workspace</span>
                        <strong>{selectedBooking.workspace}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Location</span>
                        <strong>{selectedBooking.location}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Date</span>
                        <strong>{selectedBooking.date}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Status</span>
                        <strong>{selectedBooking.status}</strong>
                      </div>
                    </div>
                  )}

                  {selectedSpecial && (
                    <div className="ticket-summary-grid">
                      <div>
                        <span className="summary-label">Category</span>
                        <strong>{selectedSpecial.category}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Company</span>
                        <strong>{selectedSpecial.company || "-"}</strong>
                      </div>
                      <div className="full">
                        <span className="summary-label">Message</span>
                        <strong>{selectedSpecial.message || "-"}</strong>
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
                {ticketErrors.subject && <span className="error-text">{ticketErrors.subject}</span>}
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



      <div className="orders-section">

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
<th>Workspace</th>
<th>Location</th>
<th>Booking Status</th>
<th>Date</th>
<th>Issue</th>
<th>Ticket Status</th>
<th>Admin Note</th>
</tr>
</thead>


<tbody>
{tickets.map(t=>(
<tr key={t.id}>

<td>{t.workspace || "-"}</td>

<td>{t.location || "-"}</td>

<td>
<span className={`status ${getStatusClass(t.booking_status)}`}>
{t.booking_status || "-"}
</span>
</td>

<td>{t.date || "-"}</td>

<td>{t.issue_type}</td>

<td>
<span className={`status ${getStatusClass(t.ticket_status)}`}>
{t.ticket_status}
</span>
</td>

<td>{t.admin_note || "pending"}</td>

</tr>
))}
</tbody>
</table>

</div>

)}

</div>
    </section>
  );
}

export default MyOrders;
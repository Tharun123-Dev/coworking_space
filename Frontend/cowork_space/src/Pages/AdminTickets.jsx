import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminTickets.css";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/leads/tickets/admin/");
      const data = Array.isArray(res.data) ? res.data : [];

      const normalizedTickets = data.map((t) => ({
        ...t,
        username: t.username || t.user_name || t.name || "-",
        phone: t.phone || t.mobile || t.contact || "-",
        workspace: t.workspace || t.workspace_name || "-",
        special_category: t.special_category || "-",
        location: t.location || "-",
        booking_status: t.booking_status || "-",
        issue_type: t.issue_type || t.issue || "-",
        priority: t.priority || "low",
        status: t.status || "open",
        admin_note: t.admin_note || "",
      }));

      setTickets(normalizedTickets);

      const initialNotes = {};
      normalizedTickets.forEach((ticket) => {
        initialNotes[ticket.id] = ticket.admin_note || "";
      });
      setNotes(initialNotes);
    } catch (error) {
      console.log("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleNoteChange = (id, value) => {
    setNotes((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateTicket = async (id, status) => {
    try {
      setUpdatingId(id);
      await axiosInstance.put(`/leads/tickets/update/${id}/`, {
        status,
        admin_note: notes[id] || "",
      });
      fetchTickets();
    } catch (error) {
      console.log("Error updating ticket:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all"
          ? true
          : (t.priority || "low").toLowerCase() === priorityFilter;

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        t.username?.toLowerCase().includes(search) ||
        t.phone?.toLowerCase().includes(search) ||
        t.workspace?.toLowerCase().includes(search) ||
        t.special_category?.toLowerCase().includes(search) ||
        t.location?.toLowerCase().includes(search) ||
        t.issue_type?.toLowerCase().includes(search);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, statusFilter, priorityFilter, searchTerm]);

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      pending: tickets.filter((t) => t.status === "pending").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    };
  }, [tickets]);

  return (
    <div className="admin-tickets-layout">
      <div className="tickets-header">
        <div>
          <p className="tickets-eyebrow">Support Desk</p>
          <h2>Support Tickets</h2>
          <p className="tickets-subtitle">
            Manage issues, review priorities, and update ticket progress quickly.
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchTickets}>
          Refresh
        </button>
      </div>

      <div className="tickets-stats">
        <div className="stat-card stat-total">
          <span>Total</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="stat-card stat-open">
          <span>Open</span>
          <strong>{counts.open}</strong>
        </div>
        <div className="stat-card stat-pending">
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className="stat-card stat-resolved">
          <span>Resolved</span>
          <strong>{counts.resolved}</strong>
        </div>
        <div className="stat-card stat-closed">
          <span>Closed</span>
          <strong>{counts.closed}</strong>
        </div>
      </div>

      <div className="tickets-toolbar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search user, phone, workspace, issue, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="toolbar-filter">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="tickets-table-container">
        <div className="table-header">
          <h3>All Tickets</h3>
          <span>{filteredTickets.length} result(s)</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">No tickets found.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Workspace</th>
                    <th>Location</th>
                    <th>Booking</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Admin Note</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id}>
                      <td className="cell-user">{t.username}</td>
                      <td className="cell-phone">{t.phone}</td>
                      <td className="cell-workspace">
                        {t.workspace || t.special_category || "-"}
                      </td>
                      <td className="cell-location">
                        {t.location || "-"}
                      </td>
                      <td className="cell-booking">
                        {t.booking_status || "-"}
                      </td>
                      <td className="cell-issue">{t.issue_type}</td>
                      <td className="cell-priority">
                        <span
                          className={`badge-priority badge-${
                            (t.priority || "low").toLowerCase()
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="cell-status">
                        <span
                          className={`badge-status badge-${
                            (t.status || "open").toLowerCase()
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="cell-note">
                        <textarea
                          value={notes[t.id] || ""}
                          onChange={(e) => handleNoteChange(t.id, e.target.value)}
                          placeholder="Write admin note..."
                          rows={1}
                        />
                      </td>
                      <td className="cell-action">
                        <select
                          value={t.status || "open"}
                          disabled={updatingId === t.id}
                          onChange={(e) => updateTicket(t.id, e.target.value)}
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-ticket-cards">
              {filteredTickets.map((t) => (
                <div className="ticket-card" key={t.id}>
                  <div className="card-header">
                    <div className="card-user">
                      <h4>{t.username}</h4>
                      <p>{t.phone}</p>
                    </div>
                    <span
                      className={`badge-status badge-${
                        (t.status || "open").toLowerCase()
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="card-details">
                    <div>
                      <span>Workspace</span>
                      <p>{t.workspace || t.special_category || "-"}</p>
                    </div>
                    <div>
                      <span>Location</span>
                      <p>{t.location || "-"}</p>
                    </div>
                    <div>
                      <span>Booking</span>
                      <p>{t.booking_status || "-"}</p>
                    </div>
                    <div>
                      <span>Issue</span>
                      <p>{t.issue_type}</p>
                    </div>
                    <div>
                      <span>Priority</span>
                      <p>
                        <span
                          className={`badge-priority badge-${
                            (t.priority || "low").toLowerCase()
                          }`}
                        >
                          {t.priority}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="card-note">
                    <label>Admin Note</label>
                    <textarea
                      value={notes[t.id] || ""}
                      onChange={(e) => handleNoteChange(t.id, e.target.value)}
                      placeholder="Write admin note..."
                      rows={2}
                    />
                  </div>

                  <div className="card-actions">
                    <select
                      value={t.status || "open"}
                      disabled={updatingId === t.id}
                      onChange={(e) => updateTicket(t.id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminTickets;
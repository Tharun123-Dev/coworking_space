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
      setTickets(res.data);

      const initialNotes = {};
      res.data.forEach((ticket) => {
        initialNotes[ticket.id] = ticket.admin_note || "";
      });
      setNotes(initialNotes);
    } catch (error) {
      console.log(error);
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
      console.log(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ? true : t.priority?.toLowerCase() === priorityFilter;

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
    <div className="adminTickets">
      <div className="tickets-header">
        <div>
          <p className="tickets-eyebrow">Support Desk</p>
          <h2>Support Tickets</h2>
          <p className="tickets-subtitle">
            Manage issues, review priorities, and update ticket progress quickly.
          </p>
        </div>

        <button className="secondary-btn" onClick={fetchTickets}>
          Refresh
        </button>
      </div>

      <div className="ticket-stats">
        <div className="ticket-stat-card">
          <span>Total</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="ticket-stat-card">
          <span>Open</span>
          <strong>{counts.open}</strong>
        </div>
        <div className="ticket-stat-card">
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className="ticket-stat-card">
          <span>Resolved</span>
          <strong>{counts.resolved}</strong>
        </div>
        <div className="ticket-stat-card">
          <span>Closed</span>
          <strong>{counts.closed}</strong>
        </div>
      </div>

      <div className="ticket-toolbar">
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

      <div className="tickets-table-card">
        <div className="tickets-table-top">
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
                    <th>Booking Status</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Ticket Status</th>
                    <th>Admin Note</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.username}</td>
                      <td>{t.phone}</td>
                      <td>{t.workspace || t.special_category || "-"}</td>
                      <td>{t.location || "-"}</td>
                      <td>{t.booking_status || "-"}</td>
                      <td>{t.issue_type}</td>
                      <td>
                        <span className={`priority-badge priority-${t.priority?.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${t.status?.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <textarea
                          value={notes[t.id] || ""}
                          onChange={(e) => handleNoteChange(t.id, e.target.value)}
                          placeholder="Write admin note..."
                        />
                      </td>
                      <td>
                        <select
                          value={t.status}
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

            <div className="mobile-ticket-cards">
              {filteredTickets.map((t) => (
                <div className="ticket-card" key={t.id}>
                  <div className="ticket-card-top">
                    <div>
                      <h4>{t.username}</h4>
                      <p>{t.phone}</p>
                    </div>
                    <span className={`status-badge status-${t.status?.toLowerCase()}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="ticket-card-grid">
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
                        <span className={`priority-badge priority-${t.priority?.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="ticket-card-note">
                    <label>Admin Note</label>
                    <textarea
                      value={notes[t.id] || ""}
                      onChange={(e) => handleNoteChange(t.id, e.target.value)}
                      placeholder="Write admin note..."
                    />
                  </div>

                  <div className="ticket-card-actions">
                    <select
                      value={t.status}
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
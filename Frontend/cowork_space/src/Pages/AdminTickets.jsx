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
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedCard, setExpandedCard] = useState(null);
  const [savingNote, setSavingNote] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

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
        created_at: t.created_at || null,
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
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const saveNote = async (id) => {
    try {
      setSavingNote(id);
      const ticket = tickets.find((t) => t.id === id);
      await axiosInstance.put(`/leads/tickets/update/${id}/`, {
        status: ticket.status,
        admin_note: notes[id] || "",
      });
      showToast("Note saved successfully.");
      fetchTickets();
    } catch {
      showToast("Failed to save note.");
    } finally {
      setSavingNote(null);
    }
  };

  const updateTicket = async (id, status) => {
    try {
      setUpdatingId(id);
      await axiosInstance.put(`/leads/tickets/update/${id}/`, {
        status,
        admin_note: notes[id] || "",
      });
      showToast(`Ticket marked as "${status}".`);
      fetchTickets();
    } catch (error) {
      console.log("Error updating ticket:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filteredTickets = useMemo(() => {
    let list = tickets.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ||
        (t.priority || "low").toLowerCase() === priorityFilter;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        t.username?.toLowerCase().includes(search) ||
        t.phone?.toLowerCase().includes(search) ||
        t.workspace?.toLowerCase().includes(search) ||
        t.special_category?.toLowerCase().includes(search) ||
        t.location?.toLowerCase().includes(search) ||
        t.issue_type?.toLowerCase().includes(search);
      return matchesStatus && matchesPriority && matchesSearch;
    });

    list = [...list].sort((a, b) => {
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";
      if (sortField === "priority") {
        av = priorityOrder[av.toLowerCase()] ?? 99;
        bv = priorityOrder[bv.toLowerCase()] ?? 99;
        return sortDir === "asc" ? av - bv : bv - av;
      }
      if (sortField === "id") {
        return sortDir === "asc" ? a.id - b.id : b.id - a.id;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return list;
  }, [tickets, statusFilter, priorityFilter, searchTerm, sortField, sortDir]);

  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  }), [tickets]);

  const SortIcon = ({ field }) => (
    <span className={`sort-icon ${sortField === field ? "active" : ""}`}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "⇅"}
    </span>
  );

  return (
    <div className="at-layout">
      {toastMsg && <div className="at-toast">{toastMsg}</div>}

      {/* Header */}
      <div className="at-header">
        <div className="at-header-left">
          <p className="at-eyebrow">Support Desk</p>
          <h2 className="at-title">Support Tickets</h2>
          <p className="at-subtitle">
            Manage issues, review priorities, and update ticket progress.
          </p>
        </div>
        <button className="at-btn-refresh" onClick={fetchTickets}>
          <span>↻</span> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="at-stats">
        {[
          { label: "Total", count: counts.total, cls: "stat-total" },
          { label: "Open", count: counts.open, cls: "stat-open" },
          { label: "Pending", count: counts.pending, cls: "stat-pending" },
          { label: "Resolved", count: counts.resolved, cls: "stat-resolved" },
          { label: "Closed", count: counts.closed, cls: "stat-closed" },
        ].map(({ label, count, cls }) => (
          <div
            key={label}
            className={`at-stat-card ${cls} ${statusFilter === label.toLowerCase() ? "active" : ""}`}
            onClick={() =>
              setStatusFilter(
                statusFilter === label.toLowerCase() && label !== "Total"
                  ? "all"
                  : label === "Total"
                  ? "all"
                  : label.toLowerCase()
              )
            }
          >
            <span className="stat-label">{label}</span>
            <strong className="stat-count">{count}</strong>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="at-toolbar">
        <div className="at-search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search user, phone, workspace, issue, location…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>

        <div className="at-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="at-table-container">
        <div className="at-table-header">
          <h3>All Tickets</h3>
          <span className="result-count">{filteredTickets.length} result(s)</span>
        </div>

        {loading ? (
          <div className="at-empty">
            <div className="at-spinner" />
            <p>Loading tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="at-empty">
            <p>No tickets found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="at-table-scroll">
              <table className="at-table">
                <thead>
                  <tr>
                    {[
                      { label: "#", field: "id" },
                      { label: "User", field: "username" },
                      { label: "Phone", field: "phone" },
                      { label: "Workspace", field: "workspace" },
                      { label: "Location", field: "location" },
                      { label: "Booking", field: "booking_status" },
                      { label: "Issue", field: "issue_type" },
                      { label: "Priority", field: "priority" },
                      { label: "Status", field: "status" },
                      { label: "Admin Note", field: null },
                      { label: "Update", field: null },
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        className={field ? "sortable" : ""}
                        onClick={() => field && handleSort(field)}
                      >
                        {label} {field && <SortIcon field={field} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t, i) => (
                    <tr key={t.id} style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="cell-id">#{t.id}</td>
                      <td className="cell-user">{t.username}</td>
                      <td className="cell-phone">{t.phone}</td>
                      <td className="cell-workspace">{t.workspace || t.special_category || "-"}</td>
                      <td className="cell-location">{t.location || "-"}</td>
                      <td className="cell-booking">{t.booking_status || "-"}</td>
                      <td className="cell-issue">{t.issue_type}</td>
                      <td className="cell-priority">
                        <span className={`badge-priority bp-${(t.priority || "low").toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="cell-status">
                        <span className={`badge-status bs-${(t.status || "open").toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="cell-note">
                        <div className="note-wrap">
                          <textarea
                            value={notes[t.id] || ""}
                            onChange={(e) => handleNoteChange(t.id, e.target.value)}
                            placeholder="Write note…"
                            rows={1}
                          />
                          <button
                            className="btn-save-note"
                            disabled={savingNote === t.id}
                            onClick={() => saveNote(t.id)}
                          >
                            {savingNote === t.id ? "…" : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="cell-action">
                        <select
                          value={t.status || "open"}
                          disabled={updatingId === t.id}
                          onChange={(e) => updateTicket(t.id, e.target.value)}
                          className={`status-select ss-${(t.status || "open").toLowerCase()}`}
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
            <div className="at-mobile-cards">
              {filteredTickets.map((t) => (
                <div className="at-card" key={t.id}>
                  <div
                    className="at-card-top"
                    onClick={() => setExpandedCard(expandedCard === t.id ? null : t.id)}
                  >
                    <div className="at-card-user">
                      <div className="at-card-avatar">
                        {(t.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <h4>{t.username}</h4>
                        <p>{t.phone}</p>
                      </div>
                    </div>
                    <div className="at-card-badges">
                      <span className={`badge-status bs-${(t.status || "open").toLowerCase()}`}>
                        {t.status}
                      </span>
                      <span className={`badge-priority bp-${(t.priority || "low").toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </div>
                    <span className="at-card-chevron">{expandedCard === t.id ? "▲" : "▼"}</span>
                  </div>

                  {expandedCard === t.id && (
                    <div className="at-card-body">
                      <div className="at-card-grid">
                        {[
                          ["Workspace", t.workspace || t.special_category || "-"],
                          ["Location", t.location || "-"],
                          ["Booking", t.booking_status || "-"],
                          ["Issue", t.issue_type],
                        ].map(([label, val]) => (
                          <div key={label} className="at-card-field">
                            <span>{label}</span>
                            <p>{val}</p>
                          </div>
                        ))}
                      </div>

                      <div className="at-card-note">
                        <label>Admin Note</label>
                        <textarea
                          value={notes[t.id] || ""}
                          onChange={(e) => handleNoteChange(t.id, e.target.value)}
                          placeholder="Write admin note…"
                          rows={2}
                        />
                        <button
                          className="btn-save-note"
                          disabled={savingNote === t.id}
                          onClick={() => saveNote(t.id)}
                        >
                          {savingNote === t.id ? "Saving…" : "Save Note"}
                        </button>
                      </div>

                      <div className="at-card-action">
                        <label>Update Status</label>
                        <select
                          value={t.status || "open"}
                          disabled={updatingId === t.id}
                          onChange={(e) => updateTicket(t.id, e.target.value)}
                          className={`status-select ss-${(t.status || "open").toLowerCase()}`}
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  )}
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
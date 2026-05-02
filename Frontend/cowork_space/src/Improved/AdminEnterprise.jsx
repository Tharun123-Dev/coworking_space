import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "./AdminEnterprise.css";

const STATUS_OPTIONS = ["new", "contacted", "closed"];

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const AVATAR_COLORS = ["#D97706","#B45309","#92400E","#78350F","#F59E0B","#FBBF24"];

function avatarColor(name = "") {
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState({});

  const fetchLeads = async () => {
    try {
      const res = await axiosInstance.get("leads/modern-lead/all/");
      setLeads(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await axiosInstance.put(`leads/modern-lead/update/${id}/`, { status });
      // optimistic update — no refetch needed
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } catch (err) {
      console.error("Update error:", err);
      fetchLeads(); // rollback on error
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     leads.length,
    new:       leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    closed:    leads.filter((l) => l.status === "closed").length,
  };

  return (
    <div className="al-page">

      {/* ── HEADER ── */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">✦</div>
          <div>
            <h1 className="al-title">Leads Dashboard</h1>
            <p className="al-subtitle">Manage workspace enquiries and track your pipeline</p>
          </div>
        </div>
        <div className="al-badge">Admin Panel</div>
      </div>

      {/* ── STATS ── */}
      <div className="al-stats">
        {[
          { label: "Total Leads", value: stats.total,     key: "all",       icon: "◈" },
          { label: "New",         value: stats.new,       key: "new",       icon: "✦" },
          { label: "Contacted",   value: stats.contacted, key: "contacted", icon: "◉" },
          { label: "Closed",      value: stats.closed,    key: "closed",    icon: "✔" },
        ].map((s) => (
          <div
            key={s.key}
            className={`al-stat-card ${statusFilter === s.key ? "active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s.key ? "all" : s.key)}
          >
            <span className="al-stat-icon">{s.icon}</span>
            <span className="al-stat-value">{s.value}</span>
            <span className="al-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── CONTROLS ── */}
      <div className="al-controls">
        <div className="al-search-wrap">
          <span className="al-search-icon">⌕</span>
          <input
            className="al-search"
            type="text"
            placeholder="Search name, email, phone, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="al-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <select
          className="al-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* ── COUNT ── */}
      <div className="al-count">
        Showing <strong>{filtered.length}</strong> of <strong>{leads.length}</strong> leads
      </div>

      {/* ── TABLE ── */}
      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company</th>
              <th>Message</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((lead) => {
                const color = avatarColor(lead.name || "");
                return (
                  <tr
                    key={lead.id}
                    className={updating[lead.id] ? "al-row-updating" : ""}
                  >
                    <td data-label="Name">
                      <div className="al-name-cell">
                        <div
                          className="al-avatar"
                          style={{ background: color + "18", color }}
                        >
                          {(lead.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="al-name">{lead.name}</span>
                      </div>
                    </td>

                    <td data-label="Phone">
                      <span className="al-mono">{lead.phone}</span>
                    </td>

                    <td data-label="Email">
                      <span className="al-mono">{lead.email || "—"}</span>
                    </td>

                    <td data-label="Company">
                      {lead.company
                        ? <span className="al-company">{lead.company}</span>
                        : <span className="al-dash">—</span>}
                    </td>

                    <td data-label="Message" className="al-msg">
                      <span title={lead.message}>{lead.message || "—"}</span>
                    </td>

                    <td data-label="Status">
                      <span className={`al-badge-status al-status-${lead.status}`}>
                        <span className="al-dot" />
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </td>

                    <td data-label="Contact">
                      <div className="al-contact-btns">
                        <a href={`tel:${lead.phone}`} className="al-call-btn">
                          📞 Call
                        </a>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="al-mail-btn">
                            ✉ Mail
                          </a>
                        )}
                      </div>
                    </td>

                    <td data-label="Actions">
                      <select
                        className="al-select"
                        value={lead.status}
                        disabled={updating[lead.id]}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="al-empty">
                  <div className="al-empty-inner">
                    <span className="al-empty-icon">✦</span>
                    <p>No leads found</p>
                    <small>Try adjusting your search or filter</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLeads;
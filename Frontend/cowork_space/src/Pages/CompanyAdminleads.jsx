import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminCompanyLeads.module.css";

const STATUS_OPTIONS = ["all", "pending", "contacted", "closed"];
const STATUS_COLORS = {
  pending: { bg: "#FFF8E7", color: "#B8860B", dot: "#D4A017" },
  contacted: { bg: "#E8F4FD", color: "#1A6FA8", dot: "#2196F3" },
  closed: { bg: "#EAFAF1", color: "#1A7A3C", dot: "#2ECC71" },
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={styles.statCard} style={{ borderTop: `3px solid ${accent}` }}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span
      className={styles.statusBadge}
      style={{ background: s.bg, color: s.color }}
    >
      <span className={styles.statusDot} style={{ background: s.dot }} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
    </span>
  );
}

function AdminCompanyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // table | card
  const [editingStatus, setEditingStatus] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("leads/company/admin/");
      setLeads(res.data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`leads/company/status/${id}/`, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      setEditingStatus(null);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Status update failed");
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedLeads.length === 0) return;
    try {
      await Promise.all(selectedLeads.map(id =>
        axiosInstance.put(`leads/company/status/${id}/`, { status: bulkStatus })
      ));
      setLeads(prev => prev.map(l =>
        selectedLeads.includes(l.id) ? { ...l, status: bulkStatus } : l
      ));
      setSelectedLeads([]);
      setBulkStatus("");
    } catch (err) {
      alert("Bulk update failed");
    }
  };

  const locations = useMemo(() => {
    const locs = [...new Set(leads.map(l => l.location).filter(Boolean))];
    return ["all", ...locs];
  }, [leads]);

  const owners = useMemo(() => {
    const ows = [...new Set(leads.map(l => l.owner_name).filter(Boolean))];
    return ["all", ...ows];
  }, [leads]);

  const filtered = useMemo(() => {
    let data = leads.filter(l => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q);
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchLoc = locationFilter === "all" || l.location === locationFilter;
      const matchOwner = ownerFilter === "all" || l.owner_name === ownerFilter;
      return matchSearch && matchStatus && matchLoc && matchOwner;
    });

    data = [...data].sort((a, b) => {
      let va = (a[sortField] || "").toString().toLowerCase();
      let vb = (b[sortField] || "").toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [leads, search, statusFilter, locationFilter, ownerFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleSelect = (id) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = paginated.map(l => l.id);
    if (ids.every(id => selectedLeads.includes(id))) {
      setSelectedLeads(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedLeads(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const stats = useMemo(() => ({
    total: leads.length,
    pending: leads.filter(l => l.status === "pending" || !l.status).length,
    contacted: leads.filter(l => l.status === "contacted").length,
    closed: leads.filter(l => l.status === "closed").length,
  }), [leads]);

  const exportCSV = () => {
    const headers = ["Name", "Company", "Team", "Phone", "Email", "Location", "Owner", "Status"];
    const rows = filtered.map(l => [
      l.name, l.company, l.team_size, l.phone, l.email, l.location, l.owner_name, l.status
    ].map(v => `"${v || ""}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "company_leads.csv"; a.click();
  };

  const SortIcon = ({ field }) => (
    <span className={styles.sortIcon}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "⇅"}
    </span>
  );

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <span className={styles.headerIcon}>◈</span>
          </div>
          <div>
            <h1 className={styles.pageTitle}>Company Leads</h1>
            <p className={styles.pageSubtitle}>Admin · Manage all company leads</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={fetchLeads}>↻ Refresh</button>
          <button className={styles.btnGold} onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard icon="📋" label="Total Leads" value={stats.total} accent="#C9A84C" />
        <StatCard icon="🕐" label="Pending" value={stats.pending} accent="#D4A017" />
        <StatCard icon="📞" label="Contacted" value={stats.contacted} accent="#2196F3" />
        <StatCard icon="✅" label="Closed" value={stats.closed} accent="#2ECC71" />
      </div>

      {/* Filters */}
      <div className={styles.filtersPanel}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search name, company, email, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => { setSearch(""); setPage(1); }}>✕</button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={locationFilter}
            onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
          >
            {locations.map(l => (
              <option key={l} value={l}>{l === "all" ? "All Locations" : l}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={ownerFilter}
            onChange={e => { setOwnerFilter(e.target.value); setPage(1); }}
          >
            {owners.map(o => (
              <option key={o} value={o}>{o === "all" ? "All Owners" : o}</option>
            ))}
          </select>
        </div>

        <div className={styles.viewToggle}>
          <button
            className={viewMode === "table" ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => setViewMode("table")}
            title="Table view"
          >☰</button>
          <button
            className={viewMode === "card" ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => setViewMode("card")}
            title="Card view"
          >⊞</button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedLeads.length} selected</span>
          <select
            className={styles.filterSelect}
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
          >
            <option value="">Change status to…</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <button className={styles.btnGold} onClick={handleBulkUpdate}>Apply</button>
          <button className={styles.btnOutline} onClick={() => setSelectedLeads([])}>Clear</button>
        </div>
      )}

      {/* Results count */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} leads
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <p className={styles.stateText}>Loading leads…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.stateBox}>
          <span className={styles.emptyIcon}>🗂</span>
          <p className={styles.stateTitle}>No leads found</p>
          <p className={styles.stateText}>Try adjusting your filters or search term.</p>
          <button className={styles.btnGold} onClick={() => {
            setSearch(""); setStatusFilter("all");
            setLocationFilter("all"); setOwnerFilter("all");
          }}>Clear Filters</button>
        </div>
      ) : viewMode === "table" ? (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={paginated.length > 0 && paginated.every(l => selectedLeads.includes(l.id))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {[
                    { key: "name", label: "Name" },
                    { key: "company", label: "Company" },
                    { key: "team_size", label: "Team" },
                    { key: "phone", label: "Phone" },
                    { key: "email", label: "Email" },
                    { key: "location", label: "Location" },
                    {
  key: "workspace_type",
  label: "Workspace"
},
                    { key: "owner_name", label: "Owner" },
                    { key: "status", label: "Status" },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={styles.sortable}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label} <SortIcon field={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(lead => (
                  <tr
                    key={lead.id}
                    className={selectedLeads.includes(lead.id) ? styles.rowSelected : styles.row}
                  >
                    <td className={styles.checkCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                      />
                    </td>
                    <td data-label="Name">
                      <div className={styles.leadName}>
                        <span className={styles.avatar}>
                          {(lead.name || "?")[0].toUpperCase()}
                        </span>
                        <strong>{lead.name || "—"}</strong>
                      </div>
                    </td>
                    <td data-label="Company">
                      <span className={styles.companyText}>{lead.company || "—"}</span>
                    </td>
                    <td data-label="Team">
                      {lead.team_size ? (
                        <span className={styles.teamBadge}>{lead.team_size}</span>
                      ) : "—"}
                    </td>
                    <td data-label="Phone">
                      {lead.phone
                        ? <a href={`tel:${lead.phone}`} className={styles.link}>📞 {lead.phone}</a>
                        : "—"}
                    </td>
                    <td data-label="Email">
                      {lead.email
                        ? <a href={`mailto:${lead.email}`} className={styles.link}>✉ {lead.email}</a>
                        : "—"}
                    </td>
                    <td data-label="Location">
                      <span className={styles.locationTag}>
                        📍 {lead.location || "No Location"}
                      </span>
                    </td>
                    <td data-label="Workspace">

  <span className={styles.teamBadge}>

    {lead.workspace_type || "—"}

  </span>

</td>
                    <td data-label="Owner">
                      {lead.owner_name
                        ? <span className={styles.ownerAssigned}>{lead.owner_name}</span>
                        : <span className={styles.ownerUnassigned}>Unassigned</span>}
                    </td>
                    <td data-label="Status">
                      {editingStatus === lead.id ? (
                        <select
                          autoFocus
                          className={styles.statusSelect}
                          value={lead.status || "pending"}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          onBlur={() => setEditingStatus(null)}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : (
                        <span
                          className={styles.statusClickable}
                          onClick={() => setEditingStatus(lead.id)}
                          title="Click to change"
                        >
                          <StatusBadge status={lead.status || "pending"} />
                          <span className={styles.editHint}>✎</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card view */
        <div className={styles.cardGrid}>
          {paginated.map(lead => (
            <div
              key={lead.id}
              className={selectedLeads.includes(lead.id) ? styles.leadCardSelected : styles.leadCard}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardCheckAva}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                  />
                  <div className={styles.cardAvatar}>
                    {(lead.name || "?")[0].toUpperCase()}
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <p className={styles.cardName}>{lead.name || "—"}</p>
                  <p className={styles.cardCompany}>{lead.company || "—"}</p>
                </div>
                <StatusBadge status={lead.status || "pending"} />
              </div>

              <div className={styles.cardBody}>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className={styles.cardRow}>
                    <span>📞</span><span>{lead.phone}</span>
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className={styles.cardRow}>
                    <span>✉</span><span className={styles.cardEmail}>{lead.email}</span>
                  </a>
                )}
                {lead.location && (
                  <div className={styles.cardRow}>
                    <span>📍</span><span>{lead.location}</span>
                  </div>
                )}
                {lead.team_size && (
                  <div className={styles.cardRow}>
                    <span>👥</span><span>Team: {lead.team_size}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <span className={lead.owner_name ? styles.ownerAssigned : styles.ownerUnassigned}>
                  {lead.owner_name ? `👤 ${lead.owner_name}` : "Unassigned"}
                </span>
                <select
                  className={styles.statusSelect}
                  value={lead.status || "pending"}
                  onChange={e => updateStatus(lead.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(1)}
            disabled={page === 1}
          >«</button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => Math.abs(p - page) <= 2)
            .map(p => (
              <button
                key={p}
                className={p === page ? styles.pageBtnActive : styles.pageBtn}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >›</button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >»</button>
        </div>
      )}
    </div>
  );
}

export default AdminCompanyLeads;

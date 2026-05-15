import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminQuotationLeads.module.css";
import {
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiList,
  FiGrid,
} from "react-icons/fi";
import { MdOutlineRequestQuote } from "react-icons/md";
import { BsClock, BsTelephone, BsCheckCircle } from "react-icons/bs";

const STATUS_OPTIONS = ["pending", "contacted", "closed"];

export default function AdminQuotationLeads() {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    axiosInstance
      .get("leads/admin/quotation-leads/")
      .then((res) => {
        setLeads(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    let data = [...leads];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((l) => l.status === statusFilter);
    if (locationFilter !== "all") data = data.filter((l) => l.preferred_location === locationFilter);
    if (ownerFilter !== "all") data = data.filter((l) => l.owner_name === ownerFilter);
    setFiltered(data);
  }, [search, statusFilter, locationFilter, ownerFilter, leads]);

  const updateStatus = (id, status) => {
    axiosInstance
      .patch(`leads/admin/quotation-leads/${id}/status/`, { status })
      .then(fetchLeads)
      .catch((err) => console.log(err));
  };

  const exportCSV = () => {
    const headers = ["Name","Phone","Email","Company","Location","Owner","Workspace","Units","Total","Status"];
    const rows = filtered.map((l) => [
      l.name, l.phone, l.email, l.company || "-",
      l.preferred_location, l.owner_name, l.workspace_type,
      l.quotation_details?.map((q) => q.units).join(" | "),
      `₹${l.total_amount}`, l.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotation_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((l) => l.id));

  const locations = [...new Set(leads.map((l) => l.preferred_location).filter(Boolean))];
  const owners = [...new Set(leads.map((l) => l.owner_name).filter(Boolean))];

  const stats = {
    total: leads.length,
    pending: leads.filter((l) => l.status === "pending").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  return (
    <div className={styles.pageWrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <MdOutlineRequestQuote />
          </div>
          <div>
            <h1 className={styles.pageTitle}>Quotation Leads</h1>
            <p className={styles.pageSubtitle}>Admin · Manage all quotation leads</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={fetchLeads} disabled={loading}>
            <FiRefreshCw className={loading ? styles.spinning : ""} />
            <span>Refresh</span>
          </button>
          <button className={styles.btnExport} onClick={exportCSV}>
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <MdOutlineRequestQuote className={styles.statIcon} />
          <div className={styles.statNumber}>{stats.total}</div>
          <div className={styles.statLabel}>Total Leads</div>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <BsClock className={styles.statIcon} />
          <div className={styles.statNumber}>{stats.pending}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={`${styles.statCard} ${styles.statContacted}`}>
          <BsTelephone className={styles.statIcon} />
          <div className={styles.statNumber}>{stats.contacted}</div>
          <div className={styles.statLabel}>Contacted</div>
        </div>
        <div className={`${styles.statCard} ${styles.statClosed}`}>
          <BsCheckCircle className={styles.statIcon} />
          <div className={styles.statNumber}>{stats.closed}</div>
          <div className={styles.statLabel}>Closed</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search name, company, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterSelects}>
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select className={styles.filterSelect} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="all">All Locations</option>
            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select className={styles.filterSelect} value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="all">All Owners</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === "table" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <FiList />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <FiGrid />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className={styles.countText}>
        Showing 1–{filtered.length} of {filtered.length} leads
      </p>

      {/* Table View */}
      {viewMode === "table" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className={styles.checkbox}
                  />
                </th>
                <th>Name ↑</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Workspace</th>
                <th>Units</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={selected.includes(item.id) ? styles.rowSelected : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{item.name?.[0]?.toUpperCase()}</div>
                      <span className={styles.nameMuted}>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.company || "-"}</td>
                  <td>
                    <span className={styles.phone}>📞 {item.phone}</span>
                  </td>
                  <td>
                    <span className={styles.email}>✉ {item.email}</span>
                  </td>
                  <td>
                    <span className={styles.location}>📍 {item.preferred_location}</span>
                  </td>
                  <td>{item.owner_name || "Unassigned"}</td>
                  <td>{item.workspace_type || "—"}</td>
                  <td>{item.quotation_details?.map((q) => q.units).join(", ") || "—"}</td>
                  <td className={styles.totalCell}>₹{item.total_amount}</td>
                  <td>
                    <span className={`${styles.statusPill} ${styles["status_" + item.status]}`}>
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="12" className={styles.emptyRow}>No Quotation Leads Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <div key={item.id} className={styles.leadCard}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{item.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className={styles.cardName}>{item.name}</div>
                  <div className={styles.cardCompany}>{item.company || "—"}</div>
                </div>
                <span className={`${styles.statusPill} ${styles["status_" + item.status]}`}>
                  {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardRow}><span>📞</span>{item.phone}</div>
                <div className={styles.cardRow}><span>✉</span>{item.email}</div>
                <div className={styles.cardRow}><span>📍</span>{item.preferred_location}</div>
                <div className={styles.cardRow}><span>🏢</span>{item.workspace_type || "—"}</div>
                <div className={styles.cardRow}><span>💰</span>₹{item.total_amount}</div>
              </div>
              <div className={styles.cardFooter}>
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={styles.emptyRow}>No Quotation Leads Found</p>
          )}
        </div>
      )}
    </div>
  );
}
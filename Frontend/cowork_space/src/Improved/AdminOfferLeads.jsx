import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "./AdminOfferLeads.module.css";

const STATUS_OPTIONS = ["New", "Contacted", "Interested", "Converted"];

const STATUS_COLORS = {
  New: "statusNew",
  Contacted: "statusContacted",
  Interested: "statusInterested",
  Converted: "statusConverted",
};

function AdminOfferLeads() {
  const { id } = useParams();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const PAGE_SIZE = 8;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeads = () => {
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`leads/offers/admin/leads/${id}/`)
      .then((res) => setLeads(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load leads. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = (leadId, status) => {
    setUpdatingId(leadId);
    axiosInstance
      .put(`offers/leads/status/${leadId}/`, { status })
      .then(() => {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
        showToast(`Status updated to "${status}"`);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to update status", "error");
      })
      .finally(() => setUpdatingId(null));
  };

  const deleteLead = (leadId) => {
    axiosInstance
      .delete(`offers/leads/${leadId}/`)
      .then(() => {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        showToast("Lead deleted successfully");
        setDeleteConfirm(null);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to delete lead", "error");
        setDeleteConfirm(null);
      });
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const filteredLeads = useMemo(() => {
    let data = [...leads];
    if (filterStatus !== "All") data = data.filter((l) => l.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.owner_name?.toLowerCase().includes(q) ||
          l.preferred_location?.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = (a[sortConfig.key] || "").toString().toLowerCase();
        const valB = (b[sortConfig.key] || "").toString().toLowerCase();
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }
    return data;
  }, [leads, filterStatus, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    }, {});
  }, [leads]);

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className={styles.sortIcon}>↕</span>;
    return (
      <span className={`${styles.sortIcon} ${styles.sortActive}`}>
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const statAccents = {
    New: "#1a6fa8",
    Contacted: "#c9a84c",
    Interested: "#9b59b6",
    Converted: "#1e8449",
  };

  return (
    <div className={styles.wrapper}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>Delete Lead?</h3>
            <p className={styles.modalText}>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.btnDeleteConfirm} onClick={() => deleteLead(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>🎯</div>
          <div>
            <h2 className={styles.pageTitle}>Offer Workspace Leads</h2>
            <p className={styles.pageSubtitle}>{leads.length} total leads tracked</p>
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={fetchLeads}>↺ Refresh</button>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {STATUS_OPTIONS.map((s) => (
          <div
            key={s}
            className={`${styles.statCard} ${filterStatus === s ? styles.statCardActive : ""}`}
            style={{ borderTop: `3px solid ${statAccents[s]}` }}
            onClick={() => { setFilterStatus(s === filterStatus ? "All" : s); setCurrentPage(1); }}
          >
            <span className={styles.statCount} style={{ color: statAccents[s] }}>{stats[s]}</span>
            <span className={styles.statLabel}>{s}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, location..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => { setSearchQuery(""); setCurrentPage(1); }}>✕</button>
          )}
        </div>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing {filteredLeads.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length} leads
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p className={styles.stateText}>Loading leads…</p>
          </div>
        ) : error ? (
          <div className={styles.stateBox}>
            <span className={styles.emptyIcon}>⚠️</span>
            <p className={styles.stateTitle}>Something went wrong</p>
            <p className={styles.stateText}>{error}</p>
            <button className={styles.btnGold} onClick={fetchLeads}>Retry</button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className={styles.stateBox}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.stateTitle}>No leads found</p>
            <p className={styles.stateText}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th className={styles.sortable} onClick={() => handleSort("owner_name")}>Owner <SortIcon col="owner_name" /></th>
                  <th className={styles.sortable} onClick={() => handleSort("workspace_type")}>Workspace <SortIcon col="workspace_type" /></th>
                  <th className={styles.sortable} onClick={() => handleSort("preferred_location")}>Location <SortIcon col="preferred_location" /></th>
                  <th className={styles.sortable} onClick={() => handleSort("name")}>Name <SortIcon col="name" /></th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Team Size</th>
                  <th>Coupon</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${styles.row} ${updatingId === item.id ? styles.rowUpdating : ""}`}
                  >
                    <td data-label="#">
                      <span className={styles.rowNum}>{(currentPage - 1) * PAGE_SIZE + index + 1}</span>
                    </td>

                    <td data-label="Owner">
                      <div className={styles.ownerCell}>
                        <div className={styles.avatar}>{(item.owner_name || "?")[0].toUpperCase()}</div>
                        <span className={styles.ownerName}>{item.owner_name || "—"}</span>
                      </div>
                    </td>

                    <td data-label="Workspace">
                      <div className={styles.workspaceInfo}>
                        <strong className={styles.workspaceTitle}>{item.workspace_type || "—"}</strong>
                        <small className={styles.workspaceSub}>
                          <span>{item.preferred_location || "Hyderabad"}</span>
                          <span className={styles.sep}>·</span>
                          <span className={styles.typePill}>{item.workspace_type || "—"}</span>
                        </small>
                      </div>
                    </td>

                    <td data-label="Location">
                      <span className={styles.locationText}>📍 {item.preferred_location || "—"}</span>
                    </td>

                    <td data-label="Name">
                      <div className={styles.nameCell}>
                        <div className={styles.leadAvatar}>{(item.name || "?")[0].toUpperCase()}</div>
                        <span>{item.name || "—"}</span>
                      </div>
                    </td>

                    <td data-label="Phone">
                      <a href={`tel:${item.phone}`} className={styles.link}>📞 {item.phone || "—"}</a>
                    </td>

                    <td data-label="Email">
                      <a href={`mailto:${item.email}`} className={styles.link}>✉ {item.email || "—"}</a>
                    </td>

                    <td data-label="Team Size">
                      <span className={styles.centerCell}>{item.team_size ?? "—"}</span>
                    </td>

                    <td data-label="Coupon">
                      {item.coupon_code ? (
                        <span className={styles.couponCode}>{item.coupon_code}</span>
                      ) : (
                        <span className={styles.nullText}>—</span>
                      )}
                    </td>

                    <td data-label="Discount">
                      {item.discount_percentage ? (
                        <div className={styles.discountInfo}>
                          <strong className={styles.discountText}>{item.discount_percentage}% OFF</strong>
                          <small className={styles.discountSave}>Save ₹{item.discount_amount || 0}</small>
                        </div>
                      ) : (
                        <span className={styles.nullText}>—</span>
                      )}
                    </td>

                    <td data-label="Final Price">
                      <span className={styles.finalPrice}>₹{item.final_price || 0}</span>
                    </td>

                    <td data-label="Status">
                      <span className={`${styles.badge} ${styles[STATUS_COLORS[item.status]] || styles.statusNew}`}>
                        {item.status || "New"}
                      </span>
                    </td>

                    <td data-label="Update">
                      <select
                        className={styles.statusSelect}
                        value={item.status || "New"}
                        disabled={updatingId === item.id}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    <td data-label="Delete">
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteConfirm(item.id)}
                        title="Delete lead"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
          <button className={styles.pageBtn} onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - currentPage) <= 2)
            .map((p) => (
              <button
                key={p}
                className={p === currentPage ? styles.pageBtnActive : styles.pageBtn}
                onClick={() => setCurrentPage(p)}
              >{p}</button>
            ))}
          <button className={styles.pageBtn} onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>›</button>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}

export default AdminOfferLeads;
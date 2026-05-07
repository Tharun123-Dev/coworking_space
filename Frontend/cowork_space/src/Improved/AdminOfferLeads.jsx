import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "./AdminOfferLeads.module.css";

const STATUS_OPTIONS = ["New", "Contacted", "Interested", "Converted"];

const STATUS_COLORS = {
  New: "status-new",
  Contacted: "status-contacted",
  Interested: "status-interested",
  Converted: "status-converted",
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
      .then((res) => {
        setLeads(Array.isArray(res.data) ? res.data : []);
      })
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
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status } : l))
        );
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

    if (filterStatus !== "All") {
      data = data.filter((l) => l.status === filterStatus);
    }

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
    const counts = STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    }, {});
    return counts;
  }, [leads]);

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className={styles.sortIcon}>↕</span>;
    return (
      <span className={`${styles.sortIcon} ${styles.sortActive}`}>
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3>Delete Lead?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => deleteLead(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Offer Workspace Leads</h2>
          <p>{leads.length} total leads tracked</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchLeads} title="Refresh">
          ↺ Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {STATUS_OPTIONS.map((s) => (
          <div
            key={s}
            className={`${styles.statCard} ${styles[STATUS_COLORS[s]]}`}
            onClick={() => {
              setFilterStatus(s === filterStatus ? "All" : s);
              setCurrentPage(1);
            }}
          >
            <span className={styles.statCount}>{stats[s]}</span>
            <span className={styles.statLabel}>{s}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="🔍  Search by name, email, phone..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.centered}>
            <div className={styles.spinner} />
            <p>Loading leads...</p>
          </div>
        ) : error ? (
          <div className={styles.centered}>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryBtn} onClick={fetchLeads}>
              Retry
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className={styles.centered}>
            <p className={styles.emptyText}>No leads found.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort("owner_name")} className={styles.sortable}>
                  Owner <SortIcon col="owner_name" />
                </th>
                <th onClick={() => handleSort("workspace_type")} className={styles.sortable}>
                  Workspace <SortIcon col="workspace_type" />
                </th>
                <th onClick={() => handleSort("preferred_location")} className={styles.sortable}>
                  Location <SortIcon col="preferred_location" />
                </th>
                <th onClick={() => handleSort("name")} className={styles.sortable}>
                  Name <SortIcon col="name" />
                </th>
                <th>Phone</th>
                <th>Email</th>
                <th>Team Size</th>
                <th>Status</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((item, index) => (
                <tr key={item.id} className={updatingId === item.id ? styles.rowUpdating : ""}>
                  <td className={styles.indexCell}>
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td>{item.owner_name || "—"}</td>
                  <td>{item.workspace_type || "—"}</td>
                  <td>{item.preferred_location || "—"}</td>
                  <td className={styles.nameCell}>{item.name || "—"}</td>
                  <td>
                    <a href={`tel:${item.phone}`} className={styles.link}>
                      {item.phone || "—"}
                    </a>
                  </td>
                  <td>
                    <a href={`mailto:${item.email}`} className={styles.link}>
                      {item.email || "—"}
                    </a>
                  </td>
                  <td className={styles.centerCell}>{item.team_size ?? "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[STATUS_COLORS[item.status]]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
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
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOfferLeads;

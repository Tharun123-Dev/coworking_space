import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/OwnerLeads.css";

function OwnerLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axiosInstance.get("leads/special/owner/");
      setLeads(res.data || []);
    } catch (err) {
      console.log(err);
      showToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setLeads((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      await axiosInstance.put(`leads/special/update/${id}/`, { status });
      showToast(`Status updated to "${status}" ✓`);
      fetchLeads(true);
    } catch (err) {
      console.log(err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status = "") => {
    const s = status.toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "contacted") return "status-contacted";
    if (s === "confirmed") return "status-confirmed";
    if (s === "cancelled") return "status-cancelled";
    return "status-pending";
  };

  const handleImageClick = (item) => {
    setSelectedLead(item);
    setActiveTab("overview");
    setShowDetails(true);
  };

  const closeModal = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedLead(null);
      setActiveTab("overview");
    }, 200);
  };

  const filteredLeads = leads.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (item.name || "").toLowerCase().includes(q) ||
      (item.company || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.phone || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || (item.status || "pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: leads.length,
    pending: leads.filter((l) => (l.status || "pending") === "pending").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    confirmed: leads.filter((l) => l.status === "confirmed").length,
    cancelled: leads.filter((l) => l.status === "cancelled").length,
  };

  return (
    <section className="owner-leads-page">

      {/* Toast */}
      {toast.show && (
        <div className={`ol-toast ol-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="ol-header">
        <div className="ol-header-left">
          <p className="ol-badge">Owner Panel</p>
          <h2 className="ol-title">Special Leads</h2>
          <p className="ol-subtext">
            Manage special workspace leads, contact users quickly, and update
            request status.
          </p>
        </div>
        <button
          className={`ol-refresh-btn ${refreshing ? "refreshing" : ""}`}
          onClick={() => fetchLeads(true)}
          disabled={refreshing}
          type="button"
        >
          <span className="ol-refresh-icon">↻</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="ol-stats-row">
        {[
          { key: "all",       label: "All Leads",  color: "stat-all" },
          { key: "pending",   label: "Pending",    color: "stat-pending" },
          { key: "contacted", label: "Contacted",  color: "stat-contacted" },
          { key: "confirmed", label: "Confirmed",  color: "stat-confirmed" },
          { key: "cancelled", label: "Cancelled",  color: "stat-cancelled" },
        ].map((s) => (
          <button
            key={s.key}
            type="button"
            className={`ol-stat-card ${s.color} ${statusFilter === s.key ? "active" : ""}`}
            onClick={() => setStatusFilter(s.key)}
          >
            <span className="ol-stat-num">{counts[s.key]}</span>
            <span className="ol-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="ol-toolbar">
        <div className="ol-search-wrap">
          <span className="ol-search-icon">🔍</span>
          <input
            type="text"
            className="ol-search"
            placeholder="Search by name, company, category, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="ol-search-clear"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>
        <select
          className="ol-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table / States */}
      {loading ? (
        <div className="ol-state-box">
          <div className="ol-spinner"></div>
          <p>Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="ol-state-box">
          <div className="ol-empty-icon">📋</div>
          <h3>No leads found</h3>
          <p>
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : "Special leads will appear here once users submit requests."}
          </p>
        </div>
      ) : (
        <div className="ol-table-wrapper">
          <table className="ol-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((item) => (
                <tr key={item.id} className={updatingId === item.id ? "row-updating" : ""}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.category || "workspace"}
                      className="ol-thumb"
                      onClick={() => handleImageClick(item)}
                    />
                  </td>

                  <td>
                    <div className="ol-name-cell">
                      <strong>{item.name || "-"}</strong>
                    </div>
                  </td>

                  <td>
                    <div className="ol-contact-cell">
                      <a href={`tel:${item.phone}`} className="ol-contact-phone">
                        📞 {item.phone || "-"}
                      </a>
                      <div className="ol-contact-icons">
                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                            className="ol-icon-btn"
                            title={item.email}
                          >
                            📧
                          </a>
                        )}
                        {item.phone && (
                          <a
                            href={`https://wa.me/${item.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ol-icon-btn ol-wa"
                            title="WhatsApp"
                          >
                            💬
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>{item.company || "-"}</td>
                  <td>
                    <span className="ol-category-chip">{item.category || "-"}</span>
                  </td>

                  <td className="ol-message-cell">
                    <span title={item.message}>{item.message || "No message"}</span>
                  </td>

                  <td>
                    <span className={`ol-status-badge ${getStatusClass(item.status)}`}>
                      {item.status || "pending"}
                    </span>
                  </td>

                  <td>
                    <select
                      className="ol-action-select"
                      value={item.status || "pending"}
                      disabled={updatingId === item.id}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetails && selectedLead && (
        <div className="ol-overlay" onClick={closeModal}>
          <div className="ol-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="ol-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Hero */}
            <div className="ol-hero">
              <img
                src={selectedLead.image}
                alt={selectedLead.category || "workspace"}
                className="ol-hero-img"
              />
              <div className="ol-hero-overlay"></div>
              <div className="ol-hero-content">
                <span className="ol-mini-chip">Special Lead</span>
                <h3>{selectedLead.category || "Lead Details"}</h3>
                <p>
                  {selectedLead.name} ·{" "}
                  {selectedLead.company || "No company"}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="ol-modal-body">
              <div className="ol-tabs">
                {["overview", "contact", "status"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`ol-tab ${activeTab === tab ? "ol-tab-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="ol-detail-grid">
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Name</span>
                    <strong>{selectedLead.name || "-"}</strong>
                  </div>
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Company</span>
                    <strong>{selectedLead.company || "-"}</strong>
                  </div>
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Category</span>
                    <strong>{selectedLead.category || "-"}</strong>
                  </div>
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Status</span>
                    <span className={`ol-status-badge ${getStatusClass(selectedLead.status)}`}>
                      {selectedLead.status || "pending"}
                    </span>
                  </div>
                  <div className="ol-detail-card ol-detail-full">
                    <span className="ol-detail-label">Message</span>
                    <p className="ol-lead-msg">
                      {selectedLead.message || "No message available."}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === "contact" && (
                <div className="ol-detail-grid">
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Phone</span>
                    <a href={`tel:${selectedLead.phone}`} className="ol-big-link">
                      {selectedLead.phone || "-"}
                    </a>
                  </div>
                  <div className="ol-detail-card">
                    <span className="ol-detail-label">Email</span>
                    <a href={`mailto:${selectedLead.email}`} className="ol-big-link">
                      {selectedLead.email || "-"}
                    </a>
                  </div>
                  <div className="ol-detail-card ol-detail-full">
                    <span className="ol-detail-label">Quick Actions</span>
                    <div className="ol-quick-actions">
                      {selectedLead.phone && (
                        <a
                          href={`https://wa.me/${selectedLead.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ol-quick-btn ol-quick-wa"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                      {selectedLead.email && (
                        <a
                          href={`mailto:${selectedLead.email}`}
                          className="ol-quick-btn ol-quick-email"
                        >
                          📧 Send Email
                        </a>
                      )}
                      {selectedLead.phone && (
                        <a
                          href={`tel:${selectedLead.phone}`}
                          className="ol-quick-btn ol-quick-call"
                        >
                          📞 Call Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Tab */}
              {activeTab === "status" && (
                <div className="ol-status-panel">
                  <div className="ol-status-top">
                    <span className="ol-status-title">Current Status</span>
                    <span className={`ol-status-badge ol-status-big ${getStatusClass(selectedLead.status)}`}>
                      {selectedLead.status || "pending"}
                    </span>
                  </div>
                  <p className="ol-status-desc">
                    Update the status of this lead directly from the table dropdown after
                    closing this popup.
                  </p>
                  <div className="ol-status-hint">
                    <strong>Pending</strong> — needs follow-up &nbsp;·&nbsp;
                    <strong>Contacted</strong> — in progress &nbsp;·&nbsp;
                    <strong>Confirmed</strong> — approved &nbsp;·&nbsp;
                    <strong>Cancelled</strong> — rejected
                  </div>

                  {/* Quick status change inside modal */}
                  <div className="ol-status-quick-change">
                    <p className="ol-detail-label">Change Status</p>
                    <div className="ol-status-btns">
                      {["pending", "contacted", "confirmed", "cancelled"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updatingId === selectedLead.id}
                          className={`ol-status-btn ${getStatusClass(s)} ${
                            (selectedLead.status || "pending") === s ? "ol-status-btn-active" : ""
                          }`}
                          onClick={() => {
                            updateStatus(selectedLead.id, s);
                            setSelectedLead((prev) => ({ ...prev, status: s }));
                          }}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ol-modal-footer">
              <div className="ol-footer-left">
                <span className="ol-footer-name">{selectedLead.name}</span>
                <small>{selectedLead.category || "Special lead"}</small>
              </div>
              <div className="ol-footer-actions">
                {selectedLead.phone && (
                  <a
                    href={`https://wa.me/${selectedLead.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ol-footer-btn ol-footer-wa"
                  >
                    💬 WhatsApp
                  </a>
                )}
                {(selectedLead.status === "pending" || !selectedLead.status) && (
                  <>
                    <button
                      className="ol-footer-btn ol-footer-danger"
                      type="button"
                      onClick={() => updateStatus(selectedLead.id, "cancelled")}
                    >
                      Cancel Lead
                    </button>
                    <button
                      className="ol-footer-btn ol-footer-dark"
                      type="button"
                      onClick={() => {
                        updateStatus(selectedLead.id, "contacted");
                        setSelectedLead((prev) => ({ ...prev, status: "contacted" }));
                      }}
                    >
                      Mark Contacted
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OwnerLeads;
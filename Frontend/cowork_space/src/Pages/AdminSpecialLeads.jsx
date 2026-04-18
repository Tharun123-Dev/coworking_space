import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminSpecialLeads.css";

function AdminSpecialLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDetails]);

  const fetchLeads = () => {
    setLoading(true);
    axiosInstance
      .get("leads/special/admin/")
      .then((res) => {
        setLeads(res.data || []);
      })
      .catch(() => {
        setLeads([]);
      })
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    let data = [...leads];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.user?.toLowerCase().includes(q) ||
          item.company?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.owner?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (ownerFilter) {
      data = data.filter((item) => item.owner === ownerFilter);
    }

    return data;
  }, [leads, search, statusFilter, ownerFilter]);

  const uniqueOwners = useMemo(() => {
    return [...new Set(leads.map((i) => i.owner).filter(Boolean))];
  }, [leads]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      pending: leads.filter((i) => i.status === "Pending").length,
      contacted: leads.filter((i) => i.status === "Contacted").length,
      converted: leads.filter((i) => i.status === "Converted").length,
    };
  }, [leads]);

  const getStatusClass = (status) => {
    if (status === "Pending") return "status pending";
    if (status === "Contacted") return "status contacted";
    if (status === "Converted") return "status converted";
    return "status";
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setActiveTab("overview");
    setShowDetails(true);
  };

  const closeLeadDetails = () => {
    setShowDetails(false);
    setTimeout(() => setSelectedLead(null), 150);
  };

  return (
    <div className="admin-leads-container">
      <div className="admin-leads-shell">
        <div className="header">
          <div>
            <p className="page-kicker">Admin Panel</p>
            <h2>Admin Special Leads</h2>
            <p className="page-subtext">
              Track special requests, owner assignment, and lead contact details.
            </p>
          </div>

          <button className="refresh-btn" onClick={fetchLeads} type="button">
            Refresh
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <span>Total Leads</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-box">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="stat-box">
            <span>Contacted</span>
            <strong>{stats.contacted}</strong>
          </div>
          <div className="stat-box">
            <span>Converted</span>
            <strong>{stats.converted}</strong>
          </div>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search user, company, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="">All Owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-box">
              <div className="loading-spinner"></div>
              <div className="loading">Loading leads...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-box">
              <h3>No leads found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="desktop-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>User</th>
                      <th>Owner</th>
                      <th>Category</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={item.image}
                            alt={item.category || "workspace"}
                            className="lead-thumb"
                            onClick={() => openLeadDetails(item)}
                          />
                        </td>
                        <td>{item.user || "-"}</td>
                        <td>{item.owner || "-"}</td>
                        <td>{item.category || "-"}</td>
                        <td>{item.company || "-"}</td>
                        <td className="contact-icons">
                          <a href={`tel:${item.phone}`} aria-label="Call lead">
                            📞
                          </a>
                          <a href={`mailto:${item.email}`} aria-label="Email lead">
                            📧
                          </a>
                        </td>
                        <td>
                          <span className={getStatusClass(item.status)}>
                            {item.status || "-"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-btn"
                            type="button"
                            onClick={() => openLeadDetails(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {filtered.map((item) => (
                  <div className="lead-mobile-card" key={item.id}>
                    <div className="lead-mobile-top">
                      <img
                        src={item.image}
                        alt={item.category || "workspace"}
                        className="lead-mobile-thumb"
                        onClick={() => openLeadDetails(item)}
                      />

                      <div className="lead-mobile-main">
                        <h3>{item.user || "-"}</h3>
                        <p>{item.company || "No company"}</p>
                        <span className={getStatusClass(item.status)}>
                          {item.status || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="lead-mobile-info">
                      <div className="mobile-info-item">
                        <span>Owner</span>
                        <strong>{item.owner || "-"}</strong>
                      </div>
                      <div className="mobile-info-item">
                        <span>Category</span>
                        <strong>{item.category || "-"}</strong>
                      </div>
                    </div>

                    <div className="lead-mobile-actions">
                      <a href={`tel:${item.phone}`} className="icon-btn">
                        Call
                      </a>
                      <a href={`mailto:${item.email}`} className="icon-btn secondary">
                        Email
                      </a>
                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => openLeadDetails(item)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {showDetails && selectedLead && (
          <div className="lead-modal-overlay" onClick={closeLeadDetails}>
            <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="lead-close-btn"
                type="button"
                onClick={closeLeadDetails}
                aria-label="Close modal"
              >
                ×
              </button>

              <div className="lead-hero">
                <img
                  src={selectedLead.image}
                  alt={selectedLead.category || "special lead"}
                  className="lead-hero-image"
                />
                <div className="lead-hero-overlay"></div>

                <div className="lead-hero-content">
                  <p className="lead-mini-badge">Special Request</p>
                  <h3>{selectedLead.category || "Lead Details"}</h3>
                  <p>{selectedLead.company || "No company available"}</p>
                </div>
              </div>

              <div className="lead-modal-body">
                <div className="lead-tabs">
                  {["overview", "request", "contact"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`lead-tab ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {activeTab === "overview" && (
                  <div className="lead-grid">
                    <div className="info-card">
                      <span className="info-label">User</span>
                      <strong>{selectedLead.user || "-"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Owner</span>
                      <strong>{selectedLead.owner || "-"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Category</span>
                      <strong>{selectedLead.category || "-"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Status</span>
                      <strong className={getStatusClass(selectedLead.status)}>
                        {selectedLead.status || "-"}
                      </strong>
                    </div>
                    <div className="info-card full">
                      <span className="info-label">Company</span>
                      <strong>{selectedLead.company || "-"}</strong>
                    </div>
                  </div>
                )}

                {activeTab === "request" && (
                  <div className="lead-grid">
                    <div className="info-card full">
                      <span className="info-label">Request Message</span>
                      <strong>{selectedLead.message || "No message available"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Lead Type</span>
                      <strong>{selectedLead.category || "-"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Created By</span>
                      <strong>{selectedLead.user || "-"}</strong>
                    </div>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div className="lead-grid">
                    <div className="info-card">
                      <span className="info-label">Phone</span>
                      <strong>{selectedLead.phone || "-"}</strong>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Email</span>
                      <strong>{selectedLead.email || "-"}</strong>
                    </div>
                    <div className="info-card full">
                      <span className="info-label">Quick Actions</span>
                      <div className="lead-actions">
                        <a className="lead-action-btn" href={`tel:${selectedLead.phone}`}>
                          Call Now
                        </a>
                        <a
                          className="lead-action-btn secondary"
                          href={`mailto:${selectedLead.email}`}
                        >
                          Send Email
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSpecialLeads;

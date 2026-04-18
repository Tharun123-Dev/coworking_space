import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "./AdminLeadss.css";

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  workspace_type: "",
  status: "New",
};

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  // FETCH LEADS
  const fetchLeads = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axiosInstance.get("/leads/leadss/");

      setLeads((prevLeads) => {
        if (res.data.length > prevLeads.length && prevLeads.length > 0) {
          alert("New Lead Received!");
        }
        return res.data;
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    const previousLeads = [...leads];

    try {
      setUpdatingId(id);

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status } : lead
        )
      );

      await axiosInstance.patch(`/leads/leadss/${id}/`, { status });
    } catch (error) {
      console.log(error);
      setLeads(previousLeads);
    } finally {
      setUpdatingId(null);
    }
  };

  // ADD LEAD
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axiosInstance.post("/leads/leadss/", formData);
      setFormData(defaultForm);
      setShowModal(false);
      fetchLeads();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  // FILTERED LEADS
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.workspace_type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "New").length,
      contacted: leads.filter((l) => l.status === "Contacted").length,
      converted: leads.filter((l) => l.status === "Converted").length,
    };
  }, [leads]);

  return (
    <div className="admin-container">
      <div className="dashboard-header">
        <div>
          <p className="admin-eyebrow">Lead Management</p>
          <h2 className="admin-title">Leads Dashboard</h2>
          <p className="admin-subtitle">
            Track enquiries, update status, and contact leads quickly.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={() => fetchLeads(true)}
            type="button"
          >
            Refresh
          </button>
          <button
            className="primary-btn"
            onClick={() => setShowModal(true)}
            type="button"
          >
            + Add Lead
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Leads</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="stat-card">
          <span>New</span>
          <strong>{counts.new}</strong>
        </div>
        <div className="stat-card">
          <span>Contacted</span>
          <strong>{counts.contacted}</strong>
        </div>
        <div className="stat-card">
          <span>Converted</span>
          <strong>{counts.converted}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, phone, email, workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <div className="table-top">
          <h3>All Leads</h3>
          <span>{filteredLeads.length} result(s)</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="empty-state">No leads found.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Workspace</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td data-label="Name">{lead.name}</td>
                      <td data-label="Phone">{lead.phone}</td>
                      <td data-label="Email">{lead.email || "—"}</td>
                      <td data-label="Workspace">{lead.workspace_type}</td>
                      <td data-label="Status">
                        <select
                          className={`status-dropdown status-${lead.status?.toLowerCase()}`}
                          value={lead.status}
                          onChange={(e) =>
                            updateStatus(lead.id, e.target.value)
                          }
                          disabled={updatingId === lead.id}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <a href={`tel:${lead.phone}`} className="call-btn">
                            📞 Call
                          </a>

                          {lead.email && (
                            <a
                              href={`https://mail.google.com/mail/?view=cm&to=${lead.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="email-btn"
                            >
                              📧 Email
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {filteredLeads.map((lead) => (
                <div className="lead-card" key={lead.id}>
                  <div className="lead-card-top">
                    <div>
                      <h4>{lead.name}</h4>
                      <p>{lead.workspace_type}</p>
                    </div>
                    <span className={`status-badge badge-${lead.status?.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="lead-info">
                    <div>
                      <span>Phone</span>
                      <p>{lead.phone}</p>
                    </div>
                    <div>
                      <span>Email</span>
                      <p>{lead.email || "—"}</p>
                    </div>
                  </div>

                  <div className="lead-card-bottom">
                    <select
                      className={`status-dropdown status-${lead.status?.toLowerCase()}`}
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      disabled={updatingId === lead.id}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Converted">Converted</option>
                    </select>

                    <div className="action-buttons">
                      <a href={`tel:${lead.phone}`} className="call-btn">
                        📞 Call
                      </a>

                      {lead.email && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&to=${lead.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="email-btn"
                        >
                          📧 Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="lead-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Add New Lead</h3>
                <p>Enter lead details and save instantly.</p>
              </div>
              <button
                className="close-btn"
                type="button"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="lead-form" onSubmit={handleAddLead}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label>Workspace Type</label>
                  <input
                    type="text"
                    name="workspace_type"
                    value={formData.workspace_type}
                    onChange={handleInputChange}
                    placeholder="Private cabin / Desk / Meeting room"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
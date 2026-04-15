import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";

function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [expandedLead, setExpandedLead] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await axiosInstance.get("leads/all/");
      setLeads(res.data);
    } catch (err) {
      alert("Only admin can view leads");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getLeadPurpose = (lead) => {
    const text = `${lead.message || ""} ${lead.city || ""}`.toLowerCase();

    if (
      text.includes("buy") ||
      text.includes("purchase") ||
      text.includes("book") ||
      text.includes("interested")
    ) {
      return "Sales";
    }
    if (
      text.includes("support") ||
      text.includes("issue") ||
      text.includes("problem") ||
      text.includes("help")
    ) {
      return "Support";
    }
    if (
      text.includes("partnership") ||
      text.includes("business") ||
      text.includes("collab")
    ) {
      return "Business";
    }
    return "General";
  };

  const getStatus = (lead) => {
    const purpose = getLeadPurpose(lead);
    if (purpose === "Sales") return "High Priority";
    if (purpose === "Support") return "Needs Reply";
    if (purpose === "Business") return "Important";
    return "Normal";
  };

  const purposeOptions = useMemo(() => {
    const allPurposes = leads.map((lead) => getLeadPurpose(lead));
    return ["All", ...new Set(allPurposes)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const purpose = getLeadPurpose(lead);
      const query = search.toLowerCase();

      const matchesSearch =
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.city?.toLowerCase().includes(query) ||
        lead.message?.toLowerCase().includes(query);

      const matchesPurpose =
        purposeFilter === "All" || purpose === purposeFilter;

      return matchesSearch && matchesPurpose;
    });
  }, [leads, search, purposeFilter]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      sales: leads.filter((lead) => getLeadPurpose(lead) === "Sales").length,
      support: leads.filter((lead) => getLeadPurpose(lead) === "Support").length,
      general: leads.filter((lead) => getLeadPurpose(lead) === "General").length,
    };
  }, [leads]);

  return (
    <div className="admin-leads-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-leads-page {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #eef4ff);
          font-family: "Inter", "Segoe UI", sans-serif;
          color: #1e293b;
          margin-top:100px;
        }

        .lead-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .lead-title {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
        }

        .lead-subtitle {
          margin-top: 6px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .top-badge {
          background: #0f172a;
          color: #fff;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(30, 41, 59, 0.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 34px rgba(30, 41, 59, 0.12);
        }

        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
        }

        .controls {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .search-box,
        .filter-select {
          background: #ffffff;
          border: 1px solid #dbe4f0;
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 0.95rem;
          outline: none;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .filter-select {
          min-width: 180px;
          cursor: pointer;
        }

        .lead-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .lead-card {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .lead-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(59,130,246,0.06), rgba(168,85,247,0.04));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .lead-card:hover::before {
          opacity: 1;
        }

        .lead-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
        }

        .lead-card > * {
          position: relative;
          z-index: 1;
        }

        .lead-top {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .lead-name {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .purpose-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          margin-right: 8px;
          margin-top: 6px;
        }

        .purpose-badge {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-badge {
          background: #ede9fe;
          color: #6d28d9;
        }

        .lead-info {
          display: grid;
          gap: 10px;
          margin-bottom: 14px;
        }

        .lead-info p {
          margin: 0;
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.5;
          word-break: break-word;
        }

        .lead-message {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px;
          border-radius: 14px;
          margin-top: 12px;
          color: #475569;
          line-height: 1.6;
        }

        .lead-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .lead-time {
          font-size: 0.82rem;
          color: #64748b;
        }

        .toggle-btn {
          border: none;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .toggle-btn:hover {
          transform: translateY(-1px) scale(1.02);
          opacity: 0.95;
        }

        .empty-box {
          text-align: center;
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 50px 20px;
          color: #64748b;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }

        .empty-box h3 {
          margin-bottom: 8px;
          color: #0f172a;
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .lead-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .admin-leads-page {
            padding: 16px;
          }

          .lead-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .controls {
            flex-direction: column;
          }

          .search-box,
          .filter-select {
            width: 100%;
          }

          .lead-card {
            padding: 16px;
            border-radius: 18px;
          }

          .lead-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .toggle-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="lead-container">
        <div className="lead-header">
          <div>
            <h2 className="lead-title">📩 Admin Leads Dashboard</h2>
            <p className="lead-subtitle">
              Manage user requests, inquiries, and business leads in one place.
            </p>
          </div>
          <div className="top-badge">Admin Panel</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sales Leads</div>
            <div className="stat-value">{stats.sales}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Support Leads</div>
            <div className="stat-value">{stats.support}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">General Leads</div>
            <div className="stat-value">{stats.general}</div>
          </div>
        </div>

        <div className="controls">
          <input
            type="text"
            className="search-box"
            placeholder="Search by name, email, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
          >
            {purposeOptions.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-box">
            <h3>No leads found</h3>
            <p>Try changing the search text or filter option.</p>
          </div>
        ) : (
          <div className="lead-grid">
            {filteredLeads.map((lead) => {
              const purpose = getLeadPurpose(lead);
              const status = getStatus(lead);
              const isExpanded = expandedLead === lead.id;

              return (
                <div key={lead.id} className="lead-card">
                  <div className="lead-top">
                    <div>
                      <h3 className="lead-name">{lead.name}</h3>
                      <span className="purpose-badge">{purpose}</span>
                      <span className="status-badge">{status}</span>
                    </div>
                  </div>

                  <div className="lead-info">
                    <p><strong>📧 Email:</strong> {lead.email}</p>
                    <p><strong>📱 Phone:</strong> {lead.phone}</p>
                    <p><strong>📍 City:</strong> {lead.city}</p>
                  </div>

                  <div className="lead-message">
                    <strong>💬 Message:</strong>{" "}
                    {isExpanded
                      ? lead.message
                      : `${lead.message?.slice(0, 90) || ""}${
                          lead.message?.length > 90 ? "..." : ""
                        }`}
                  </div>

                  <div className="lead-footer">
                    <small className="lead-time">🕒 {lead.created_at}</small>

                    {lead.message?.length > 90 && (
                      <button
                        className="toggle-btn"
                        onClick={() =>
                          setExpandedLead(isExpanded ? null : lead.id)
                        }
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLeads;
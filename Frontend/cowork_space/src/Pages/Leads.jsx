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
    )
      return "Sales";

    if (
      text.includes("support") ||
      text.includes("issue") ||
      text.includes("problem") ||
      text.includes("help")
    )
      return "Support";

    if (
      text.includes("partnership") ||
      text.includes("business") ||
      text.includes("collab")
    )
      return "Business";

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

  const stats = useMemo(
    () => ({
      total: leads.length,
      sales: leads.filter((l) => getLeadPurpose(l) === "Sales").length,
      support: leads.filter((l) => getLeadPurpose(l) === "Support").length,
      business: leads.filter((l) => getLeadPurpose(l) === "Business").length,
      general: leads.filter((l) => getLeadPurpose(l) === "General").length,
    }),
    [leads]
  );

  return (
    <div className="admin-leads-page">
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .admin-leads-page {
          min-height: 100vh;
           background:
   rgba(234, 229, 216, 0.18);
          padding: 32px 20px 40px;
          margin-top: -50px;
          font-family: "Inter", "Segoe UI", sans-serif;
          color: #0f172a;
        }

        .lead-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .lead-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 26px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          margin-bottom: 24px;
        }

        .lead-title {
          font-size: clamp(1.5rem, 2vw, 2rem);
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .lead-title span {
          color: #0f766e;
        }

        .lead-subtitle {
          margin-top: 8px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .top-badge {
          background: #ecfeff;
          color: #0f766e;
          border: 1px solid #99f6e4;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 20px 18px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #0f766e, #14b8a6);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
        }

        .stat-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .stat-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 1.35rem;
          opacity: 0.2;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .search-wrapper {
          flex: 1;
          min-width: 260px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #0f766e;
          font-size: 14px;
          pointer-events: none;
        }

        .search-box {
          width: 100%;
          height: 48px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          padding: 0 14px 0 40px;
          font-size: 0.95rem;
          color: #111827;
          outline: none;
          transition: all 0.25s ease;
        }

        .search-box::placeholder {
          color: #94a3b8;
        }

        .search-box:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
        }

        .filter-select {
          height: 48px;
          min-width: 170px;
          padding: 0 40px 0 14px;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          background: #ffffff;
          font-size: 0.95rem;
          color: #111827;
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: all 0.25s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230f766e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .filter-select:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
        }

        .lead-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .lead-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
          transition: all 0.28s ease;
        }

        .lead-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }

        .lead-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 16px;
        }

        .lead-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ccfbf1;
          color: #115e59;
          border: 1px solid #99f6e4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .lead-name-section {
          flex: 1;
          min-width: 0;
        }

        .lead-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          word-break: break-word;
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .purpose-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .purpose-badge {
          background: #ecfeff;
          color: #0f766e;
          border: 1px solid #99f6e4;
        }

        .status-badge {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .lead-info {
          display: grid;
          gap: 10px;
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .info-label {
          min-width: 54px;
          color: #0f766e;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .info-value {
          color: #475569;
          font-size: 0.92rem;
          word-break: break-word;
        }

        .lead-message {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          color: #475569;
          line-height: 1.65;
          font-size: 0.9rem;
          margin-bottom: 16px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .lead-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-top: 1px solid #edf2f7;
          padding-top: 14px;
          flex-wrap: wrap;
        }

        .lead-time {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
          word-break: break-word;
        }

        .lead-time::before {
          content: "🕒";
          font-size: 12px;
        }

        .toggle-btn {
          border: 1px solid #99f6e4;
          background: #ecfeff;
          color: #0f766e;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .toggle-btn:hover {
          background: #ccfbf1;
          border-color: #5eead4;
        }

        .empty-box {
          text-align: center;
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-box h3 {
          color: #0f172a;
          font-size: 1.2rem;
          margin-bottom: 8px;
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lead-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-leads-page {
            padding: 22px 14px 30px;
            margin-top: 65px;
          }

          .lead-header {
            padding: 20px 16px;
            border-radius: 18px;
          }

          .lead-title {
            font-size: 1.35rem;
          }

          .lead-subtitle {
            font-size: 0.88rem;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrapper,
          .filter-select {
            width: 100%;
          }

          .search-box,
          .filter-select {
            height: 44px;
            border-radius: 12px;
            font-size: 0.9rem;
          }

          .lead-card {
            padding: 16px;
            border-radius: 16px;
          }

          .lead-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .toggle-btn {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 18px 16px;
          }

          .stat-value {
            font-size: 1.7rem;
          }

          .lead-avatar {
            width: 42px;
            height: 42px;
            font-size: 0.85rem;
          }

          .lead-name {
            font-size: 0.98rem;
          }

          .info-row {
            flex-direction: column;
            gap: 4px;
          }

          .info-label {
            min-width: auto;
          }

          .lead-message {
            font-size: 0.86rem;
            padding: 12px;
          }
        }

        @media (max-width: 380px) {
          .admin-leads-page {
            padding: 18px 10px 24px;
          }

          .lead-title {
            font-size: 1.15rem;
          }

          .top-badge {
            font-size: 0.68rem;
            padding: 8px 12px;
          }

          .search-box,
          .filter-select {
            height: 42px;
            font-size: 0.82rem;
          }

          .stat-value {
            font-size: 1.45rem;
          }
        }
      `}</style>

      <div className="lead-container">
        <div className="lead-header">
          <div>
            <h2 className="lead-title">
              <span>Admin</span> Leads Dashboard
            </h2>
            <p className="lead-subtitle">
              Manage user requests, inquiries and business leads
            </p>
          </div>

          <div className="top-badge">Admin Panel</div>
        </div>

        <div className="stats-grid">
          {[
            { label: "Total Leads", value: stats.total, icon: "📊" },
            { label: "Sales Leads", value: stats.sales, icon: "💰" },
            { label: "Support Leads", value: stats.support, icon: "🎧" },
            { label: "Business Leads", value: stats.business, icon: "🤝" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        <div className="controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Search by name, email, city, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
          >
            {purposeOptions.map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-box">
            <h3>No leads found</h3>
            <p>Try adjusting the search or filter above.</p>
          </div>
        ) : (
          <div className="lead-grid">
            {filteredLeads.map((lead) => {
              const purpose = getLeadPurpose(lead);
              const status = getStatus(lead);
              const isExpanded = expandedLead === lead.id;

              const initials =
                lead.name
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?";

              return (
                <div key={lead.id} className="lead-card">
                  <div className="lead-top">
                    <div className="lead-avatar">{initials}</div>

                    <div className="lead-name-section">
                      <div className="lead-name">{lead.name || "No Name"}</div>

                      <div className="badges">
                        <span className="purpose-badge">{purpose}</span>
                        <span className="status-badge">{status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lead-info">
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">{lead.email || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{lead.phone || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">City</span>
                      <span className="info-value">{lead.city || "N/A"}</span>
                    </div>
                  </div>

                  <div className="lead-message">
                    {isExpanded
                      ? lead.message || "No message"
                      : `${lead.message?.slice(0, 90) || "No message"}${
                          lead.message?.length > 90 ? "..." : ""
                        }`}
                  </div>

                  <div className="lead-footer">
                    <span className="lead-time">
                      {lead.created_at || "No date"}
                    </span>

                    {lead.message?.length > 90 && (
                      <button
                        className="toggle-btn"
                        onClick={() =>
                          setExpandedLead(isExpanded ? null : lead.id)
                        }
                      >
                        {isExpanded ? "Show Less ▲" : "Read More ▼"}
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
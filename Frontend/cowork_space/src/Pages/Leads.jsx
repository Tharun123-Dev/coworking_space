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
    if (text.includes("buy") || text.includes("purchase") || text.includes("book") || text.includes("interested")) return "Sales";
    if (text.includes("support") || text.includes("issue") || text.includes("problem") || text.includes("help")) return "Support";
    if (text.includes("partnership") || text.includes("business") || text.includes("collab")) return "Business";
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
      const matchesPurpose = purposeFilter === "All" || purpose === purposeFilter;
      return matchesSearch && matchesPurpose;
    });
  }, [leads, search, purposeFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    sales: leads.filter((l) => getLeadPurpose(l) === "Sales").length,
    support: leads.filter((l) => getLeadPurpose(l) === "Support").length,
    general: leads.filter((l) => getLeadPurpose(l) === "General").length,
  }), [leads]);

  return (
    <div className="admin-leads-page">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-leads-page {
          min-height: 100vh;
          padding: 28px 20px;
          background: #0a0a0a;
          font-family: "Inter", "Segoe UI", sans-serif;
          color: #f5f0e8;
          margin-top: 80px;
        }

        .lead-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #2a2a2a;
        }

        .lead-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #c9a84c;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .lead-title span {
          color: #f5f0e8;
        }

        .lead-subtitle {
          margin-top: 6px;
          color: #888;
          font-size: 0.88rem;
          font-weight: 400;
        }

        .top-badge {
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #0a0a0a;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── STAT CARDS ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #111111;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 18px 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
        }

        .stat-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #c9a84c, #e8c96a);
          border-radius: 16px 16px 0 0;
        }

        .stat-card:hover {
          border-color: #c9a84c;
          transform: translateY(-3px);
        }

        .stat-label {
          font-size: 0.78rem;
          color: #888;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #c9a84c;
          line-height: 1;
        }

        .stat-icon {
          position: absolute;
          top: 16px; right: 16px;
          font-size: 1.4rem;
          opacity: 0.25;
        }

        /* ── CONTROLS ── */
        .controls {
          display: flex;
          gap: 12px;
          flex-wrap: nowrap;
          margin-bottom: 24px;
          align-items: center;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
          min-width: 0;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #c9a84c;
          pointer-events: none;
          line-height: 1;
        }

        .search-box {
          width: 100%;
          height: 40px;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          padding: 0 14px 0 36px;
          font-size: 0.88rem;
          color: #f5f0e8;
          outline: none;
          transition: border-color 0.2s;
          line-height: 40px;
          display: block;
        }

        .search-box::placeholder { color: #555; }

        .search-box:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }

        .filter-select {
          height: 40px;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 0.88rem;
          color: #f5f0e8;
          outline: none;
          cursor: pointer;
          flex-shrink: 0;
          min-width: 140px;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .filter-select:focus { border-color: #c9a84c; }
        .filter-select option { background: #111; color: #f5f0e8; }

        /* ── LEAD GRID ── */
        .lead-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        /* ── LEAD CARD ── */
        .lead-card {
          background: #111111;
          border: 1px solid #1e1e1e;
          border-radius: 20px;
          padding: 20px;
          transition: border-color 0.3s, transform 0.3s;
          position: relative;
          overflow: hidden;
        }

        .lead-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c 40%, #e8c96a 60%, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .lead-card:hover {
          border-color: #3a3016;
          transform: translateY(-4px);
        }

        .lead-card:hover::before { opacity: 1; }

        .lead-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .lead-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a84c, #8a6f2e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0a0a0a;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }

        .lead-name-section { flex: 1; min-width: 0; }

        .lead-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f5f0e8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .purpose-badge, .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .purpose-badge {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3);
        }

        .status-badge {
          background: rgba(255,255,255,0.06);
          color: #aaa;
          border: 1px solid #2a2a2a;
        }

        /* ── LEAD INFO ── */
        .lead-info {
          display: grid;
          gap: 8px;
          margin-bottom: 14px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }

        .info-label {
          color: #c9a84c;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          min-width: 46px;
          flex-shrink: 0;
        }

        .info-value {
          color: #ccc;
          word-break: break-all;
          font-size: 0.85rem;
        }

        /* ── MESSAGE BOX ── */
        .lead-message {
          background: #0d0d0d;
          border: 1px solid #1e1e1e;
          border-left: 3px solid #c9a84c;
          padding: 12px 14px;
          border-radius: 0 10px 10px 0;
          color: #999;
          line-height: 1.6;
          font-size: 0.85rem;
          margin-bottom: 14px;
        }

        /* ── FOOTER ── */
        .lead-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          border-top: 1px solid #1a1a1a;
          padding-top: 12px;
          flex-wrap: wrap;
        }

        .lead-time {
          font-size: 0.75rem;
          color: #555;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .lead-time::before {
          content: "🕒";
          font-size: 11px;
        }

        .toggle-btn {
          border: 1px solid rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.08);
          color: #c9a84c;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        .toggle-btn:hover {
          background: rgba(201,168,76,0.18);
          border-color: #c9a84c;
        }

        /* ── EMPTY ── */
        .empty-box {
          text-align: center;
          background: #111;
          border: 1px dashed #2a2a2a;
          border-radius: 20px;
          padding: 60px 20px;
          color: #555;
        }

        .empty-box h3 {
          color: #c9a84c;
          font-size: 1.2rem;
          margin-bottom: 8px;
        }

        /* ── DIVIDER ── */
        .gold-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c 30%, #e8c96a 50%, #c9a84c 70%, transparent);
          margin: 0 0 24px;
          opacity: 0.4;
        }

        /* ────────────────────────────────
           RESPONSIVE — TABLET
        ──────────────────────────────── */
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .lead-grid { grid-template-columns: 1fr; }
        }

        /* ────────────────────────────────
           RESPONSIVE — MOBILE (≤576px)
        ──────────────────────────────── */
        @media (max-width: 576px) {
          .admin-leads-page {
            padding: 14px 12px;
            margin-top: 60px;
          }

          .lead-title { font-size: 1.35rem; }
          .lead-subtitle { font-size: 0.8rem; }

          .top-badge {
            font-size: 0.7rem;
            padding: 6px 14px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .stat-card { padding: 14px 12px; border-radius: 12px; }
          .stat-value { font-size: 1.6rem; }
          .stat-label { font-size: 0.7rem; }

          /* ── CRITICAL: search box 10px shorter on mobile ── */
          .controls {
            flex-wrap: nowrap;
            gap: 8px;
          }

          .search-box {
            height: 30px !important;
            font-size: 0.82rem;
            border-radius: 8px;
            padding: 0 10px 0 32px;
            line-height: 30px;
          }

          .search-icon {
            font-size: 12px;
            left: 10px;
          }

          .filter-select {
            height: 30px !important;
            font-size: 0.82rem;
            border-radius: 8px;
            padding: 0 28px 0 10px;
            min-width: 110px;
          }

          .lead-grid { gap: 12px; }

          .lead-card {
            padding: 14px;
            border-radius: 14px;
          }

          .lead-avatar { width: 36px; height: 36px; font-size: 0.82rem; }
          .lead-name { font-size: 0.95rem; }

          .lead-footer { flex-direction: column; align-items: flex-start; }

          .toggle-btn { width: 100%; text-align: center; justify-content: center; }
        }

        /* ── VERY SMALL PHONES (≤380px) ── */
        @media (max-width: 380px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .stat-value { font-size: 1.4rem; }
          .lead-title { font-size: 1.15rem; }

          .search-box {
            height: 30px !important;
            font-size: 0.78rem;
          }

          .filter-select {
            height: 30px !important;
            font-size: 0.78rem;
            min-width: 95px;
          }
        }
      `}</style>

      <div className="lead-container">

        {/* HEADER */}
        <div className="lead-header">
          <div>
            <h2 className="lead-title">
              <span>Admin</span> Leads Dashboard
            </h2>
            <p className="lead-subtitle">
              Manage user requests, inquiries & business leads
            </p>
          </div>
          <div className="top-badge">⬡ Admin Panel</div>
        </div>

        <div className="gold-divider" />

        {/* STATS */}
        <div className="stats-grid">
          {[
            { label: "Total Leads", value: stats.total, icon: "📊" },
            { label: "Sales Leads", value: stats.sales, icon: "💰" },
            { label: "Support Leads", value: stats.support, icon: "🎧" },
            { label: "General Leads", value: stats.general, icon: "📋" },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Search name, email, city, phone..."
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
              <option key={i} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* LEADS */}
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
              const initials = lead.name
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
                      <div className="lead-name">{lead.name}</div>
                      <div className="badges">
                        <span className="purpose-badge">{purpose}</span>
                        <span className="status-badge">{status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lead-info">
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">{lead.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{lead.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">City</span>
                      <span className="info-value">{lead.city}</span>
                    </div>
                  </div>

                  <div className="lead-message">
                    {isExpanded
                      ? lead.message
                      : `${lead.message?.slice(0, 90) || ""}${lead.message?.length > 90 ? "…" : ""}`}
                  </div>

                  <div className="lead-footer">
                    <span className="lead-time">{lead.created_at}</span>
                    {lead.message?.length > 90 && (
                      <button
                        className="toggle-btn"
                        onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
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
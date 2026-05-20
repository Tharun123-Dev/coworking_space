import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminLeads.css";

function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("leads/all/");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Only admin can view leads");
    } finally {
      setLoading(false);
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
    const all = leads.map((l) => getLeadPurpose(l));
    return ["All", ...new Set(all)];
  }, [leads]);

  const statusOptions = useMemo(() => {
    const all = leads.map((l) => getStatus(l));
    return ["All", ...new Set(all)];
  }, [leads]);

  const cityOptions = useMemo(() => {
    const all = leads.map((l) => l.city?.trim()).filter(Boolean);
    return ["All", ...new Set(all)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const purpose = getLeadPurpose(lead);
      const status = getStatus(lead);
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.city?.toLowerCase().includes(query) ||
        lead.message?.toLowerCase().includes(query);
      const matchesPurpose = purposeFilter === "All" || purpose === purposeFilter;
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesCity = cityFilter === "All" || lead.city === cityFilter;
      return matchesSearch && matchesPurpose && matchesStatus && matchesCity;
    });
  }, [leads, search, purposeFilter, statusFilter, cityFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    sales: leads.filter((l) => getLeadPurpose(l) === "Sales").length,
    support: leads.filter((l) => getLeadPurpose(l) === "Support").length,
    business: leads.filter((l) => getLeadPurpose(l) === "Business").length,
    general: leads.filter((l) => getLeadPurpose(l) === "General").length,
  }), [leads]);

  const clearFilters = () => {
    setSearch("");
    setPurposeFilter("All");
    setStatusFilter("All");
    setCityFilter("All");
  };

  const truncateText = (text, limit = 90) => {
    if (!text) return "No message";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const statsConfig = [
    { label: "Total Leads", value: stats.total, icon: "👥" },
    { label: "Sales", value: stats.sales, icon: "💼" },
    // { label: "Support", value: stats.support, icon: "🛠️" },
    // { label: "Business", value: stats.business, icon: "🤝" },
    { label: "General", value: stats.general, icon: "📋" },
  ];

  return (
    <div className="al-page">
      <div className="al-container">

        {/* Header */}
        <div className="al-header">
          <div className="al-header-text">
            <p className="al-eyebrow">Admin Panel</p>
            <h2 className="al-title">Normal Leads</h2>
            <p className="al-subtitle">View, search, and filter all incoming leads in one place.</p>
          </div>
          <button className="al-refresh-btn" onClick={fetchLeads}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="al-stats-grid">
          {statsConfig.map((s) => (
            <div className="al-stat-card" key={s.label}>
              <span className="al-stat-icon">{s.icon}</span>
              <strong className="al-stat-value">{s.value}</strong>
              <span className="al-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="al-filters">
          <div className="al-search-wrap">
            <span className="al-search-icon">🔍</span>
            <input
              type="text"
              className="al-search"
              placeholder="Search by name, email, phone, city, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="al-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="al-selects">
            <select className="al-select" value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)}>
              {purposeOptions.map((item, i) => <option key={i} value={item}>{item === "All" ? "All Purposes" : item}</option>)}
            </select>

            <select className="al-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((item, i) => <option key={i} value={item}>{item === "All" ? "All Statuses" : item}</option>)}
            </select>

            <select className="al-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              {cityOptions.map((item, i) => <option key={i} value={item}>{item === "All" ? "All Cities" : item}</option>)}
            </select>

            <button className="al-clear-btn" onClick={clearFilters}>Clear</button>
          </div>
        </div>

        {/* Table Card */}
        <div className="al-table-card">
          <div className="al-table-head">
            <h3 className="al-table-title">All Leads</h3>
            <span className="al-count">{filteredLeads.length} result{filteredLeads.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="al-empty">
              <span className="al-loader"></span>
              <p>Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="al-empty">
              <p>No leads found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="al-table-wrapper">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => {
                    const purpose = getLeadPurpose(lead);
                    const status = getStatus(lead);
                    return (
                      <tr key={lead.id || index}>
                        <td className="al-td-num">{index + 1}</td>
                        <td className="al-td-name">{lead.name || "No Name"}</td>
                        <td className="al-td-muted">{lead.email || "N/A"}</td>
                        <td className="al-td-muted">{lead.phone || "N/A"}</td>
                        <td>{lead.city || "N/A"}</td>
                        <td>
                          <span className={`al-badge al-purpose-${purpose.toLowerCase()}`}>{purpose}</span>
                        </td>
                        <td>
                          <span className={`al-badge al-status-${status.toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>
                        </td>
                        <td className="al-td-msg" title={lead.message || "No message"}>
                          {truncateText(lead.message, 90)}
                        </td>
                        <td className="al-td-muted al-td-date">{lead.created_at || "No date"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminLeads;
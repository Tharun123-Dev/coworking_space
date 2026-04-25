// import React, { useEffect, useState, useMemo } from "react";
// import "./AdminEnterprise.css";

// const STATUS_OPTIONS = ["New", "Contacted", "Interested", "Converted"];

// const STATUS_META = {
//   New:        { color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  dot: "#38bdf8" },
//   Contacted:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  dot: "#f59e0b" },
//   Interested: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  dot: "#8b5cf6" },
//   Converted:  { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   dot: "#22c55e" },
// };

// function getInitials(name = "") {
//   return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
// }

// const AVATAR_COLORS = ["#38bdf8","#8b5cf6","#22c55e","#f59e0b","#ef4444","#ec4899"];
// function avatarColor(name = "") {
//   let sum = 0;
//   for (let c of name) sum += c.charCodeAt(0);
//   return AVATAR_COLORS[sum % AVATAR_COLORS.length];
// }

// export default function AdminDashboardEnterprise() {
//   const [leads, setLeads]             = useState([]);
//   const [search, setSearch]           = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [sortField, setSortField]     = useState("name");
//   const [sortDir, setSortDir]         = useState("asc");
//   const [updating, setUpdating]       = useState({});

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/enterprise-leads/")
//       .then((r) => r.json())
//       .then(setLeads)
//       .catch(console.error);
//   }, []);

//   const updateStatus = (id, status) => {
//     setUpdating((u) => ({ ...u, [id]: true }));
//     fetch(`http://127.0.0.1:8000/api/enterprise-leads/${id}/`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status }),
//     })
//       .then(() => {
//         setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
//       })
//       .catch(console.error)
//       .finally(() => setUpdating((u) => ({ ...u, [id]: false })));
//   };

//   const handleSort = (field) => {
//     if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     else { setSortField(field); setSortDir("asc"); }
//   };

//   const stats = useMemo(() => ({
//     total:      leads.length,
//     new:        leads.filter((l) => l.status === "New").length,
//     contacted:  leads.filter((l) => l.status === "Contacted").length,
//     interested: leads.filter((l) => l.status === "Interested").length,
//     converted:  leads.filter((l) => l.status === "Converted").length,
//   }), [leads]);

//   const filtered = useMemo(() => {
//     let result = leads.filter((l) => {
//       const q = search.toLowerCase();
//       const matchSearch =
//         l.name?.toLowerCase().includes(q) ||
//         l.email?.toLowerCase().includes(q) ||
//         l.phone?.toLowerCase().includes(q) ||
//         l.workspace_type?.toLowerCase().includes(q);
//       const matchStatus = statusFilter === "All" || l.status === statusFilter;
//       return matchSearch && matchStatus;
//     });
//     result = [...result].sort((a, b) => {
//       const av = (a[sortField] || "").toLowerCase();
//       const bv = (b[sortField] || "").toLowerCase();
//       return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
//     });
//     return result;
//   }, [leads, search, statusFilter, sortField, sortDir]);

//   const SortIcon = ({ field }) => (
//     <span className={`sort-icon ${sortField === field ? "active" : ""}`}>
//       {sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
//     </span>
//   );

//   return (
//     <div className="ent-page">
//       {/* ── HEADER ── */}
//       <div className="ent-header">
//         <div>
//           <h1 className="ent-title">Enterprise <span>Leads</span></h1>
//           <p className="ent-subtitle">Manage and track your enterprise pipeline</p>
//         </div>
//         <div className="ent-badge">Admin Panel</div>
//       </div>

//       {/* ── STATS ── */}
//       <div className="ent-stats">
//         {[
//           { label: "Total",      value: stats.total,      color: "#a8b3c5" },
//           { label: "New",        value: stats.new,        color: "#38bdf8" },
//           { label: "Contacted",  value: stats.contacted,  color: "#f59e0b" },
//           { label: "Interested", value: stats.interested, color: "#8b5cf6" },
//           { label: "Converted",  value: stats.converted,  color: "#22c55e" },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className={`ent-stat ${statusFilter === s.label ? "active" : ""}`}
//             onClick={() => setStatusFilter(statusFilter === s.label ? "All" : s.label)}
//             style={{ "--stat-color": s.color }}
//           >
//             <span className="ent-stat-value" style={{ color: s.color }}>{s.value}</span>
//             <span className="ent-stat-label">{s.label}</span>
//           </div>
//         ))}
//       </div>

//       {/* ── CONTROLS ── */}
//       <div className="ent-controls">
//         <div className="ent-search-wrap">
//           <span className="ent-search-icon">⌕</span>
//           <input
//             className="ent-search"
//             type="text"
//             placeholder="Search name, email, phone, workspace…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           {search && (
//             <button className="ent-clear" onClick={() => setSearch("")}>✕</button>
//           )}
//         </div>
//         <select
//           className="ent-filter"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="All">All Status</option>
//           {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
//         </select>
//       </div>

//       {/* ── RESULT COUNT ── */}
//       <div className="ent-count">
//         Showing <strong>{filtered.length}</strong> of <strong>{leads.length}</strong> leads
//       </div>

//       {/* ── TABLE (desktop) ── */}
//       <div className="ent-table-wrap">
//         <table className="ent-table">
//           <thead>
//             <tr>
//               <th onClick={() => handleSort("name")} className="sortable">
//                 Name <SortIcon field="name" />
//               </th>
//               <th>Phone</th>
//               <th onClick={() => handleSort("email")} className="sortable">
//                 Email <SortIcon field="email" />
//               </th>
//               <th onClick={() => handleSort("workspace_type")} className="sortable">
//                 Workspace <SortIcon field="workspace_type" />
//               </th>
//               <th onClick={() => handleSort("status")} className="sortable">
//                 Status <SortIcon field="status" />
//               </th>
//               <th>Update</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="ent-empty">
//                   <div className="ent-empty-inner">
//                     <span style={{ fontSize: 32 }}>🔍</span>
//                     <p>No leads found</p>
//                     <small>Try adjusting your search or filter</small>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               filtered.map((lead) => {
//                 const meta = STATUS_META[lead.status] || STATUS_META["New"];
//                 const color = avatarColor(lead.name);
//                 return (
//                   <tr key={lead.id} className={updating[lead.id] ? "updating" : ""}>
//                     <td>
//                       <div className="ent-name-cell">
//                         <div className="ent-avatar" style={{ background: color + "22", color }}>
//                           {getInitials(lead.name)}
//                         </div>
//                         <span className="ent-name">{lead.name}</span>
//                       </div>
//                     </td>
//                     <td className="ent-phone">{lead.phone}</td>
//                     <td className="ent-email">{lead.email}</td>
//                     <td>
//                       <span className="ent-workspace">{lead.workspace_type}</span>
//                     </td>
//                     <td>
//                       <span
//                         className="ent-status-badge"
//                         style={{ color: meta.color, background: meta.bg }}
//                       >
//                         <span className="ent-dot" style={{ background: meta.dot }} />
//                         {lead.status}
//                       </span>
//                     </td>
//                     <td>
//                       <select
//                         className="ent-select"
//                         value={lead.status}
//                         disabled={updating[lead.id]}
//                         onChange={(e) => updateStatus(lead.id, e.target.value)}
//                         style={{ borderColor: meta.color + "55" }}
//                       >
//                         {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
//                       </select>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ── MOBILE CARDS ── */}
//       <div className="ent-cards">
//         {filtered.length === 0 ? (
//           <div className="ent-empty-card">
//             <p>No leads found</p>
//             <small>Try adjusting your search or filter</small>
//           </div>
//         ) : (
//           filtered.map((lead) => {
//             const meta = STATUS_META[lead.status] || STATUS_META["New"];
//             const color = avatarColor(lead.name);
//             return (
//               <div key={lead.id} className={`ent-card ${updating[lead.id] ? "updating" : ""}`}>
//                 <div className="ent-card-top">
//                   <div className="ent-avatar" style={{ background: color + "22", color }}>
//                     {getInitials(lead.name)}
//                   </div>
//                   <div className="ent-card-head">
//                     <span className="ent-name">{lead.name}</span>
//                     <span
//                       className="ent-status-badge"
//                       style={{ color: meta.color, background: meta.bg }}
//                     >
//                       <span className="ent-dot" style={{ background: meta.dot }} />
//                       {lead.status}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="ent-card-body">
//                   <div className="ent-card-row">
//                     <span className="ent-card-label">Email</span>
//                     <span className="ent-email">{lead.email}</span>
//                   </div>
//                   <div className="ent-card-row">
//                     <span className="ent-card-label">Phone</span>
//                     <span className="ent-phone">{lead.phone}</span>
//                   </div>
//                   <div className="ent-card-row">
//                     <span className="ent-card-label">Workspace</span>
//                     <span className="ent-workspace">{lead.workspace_type}</span>
//                   </div>
//                 </div>
//                 <div className="ent-card-foot">
//                   <select
//                     className="ent-select full"
//                     value={lead.status}
//                     disabled={updating[lead.id]}
//                     onChange={(e) => updateStatus(lead.id, e.target.value)}
//                     style={{ borderColor: meta.color + "55" }}
//                   >
//                     {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
//                   </select>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "./AdminEnterprise.css";

function AdminLeads() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const res = await axiosInstance.get("leads/modern-lead/all/");
      setLeads(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`leads/modern-lead/update/${id}/`, { status });
      fetchLeads();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-leads-container">
      <div className="admin-leads-header">
        <h2 className="admin-leads-title">Modern Leads Dashboard</h2>
        <p className="admin-leads-subtitle">
          Manage workspace enquiries, update statuses, and contact leads quickly.
        </p>
      </div>

      <div className="admin-leads-table-wrap">
        <table className="admin-leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company</th>
              <th>Message</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email || "-"}</td>
                  <td>{lead.company || "-"}</td>
                  <td className="message-cell">{lead.message || "-"}</td>

                  <td>
                    <span className={`status-badge status-${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>

                  <td>
                    <div className="contact-btns">
                      <a href={`tel:${lead.phone}`} className="call-btn">
                        Call
                      </a>

                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="mail-btn">
                          Email
                        </a>
                      )}
                    </div>
                  </td>

                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLeads;
import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";

const STATUS_OPTIONS = ["pending", "contacted", "closed"];

const STATUS_META = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.35)"  },
  contacted: { label: "Contacted", color: "#38bdf8", bg: "rgba(56,189,248,0.13)",  border: "rgba(56,189,248,0.35)"  },
  closed:    { label: "Closed",    color: "#22c55e", bg: "rgba(34,197,94,0.13)",   border: "rgba(34,197,94,0.35)"   },
};

const AVATAR_COLORS = ["#38bdf8","#8b5cf6","#22c55e","#f59e0b","#ef4444","#ec4899","#14b8a6"];

function avatarColor(name = "") {
  let s = 0; for (let c of name) s += c.charCodeAt(0);
  return AVATAR_COLORS[s % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function AdminBusinessEnterprise() {
  const [leads, setLeads]           = useState([]);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [sortField, setSortField]   = useState("company");
  const [sortDir, setSortDir]       = useState("asc");
  const [updating, setUpdating]     = useState({});
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchLeads();
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchLeads = () => {
    axiosInstance.get("leads/business/admin/").then(res => setLeads(res.data));
  };

  const updateStatus = (id, status) => {
    setUpdating(u => ({ ...u, [id]: true }));
    axiosInstance.put(`leads/business/status/${id}/`, { status })
      .then(() => fetchLeads())
      .finally(() => setUpdating(u => ({ ...u, [id]: false })));
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const stats = useMemo(() => ({
    total:     leads.length,
    pending:   leads.filter(l => l.status === "pending").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    closed:    leads.filter(l => l.status === "closed").length,
  }), [leads]);

  const filtered = useMemo(() => {
    let r = leads.filter(l => {
      const q = search.toLowerCase();
      const ok =
        l.company?.toLowerCase().includes(q) ||
        l.contact?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.budget?.toLowerCase().includes(q);
      const st = statusFilter === "All" || l.status === statusFilter;
      return ok && st;
    });
    return [...r].sort((a, b) => {
      const av = (a[sortField] || "").toLowerCase();
      const bv = (b[sortField] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [leads, search, statusFilter, sortField, sortDir]);

  /* ── shared style tokens ── */
  const T = {
    page:    { minHeight: "100vh", padding: isMobile ? "14px 10px 40px" : "32px 20px 48px", marginTop: isMobile ? "54px" : "72px", background: "linear-gradient(160deg,#0f172a 0%,#111827 100%)", color: "#dbe4ee", fontFamily: "'Inter','Segoe UI',sans-serif" },
    card:    { background: "#111f33", border: "1px solid rgba(148,163,184,0.13)", borderRadius: 18, padding: isMobile ? "14px" : "20px" },
    label:   { fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase", color: "#64748b" },
    input:   { height: 40, background: "#0d1929", border: "1px solid rgba(148,163,184,0.22)", borderRadius: 10, padding: "0 12px", fontSize: 14, color: "#dbe4ee", outline: "none", width: "100%" },
    badge:   (status) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, fontSize:12, fontWeight:700, color: STATUS_META[status]?.color || "#dbe4ee", background: STATUS_META[status]?.bg || "transparent", border: `1px solid ${STATUS_META[status]?.border || "transparent"}` }),
    btn:     (color="rgba(56,189,248,0.12)", textCol="#38bdf8", bord="rgba(56,189,248,0.3)") => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, fontSize:13, fontWeight:700, color:textCol, background:color, border:`1px solid ${bord}`, cursor:"pointer", textDecoration:"none", transition:"opacity .2s" }),
    select:  (status) => ({ height:36, background:"#0e1a2c", border:`1px solid ${STATUS_META[status]?.border || "rgba(148,163,184,0.22)"}`, borderRadius:8, color:"#dbe4ee", fontSize:13, fontWeight:600, padding:"0 28px 0 10px", outline:"none", cursor:"pointer", width:"100%", appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center" }),
    th:      { padding:"14px 16px", fontSize:12, fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", color:"#94a3b8", textAlign:"left", whiteSpace:"nowrap", cursor:"pointer", userSelect:"none", borderBottom:"1px solid rgba(148,163,184,0.15)" },
    td:      { padding:"14px 16px", fontSize:14, color:"#94a3b8", borderBottom:"1px solid rgba(148,163,184,0.07)", verticalAlign:"middle" },
  };

  const SortArrow = ({ field }) => (
    <span style={{ fontSize:11, color: sortField===field ? "#38bdf8" : "#475569", marginLeft:4 }}>
      {sortField===field ? (sortDir==="asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  /* ── STAT PILL ── */
  const StatPill = ({ label, value, color, active, onClick }) => (
    <div
      onClick={onClick}
      style={{ flex:"1 1 70px", minWidth:70, background: active ? "rgba(255,255,255,0.05)" : "#111f33", border:`1px solid ${active ? color : "rgba(148,163,184,0.13)"}`, borderRadius:12, padding:isMobile?"10px 6px":"14px 10px", textAlign:"center", cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}
    >
      {active && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color, borderRadius:"12px 12px 0 0" }} />}
      <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize: isMobile ? 10 : 11, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color:"#64748b" }}>{label}</div>
    </div>
  );

  /* ── MOBILE CARD ── */
  const MobileCard = ({ item }) => {
    const meta  = STATUS_META[item.status] || STATUS_META["pending"];
    const color = avatarColor(item.company);
    const busy  = updating[item.id];
    return (
      <div style={{ ...T.card, opacity: busy ? 0.6 : 1, transition:"all .25s", marginBottom:0 }}>

        {/* top row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:color+"22", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, flexShrink:0 }}>
            {getInitials(item.company)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:15, color:"#dbe4ee", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.company}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{item.location}</div>
          </div>
          <span style={T.badge(item.status)}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:meta.color, display:"inline-block" }} />
            {meta.label}
          </span>
        </div>

        {/* info grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 12px", borderTop:"1px solid rgba(148,163,184,0.1)", paddingTop:12, marginBottom:14 }}>
          {[
            { label:"Contact", value: item.contact },
            { label:"Team",    value: item.team },
            { label:"Budget",  value: item.budget },
          ].map(r => (
            <div key={r.label}>
              <div style={T.label}>{r.label}</div>
              <div style={{ fontSize:13, color:"#cbd5e1", marginTop:3 }}>{r.value || "—"}</div>
            </div>
          ))}
        </div>

        {/* action row */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", borderTop:"1px solid rgba(148,163,184,0.1)", paddingTop:12, marginBottom:10 }}>
          <a href={`tel:${item.phone}`} style={{ ...T.btn(), flex:1, justifyContent:"center" }}>📞 {item.phone}</a>
          <a href={`mailto:${item.email}`} style={{ ...T.btn("rgba(139,92,246,0.12)","#a78bfa","rgba(139,92,246,0.3)"), flex:1, justifyContent:"center" }}>✉ Email</a>
        </div>

        {/* status select */}
        <div style={{ position:"relative" }}>
          <select
            style={T.select(item.status)}
            value={item.status}
            disabled={busy}
            onChange={e => updateStatus(item.id, e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div style={T.page}>
      <div style={{ maxWidth:1300, margin:"0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24, paddingBottom:20, borderBottom:"1px solid rgba(148,163,184,0.1)" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "1.4rem" : "2rem", fontWeight:800, color:"#dbe4ee", letterSpacing:"-0.03em", margin:0 }}>
              Business <span style={{ color:"#38bdf8" }}>Enterprise</span> Leads
            </h1>
            <p style={{ fontSize:13, color:"#64748b", marginTop:5 }}>Track, filter and manage your enterprise pipeline</p>
          </div>
          <div style={{ background:"linear-gradient(135deg,#1e3a5f,#162d4a)", border:"1px solid rgba(56,189,248,0.25)", color:"#38bdf8", fontSize:11, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", padding:"7px 16px", borderRadius:999 }}>
            Admin Panel
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display:"flex", gap: isMobile ? 6 : 10, flexWrap:"nowrap", marginBottom:20 }}>
          <StatPill label="Total"     value={stats.total}     color="#94a3b8" active={statusFilter==="All"}       onClick={() => setStatus("All")} />
          <StatPill label="Pending"   value={stats.pending}   color="#f59e0b" active={statusFilter==="pending"}   onClick={() => setStatus(s => s==="pending"   ? "All" : "pending")} />
          <StatPill label="Contacted" value={stats.contacted} color="#38bdf8" active={statusFilter==="contacted"} onClick={() => setStatus(s => s==="contacted" ? "All" : "contacted")} />
          <StatPill label="Closed"    value={stats.closed}    color="#22c55e" active={statusFilter==="closed"}    onClick={() => setStatus(s => s==="closed"    ? "All" : "closed")} />
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ display:"flex", gap:10, flexWrap: isMobile ? "wrap" : "nowrap", marginBottom:14, alignItems:"center" }}>
          {/* search */}
          <div style={{ flex:1, minWidth:0, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#475569", pointerEvents:"none" }}>⌕</span>
            <input
              style={{ ...T.input, paddingLeft:36, paddingRight: search ? 34 : 12 }}
              placeholder="Search company, contact, location, budget…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13, padding:4 }}>✕</button>
            )}
          </div>

          {/* status filter */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <select
              style={{ ...T.select("pending"), width: isMobile ? "100%" : 150, height:40, paddingLeft:12 }}
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </div>
        </div>

        {/* result count */}
        <div style={{ fontSize:12, color:"#475569", marginBottom:16 }}>
          Showing <strong style={{ color:"#94a3b8" }}>{filtered.length}</strong> of <strong style={{ color:"#94a3b8" }}>{leads.length}</strong> leads
        </div>

        {/* ══════════════════════════
            DESKTOP TABLE
        ══════════════════════════ */}
        {!isMobile && (
          <div style={{ borderRadius:22, border:"1px solid rgba(148,163,184,0.13)", background:"#111f33", overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.3)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <thead style={{ background:"linear-gradient(180deg,#1a2e48,#152437)" }}>
                <tr>
                  {[
                    { label:"Company",  field:"company",  w:"15%" },
                    { label:"Location", field:"location", w:"12%" },
                    { label:"Contact",  field:"contact",  w:"12%" },
                    { label:"Phone",    field:"phone",    w:"13%" },
                    { label:"Email",    field:"email",    w:"15%" },
                    { label:"Team",     field:"team",     w:"9%"  },
                    { label:"Budget",   field:"budget",   w:"10%" },
                    { label:"Status",   field:"status",   w:"10%" },
                    { label:"Actions",  field:null,       w:"14%" },
                  ].map(col => (
                    <th
                      key={col.label}
                      style={{ ...T.th, width:col.w }}
                      onClick={() => col.field && handleSort(col.field)}
                    >
                      {col.label}{col.field && <SortArrow field={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...T.td, textAlign:"center", padding:48 }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
                      <div style={{ fontSize:15, fontWeight:600, color:"#94a3b8", marginBottom:6 }}>No leads found</div>
                      <div style={{ fontSize:13, color:"#475569" }}>Try adjusting your search or filter</div>
                    </td>
                  </tr>
                ) : filtered.map((item, idx) => {
                  const meta  = STATUS_META[item.status] || STATUS_META["pending"];
                  const color = avatarColor(item.company);
                  const busy  = updating[item.id];
                  return (
                    <tr
                      key={item.id}
                      style={{ background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", opacity: busy ? 0.6 : 1, transition:"background .2s,opacity .2s" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(56,189,248,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background= idx%2===0 ? "transparent" : "rgba(255,255,255,0.015)"}
                    >
                      {/* Company */}
                      <td style={T.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:"50%", background:color+"22", color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                            {getInitials(item.company)}
                          </div>
                          <span style={{ color:"#dbe4ee", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.company}</span>
                        </div>
                      </td>
                      {/* Location */}
                      <td style={T.td}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                          <span style={{ fontSize:12 }}>📍</span>
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.location}</span>
                        </span>
                      </td>
                      {/* Contact */}
                      <td style={{ ...T.td, color:"#dbe4ee", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.contact}</td>
                      {/* Phone */}
                      <td style={T.td}>
                        <a href={`tel:${item.phone}`} style={{ color:"#38bdf8", textDecoration:"none", fontWeight:600, fontSize:13, display:"inline-flex", alignItems:"center", gap:5 }}>
                          📞 {item.phone}
                        </a>
                      </td>
                      {/* Email */}
                      <td style={T.td}>
                        <a href={`mailto:${item.email}`} style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600, fontSize:13, display:"inline-flex", alignItems:"center", gap:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>
                          ✉ {item.email}
                        </a>
                      </td>
                      {/* Team */}
                      <td style={T.td}>
                        <span style={{ background:"rgba(139,92,246,0.12)", color:"#c4b5fd", border:"1px solid rgba(139,92,246,0.25)", borderRadius:6, padding:"3px 9px", fontSize:12, fontWeight:600 }}>
                          {item.team}
                        </span>
                      </td>
                      {/* Budget */}
                      <td style={{ ...T.td, color:"#22c55e", fontWeight:700 }}>{item.budget}</td>
                      {/* Status badge */}
                      <td style={T.td}>
                        <span style={T.badge(item.status)}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:meta.color, display:"inline-block" }} />
                          {meta.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={T.td}>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <div style={{ position:"relative" }}>
                            <select
                              style={T.select(item.status)}
                              value={item.status}
                              disabled={busy}
                              onChange={e => updateStatus(item.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                            </select>
                          </div>
                          <div style={{ display:"flex", gap:5 }}>
                            <a href={`tel:${item.phone}`}    style={{ ...T.btn(), flex:1, justifyContent:"center", padding:"5px 8px", fontSize:12 }}>📞</a>
                            <a href={`mailto:${item.email}`} style={{ ...T.btn("rgba(139,92,246,0.12)","#a78bfa","rgba(139,92,246,0.3)"), flex:1, justifyContent:"center", padding:"5px 8px", fontSize:12 }}>✉</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════
            MOBILE CARDS
        ══════════════════════════ */}
        {isMobile && (
          <div style={{ display:"grid", gap:12 }}>
            {filtered.length === 0 ? (
              <div style={{ ...T.card, textAlign:"center", padding:40 }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
                <div style={{ fontSize:15, fontWeight:600, color:"#94a3b8", marginBottom:4 }}>No leads found</div>
                <div style={{ fontSize:13, color:"#475569" }}>Try adjusting your search or filter</div>
              </div>
            ) : filtered.map(item => <MobileCard key={item.id} item={item} />)}
          </div>
        )}

      </div>
    </div>
  );
}
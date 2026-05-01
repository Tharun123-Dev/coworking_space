import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";

const STATUS_META = {
  new:        { label: "New",        color: "#38bdf8", bg: "rgba(56,189,248,0.13)",  border: "rgba(56,189,248,0.3)"  },
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.3)"  },
  contacted:  { label: "Contacted",  color: "#8b5cf6", bg: "rgba(139,92,246,0.13)",  border: "rgba(139,92,246,0.3)"  },
  converted:  { label: "Converted",  color: "#22c55e", bg: "rgba(34,197,94,0.13)",   border: "rgba(34,197,94,0.3)"   },
  closed:     { label: "Closed",     color: "#ef4444", bg: "rgba(239,68,68,0.13)",   border: "rgba(239,68,68,0.3)"   },
};

const AVATAR_COLORS = ["#38bdf8","#8b5cf6","#22c55e","#f59e0b","#ef4444","#ec4899","#14b8a6","#fb923c"];

function avatarColor(str = "") {
  let s = 0; for (let c of str) s += c.charCodeAt(0);
  return AVATAR_COLORS[s % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function statusMeta(raw = "") {
  return STATUS_META[raw?.toLowerCase()] || { label: raw || "Unknown", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)" };
}

export default function AdminCompanyLeads() {
  const [leads,     setLeads]     = useState([]);
  const [owners,    setOwners]    = useState([]);
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("All");
  const [ownerF,    setOwnerF]    = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDir,   setSortDir]   = useState("asc");
  const [assigning, setAssigning] = useState({});
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchLeads();
    fetchOwners();
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const fetchLeads  = () => axiosInstance.get("leads/company/admin/").then(r => setLeads(r.data));
  const fetchOwners = () => axiosInstance.get("owners/").then(r => setOwners(r.data));

  const assignOwner = (id, owner) => {
    if (!owner) return;
    setAssigning(a => ({ ...a, [id]: true }));
    axiosInstance.put(`leads/company/assign/${id}/`, { owner })
      .then(fetchLeads)
      .finally(() => setAssigning(a => ({ ...a, [id]: false })));
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:    leads.length,
    assigned: leads.filter(l => l.owner).length,
    unassigned: leads.filter(l => !l.owner).length,
  }), [leads]);

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    let r = leads.filter(l => {
      const q  = search.toLowerCase();
      const ok =
        l.name?.toLowerCase().includes(q)        ||
        l.company?.toLowerCase().includes(q)     ||
        l.email?.toLowerCase().includes(q)       ||
        l.phone?.toLowerCase().includes(q)       ||
        l.owner_name?.toLowerCase().includes(q)  ||
        String(l.team_size || "").includes(q);
      const sf = statusF === "All" || (l.status?.toLowerCase() === statusF.toLowerCase());
      const of = ownerF  === "All"
        || (ownerF === "Unassigned" && !l.owner)
        || (l.owner_name === ownerF);
      return ok && sf && of;
    });
    return [...r].sort((a, b) => {
      const av = String(a[sortField] || "").toLowerCase();
      const bv = String(b[sortField] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [leads, search, statusF, ownerF, sortField, sortDir]);

  /* ── design tokens ── */
  const C = {
    page:   { minHeight:"100vh", padding: isMobile ? "14px 10px 44px" : "32px 22px 52px", marginTop: isMobile ? 54 : 72, background:"linear-gradient(160deg,#0f172a 0%,#111827 100%)", color:"#dbe4ee", fontFamily:"'Inter','Segoe UI',sans-serif",marginTop:"-20px" },
    card:   { background:"#111f33", border:"1px solid rgba(148,163,184,0.13)", borderRadius:18, padding: isMobile ? 14 : 20 },
    input:  { height:40, background:"#0d1929", border:"1px solid rgba(148,163,184,0.22)", borderRadius:10, padding:"0 36px 0 36px", fontSize:14, color:"#dbe4ee", outline:"none", width:"100%" },
    select: (accentColor = "rgba(148,163,184,0.3)") => ({
      height:38, background:"#0e1a2c", border:`1px solid ${accentColor}`,
      borderRadius:8, color:"#dbe4ee", fontSize:13, fontWeight:600,
      padding:"0 28px 0 10px", outline:"none", cursor:"pointer", width:"100%",
      appearance:"none",
      backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
      backgroundRepeat:"no-repeat", backgroundPosition:"right 9px center",
    }),
    badge:  (raw) => { const m = statusMeta(raw); return { display:"inline-flex", alignItems:"center", gap:6, padding:"4px 11px", borderRadius:999, fontSize:12, fontWeight:700, color:m.color, background:m.bg, border:`1px solid ${m.border}` }; },
    th:     { padding:"14px 16px", fontSize:12, fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", color:"#94a3b8", textAlign:"left", whiteSpace:"nowrap", cursor:"pointer", userSelect:"none", borderBottom:"1px solid rgba(148,163,184,0.15)" },
    td:     { padding:"14px 16px", fontSize:14, color:"#94a3b8", borderBottom:"1px solid rgba(148,163,184,0.07)", verticalAlign:"middle" },
    linkBtn:(col="#38bdf8", bg="rgba(56,189,248,0.1)", brd="rgba(56,189,248,0.3)") => ({ display:"inline-flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:8, fontSize:13, fontWeight:700, color:col, background:bg, border:`1px solid ${brd}`, textDecoration:"none", transition:"opacity .2s", whiteSpace:"nowrap" }),
  };

  const SortArrow = ({ f }) => (
    <span style={{ fontSize:11, marginLeft:4, color: sortField===f ? "#38bdf8" : "#475569" }}>
      {sortField===f ? (sortDir==="asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  /* ── stat pill ── */
  const Pill = ({ label, value, color, active, onClick }) => (
    <div onClick={onClick} style={{ flex:"1 1 80px", minWidth:72, background: active ? "rgba(255,255,255,0.04)" : "#111f33", border:`1px solid ${active ? color : "rgba(148,163,184,0.12)"}`, borderRadius:12, padding: isMobile ? "10px 6px" : "14px 10px", textAlign:"center", cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}>
      {active && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color, borderRadius:"12px 12px 0 0" }} />}
      <div style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize: isMobile ? 10 : 11, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color:"#64748b" }}>{label}</div>
    </div>
  );

  /* ── owner assign cell ── */
  const OwnerCell = ({ item }) => {
    const busy = assigning[item.id];
    if (item.owner) {
      const col = avatarColor(item.owner_name);
      return (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:col+"22", color:col, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>
            {getInitials(item.owner_name)}
          </div>
          <span style={{ color:"#22c55e", fontWeight:600, fontSize:13 }}>{item.owner_name}</span>
          <span style={{ fontSize:10, background:"rgba(34,197,94,0.12)", color:"#22c55e", border:"1px solid rgba(34,197,94,0.25)", borderRadius:999, padding:"2px 7px", fontWeight:700 }}>Assigned</span>
        </div>
      );
    }
    return (
      <div style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? "none" : "auto" }}>
        <select
          style={C.select("rgba(245,158,11,0.35)")}
          defaultValue=""
          onChange={e => assignOwner(item.id, e.target.value)}
        >
          <option value="" disabled>Assign Owner…</option>
          {owners.map(o => <option key={o.id} value={o.id}>{o.username}</option>)}
        </select>
      </div>
    );
  };

  /* ── mobile card ── */
  const MobileCard = ({ item }) => {
    const col  = avatarColor(item.name);
    const meta = statusMeta(item.status);
    const busy = assigning[item.id];
    return (
      <div style={{ ...C.card, opacity: busy ? 0.7 : 1, transition:"all .25s" }}>

        {/* top */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:col+"22", color:col, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>
            {getInitials(item.name)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:15, color:"#dbe4ee", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.company}</div>
          </div>
          <span style={C.badge(item.status)}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:meta.color }} />
            {meta.label}
          </span>
        </div>

        {/* info grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 16px", borderTop:"1px solid rgba(148,163,184,0.1)", paddingTop:12, marginBottom:14 }}>
          {[
            { label:"Team Size", value: item.team_size ? `${item.team_size} members` : "—" },
            { label:"Company",   value: item.company || "—" },
          ].map(r => (
            <div key={r.label}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", color:"#475569", marginBottom:3 }}>{r.label}</div>
              <div style={{ fontSize:13, color:"#cbd5e1" }}>{r.value}</div>
            </div>
          ))}
        </div>

        {/* contact buttons */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <a href={`tel:${item.phone}`}    style={{ ...C.linkBtn(), flex:1, justifyContent:"center" }}>📞 {item.phone}</a>
          <a href={`mailto:${item.email}`} style={{ ...C.linkBtn("#a78bfa","rgba(139,92,246,0.1)","rgba(139,92,246,0.3)"), flex:1, justifyContent:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>✉ Email</a>
        </div>

        {/* owner assign */}
        <div style={{ borderTop:"1px solid rgba(148,163,184,0.1)", paddingTop:12 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", color:"#475569", marginBottom:8 }}>Owner Assignment</div>
          <OwnerCell item={item} />
        </div>
      </div>
    );
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div style={C.page}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24, paddingBottom:20, borderBottom:"1px solid rgba(148,163,184,0.1)" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.95rem", fontWeight:800, color:"#dbe4ee", letterSpacing:"-0.03em", margin:0, lineHeight:1.2 }}>
              Company <span style={{ color:"#38bdf8" }}>Leads</span>
            </h1>
            <p style={{ fontSize:13, color:"#64748b", marginTop:5, margin:"5px 0 0" }}>Assign owners and track company lead pipeline</p>
          </div>
          <div style={{ background:"linear-gradient(135deg,#1e3a5f,#162d4a)", border:"1px solid rgba(56,189,248,0.25)", color:"#38bdf8", fontSize:11, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", padding:"7px 16px", borderRadius:999, flexShrink:0 }}>
            Admin Panel
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display:"flex", gap: isMobile ? 6 : 10, marginBottom:20 }}>
          <Pill label="Total"      value={stats.total}      color="#94a3b8" active={statusF==="All" && ownerF==="All"}        onClick={() => { setStatusF("All"); setOwnerF("All"); }} />
          <Pill label="Assigned"   value={stats.assigned}   color="#22c55e" active={ownerF==="Assigned (any)"}                onClick={() => setOwnerF(v => v==="Assigned (any)" ? "All" : "Assigned (any)")} />
          <Pill label="Unassigned" value={stats.unassigned} color="#f59e0b" active={ownerF==="Unassigned"}                   onClick={() => setOwnerF(v => v==="Unassigned" ? "All" : "Unassigned")} />
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ display:"flex", gap:10, flexWrap: isMobile ? "wrap" : "nowrap", marginBottom:14, alignItems:"center" }}>

          {/* search */}
          <div style={{ flex:1, minWidth:0, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#475569", pointerEvents:"none" }}>⌕</span>
            <input
              style={C.input}
              placeholder="Search name, company, email, phone, owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13, padding:4 }}>✕</button>
            )}
          </div>

          {/* status filter */}
          <div style={{ flexShrink:0, minWidth: isMobile ? "100%" : 150 }}>
            <select style={{ ...C.select(), height:40, paddingLeft:12 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="All">All Status</option>
              {Object.entries(STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* owner filter */}
          <div style={{ flexShrink:0, minWidth: isMobile ? "100%" : 170 }}>
            <select style={{ ...C.select(), height:40, paddingLeft:12 }} value={ownerF} onChange={e => setOwnerF(e.target.value)}>
              <option value="All">All Owners</option>
              <option value="Unassigned">Unassigned</option>
              {owners.map(o => <option key={o.id} value={o.username}>{o.username}</option>)}
            </select>
          </div>
        </div>

        {/* result count */}
        <div style={{ fontSize:12, color:"#475569", marginBottom:16 }}>
          Showing <strong style={{ color:"#94a3b8" }}>{filtered.length}</strong> of <strong style={{ color:"#94a3b8" }}>{leads.length}</strong> leads
        </div>

        {/* ══════════ DESKTOP TABLE ══════════ */}
        {!isMobile && (
          <div style={{ borderRadius:22, border:"1px solid rgba(148,163,184,0.13)", background:"#111f33", overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.3)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <thead style={{ background:"linear-gradient(180deg,#1a2e48,#152437)" }}>
                <tr>
                  {[
                    { label:"Name",      field:"name",      w:"16%" },
                    { label:"Company",   field:"company",   w:"14%" },
                    { label:"Team Size", field:"team_size", w:"10%" },
                    { label:"Contact",   field:null,        w:"18%" },
                    { label:"Owner",     field:"owner_name",w:"20%" },
                    { label:"Status",    field:"status",    w:"12%" },
                    { label:"Assign",    field:null,        w:"10%" },
                  ].map(col => (
                    <th key={col.label} style={{ ...C.th, width:col.w }} onClick={() => col.field && handleSort(col.field)}>
                      {col.label}{col.field && <SortArrow f={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...C.td, textAlign:"center", padding:52 }}>
                      <div style={{ fontSize:34, marginBottom:10 }}>🔍</div>
                      <div style={{ fontSize:15, fontWeight:600, color:"#94a3b8", marginBottom:5 }}>No leads found</div>
                      <div style={{ fontSize:13, color:"#475569" }}>Try adjusting your search, status, or owner filter</div>
                    </td>
                  </tr>
                ) : filtered.map((item, idx) => {
                  const col  = avatarColor(item.name);
                  const meta = statusMeta(item.status);
                  const busy = assigning[item.id];
                  return (
                    <tr
                      key={item.id}
                      style={{ background: idx%2===0 ? "transparent" : "rgba(255,255,255,0.015)", opacity: busy ? 0.65 : 1, transition:"background .2s, opacity .2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = idx%2===0 ? "transparent" : "rgba(255,255,255,0.015)"}
                    >
                      {/* Name */}
                      <td style={C.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:col+"22", color:col, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                            {getInitials(item.name)}
                          </div>
                          <span style={{ color:"#dbe4ee", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</span>
                        </div>
                      </td>

                      {/* Company */}
                      <td style={{ ...C.td, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        <span style={{ background:"rgba(139,92,246,0.1)", color:"#c4b5fd", border:"1px solid rgba(139,92,246,0.22)", borderRadius:6, padding:"3px 9px", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
                          {item.company || "—"}
                        </span>
                      </td>

                      {/* Team Size */}
                      <td style={{ ...C.td, textAlign:"center" }}>
                        {item.team_size ? (
                          <span style={{ background:"rgba(56,189,248,0.1)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.22)", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700 }}>
                            {item.team_size}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Contact */}
                      <td style={C.td}>
                        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                          <a href={`tel:${item.phone}`}    style={C.linkBtn()}>📞 {item.phone}</a>
                          <a href={`mailto:${item.email}`} style={C.linkBtn("#a78bfa","rgba(139,92,246,0.1)","rgba(139,92,246,0.3)")}>✉ {item.email}</a>
                        </div>
                      </td>

                      {/* Owner */}
                      <td style={C.td}><OwnerCell item={item} /></td>

                      {/* Status badge */}
                      <td style={C.td}>
                        <span style={C.badge(item.status)}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:meta.color }} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Re-assign dropdown — always visible for flexibility */}
                      <td style={C.td}>
                        {item.owner ? (
                          <select
                            style={C.select("rgba(34,197,94,0.3)")}
                            defaultValue={item.owner}
                            onChange={e => assignOwner(item.id, e.target.value)}
                          >
                            {owners.map(o => <option key={o.id} value={o.id}>{o.username}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontSize:12, color:"#475569" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════ MOBILE CARDS ══════════ */}
        {isMobile && (
          <div style={{ display:"grid", gap:12 }}>
            {filtered.length === 0 ? (
              <div style={{ ...C.card, textAlign:"center", padding:44 }}>
                <div style={{ fontSize:34, marginBottom:10 }}>🔍</div>
                <div style={{ fontSize:15, fontWeight:600, color:"#94a3b8", marginBottom:5 }}>No leads found</div>
                <div style={{ fontSize:13, color:"#475569" }}>Try adjusting your search or filters</div>
              </div>
            ) : filtered.map(item => <MobileCard key={item.id} item={item} />)}
          </div>
        )}

      </div>
    </div>
  );
}
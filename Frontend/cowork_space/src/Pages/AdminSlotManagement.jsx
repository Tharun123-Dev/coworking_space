import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";

const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const IC = {
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  close:    "M18 6L6 18 M6 6l12 12",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
  user:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  chevDown: "M6 9l6 6 6-6",
  chevUp:   "M18 15l-6-6-6 6",
  pending:  "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
  full:     "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  expired:  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
  check:    "M20 6L9 17l-5-5",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const TODAY = todayStr();

const isDateExpired  = (dateStr) => !!dateStr && dateStr < TODAY;
const isMonthExpired = (year, month) => {
  const d = new Date();
  return Number(year) < d.getFullYear() ||
    (Number(year) === d.getFullYear() && Number(month) < d.getMonth() + 1);
};

function Pill({ children, color = "#6366f1" }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 10px",
      borderRadius:20, fontSize:11, fontWeight:700,
      background:color+"18", color, border:`1px solid ${color}30`, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function FillBar({ pct, expired }) {
  const col = expired ? "#9ca3af"
    : pct >= 100 ? "#dc2626" : pct >= 75 ? "#ea580c"
    : pct >= 40  ? "#f59e0b" : "#16a34a";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ height:5, width:54, borderRadius:3, background:"#e5e7eb", overflow:"hidden", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background:col, borderRadius:3, transition:"width .4s" }} />
      </div>
      <span style={{ fontSize:11, color: expired ? "#9ca3af" : "#6b7280", minWidth:28 }}>{pct}%</span>
    </div>
  );
}

function Tab({ active, onClick, children, count }) {
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6,
      padding:"8px 16px", borderRadius:8, border:"none",
      background: active ? "#6366f1" : "transparent",
      color: active ? "#fff" : "#555", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .15s" }}>
      {children}
      <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
        minWidth:20, height:20, borderRadius:20, fontSize:11, fontWeight:700,
        background: active ? "rgba(255,255,255,0.25)" : "#e5e7eb",
        color: active ? "#fff" : "#555", padding:"0 5px" }}>{count}</span>
    </button>
  );
}

function SlotStatusBadge({ expired, booked, cap }) {
  if (expired)        return <Pill color="#9ca3af"><Ico d={IC.expired} size={10}/> Expired</Pill>;
  if (booked >= cap)  return <Pill color="#dc2626"><Ico d={IC.full}    size={10}/> Full</Pill>;
  if (booked === 0)   return <Pill color="#f59e0b"><Ico d={IC.pending} size={10}/> Pending</Pill>;
  return                     <Pill color="#16a34a"><Ico d={IC.check}   size={10}/> Active</Pill>;
}

function MiniStats({ slots, type }) {
  let pending=0, active=0, full=0, expired=0;
  slots.forEach(s => {
    const exp = type === "monthly" ? isMonthExpired(s.year, s.month) : isDateExpired(s.date);
    const b   = Number(type === "monthly" ? s.booked ?? 0 : s.booked_count ?? s.booked ?? 0);
    const c   = Number(s.capacity ?? 1);
    if (exp)       expired++;
    else if (b>=c) full++;
    else if (b===0) pending++;
    else            active++;
  });
  return (
    <div style={{ display:"flex", gap:8, padding:"10px 18px", background:"#f9fafb",
      borderBottom:"1px solid #bbbbbc", flexWrap:"wrap" }}>
      {[
        { label:"Pending", val:pending, color:"#f59e0b" },
        { label:"Active",  val:active,  color:"#16a34a" },
        { label:"Full",    val:full,    color:"#dc2626" },
        { label:"Expired", val:expired, color:"#9ca3af" },
      ].map(it => (
        <div key={it.label} style={{ display:"flex", alignItems:"center", gap:5,
          padding:"4px 10px", borderRadius:20,
          background:it.color+"12", border:`1px solid ${it.color}25` }}>
          <span style={{ fontSize:11, fontWeight:700, color:it.color }}>{it.val} {it.label}</span>
        </div>
      ))}
    </div>
  );
}

const expiredRow = { opacity:0.42, background:"#f7f7f7", filter:"grayscale(35%)" };

function HourlyTable({ slots }) {
  if (!slots.length) return <div style={S.empty}>No hourly slots found.</div>;
  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead><tr>
          {["#","Workspace","City","Location","Date","Time","Cap","Booked","Remaining","Fill %","Price","Status"].map(h=>(
            <th key={h} style={S.th}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {slots.map((s,i) => {
            const b  = Number(s.booked_count ?? s.booked ?? 0);
            const c  = Number(s.capacity ?? 0);
            const r  = Math.max(c-b,0);
            const p  = c>0 ? Math.round((b/c)*100) : 0;
            const ex = isDateExpired(s.date);
            return (
              <tr key={s.id} style={{ ...(ex ? expiredRow : {}), background: ex?"#f7f7f7": i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f3f4f6" }}>
                <td style={S.td}><span style={{ ...S.sn, ...(ex?{color:"#c4c4c4"}:{}) }}>{String(i+1).padStart(2,"0")}</span></td>
                <td style={S.td}><strong style={{ color:ex?"#9ca3af":"#111", fontSize:13 }}>{s.workspace_name||s.workspace}</strong></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.city||"—"}</span></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.location||"—"}</span></td>
                <td style={S.td}>
                  <span style={{ fontSize:12, fontWeight:600, color:ex?"#9ca3af":"#374151" }}>{s.date}</span>
                  {ex && <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, marginTop:1 }}>Past date</div>}
                </td>
                <td style={S.td}>
                  <Pill color={ex?"#9ca3af":"#6366f1"}>
                    <Ico d={IC.clock} size={10}/> {s.start_time}–{s.end_time}
                  </Pill>
                </td>
                <td style={{...S.td,textAlign:"center"}}><span style={{ fontWeight:700, color:ex?"#9ca3af":"#374151" }}>{c}</span></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":b>0?"#2563eb":"#94a3b8"}>{b}</Pill></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":r===0?"#dc2626":r<c*0.2?"#ea580c":"#16a34a"}>{ex?"—":r===0?"Full":r}</Pill></td>
                <td style={S.td}><FillBar pct={p} expired={ex}/></td>
                <td style={{...S.td,fontWeight:700,color:ex?"#9ca3af":"#7c3aed"}}>₹{s.price}</td>
                <td style={S.td}><SlotStatusBadge expired={ex} booked={b} cap={c}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FullDayTable({ slots }) {
  if (!slots.length) return <div style={S.empty}>No full-day slots found.</div>;
  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead><tr>
          {["#","Workspace","City","Location","Date","Cap","Booked","Remaining","Fill %","Price","Status"].map(h=>(
            <th key={h} style={S.th}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {slots.map((s,i) => {
            const b  = Number(s.booked_count ?? s.booked ?? 0);
            const c  = Number(s.capacity ?? 0);
            const r  = Math.max(c-b,0);
            const p  = c>0 ? Math.round((b/c)*100) : 0;
            const ex = isDateExpired(s.date);
            return (
              <tr key={s.id} style={{ ...(ex ? expiredRow : {}), background: ex?"#f7f7f7": i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f3f4f6" }}>
                <td style={S.td}><span style={{ ...S.sn, ...(ex?{color:"#c4c4c4"}:{}) }}>{String(i+1).padStart(2,"0")}</span></td>
                <td style={S.td}><strong style={{ color:ex?"#9ca3af":"#111", fontSize:13 }}>{s.workspace_name||s.workspace}</strong></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.city||"—"}</span></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.location||"—"}</span></td>
                <td style={S.td}>
                  <span style={{ fontSize:12, fontWeight:600, color:ex?"#9ca3af":"#374151" }}>{s.date}</span>
                  {ex && <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, marginTop:1 }}>Past date</div>}
                </td>
                <td style={{...S.td,textAlign:"center"}}><span style={{ fontWeight:700, color:ex?"#9ca3af":"#374151" }}>{c}</span></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":b>0?"#2563eb":"#94a3b8"}>{b}</Pill></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":r===0?"#dc2626":r<c*0.2?"#ea580c":"#16a34a"}>{ex?"—":r===0?"Full":r}</Pill></td>
                <td style={S.td}><FillBar pct={p} expired={ex}/></td>
                <td style={{...S.td,fontWeight:700,color:ex?"#9ca3af":"#7c3aed"}}>₹{s.price}</td>
                <td style={S.td}><SlotStatusBadge expired={ex} booked={b} cap={c}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyTable({ slots }) {
  if (!slots.length) return <div style={S.empty}>No monthly slots found.</div>;
  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead><tr>
          {["#","Workspace","City","Location","Month","Year","Cap","Booked","Remaining","Fill %","Price/Seat","Status"].map(h=>(
            <th key={h} style={S.th}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {slots.map((s,i) => {
            const b  = Number(s.booked ?? 0);
            const c  = Number(s.capacity ?? 0);
            const r  = Math.max(c-b,0);
            const p  = c>0 ? Math.round((b/c)*100) : 0;
            const ex = isMonthExpired(s.year, s.month);
            const ml = MONTHS[(Number(s.month)-1)] || s.month;
            return (
              <tr key={s.id} style={{ ...(ex ? expiredRow : {}), background: ex?"#f7f7f7": i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f3f4f6" }}>
                <td style={S.td}><span style={{ ...S.sn, ...(ex?{color:"#c4c4c4"}:{}) }}>{String(i+1).padStart(2,"0")}</span></td>
                <td style={S.td}><strong style={{ color:ex?"#9ca3af":"#111", fontSize:13 }}>{s.workspace_name||s.workspace}</strong></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.city||"—"}</span></td>
                <td style={S.td}><span style={{ fontSize:12, color:ex?"#9ca3af":"#64748b" }}>{s.location||"—"}</span></td>
                <td style={S.td}>
                  <Pill color={ex?"#9ca3af":"#f59e0b"}><Ico d={IC.calendar} size={10}/> {ml}</Pill>
                  {ex && <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, marginTop:3 }}>Past month</div>}
                </td>
                <td style={{...S.td,fontWeight:600,color:ex?"#9ca3af":"#374151"}}>{s.year}</td>
                <td style={{...S.td,textAlign:"center"}}><span style={{ fontWeight:700, color:ex?"#9ca3af":"#374151" }}>{c}</span></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":b>0?"#2563eb":"#94a3b8"}>{b}</Pill></td>
                <td style={{...S.td,textAlign:"center"}}><Pill color={ex?"#9ca3af":r===0?"#dc2626":r<c*0.2?"#ea580c":"#16a34a"}>{ex?"—":r===0?"Full":r}</Pill></td>
                <td style={S.td}><FillBar pct={p} expired={ex}/></td>
                <td style={{...S.td,fontWeight:700,color:ex?"#9ca3af":"#7c3aed"}}>₹{Number(s.price).toLocaleString()}</td>
                <td style={S.td}><SlotStatusBadge expired={ex} booked={b} cap={c}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminSlotManagement() {
  const [allSlots,        setAllSlots]        = useState([]);
  const [allMonthlySlots, setAllMonthlySlots] = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [activeTab,       setActiveTab]       = useState("hourly");
  const [ownerFilter,     setOwnerFilter]     = useState("");
  const [wsFilter,        setWsFilter]        = useState("");
  const [searchQ,         setSearchQ]         = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [expandedOwners,  setExpandedOwners]  = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, monthlyRes] = await Promise.all([
        axiosInstance.get("workspaces/slots/admin/"),
        axiosInstance.get("workspaces/monthly-slots/admin/"),
      ]);
      setAllSlots(Array.isArray(slotsRes.data)       ? slotsRes.data       : []);
      setAllMonthlySlots(Array.isArray(monthlyRes.data) ? monthlyRes.data  : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const hourlySlots  = useMemo(() => allSlots.filter(s => s.slot_type === "hour"), [allSlots]);
  const fulldaySlots = useMemo(() => allSlots.filter(s => s.slot_type === "day"),  [allSlots]);

  const activeSource = activeTab === "hourly" ? hourlySlots
                     : activeTab === "fullday" ? fulldaySlots
                     : allMonthlySlots;

  const getStatus = (s) => {
    if (activeTab === "monthly") {
      if (isMonthExpired(s.year, s.month)) return "expired";
      const b=Number(s.booked??0), c=Number(s.capacity??1);
      return b>=c ? "full" : b===0 ? "pending" : "active";
    }
    if (isDateExpired(s.date)) return "expired";
    const b=Number(s.booked_count??s.booked??0), c=Number(s.capacity??1);
    return b>=c ? "full" : b===0 ? "pending" : "active";
  };

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return activeSource.filter(s => {
      const matchSearch = !q || [s.workspace_name,s.workspace,s.city,s.location,s.owner_name,s.owner_username,s.owner].filter(Boolean).some(v=>v.toLowerCase().includes(q));
      const matchOwner  = !ownerFilter || (s.owner_name||s.owner_username||s.owner||"") === ownerFilter;
      const matchWs     = !wsFilter    || (s.workspace_name||s.workspace||"")            === wsFilter;
      const matchStatus = statusFilter === "all" || getStatus(s) === statusFilter;
      return matchSearch && matchOwner && matchWs && matchStatus;
    });
  }, [activeSource, searchQ, ownerFilter, wsFilter, statusFilter, activeTab]);

  const groupedByOwner = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const k = s.owner_name||s.owner_username||s.owner||"Unassigned";
      if (!map[k]) map[k] = [];
      map[k].push(s);
    });
    return map;
  }, [filtered]);

  const ownerOptions = useMemo(() => [...new Set(activeSource.map(s=>s.owner_name||s.owner_username||s.owner||"Unassigned"))].filter(Boolean).sort(), [activeSource]);
  const wsOptions    = useMemo(() => [...new Set(activeSource.map(s=>s.workspace_name||s.workspace||""))].filter(Boolean).sort(), [activeSource]);

  // global stats
  const gs = useMemo(() => {
    const calc = (arr, isMonthly) => {
      let pending=0,active=0,full=0,expired=0;
      arr.forEach(s => {
        const exp = isMonthly ? isMonthExpired(s.year,s.month) : isDateExpired(s.date);
        const b   = Number(isMonthly ? s.booked??0 : s.booked_count??s.booked??0);
        const c   = Number(s.capacity??1);
        if (exp) expired++; else if (b>=c) full++; else if (b===0) pending++; else active++;
      });
      return { pending, active, full, expired };
    };
    return {
      h: calc(hourlySlots,  false),
      f: calc(fulldaySlots, false),
      m: calc(allMonthlySlots, true),
    };
  }, [hourlySlots, fulldaySlots, allMonthlySlots]);

  const toggleAll = (open) => {
    const n = {};
    Object.keys(groupedByOwner).forEach(k => { n[k]=open; });
    setExpandedOwners(n);
  };

  const renderTable = (slots) => {
    if (activeTab === "hourly")  return <HourlyTable  slots={slots} />;
    if (activeTab === "fullday") return <FullDayTable slots={slots} />;
    return <MonthlyTable slots={slots} />;
  };

  const ss = { height:36, padding:"0 10px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:12, color:"#333", background:"#fff", outline:"none", cursor:"pointer", minWidth:130 };

  const StatPanel = ({ emoji, title, count, stats, color, tab }) => (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", background:color+"08", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>{emoji}</span>
        <span style={{ fontWeight:700, fontSize:13, color:"#111" }}>{title}</span>
        <span style={{ marginLeft:"auto", fontWeight:800, fontSize:20, color }}>{count}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"#f3f4f6" }}>
        {[
          { label:"Pending", val:stats.pending, color:"#f59e0b", bg:"#fffbeb" },
          { label:"Active",  val:stats.active,  color:"#16a34a", bg:"#f0fdf4" },
          { label:"Full",    val:stats.full,    color:"#dc2626", bg:"#fef2f2" },
          { label:"Expired", val:stats.expired, color:"#9ca3af", bg:"#f9fafb" },
        ].map(it => (
          <div key={it.label}
            onClick={() => { setActiveTab(tab); setStatusFilter(it.label.toLowerCase()); setOwnerFilter(""); setWsFilter(""); setSearchQ(""); }}
            style={{ background:it.bg, padding:"12px 14px", cursor:"pointer", transition:"opacity .15s" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <div style={{ fontSize:20, fontWeight:800, color:it.color }}>{it.val}</div>
            <div style={{ fontSize:11, fontWeight:700, color:it.color, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif" }}>

      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#111" }}>Slot Management</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>
          All slots grouped by owner — click any stat to filter. Expired rows appear dimmed automatically.
        </p>
      </div>

      {/* ── 3 stat panels ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14, marginBottom:22 }}>
        <StatPanel emoji="⏰" title="Hourly Slots"   count={hourlySlots.length}       stats={gs.h} color="#6366f1" tab="hourly"  />
        <StatPanel emoji="☀️" title="Full-Day Slots" count={fulldaySlots.length}      stats={gs.f} color="#f59e0b" tab="fullday" />
        <StatPanel emoji="📅" title="Monthly Slots"  count={allMonthlySlots.length}   stats={gs.m} color="#10b981" tab="monthly" />
      </div>

      {/* expired legend */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"9px 14px", background:"#f9fafb", borderRadius:8, border:"1px solid #e5e7eb", width:"fit-content" }}>
        <div style={{ width:28, height:12, borderRadius:3, background:"#d1d5db", opacity:0.6 }} />
        <span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>Greyed rows = expired (past date / past month)</span>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:4, marginBottom:12, background:"#f3f4f6", borderRadius:10, padding:4, width:"fit-content" }}>
        <Tab active={activeTab==="hourly"}  onClick={()=>{ setActiveTab("hourly");  setOwnerFilter(""); setWsFilter(""); setSearchQ(""); setStatusFilter("all"); }} count={hourlySlots.length}>⏰ Hourly</Tab>
        <Tab active={activeTab==="fullday"} onClick={()=>{ setActiveTab("fullday"); setOwnerFilter(""); setWsFilter(""); setSearchQ(""); setStatusFilter("all"); }} count={fulldaySlots.length}>☀️ Full Day</Tab>
        <Tab active={activeTab==="monthly"} onClick={()=>{ setActiveTab("monthly"); setOwnerFilter(""); setWsFilter(""); setSearchQ(""); setStatusFilter("all"); }} count={allMonthlySlots.length}>📅 Monthly</Tab>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:200, height:36, padding:"0 10px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff" }}>
          <Ico d={IC.search} size={13}/>
          <input style={{ border:"none", outline:"none", fontSize:12, color:"#000", width:"100%", background:"transparent" }}
            placeholder="Search workspace, city, owner..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          {searchQ && <button style={{ border:"none", background:"none", cursor:"pointer", color:"#aaa", padding:0, display:"flex" }} onClick={()=>setSearchQ("")}><Ico d={IC.close} size={11}/></button>}
        </div>

        <select style={{ ...ss, borderColor: statusFilter!=="all"?"#6366f1":"#e5e7eb", color: statusFilter!=="all"?"#6366f1":"#333", fontWeight: statusFilter!=="all"?700:400 }}
          value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="active">✅ Active</option>
          <option value="full">🔴 Full</option>
          <option value="expired">⛔ Expired</option>
        </select>

        <select style={ss} value={ownerFilter} onChange={e=>setOwnerFilter(e.target.value)}>
          <option value="">All Owners</option>
          {ownerOptions.map(o=><option key={o} value={o}>{o}</option>)}
        </select>

        <select style={ss} value={wsFilter} onChange={e=>setWsFilter(e.target.value)}>
          <option value="">All Workspaces</option>
          {wsOptions.map(w=><option key={w} value={w}>{w}</option>)}
        </select>

        <button onClick={()=>{ setOwnerFilter(""); setWsFilter(""); setSearchQ(""); setStatusFilter("all"); }}
          style={{ display:"inline-flex", alignItems:"center", gap:5, height:36, padding:"0 12px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#555" }}>
          <Ico d={IC.refresh} size={13}/> Reset
        </button>

        <button onClick={fetchData}
          style={{ display:"inline-flex", alignItems:"center", gap:5, height:36, padding:"0 12px", borderRadius:8, border:"none", background:"#6366f1", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          <Ico d={IC.refresh} size={13}/> {loading ? "Loading…" : "Refresh"}
        </button>

        <button onClick={()=>toggleAll(true)}
          style={{ display:"inline-flex", alignItems:"center", gap:4, height:36, padding:"0 12px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#555" }}>
          Expand All
        </button>
        <button onClick={()=>toggleAll(false)}
          style={{ display:"inline-flex", alignItems:"center", gap:4, height:36, padding:"0 12px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#555" }}>
          Collapse All
        </button>

        <span style={{ display:"inline-flex", alignItems:"center", padding:"0 10px", height:36, borderRadius:20, background:"#f3f4f6", color:"#888", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
          {filtered.length} records
        </span>
      </div>

      {/* ── Owner groups ── */}
      {loading ? (
        <div style={{ padding:40, textAlign:"center", color:"#6b7280", fontSize:14 }}>Loading slot data…</div>
      ) : Object.keys(groupedByOwner).length === 0 ? (
        <div style={{ padding:40, textAlign:"center", color:"#9ca3af", fontSize:14 }}>No slots found for the current filters.</div>
      ) : (
        Object.entries(groupedByOwner).map(([ownerName, slots]) => {
          const isOpen = expandedOwners[ownerName] !== false;
          let oPend=0, oAct=0, oFull=0, oExp=0;
          slots.forEach(s => {
            const st = getStatus(s);
            if (st==="pending") oPend++; else if (st==="active") oAct++;
            else if (st==="full") oFull++; else if (st==="expired") oExp++;
          });

          return (
            <div key={ownerName} style={{ marginBottom:12, border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <button onClick={()=>setExpandedOwners(p=>({...p,[ownerName]:!isOpen}))}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 18px",
                  background: isOpen?"#f8f9ff":"#fafafa", border:"none",
                  borderBottom: isOpen?"1px solid #e5e7eb":"none", cursor:"pointer", textAlign:"left" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#6366f118", color:"#6366f1",
                  display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, flexShrink:0 }}>
                  {(ownerName||"?").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#111" }}>{ownerName}</div>
                  <div style={{ fontSize:11, color:"#6b7280", marginTop:1 }}>{slots.length} slot{slots.length!==1?"s":""}</div>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {oPend > 0 && <Pill color="#f59e0b">⏳ {oPend} Pending</Pill>}
                  {oAct  > 0 && <Pill color="#16a34a">✅ {oAct} Active</Pill>}
                  {oFull > 0 && <Pill color="#dc2626">🔴 {oFull} Full</Pill>}
                  {oExp  > 0 && <Pill color="#9ca3af">⛔ {oExp} Expired</Pill>}
                </div>
                <Ico d={isOpen ? IC.chevUp : IC.chevDown} size={14}/>
              </button>
              {isOpen && (
                <>
                  <MiniStats slots={slots} type={activeTab}/>
                  {renderTable(slots)}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const S = {
  wrap:  { overflowX:"auto", WebkitOverflowScrolling:"touch" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:760 },
  th:    { padding:"9px 12px", textAlign:"left", color:"#6b7280", fontWeight:700, fontSize:11,
           textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1.5px solid #e5e7eb",
           whiteSpace:"nowrap", background:"#f9fafb" },
  td:    { padding:"10px 12px", color:"#111", verticalAlign:"middle" },
  sn:    { color:"#94a3b8", fontWeight:600, fontSize:12 },
  empty: { padding:"32px 18px", textAlign:"center", color:"#9ca3af", fontSize:13 },
};
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminBookings.module.css";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const AVATAR_PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#3b82f6",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316",
];
const avatarColor = (str = "") => {
  let t = 0; for (const c of str) t += c.charCodeAt(0);
  return AVATAR_PALETTE[t % AVATAR_PALETTE.length];
};
const initials = (name = "") =>
  name.trim().split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "#10b98115", border: "#10b98130" },
  pending:   { label: "Pending",   color: "#f59e0b", bg: "#f59e0b15", border: "#f59e0b30" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#ef444415", border: "#ef444430" },
};

/* ─── component ──────────────────────────────────────────────────────────── */
export default function OwnerRevenue() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]       = useState("revenue"); // revenue | bookings | name
  const [expanded, setExpanded]   = useState(null);       // owner name
  const [view, setView]           = useState("cards");    // cards | table

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("cart/admin/bookings/");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Revenue fetch error:", e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── aggregate by owner ─────────────────────────────────────────────── */
  const ownerMap = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const key = b.owner || "Unknown";
      if (!map[key]) {
        map[key] = {
          owner: key,
          total: 0, confirmed: 0, pending: 0, cancelled: 0,
          totalRevenue: 0, confirmedRevenue: 0, pendingRevenue: 0,
          workspaces: new Set(),
          cities: new Set(),
          bookings: [],
        };
      }
      const price = Number(b.total_price || b.price || 0);
      const status = (b.status || "pending").toLowerCase().trim();
      map[key].total++;
      map[key].totalRevenue += price;
      map[key].bookings.push(b);
      map[key].workspaces.add(b.workspace || "Unknown");
      map[key].cities.add(b.city || "—");
      if (status === "confirmed") { map[key].confirmed++; map[key].confirmedRevenue += price; }
      else if (status === "cancelled") { map[key].cancelled++; }
      else { map[key].pending++; map[key].pendingRevenue += price; }
    });
    return map;
  }, [bookings]);

  const owners = useMemo(() => {
    let list = Object.values(ownerMap).map(o => ({
      ...o,
      workspaces: [...o.workspaces],
      cities: [...o.cities],
    }));

    // search
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(o =>
      o.owner.toLowerCase().includes(q) ||
      o.workspaces.some(w => w.toLowerCase().includes(q)) ||
      o.cities.some(c => c.toLowerCase().includes(q))
    );

    // status filter
    if (statusFilter !== "all") {
      list = list.filter(o => {
        if (statusFilter === "confirmed") return o.confirmed > 0;
        if (statusFilter === "pending")   return o.pending > 0;
        if (statusFilter === "cancelled") return o.cancelled > 0;
        return true;
      });
    }

    // sort
    if (sortBy === "revenue")  list.sort((a, b) => b.totalRevenue - a.totalRevenue);
    if (sortBy === "bookings") list.sort((a, b) => b.total - a.total);
    if (sortBy === "name")     list.sort((a, b) => a.owner.localeCompare(b.owner));

    return list;
  }, [ownerMap, search, statusFilter, sortBy]);

  /* ── grand totals ───────────────────────────────────────────────────── */
  const totals = useMemo(() => owners.reduce((acc, o) => ({
    revenue:   acc.revenue   + o.totalRevenue,
    confirmed: acc.confirmed + o.confirmedRevenue,
    pending:   acc.pending   + o.pendingRevenue,
    bookings:  acc.bookings  + o.total,
  }), { revenue: 0, confirmed: 0, pending: 0, bookings: 0 }), [owners]);

  /* ── top owner bar widths ───────────────────────────────────────────── */
  const maxRevenue = useMemo(() => Math.max(...owners.map(o => o.totalRevenue), 1), [owners]);

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <div className={styles.wrap}>
      {/* ── header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleBlock}>
          <span className={styles.pageBadge}>Revenue Analytics</span>
          <h2 className={styles.pageTitle}>Manager-wise Revenue</h2>
          <p className={styles.pageSub}>
            Breakdown of booking revenue, confirmation rates and workspace performance per Manager.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchBookings} type="button">
          ↻ Refresh
        </button>
      </div>

      {/* ── summary cards ── */}
      <div className={styles.summaryGrid}>
        {[
          { label: "Total Revenue",     value: `₹${fmt(totals.revenue)}`,   icon: "💰", accent: "#b8922a", sub: `${owners.length} owners` },
          { label: "Confirmed Revenue", value: `₹${fmt(totals.confirmed)}`,  icon: "✅", accent: "#10b981", sub: "Settled payments" },
          { label: "Pending Revenue",   value: `₹${fmt(totals.pending)}`,    icon: "⏳", accent: "#f59e0b", sub: "Awaiting confirmation" },
          { label: "Total Bookings",    value: totals.bookings,               icon: "📋", accent: "#6366f1", sub: "All reservations" },
        ].map(card => (
          <div key={card.label} className={styles.summaryCard} style={{ "--accent": card.accent }}>
            <div className={styles.summaryCardAccent} />
            <div className={styles.summaryCardIcon} style={{ background: card.accent + "20", color: card.accent }}>
              {card.icon}
            </div>
            <div className={styles.summaryCardBody}>
              <p className={styles.summaryCardValue}>{card.value}</p>
              <p className={styles.summaryCardLabel}>{card.label}</p>
              <p className={styles.summaryCardSub}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── controls ── */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search manager, workspace, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch("")} type="button">✕</button>
          )}
        </div>

        <div className={styles.filterRow}>
          {/* status filter */}
          <div className={styles.filterTabs}>
            {[["all","All"],["confirmed","Confirmed"],["pending","Pending"],["cancelled","Cancelled"]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${styles.filterTab} ${statusFilter === key ? styles.filterTabActive : ""}`}
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* sort */}
          <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="revenue">Sort: Revenue ↓</option>
            <option value="bookings">Sort: Bookings ↓</option>
            <option value="name">Sort: Name A–Z</option>
          </select>

          {/* view toggle */}
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "cards" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("cards")}
              title="Card view"
            >⊞</button>
            <button
              type="button"
              className={`${styles.viewBtn} ${view === "table" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("table")}
              title="Table view"
            >≡</button>
          </div>
        </div>
      </div>

      <div className={styles.resultMeta}>
        Showing <strong>{owners.length}</strong> Manager{owners.length !== 1 ? "s" : ""}
        {search && <> matching <em>"{search}"</em></>}
      </div>

      {/* ── loading / empty ── */}
      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <p>Loading revenue data…</p>
        </div>
      )}

      {!loading && owners.length === 0 && (
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>📊</div>
          <h3>No data found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {!loading && view === "cards" && owners.length > 0 && (
        <div className={styles.cardGrid}>
          {owners.map((o, rank) => {
            const isOpen = expanded === o.owner;
            const barWidth = Math.round((o.totalRevenue / maxRevenue) * 100);
            const confirmRate = o.total > 0 ? Math.round((o.confirmed / o.total) * 100) : 0;

            return (
              <div key={o.owner} className={`${styles.ownerCard} ${isOpen ? styles.ownerCardOpen : ""}`}>
                {/* rank badge */}
                {rank < 3 && (
                  <div className={styles.rankBadge} style={{
                    background: rank === 0 ? "#b8922a" : rank === 1 ? "#94a3b8" : "#b87333"
                  }}>
                    #{rank + 1}
                  </div>
                )}

                {/* card header */}
                <div className={styles.ownerCardHeader} onClick={() => setExpanded(isOpen ? null : o.owner)}>
                  <div className={styles.ownerCardLeft}>
                    <div className={styles.ownerAvatar} style={{ background: avatarColor(o.owner) }}>
                      {initials(o.owner)}
                    </div>
                    <div>
                      <p className={styles.ownerName}>{o.owner}</p>
                      <p className={styles.ownerMeta}>
                        {o.workspaces.length} workspace{o.workspaces.length !== 1 ? "s" : ""}
                        {" · "}{o.cities.slice(0, 2).join(", ")}{o.cities.length > 2 ? " …" : ""}
                      </p>
                    </div>
                  </div>
                  <div className={styles.ownerCardRight}>
                    <p className={styles.ownerRevenue}>₹{fmt(o.totalRevenue)}</p>
                    <span className={styles.ownerExpandIcon}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* revenue bar */}
                <div className={styles.revenueBarTrack}>
                  <div className={styles.revenueBarFill} style={{ width: `${barWidth}%`, background: avatarColor(o.owner) }} />
                </div>

                {/* stat pills */}
                <div className={styles.statPillRow}>
                  <span className={styles.statPill} style={{ color: "#10b981", background: "#10b98112", border: "1px solid #10b98130" }}>
                    ✅ {o.confirmed} confirmed
                  </span>
                  <span className={styles.statPill} style={{ color: "#f59e0b", background: "#f59e0b12", border: "1px solid #f59e0b30" }}>
                    ⏳ {o.pending} pending
                  </span>
                  <span className={styles.statPill} style={{ color: "#ef4444", background: "#ef444412", border: "1px solid #ef444430" }}>
                    ❌ {o.cancelled} cancelled
                  </span>
                </div>

                {/* confirm rate */}
                <div className={styles.confirmRateRow}>
                  <span className={styles.confirmRateLabel}>Confirm rate</span>
                  <span className={styles.confirmRateValue}>{confirmRate}%</span>
                  <div className={styles.confirmTrack}>
                    <div className={styles.confirmFill} style={{ width: `${confirmRate}%` }} />
                  </div>
                </div>

                {/* expanded bookings list */}
                {isOpen && (
                  <div className={styles.bookingsList}>
                    <div className={styles.bookingsListHeader}>
                      <span>Recent Bookings ({o.bookings.length})</span>
                    </div>
                    {o.bookings.slice(0, 8).map(b => {
                      const s = (b.status || "pending").toLowerCase().trim();
                      const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
                      return (
                        <div key={b.id} className={styles.bookingRow}>
                          <div className={styles.bookingRowLeft}>
                            {b.image && (
                              <img src={b.image} alt={b.workspace} className={styles.bookingThumb} />
                            )}
                            <div>
                              <p className={styles.bookingWorkspace}>{b.workspace || "—"}</p>
                              <p className={styles.bookingUser}>👤 {b.user || "—"} · 📅 {b.date || "—"}</p>
                            </div>
                          </div>
                          <div className={styles.bookingRowRight}>
                            <span className={styles.bookingPrice}>₹{fmt(b.total_price || b.price)}</span>
                            <span
                              className={styles.bookingStatus}
                              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {o.bookings.length > 8 && (
                      <p className={styles.moreBookings}>+{o.bookings.length - 8} more bookings</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && view === "table" && owners.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.revenueTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Manager</th>
                <th>Workspaces</th>
                <th>Cities</th>
                <th>Total Bookings</th>
                <th>Confirmed</th>
                <th>Pending</th>
                <th>Cancelled</th>
                <th>Confirmed Revenue</th>
                <th>Pending Revenue</th>
                <th>Total Revenue</th>
                <th>Confirm Rate</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o, i) => {
                const confirmRate = o.total > 0 ? Math.round((o.confirmed / o.total) * 100) : 0;
                const barWidth = Math.round((o.totalRevenue / maxRevenue) * 100);
                return (
                  <tr key={o.owner}>
                    <td className={styles.rankCell}>
                      <span
                        className={styles.rankNum}
                        style={{
                          background: i === 0 ? "#b8922a22" : i === 1 ? "#94a3b822" : i === 2 ? "#b8733322" : "transparent",
                          color: i === 0 ? "#b8922a" : i === 1 ? "#64748b" : i === 2 ? "#b87333" : "#94a3b8",
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableOwnerCell}>
                        <div className={styles.tableAvatar} style={{ background: avatarColor(o.owner) }}>
                          {initials(o.owner)}
                        </div>
                        <span className={styles.tableOwnerName}>{o.owner}</span>
                      </div>
                    </td>
                    <td className={styles.wsList}>
                      {o.workspaces.slice(0, 2).map(w => (
                        <span key={w} className={styles.wsTag}>{w}</span>
                      ))}
                      {o.workspaces.length > 2 && <span className={styles.wsTag}>+{o.workspaces.length - 2}</span>}
                    </td>
                    <td>{o.cities.slice(0, 2).join(", ")}{o.cities.length > 2 ? " …" : ""}</td>
                    <td className={styles.numCell}>{o.total}</td>
                    <td><span className={styles.tableBadge} style={{ color:"#10b981", background:"#10b98112", border:"1px solid #10b98130" }}>{o.confirmed}</span></td>
                    <td><span className={styles.tableBadge} style={{ color:"#f59e0b", background:"#f59e0b12", border:"1px solid #f59e0b30" }}>{o.pending}</span></td>
                    <td><span className={styles.tableBadge} style={{ color:"#ef4444", background:"#ef444412", border:"1px solid #ef444430" }}>{o.cancelled}</span></td>
                    <td className={styles.moneyCell}>₹{fmt(o.confirmedRevenue)}</td>
                    <td className={styles.moneyCellAmber}>₹{fmt(o.pendingRevenue)}</td>
                    <td>
                      <div className={styles.tableTotalCell}>
                        <span className={styles.tableTotalAmount}>₹{fmt(o.totalRevenue)}</span>
                        <div className={styles.tableBarTrack}>
                          <div className={styles.tableBarFill} style={{ width: `${barWidth}%`, background: avatarColor(o.owner) }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.rateCell}>
                        <span className={styles.rateNum} style={{ color: confirmRate >= 70 ? "#10b981" : confirmRate >= 40 ? "#f59e0b" : "#ef4444" }}>
                          {confirmRate}%
                        </span>
                        <div className={styles.rateTrack}>
                          <div className={styles.rateFill} style={{
                            width: `${confirmRate}%`,
                            background: confirmRate >= 70 ? "#10b981" : confirmRate >= 40 ? "#f59e0b" : "#ef4444",
                          }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* totals row */}
            <tfoot>
              <tr className={styles.totalsRow}>
                <td colSpan="4"><strong>Grand Total</strong></td>
                <td className={styles.numCell}><strong>{totals.bookings}</strong></td>
                <td colSpan="3" />
                <td className={styles.moneyCell}><strong>₹{fmt(totals.confirmed)}</strong></td>
                <td className={styles.moneyCellAmber}><strong>₹{fmt(totals.pending)}</strong></td>
                <td><strong>₹{fmt(totals.revenue)}</strong></td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

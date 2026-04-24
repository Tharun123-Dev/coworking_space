import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Slotbookpage.module.css";

// ── Helpers ──────────────────────────────────────────────────────
function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Slot Card ────────────────────────────────────────────────────
function SlotCard({ slot, selected, onSelect, animDelay = 0 }) {
  const isFull = slot.is_full;
  const isHour = slot.slot_type === "hour";
  const label = isHour ? `${slot.start_time}` : "Full Day";
  const endLabel = isHour ? slot.end_time : null;
  const remaining = slot.capacity - slot.booked;
  const pct = slot.capacity > 0 ? Math.round((slot.booked / slot.capacity) * 100) : 0;
  const urgency = !isFull && remaining <= 10;

  let cardCls = `${styles.slotCard}`;
  if (isFull) cardCls += ` ${styles.slotFull}`;
  else if (selected) cardCls += ` ${styles.slotSelected}`;
  else cardCls += ` ${styles.slotAvail}`;

  return (
    <button
      type="button"
      disabled={isFull}
      onClick={() => !isFull && onSelect(slot)}
      className={cardCls}
      style={{ "--delay": `${animDelay}ms` }}
      aria-label={`${label} slot, ₹${slot.price}`}
    >
      {selected && !isFull && <span className={styles.checkBadge}>✓</span>}
      {urgency && !selected && <span className={styles.urgencyBadge}>!</span>}

      {/* Top colored band */}
      <div className={styles.slotBand}>
        <span className={styles.slotCount}>
          {isFull ? "FULL" : remaining}
        </span>
        {!isFull && <span className={styles.slotCountLbl}>left</span>}
      </div>

      {/* Content */}
      <div className={styles.slotBody}>
        <div className={styles.slotTimeBlock}>
          <span className={styles.slotTimeMain}>{label}</span>
          {endLabel && <span className={styles.slotTimeEnd}>{endLabel}</span>}
          {!isHour && <span className={styles.slotTimeEnd}>All Day</span>}
        </div>
        <div className={styles.slotPriceRow}>
          <span className={styles.rupee}>₹</span>
          <span className={styles.slotPrice}>{slot.price}</span>
        </div>
        <div className={styles.slotOccupancy}>
          {slot.booked}/{slot.capacity} booked
        </div>

        {/* Fill bar */}
        <div className={styles.fillBar}>
          <div
            className={styles.fillBarInner}
            style={{
              width: `${pct}%`,
              background: isFull ? "#ef4444" : pct > 70 ? "#f59e0b" : "#19b67c"
            }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function SlotBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspace = location.state?.workspace || null;

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [slotSearch, setSlotSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time"); // time | price | avail

  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [calLoading, setCalLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState(0); // which month shown on mobile

  const slotsRef = useRef(null);

  // Redirect if no workspace
  useEffect(() => {
    if (!workspace) navigate(-1);
  }, [workspace]);

  // Fetch date statuses when month changes
  useEffect(() => {
    if (!workspace) return;
    fetchDateStatuses(workspace.id);
  }, [workspace, calMonthOffset]);

  // Filter + sort slots
  useEffect(() => {
    if (!selectedDate) { setFilteredSlots([]); return; }
    let base = [...slots];
    if (slotFilter === "hour") base = base.filter(s => s.slot_type === "hour");
    if (slotFilter === "fullday") base = base.filter(s => s.slot_type !== "hour");
    const val = slotSearch.toLowerCase().trim();
    if (val) {
      base = base.filter(s => {
        const txt = [s.slot_type, s.start_time, s.end_time, `${s.price}`, `${s.booked}`, `${s.capacity}`]
          .filter(Boolean).join(" ").toLowerCase();
        return txt.includes(val);
      });
    }
    if (sortBy === "price") base.sort((a, b) => a.price - b.price);
    else if (sortBy === "avail") base.sort((a, b) => (b.capacity - b.booked) - (a.capacity - a.booked));
    else base.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
    setFilteredSlots(base);
  }, [slots, slotSearch, selectedDate, slotFilter, sortBy]);

  const fetchDateStatuses = async (wsId) => {
    setCalLoading(true);
    try {
      const today = new Date();
      const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
      const year = base.getFullYear();
      const month = base.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const map = {};
      const reqs = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dd = String(d).padStart(2,"0"), mm = String(month+1).padStart(2,"0");
        const ds = `${year}-${mm}-${dd}`;
        reqs.push(
          axiosInstance.get(`workspaces/slot/${wsId}/?date=${ds}`)
            .then(r => {
              const s = r.data || [];
              map[ds] = s.length === 0 ? "unreleased" : s.every(x => x.is_full) ? "full" : "available";
            })
            .catch(() => { map[ds] = "unreleased"; })
        );
      }
      await Promise.all(reqs);
      setDateStatusMap(prev => ({ ...prev, ...map }));
    } catch(e) { console.error(e); }
    setCalLoading(false);
  };

  const fetchSlots = (date) => {
    if (!workspace || !date) return;
    setSlotsLoading(true);
    axiosInstance.get(`workspaces/slot/${workspace.id}/?date=${date}`)
      .then(r => {
        const data = r.data || [];
        setSlots(data);
        const allFull = data.length > 0 && data.every(s => s.is_full);
        setDateStatusMap(prev => ({ ...prev, [date]: data.length === 0 ? "unreleased" : allFull ? "full" : "available" }));
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  const handleDateClick = (dateStr) => {
    const status = dateStatusMap[dateStr];
    if (status === "full") return;
    setSelectedDate(dateStr);
    setSelectedSlot(null); setSlotSearch(""); setSlotFilter("all"); setSortBy("time");
    fetchSlots(dateStr);
    setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    const token = localStorage.getItem("access");
    if (!token) { alert("Please login first 🔒"); navigate("/auth?type=user"); return; }
    try {
      setBookingLoading(true);
      const res = await axiosInstance.post("payment/create/", { amount: selectedSlot.price });
      const order = res.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount, currency: "INR",
        name: workspace.name, description: "Slot Booking",
        order_id: order.id,
        method: { netbanking: true, card: false, upi: false, wallet: false },
        theme: { color: "#c9972c" },
        handler: async (response) => {
          try {
            const verify = await axiosInstance.post("payment/verify/", response);
            if (verify.data.status === "success") {
              await axiosInstance.post("cart/create/", { slot_id: selectedSlot.id, payment_id: response.razorpay_payment_id });
              alert("Booking Confirmed 🎉");
              navigate(-1);
            } else alert("Payment verification failed");
          } catch { alert("Booking failed after payment"); }
        },
        modal: { ondismiss: () => setBookingLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => alert("Payment failed. Try again."));
      rzp.open();
      setBookingLoading(false);
    } catch { alert("Payment Failed"); setBookingLoading(false); }
  };

  const getVisibleMonths = () => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset * 2, 1);
    const m1 = { year: base.getFullYear(), month: base.getMonth() };
    const m2d = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    return [m1, { year: m2d.getFullYear(), month: m2d.getMonth() }];
  };

  const renderMonth = ({ year, month }) => {
    const cells = buildMonthMatrix(year, month);
    const today = new Date(); today.setHours(0,0,0,0);
    return (
      <div className={styles.calMonth} key={`${year}-${month}`}>
        <div className={styles.calMonthHead}>
          <span className={styles.calMonthName}>{MONTH_NAMES[month]} {year}</span>
        </div>
        <div className={styles.calDayRow}>
          {DAY_LABELS.map((d,i) => <span key={i} className={styles.calDayLbl}>{d}</span>)}
        </div>
        <div className={styles.calGrid}>
          {cells.map((day, idx) => {
            if (!day) return <span key={idx} className={styles.calEmpty} />;
            const mm = String(month+1).padStart(2,"0"), dd = String(day).padStart(2,"0");
            const ds = `${year}-${mm}-${dd}`;
            const obj = new Date(year, month, day);
            const isPast = obj < today;
            const status = dateStatusMap[ds];
            const isSel = selectedDate === ds;
            let cls = styles.calDay;
            if (isPast) cls += ` ${styles.dayPast}`;
            else if (status === "full") cls += ` ${styles.dayFull}`;
            else if (status === "available") cls += ` ${styles.dayAvail}`;
            else cls += ` ${styles.dayUnrel}`;
            if (isSel) cls += ` ${styles.daySelected}`;
            return (
              <button key={idx} type="button" className={cls}
                disabled={isPast || status === "full"}
                onClick={() => !isPast && status !== "full" && handleDateClick(ds)}
                aria-label={ds}>
                <span className={styles.dayNum}>{day}</span>
                {status === "available" && !isPast && !isSel && <span className={styles.dayDot} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const visibleMonths = getVisibleMonths();
  const totalAvail = filteredSlots.filter(s => !s.is_full).length;
  const totalFull = filteredSlots.filter(s => s.is_full).length;
  const lowestPrice = slots.length > 0 ? Math.min(...slots.filter(s => !s.is_full).map(s => s.price)) : null;

  if (!workspace) return null;

  return (
    <div className={styles.page}>
      {/* ── Ambient background orbs ── */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      {/* ── Header ── */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.headerMeta}>
            <span className={styles.headerBadge}>
              <span className={styles.headerBadgeDot}></span>Book a Slot
            </span>
          </div>
          <h1 className={styles.headerTitle}>{workspace.name}</h1>
          <p className={styles.headerSub}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            {workspace.location}, {workspace.area} · {workspace.city}
          </p>
        </div>
        {workspace.image && (
          <div className={styles.headerThumb}>
            <img src={workspace.image} alt={workspace.name} />
          </div>
        )}
      </header>

      {/* ── Quick stats ── */}
      <div className={styles.statsBar}>
        {[
          ["⚡","1 Gbps","WiFi"],
          ["🕐","24/7","Access"],
          ["🪑","50+","Seats"],
          ["⭐", workspace.rating || "4.8","Rating"],
          ...(lowestPrice ? [["₹", lowestPrice,"From/slot"]] : []),
        ].map(([ic,vl,lb]) => (
          <div key={lb} className={styles.statChip}>
            <span className={styles.statIcon}>{ic}</span>
            <span className={styles.statVal}>{vl}</span>
            <span className={styles.statLbl}>{lb}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        {/* ══ LEFT — Calendar ══ */}
        <aside className={styles.calSide}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum}>01</span>Choose a Date
              </h2>
              {selectedDate && (
                <span className={styles.selectedDatePill}>
                  {new Date(selectedDate).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                </span>
              )}
            </div>

            {calLoading && <div className={styles.calLoadBar} />}

            {/* Mobile month tabs */}
            <div className={styles.calMobileTabs}>
              {visibleMonths.map(({year, month}, i) => (
                <button key={i} type="button"
                  className={`${styles.calMobileTab} ${activeMonth === i ? styles.calMobileTabActive : ""}`}
                  onClick={() => setActiveMonth(i)}>
                  {MONTH_NAMES[month].slice(0,3)} {year}
                </button>
              ))}
            </div>

            {/* Desktop: both months side by side */}
            <div className={styles.calMonthsRow}>
              {visibleMonths.map((m, i) => renderMonth(m))}
            </div>

            {/* Mobile: single month */}
            <div className={styles.calMonthSingle}>
              {renderMonth(visibleMonths[activeMonth])}
            </div>

            {/* Nav */}
            <div className={styles.calNav}>
              <button type="button" className={styles.calNavBtn}
                disabled={calMonthOffset === 0}
                onClick={() => { setCalMonthOffset(p => Math.max(0,p-1)); setSelectedDate(""); setSlots([]); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Prev
              </button>
              <div className={styles.calNavInfo}>
                {MONTH_NAMES[visibleMonths[0].month].slice(0,3)} – {MONTH_NAMES[visibleMonths[1].month].slice(0,3)} {visibleMonths[0].year}
              </div>
              <button type="button" className={styles.calNavBtn}
                onClick={() => { setCalMonthOffset(p => p+1); setSelectedDate(""); setSlots([]); }}>
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              {[["#19b67c","Available"],["#555","Full"],["#2563eb","Not Released"],["rgba(239,68,68,0.7)","Past"]].map(([c,l]) => (
                <div key={l} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ══ RIGHT — Slots ══ */}
        <main className={styles.slotSide} ref={slotsRef}>
          {!selectedDate ? (
            <div className={styles.slotPlaceholder}>
              <div className={styles.placeholderIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                  <circle cx="12" cy="16" r="2"/>
                </svg>
              </div>
              <h3 className={styles.placeholderTitle}>Select a Date</h3>
              <p className={styles.placeholderSub}>Pick any available date from the calendar to view open slots</p>
            </div>
          ) : (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionNum}>02</span>Pick a Slot
                </h2>
                <div className={styles.slotDateLabel}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {formatDisplayDate(selectedDate)}
                </div>
              </div>

              {/* Slot stats strip */}
              {slots.length > 0 && !slotsLoading && (
                <div className={styles.slotStatsRow}>
                  <span className={styles.slotStatItem} style={{ color:"#33d79d" }}>
                    <span className={styles.slotStatDot} style={{ background:"#19b67c" }} />
                    {totalAvail} Available
                  </span>
                  <span className={styles.slotStatItem} style={{ color:"#f87171" }}>
                    <span className={styles.slotStatDot} style={{ background:"#ef4444" }} />
                    {totalFull} Full
                  </span>
                  {lowestPrice && (
                    <span className={styles.slotStatItem} style={{ color:"var(--gold-l)" }}>
                      From ₹{lowestPrice}
                    </span>
                  )}
                </div>
              )}

              {/* Controls row */}
              <div className={styles.slotControls}>
                {/* Search */}
                <div className={styles.slotSearchWrap}>
                  <svg className={styles.slotSearchIco} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input type="text" placeholder="Search time or type..."
                    value={slotSearch} onChange={e => setSlotSearch(e.target.value)}
                    className={styles.slotSearchInput} />
                  {slotSearch && <button type="button" className={styles.slotSearchClear} onClick={() => setSlotSearch("")}>×</button>}
                </div>

                {/* Filters */}
                <div className={styles.filterChips}>
                  {[["all","All"],["hour","Hourly"],["fullday","Full Day"]].map(([v,l]) => (
                    <button key={v} type="button"
                      className={`${styles.filterChip} ${slotFilter===v ? styles.filterActive : ""}`}
                      onClick={() => setSlotFilter(v)}>{l}</button>
                  ))}
                </div>

                {/* Sort */}
                <div className={styles.sortWrap}>
                  <span className={styles.sortLabel}>Sort:</span>
                  {[["time","Time"],["price","Price"],["avail","Available"]].map(([v,l]) => (
                    <button key={v} type="button"
                      className={`${styles.sortBtn} ${sortBy===v ? styles.sortActive : ""}`}
                      onClick={() => setSortBy(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Slots grid */}
              {slotsLoading ? (
                <div className={styles.slotsLoading}>
                  {[...Array(8)].map((_,i) => <div key={i} className={styles.slotSkeleton} style={{ "--d": `${i*0.06}s` }} />)}
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className={styles.noSlots}>
                  <span>🔍</span>
                  <p>{slotSearch || slotFilter !== "all" ? "No slots match your filter" : "No slots released for this date"}</p>
                </div>
              ) : (
                <div className={styles.slotGrid}>
                  {filteredSlots.map((s, i) => (
                    <SlotCard key={s.id} slot={s} selected={selectedSlot?.id === s.id}
                      onSelect={setSelectedSlot} animDelay={i * 40} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Sticky booking bar ── */}
      <div className={`${styles.bookingBar} ${selectedSlot ? styles.bookingBarVisible : ""}`}>
        <div className={styles.bookingBarContent}>
          <div className={styles.bookingBarInfo}>
            <div className={styles.bookingBarSlot}>
              <span className={styles.bookingBarLabel}>Selected Slot</span>
              <span className={styles.bookingBarTime}>
                {selectedSlot?.slot_type === "hour"
                  ? `${selectedSlot?.start_time} – ${selectedSlot?.end_time}`
                  : "Full Day"}
              </span>
            </div>
            <div className={styles.bookingBarDivider} />
            <div className={styles.bookingBarDate}>
              <span className={styles.bookingBarLabel}>Date</span>
              <span className={styles.bookingBarDateVal}>
                {selectedDate && new Date(selectedDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })}
              </span>
            </div>
            <div className={styles.bookingBarDivider} />
            <div className={styles.bookingBarPrice}>
              <span className={styles.bookingBarLabel}>Amount</span>
              <span className={styles.bookingBarAmount}>₹{selectedSlot?.price}</span>
            </div>
          </div>
          <button
            className={styles.payBtn}
            disabled={bookingLoading}
            onClick={handleConfirmBooking}
          >
            {bookingLoading ? (
              <span className={styles.payBtnDots}><span/><span/><span/></span>
            ) : (
              <>
                <span>Pay & Confirm</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

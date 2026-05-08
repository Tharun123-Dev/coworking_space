import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/HyderabadWorkspaces.module.css";

function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["S","M","T","W","T","F","S"];
const WORKSPACE_TYPES = [
  "All","Hot Desk","Dedicated Desk","Private Office Space",
  "Private Cabin","Meeting Room","Board Room","Event Space","Podcast","Virtual Office",
];
const LOCATIONS = ["All","Hitech City","Madhapur","Gachibowli","Kondapur","Financial District"];
const ITEMS_PER_PAGE = 4;

const AMENITY_ICONS = {
  "24hr": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  wifi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  ),
  coffee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  firewall: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  security: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  parking:"🅿️", meeting:"🏢", games:"🎮", pantry:"🍽️", cleaning:"🧹",
  support:"💬", ac:"❄️", "air conditioning":"❄️", power:"🔌",
  "power backup":"🔌", internet:"📶", tea:"☕", month:"📆",
  bookNow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

// ✅ Compute status from slots: green if ANY slot is not full
function computeDateStatus(slotsArray) {
  if (!slotsArray || slotsArray.length === 0) return "unreleased";
  const hasAvailable = slotsArray.some((s) => !s.is_full);
  return hasAvailable ? "available" : "full";
}

function HyderabadWorkspaces() {
  const navigate = useNavigate();
  const location = useLocation();

  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMode, setBookingMode] = useState("day");

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [slotSearch, setSlotSearch] = useState("");
  const [filteredSlots, setFilteredSlots] = useState([]);

  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [calLoading, setCalLoading] = useState(false);

  const [monthlySlots, setMonthlySlots] = useState([]);
  const [

  additionalAmenities,

  setAdditionalAmenities

] = useState([]);

const [

  selectedAmenities,

  setSelectedAmenities

] = useState([]);
const [

  amenityPersons,

  setAmenityPersons

] = useState({});
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedMonthSlot, setSelectedMonthSlot] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear());
  const [monthLoading, setMonthLoading] = useState(false);

  const [hourlySeatCounts, setHourlySeatCounts] = useState({});
  const [monthlySeatCounts, setMonthlySeatCounts] = useState({});

  const [seatPopupOpen, setSeatPopupOpen] = useState(false);
  const [seatPopupMode, setSeatPopupMode] = useState(null);
  const [seatPopupTarget, setSeatPopupTarget] = useState(null);
  const [seatInputValue, setSeatInputValue] = useState("");

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryLocation = params.get("location");
  const showOnlySelectedLocation = !!queryLocation;

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hourlyTotalPrice = useMemo(() =>
    selectedSlots.reduce((sum, slot) => sum + Number(slot.price || 0) * Number(hourlySeatCounts[slot.id] || 0), 0),
    [selectedSlots, hourlySeatCounts]
  );
  const hourlyTotalSeats = useMemo(() =>
    selectedSlots.reduce((sum, slot) => sum + Number(hourlySeatCounts[slot.id] || 0), 0),
    [selectedSlots, hourlySeatCounts]
  );
  const monthlyTotalPrice = useMemo(() =>
    monthlySlots.filter((m) => selectedMonths.includes(m.id))
      .reduce((sum, month) => sum + Number(month.price || 0) * Number(monthlySeatCounts[month.id] || 0), 0),
    [selectedMonths, monthlySlots, monthlySeatCounts]
  );
  const monthlyTotalSeats = useMemo(() =>
    monthlySlots.filter((m) => selectedMonths.includes(m.id))
      .reduce((sum, month) => sum + Number(monthlySeatCounts[month.id] || 0), 0),
    [selectedMonths, monthlySlots, monthlySeatCounts]
  );

  useEffect(() => {
    axiosInstance.get("workspaces/")
      .then((res) => { const d = res.data || []; setWorkspaces(d); setFilteredData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const loc = params.get("location");
    if (loc) setSelectedLocation(loc);
  }, [params]);

  useEffect(() => {
    const filtered = workspaces.filter((item) => {
      const typeMatch = selectedType === "All" || item.name?.toLowerCase().trim() === selectedType.toLowerCase().trim();
      const locationMatch = selectedLocation === "All" ||
        item.location?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.city?.toLowerCase().includes(selectedLocation.toLowerCase());
      return typeMatch && locationMatch;
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedType, selectedLocation, workspaces]);

  useEffect(() => {
    if (!selectedWorkspace || !showBookingModal || bookingMode !== "day") return;
    // ✅ Fetch ALL 3 visible months at once so all available days show green immediately
    fetchDateStatusesForVisibleMonths(selectedWorkspace.id);
  }, [selectedWorkspace, showBookingModal, calMonthOffset, bookingMode]);

  useEffect(() => {
    if (!selectedWorkspace || !showBookingModal || bookingMode !== "month") return;
    fetchMonthlySlots(selectedWorkspace.id, selectedMonthYear);
  }, [selectedWorkspace, showBookingModal, bookingMode, selectedMonthYear]);

  useEffect(() => {
    const value = slotSearch.toLowerCase().trim();
    if (!selectedDate) { setFilteredSlots([]); return; }
    if (!value) { setFilteredSlots(slots); return; }
    setFilteredSlots(slots.filter((slot) => {
      const label = slot.slot_type === "hour" ? `${slot.start_time} - ${slot.end_time}` : "Full Day";
      return [label, slot.slot_type, slot.start_time, slot.end_time, `${slot.price}`, `${slot.booked}`, `${slot.capacity}`]
        .filter(Boolean).join(" ").toLowerCase().includes(value);
    }));
  }, [slots, slotSearch, selectedDate]);

  useEffect(() => {
    const state = location.state;
    const token = localStorage.getItem("access");
    if (!token || !state?.openBooking || !state?.workspaceId || workspaces.length === 0) return;
    const workspace = workspaces.find((w) => String(w.id) === String(state.workspaceId));
    if (!workspace) return;
    openBookingModal(workspace, state.bookingMode === "month" ? "month" : "day");
    navigate(location.pathname + location.search, { replace: true, state: {} });
  }, [workspaces, location.state]);

  const resetBookingState = (mode = "day") => {
    setBookingMode(mode);
    setSelectedDate("");
    setSlots([]);
    setFilteredSlots([]);
    setSelectedSlots([]);
    setSlotSearch("");
    setDateStatusMap({}); // ✅ clear map so fresh green dots load for new workspace
    setCalMonthOffset(0);
    setSelectedMonths([]);
    setSelectedMonthSlot(null);
    setSelectedMonthYear(new Date().getFullYear());
    setHourlySeatCounts({});
    setMonthlySeatCounts({});
    setSeatPopupOpen(false);
    setSeatPopupMode(null);
    setSeatPopupTarget(null);
    setSeatInputValue("");
    setSelectedAmenities([]);
setAmenityPersons({});
  };

  const getAmenityKey = (name = "") => {
    const value = name.toLowerCase().trim();
    if (value.includes("wifi") || value.includes("wi-fi")) return "wifi";
    if (value.includes("coffee") || value.includes("tea")) return "coffee";
    if (value.includes("24") || value.includes("hour")) return "24hr";
    if (value.includes("firewall")) return "firewall";
    if (value.includes("security")) return "security";
    if (value.includes("parking")) return "parking";
    if (value.includes("meeting")) return "meeting";
    if (value.includes("games")) return "games";
    if (value.includes("pantry")) return "pantry";
    if (value.includes("cleaning")) return "cleaning";
    if (value.includes("support")) return "support";
    if (value.includes("air")) return "air conditioning";
    if (value.includes("ac")) return "ac";
    if (value.includes("power")) return "power backup";
    if (value.includes("internet")) return "internet";
    return value;
  };

  const renderAmenityIcon = (name) => AMENITY_ICONS[getAmenityKey(name)] || "•";

  // ✅ KEY FIX: fetch all days across ALL 3 visible months at once
  // Every date that has any slot will show green immediately on calendar open
  const fetchDateStatusesForVisibleMonths = async (workspaceId) => {
    setCalLoading(true);
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);

    // Build list of all dates across 3 visible months
    const allDates = [];
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        allDates.push(`${year}-${mm}-${dd}`);
      }
    }

    // ✅ Fetch all dates in parallel — each date that returns any slot shows green
    const requests = allDates.map((dateStr) =>
      axiosInstance
        .get(`workspaces/slot/${workspaceId}/?date=${dateStr}`)
        .then((res) => ({ dateStr, slots: res.data || [] }))
        .catch(() => ({ dateStr, slots: [] }))
    );

    const results = await Promise.all(requests);

    // ✅ Build map: green = has at least 1 non-full slot
    const map = {};
    results.forEach(({ dateStr, slots: daySlots }) => {
      map[dateStr] = computeDateStatus(daySlots);
    });

    setDateStatusMap(map);
    setCalLoading(false);
  };

  const fetchMonthlySlots = (workspaceId, year = selectedMonthYear) => {
    setMonthLoading(true);
    axiosInstance.get(`workspaces/month-slots/${workspaceId}/?year=${year}`)
      .then((res) => setMonthlySlots(res.data || []))
      .catch(() => setMonthlySlots([]))
      .finally(() => setMonthLoading(false));
  };

  const fetchAdditionalAmenities =
(workspaceId) => {

  axiosInstance

    .get(

      `workspaces/additional-amenities/${workspaceId}/`

    )

    .then((res) => {

      setAdditionalAmenities(

        Array.isArray(res.data)

        ? res.data

        : []

      );

    })

    .catch(() => {

      setAdditionalAmenities([]);

    });

};

  const openBookingModal = (item, mode = "day") => {
    setSelectedWorkspace(item);
    fetchAdditionalAmenities(
  item.id
);
    resetBookingState(mode);
    setShowModal(false);
    setShowBookingModal(true);
    if (mode === "month") fetchMonthlySlots(item.id, new Date().getFullYear());
  };

  const handleBookNow = (item) => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/auth?type=user", { state: { from: location, openBooking: true, workspaceId: item.id, bookingMode: "day" } });
      return;
    }
    openBookingModal(item, "day");
  };

  const handleBookForMonth = (item) => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/auth?type=user", { state: { from: location, openBooking: true, workspaceId: item.id, bookingMode: "month" } });
      return;
    }
    openBookingModal(item, "month");
  };

  // ✅ fetchSlots: when user clicks a date, load slots BUT don't overwrite the date status map
  const fetchSlots = (workspaceId, date) => {
    if (!workspaceId || !date || date.length !== 10) return;
    axiosInstance.get(`workspaces/slot/${workspaceId}/?date=${date}`)
      .then((res) => {
        const data = res.data || [];
        setSlots(data);
        setFilteredSlots(data);
        setSelectedSlots([]);
        setHourlySeatCounts({});
        // ✅ Update ONLY this date's status in map (don't wipe the rest)
        setDateStatusMap((prev) => ({
          ...prev,
          [date]: computeDateStatus(data),
        }));
      })
      .catch(() => { setSlots([]); setFilteredSlots([]); });
  };

  const handleDateClick = (dateStr) => {
    if (dateStatusMap[dateStr] !== "available") return;
    setSelectedDate(dateStr);
    setSelectedSlots([]);
    setHourlySeatCounts({});
    setSlotSearch("");
    fetchSlots(selectedWorkspace.id, dateStr);
  };

  const openSeatPopup = (mode, target) => {
    const availableSeats = Math.max(0, Number(target?.capacity || 0) - Number(target?.booked || 0));
    if (availableSeats <= 0) return;
    setSeatPopupMode(mode);
    setSeatPopupTarget(target);
    setSeatInputValue(mode === "day" ? (hourlySeatCounts[target.id]?.toString() || "") : (monthlySeatCounts[target.id]?.toString() || ""));
    setSeatPopupOpen(true);
  };

  const closeSeatPopup = () => {
    setSeatPopupOpen(false);
    setSeatPopupMode(null);
    setSeatPopupTarget(null);
    setSeatInputValue("");
  };

  const removeHourlySlot = (slotId) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== slotId));
    setHourlySeatCounts((prev) => { const u = { ...prev }; delete u[slotId]; return u; });
  };

  const removeMonthlySlot = (monthId) => {
    const updatedMonths = selectedMonths.filter((id) => id !== monthId);
    setSelectedMonths(updatedMonths);
    setSelectedMonthSlot(updatedMonths.length ? monthlySlots.find((m) => m.id === updatedMonths[updatedMonths.length - 1]) || null : null);
    setMonthlySeatCounts((prev) => { const u = { ...prev }; delete u[monthId]; return u; });
  };

  const confirmSeatSelection = () => {
    if (!seatPopupTarget || !seatPopupMode) return;
    const availableSeats = Math.max(0, Number(seatPopupTarget.capacity || 0) - Number(seatPopupTarget.booked || 0));
    const seats = Number(seatInputValue);
    if (!seats || seats < 1) { alert("Please enter valid seat count"); return; }
    if (seats > availableSeats) { alert(`Only ${availableSeats} seats available`); return; }

    if (seatPopupMode === "day") {
      const alreadySelected = selectedSlots.some((s) => s.id === seatPopupTarget.id);
      if (alreadySelected) removeHourlySlot(seatPopupTarget.id);
      else {
        setSelectedSlots((prev) => [...prev, seatPopupTarget]);
        setHourlySeatCounts((prev) => ({ ...prev, [seatPopupTarget.id]: seats }));
      }
    }
    if (seatPopupMode === "month") {
      const alreadySelected = selectedMonths.includes(seatPopupTarget.id);
      if (alreadySelected) removeMonthlySlot(seatPopupTarget.id);
      else {
        setSelectedMonths((prev) => [...prev, seatPopupTarget.id]);
        setSelectedMonthSlot(seatPopupTarget);
        setMonthlySeatCounts((prev) => ({ ...prev, [seatPopupTarget.id]: seats }));
      }
    }
    closeSeatPopup();
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleConfirmBooking = async () => {
    if (bookingMode === "day" && selectedSlots.length === 0) { alert("Please select at least one slot"); return; }
    if (bookingMode === "month" && selectedMonths.length === 0) { alert("Please select at least one month"); return; }
    if (bookingMode === "day") {
      const invalid = selectedSlots.some((slot) => {
        const count = Number(hourlySeatCounts[slot.id] || 0);
        const avail = Number(slot.capacity || 0) - Number(slot.booked || 0);
        return count < 1 || count > avail;
      });
      if (invalid) { alert("One or more selected slots have invalid seats"); return; }
    }
    if (bookingMode === "month") {
      const invalid = monthlySlots.filter((m) => selectedMonths.includes(m.id)).some((month) => {
        const count = Number(monthlySeatCounts[month.id] || 0);
        const avail = Number(month.capacity || 0) - Number(month.booked || 0);
        return count < 1 || count > avail;
      });
      if (invalid) { alert("One or more selected months have invalid seats"); return; }
    }

    try {
      setBookingLoading(true);
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) { alert("Razorpay failed to load"); setBookingLoading(false); return; }

      const amenitiesTotal =
selectedAmenities.reduce(

  (sum, item) =>

    sum +

    (

      Number(item.price || 0)

      *

      Number(

        amenityPersons[item.id] || 1

      )

    ),

  0

)
const finalAmount =

bookingMode === "month"

? monthlyTotalPrice + amenitiesTotal

: hourlyTotalPrice + amenitiesTotal;
      const res = await axiosInstance.post("payment/create/", { amount: finalAmount });
      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Workspace Booking",
        description: bookingMode === "month" ? "Monthly Workspace Booking" : selectedSlots.length > 1 ? "Multi-Slot Booking" : "Slot Booking",
        order_id: order.id,
        method: { netbanking: true, card: false, upi: false, wallet: false },
        config: {
          display: {
            blocks: { banks: { name: "Pay using Netbanking", instruments: [{ method: "netbanking" }] } },
            sequence: ["block.banks"],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#10b981" },
        handler: async function (response) {
          try {
            const verify = await axiosInstance.post("payment/verify/", response);
            if (verify.data.status === "success") {
              if (bookingMode === "day") {
                const results = await Promise.allSettled(
                  selectedSlots.map((slot) =>
                    axiosInstance.post("cart/create/", {
                      workspace_id: selectedWorkspace.id,
                      slot_id: slot.id,
                      amenities:

selectedAmenities.map(
  (a) => ({

    amenity_id: a.id,

    persons:

    amenityPersons[a.id] || 1,

  })
),

                      seats: Number(hourlySeatCounts[slot.id] || 0),
                      booking_type: "day",
                    })
                  )
                );
                const failed = results.filter((r) => r.status === "rejected");
                if (failed.length > 0) alert(`⚠️ ${results.length - failed.length} of ${results.length} slots booked. ${failed.length} failed.`);
                else alert(selectedSlots.length > 1 ? `${selectedSlots.length} slots booked 🎉` : "Booking confirmed 🎉");
              } else {
          await axiosInstance.post("cart/create/", {

  workspace_id: selectedWorkspace.id,

  monthly_slots: selectedMonths.map((id) => ({

    monthly_slot_id: Number(id),

    seats: Number(
      monthlySeatCounts[id] || 0
    ),

  })),

  amenities:

  selectedAmenities.map(
    (a) => ({

      amenity_id: a.id,

      persons:
      amenityPersons[a.id] || 1,

    })
  ),

  booking_type: "month",

});
                alert("Monthly booking confirmed 🎉");
              }

              setShowBookingModal(false);
              setSelectedMonths([]);
              setSelectedMonthSlot(null);
              setSelectedSlots([]);
              setHourlySeatCounts({});
              setMonthlySeatCounts({});

              // ✅ Re-fetch to update green dots after booking
              if (bookingMode === "day") fetchDateStatusesForVisibleMonths(selectedWorkspace.id);
              else fetchMonthlySlots(selectedWorkspace.id, selectedMonthYear);
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert("Booking failed after payment");
          } finally {
            setBookingLoading(false);
          }
        },
        modal: { ondismiss: () => setBookingLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { alert("Payment failed. Try again."); setBookingLoading(false); });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment Failed");
      setBookingLoading(false);
    }
  };

  const handleKnowMore = (item) => { setSelectedWorkspace(item); setActiveTab("overview"); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedWorkspace(null); };

  const renderCalendarMonth = (year, month) => {
    const cells = buildMonthMatrix(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className={styles.calMonth} key={`${year}-${month}`}>
        <div className={styles.calMonthName}>{MONTH_NAMES[month]} {year}</div>
        <div className={styles.calDayLabels}>
          {DAY_LABELS.map((d, i) => <span key={i} className={styles.calDayLabel}>{d}</span>)}
        </div>
        <div className={styles.calGrid}>
          {cells.map((day, idx) => {
            if (!day) return <span key={idx} className={styles.calEmpty} />;
            const mm = String(month + 1).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            const dateStr = `${year}-${mm}-${dd}`;
            const isPast = new Date(year, month, day) < today;
            const status = dateStatusMap[dateStr];
            const isSelected = selectedDate === dateStr;

            let cellClass = styles.calDay;
            if (isPast) cellClass += ` ${styles.calDayPast}`;
            else if (status === "available") cellClass += ` ${styles.calDayAvailable}`; // ✅ green
            else if (status === "full") cellClass += ` ${styles.calDayFull}`;
            else cellClass += ` ${styles.calDayUnreleased}`;
            if (isSelected) cellClass += ` ${styles.calDaySelected}`;

            return (
              <button key={idx} type="button" className={cellClass}
                onClick={() => !isPast && status === "available" && handleDateClick(dateStr)}
                disabled={isPast || status !== "available"}
                aria-label={dateStr}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getVisibleMonths = () => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
    return [0, 1, 2].map((offset) => {
      const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const getMonthSlotForGrid = (monthIndex) => {
    const monthNumber = monthIndex + 1;
    return monthlySlots.find((m) => Number(m.month) === monthNumber && Number(m.year) === Number(selectedMonthYear));
  };

  const visibleMonths = getVisibleMonths();

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        <button type="button" className={styles.pageBtn}
          onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          disabled={currentPage === 1}>
          ‹ Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} type="button"
            className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
            onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            {page}
          </button>
        ))}
        <button type="button" className={styles.pageBtn}
          onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          disabled={currentPage === totalPages}>
          Next ›
        </button>
        <span className={styles.pageInfo}>Page {currentPage} of {totalPages} · {filteredData.length} workspaces</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderRing}><div></div><div></div><div></div></div>
        <p>Loading Hyderabad premium workspaces...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.filterBlock}>
          <h3 className={styles.filterLabel}>Locations</h3>
          <div className={styles.pillRow}>
            {(showOnlySelectedLocation ? [selectedLocation] : LOCATIONS).map((loc) => (
              <button key={loc} type="button"
                className={`${styles.locPill} ${selectedLocation === loc ? styles.locPillActive : ""}`}
                onClick={() => setSelectedLocation(loc)}>
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterBlock}>
          <h3 className={styles.filterLabel}>Workspaces</h3>
          <div className={styles.pillRow}>
            {WORKSPACE_TYPES.map((type) => (
              <button key={type} type="button"
                className={`${styles.typePill} ${selectedType === type ? styles.typePillActive : ""}`}
                onClick={() => setSelectedType(type)}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.cardList}>
          {filteredData.length === 0 ? (
            <div className={styles.empty}><span>🔍</span><p>No workspaces found for your filters.</p></div>
          ) : (
            paginatedData.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardImgWrap} onClick={() => handleKnowMore(item)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleKnowMore(item); }}
                  style={{ cursor: "pointer" }} aria-label={`Open details for ${item.name}`}>
                  <img src={item.image} alt={item.name} className={styles.cardImg} />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{item.name}</h2>
                  <p className={styles.cardAddress}>
                    {item.location}{item.area ? `, ${item.area}` : ""}{item.city ? `, ${item.city}` : ""}
                  </p>
                  <div className={styles.amenRow}>
                    {item.amenities?.length > 0 ? (
                      item.amenities.slice(0, 5).map((amenity) => (
                        <span key={amenity.id} className={styles.amenItem}>
                          <span className={styles.amenIcon}>{renderAmenityIcon(amenity.name)}</span>
                          {amenity.name}
                        </span>
                      ))
                    ) : <span className={styles.noAmenities}>No amenities listed</span>}
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceSymbol}>₹</span>
                    <span className={styles.priceNum}>{Number(item.price || 6500).toLocaleString("en-IN")}</span>
                    <span className={styles.priceOnwards}> Onwards <span className={styles.priceGst}>+.GST</span></span>
                  </div>
                  <p className={styles.priceSub}>Base price seat per month</p>
                  <div className={styles.cardActions}>
                    <button type="button" className={styles.btnBook} onClick={() => handleBookNow(item)}>
                      <span className={styles.btnIcon}>{AMENITY_ICONS.bookNow}</span>Book Now
                    </button>
                    <button type="button" className={styles.btnCall} onClick={() => handleBookForMonth(item)}>
                      <span className={styles.btnIcon}>{AMENITY_ICONS.month}</span>Book for Month
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {renderPagination()}
      </div>

      {showModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mHero}>
              <img src={selectedWorkspace.image} alt={selectedWorkspace.name} className={styles.mHeroImg} />
              <div className={styles.mHeroGrad}></div>
              <div className={styles.mHeroBadges}>
                <span className={styles.mBDay}>{bookingMode === "month" ? "Monthly Access" : "Daily Access"}</span>
                <span className={styles.mBRating}>★ 4.8</span>
              </div>
              <button type="button" className={styles.mClose} onClick={closeModal}>×</button>
              <div className={styles.mHeroInfo}>
                <h2 className={styles.mTitle}>{selectedWorkspace.name}</h2>
                <div className={styles.mSub}><span>{selectedWorkspace.location}</span></div>
              </div>
            </div>
            <div className={styles.mTabs}>
              {["overview","pricing","location"].map((tab) => (
                <button key={tab} type="button"
                  className={`${styles.mTab} ${activeTab === tab ? styles.mTabActive : ""}`}
                  onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.mBody}>
              {activeTab === "overview" && (
                <div className={styles.mContent}>
                  <div className={styles.statsRow}>
                    {[["🪑","24","Seats"],["📶","1 Gbps","Internet"],["☕","Free","Coffee"],["🚗","Yes","Parking"]].map(([e,v,l]) => (
                      <div key={l} className={styles.statBox}>
                        <span className={styles.statEmoji}>{e}</span>
                        <span className={styles.statVal}>{v}</span>
                        <span className={styles.statLbl}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>About</h3>
                    <p className={styles.mSectionText}>{selectedWorkspace.description || "A premium Hyderabad workspace crafted for focus, comfort, and productive daily work."}</p>
                  </div>
                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>Amenities</h3>
                    <div className={styles.amenGrid}>
                      {selectedWorkspace.amenities?.length > 0 ? (
                        selectedWorkspace.amenities.map((amenity) => (
                          <div key={amenity.id} className={styles.amenCard}>
                            <span className={styles.amenEmoji}>{renderAmenityIcon(amenity.name)}</span>
                            <div>
                              <div className={styles.amenName}>{amenity.name}</div>
                              <div className={styles.amenDesc}>Available with this workspace</div>
                            </div>
                          </div>
                        ))
                      ) : <p className={styles.mSectionText}>No amenities listed.</p>}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "pricing" && (
                <div className={styles.mContent}>
                  <div className={styles.pricingHero}>
                    <div className={styles.pricingTag}>{bookingMode === "month" ? "Monthly Plan" : "Daily Pass"}</div>
                    <div className={styles.pricingAmt}>
                      <span className={styles.pricingCur}>₹</span>
                      <span className={styles.pricingNum}>{selectedWorkspace.price || 499}</span>
                      <span className={styles.pricingUnit}>{bookingMode === "month" ? "/month" : "/day"}</span>
                    </div>
                    <div className={styles.pricingNote}>Flexible workspace access with premium amenities</div>
                  </div>
                  <div className={styles.includeList}>
                    {selectedWorkspace.amenities?.length > 0 ? (
                      selectedWorkspace.amenities.map((amenity) => (
                        <div key={amenity.id} className={styles.includeRow}>
                          <span className={styles.check}>✓</span>{amenity.name}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={styles.includeRow}><span className={styles.check}>✓</span>Workspace seat access</div>
                        <div className={styles.includeRow}><span className={styles.check}>✓</span>Standard workspace facilities</div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "location" && (
                <div className={styles.mContent}>
                  <div className={styles.locGrid}>
                    {[["Area",selectedWorkspace.area],["City",selectedWorkspace.city],["Address",selectedWorkspace.location]].map(([l,v]) => (
                      <div key={l} className={styles.locRow}>
                        <span className={styles.locLbl}>{l}</span>
                        <span className={styles.locVal}>{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.mapCard}>
                    <div className={styles.mapPin}>📍</div>
                    <div className={styles.mapName}>{selectedWorkspace.name}</div>
                    <div className={styles.mapAddr}>{selectedWorkspace.location}</div>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>Open in Maps</a>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.mFooter}>
              <div className={styles.mFooterPrice}>
                <span className={styles.mFooterNum}>₹{selectedWorkspace.price || 499}</span>
                <span className={styles.mFooterUnit}>{bookingMode === "month" ? "/month" : "/day"}</span>
              </div>
              <button type="button" className={styles.mFooterBtn}
                onClick={() => { setShowModal(false); if (bookingMode === "month") handleBookForMonth(selectedWorkspace); else handleBookNow(selectedWorkspace); }}>
                {bookingMode === "month" ? "Book for Month" : "Book This Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={() => setShowBookingModal(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.mClose} onClick={() => setShowBookingModal(false)}>×</button>
            <h2 className={styles.bookingTitle}>
              {bookingMode === "month" ? `Book for month at ${selectedWorkspace.name}` : `Book your slot at ${selectedWorkspace.name}`}
            </h2>

            {bookingMode === "month" ? (
              <div className={styles.monthBookingWrap}>
                <div className={styles.monthTopBar}>
                  <h3 className={styles.monthTitle}>Select months for booking</h3>
                  <div className={styles.monthYearNav}>
                    <button type="button" className={styles.monthYearBtn} onClick={() => setSelectedMonthYear((p) => p - 1)}>‹</button>
                    <div className={styles.monthYearText}>{selectedMonthYear}</div>
                    <button type="button" className={styles.monthYearBtn} onClick={() => setSelectedMonthYear((p) => p + 1)}>›</button>
                  </div>
                </div>
                <p className={styles.monthHint}>Click any month card, popup will ask how many seats you want.</p>
                {monthLoading ? (
                  <div className={styles.noSlots}>Loading monthly slots...</div>
                ) : (
                  <div className={styles.monthGridYear}>
                    {Array.from({ length: 12 }).map((_, index) => {
                      const monthSlot = getMonthSlotForGrid(index);
                      const availableSeats = Math.max(0, Number(monthSlot?.capacity || 0) - Number(monthSlot?.booked || 0));
                      const isDisabled = !monthSlot || monthSlot.is_full || availableSeats === 0;
                      const isSelected = monthSlot ? selectedMonths.includes(monthSlot.id) : false;
                      return (
                        <button key={`${selectedMonthYear}-${index}`} type="button"
                          className={`${styles.monthCard} ${isSelected ? styles.monthCardSelected : ""} ${isDisabled ? styles.monthCardDisabled : ""}`}
                          disabled={isDisabled}
                          onClick={() => { if (isDisabled || !monthSlot) return; openSeatPopup("month", monthSlot); }}>
                          <div className={styles.monthCardHeader}>
                            <h4 className={styles.monthName}>{MONTH_NAMES[index]}</h4>
                            <span className={styles.monthBadge}>{selectedMonthYear}</span>
                          </div>
                          <p className={styles.monthPrice}>{monthSlot ? `₹${Number(monthSlot.price || 0).toLocaleString("en-IN")}` : "N/A"}</p>
                          <p className={`${styles.monthSeats} ${availableSeats === 0 ? styles.monthSeatsZero : ""}`}>
                            {monthSlot ? `${availableSeats} seats left` : "No slot available"}
                          </p>
                          <p className={styles.monthSubText}>
                            {isDisabled ? "Disabled" : isSelected ? `${monthlySeatCounts[monthSlot.id] || 0} seat(s) selected` : "Tap to book"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className={styles.monthLegend}>
                  {[["monthLegendAvailable","Available"],["monthLegendSelected","Selected"],["monthLegendDisabled","Disabled"]].map(([cls,lbl]) => (
                    <div key={lbl} className={styles.monthLegendItem}>
                      <span className={`${styles.monthLegendDot} ${styles[cls]}`}></span>{lbl}
                    </div>
                  ))}
                </div>
                {selectedMonths.length > 0 && (
                  <div className={styles.monthSelectionBar}>
                    <p className={styles.monthSelectionTitle}>Selected months</p>
                    <div className={styles.monthSelectedChips}>
                      {selectedMonths.map((monthId) => {
                        const monthObj = monthlySlots.find((m) => m.id === monthId);
                        if (!monthObj) return null;
                        return (
                          <span key={monthId} className={styles.monthChip}>
                            {MONTH_NAMES[Number(monthObj.month) - 1]} {monthObj.year} • {monthlySeatCounts[monthId] || 0} seat(s)
                            <button type="button" className={styles.monthChipRemove} onClick={() => removeMonthlySlot(monthId)}>×</button>
                          </span>
                        );
                      })}
                    </div>
<p className={styles.monthTotalPrice}>

  Total Seats:
  {monthlyTotalSeats}

  |

  Total: ₹{

    (

      monthlyTotalPrice

      +

      selectedAmenities.reduce(

        (sum, item) =>

          sum +

          (

            Number(item.price || 0)

            *

            Number(

              amenityPersons[item.id] || 1

            )

          ),

        0

      )

    ).toLocaleString("en-IN")

  }

</p>
<div className={styles.additionalAmenitiesBox}>

  <h3 className={styles.additionalAmenitiesTitle}>
    Additional Amenities
  </h3>

  <div
    className={styles.additionalAmenitiesGrid}
  >

    {additionalAmenities.map(
      (item) => {

      const checked =
        selectedAmenities.some(
          (a) => a.id === item.id
        );

      return (

        <label

          key={item.id}

          className={`${styles.additionalAmenityCard}
          ${
            checked
              ? styles.additionalAmenityCardActive
              : ""
          }`}

        >

          <input

            type="checkbox"

            checked={checked}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedAmenities(

                  (prev) => [

                    ...prev,

                    item

                  ]

                );

              } else {

                setSelectedAmenities(

                  (prev) =>

                    prev.filter(

                      (x) =>

                        x.id !== item.id

                    )

                );

              }

            }}

          />

          <div>

            <h4>
              {item.title}
            </h4>

            <p>
              {item.description}
            </p>

            <span>
              ₹{item.price}
            </span>

            {checked && (

              <select

                className={
                  styles.amenityPersonSelect
                }

                value={
                  amenityPersons[item.id] || ""
                }

                onChange={(e) =>

                  setAmenityPersons({

                    ...amenityPersons,

                    [item.id]:
                    Number(e.target.value),

                  })

                }

              >

                <option value="">
                  Persons
                </option>

                {Array.from({

                  length:
                  monthlyTotalSeats || 1

                }).map((_, i) => (

                  <option
                    key={i + 1}
                    value={i + 1}
                  >

                    {i + 1} Person

                  </option>

                ))}

              </select>

            )}

          </div>

        </label>

      );

    })}

  </div>

</div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.calWrapper}>
                {calLoading && <div className={styles.calLoadingBar}></div>}
                <div className={styles.calNav}>
                  <button type="button" className={styles.calNavBtn}
                    onClick={() => setCalMonthOffset((p) => Math.max(p - 1, 0))} disabled={calMonthOffset === 0}>Prev</button>
                  <button type="button" className={styles.calNavBtn}
                    onClick={() => setCalMonthOffset((p) => p + 1)}>Next</button>
                </div>
                <div className={styles.calMonthsRow}>
                  {visibleMonths.map((m) => renderCalendarMonth(m.year, m.month))}
                </div>
                <div className={styles.calLegend}>
                  {[["calLegendGreen","Available"],["calLegendGray","Full"],["calLegendBlue","Not released"],["calLegendRed","Past"]].map(([cls,lbl]) => (
                    <div key={lbl} className={styles.calLegendItem}>
                      <span className={`${styles.calLegendDot} ${styles[cls]}`}></span>{lbl}
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <div className={styles.slotSearchWrap}>
                      <span className={styles.slotSearchIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                      </span>
                      <input type="text" className={styles.slotSearchInput}
                        placeholder="Search slot time, type, price..."
                        value={slotSearch} onChange={(e) => setSlotSearch(e.target.value)} />
                      {slotSearch && <button type="button" className={styles.slotSearchClear} onClick={() => setSlotSearch("")}>×</button>}
                    </div>
                    <p className={styles.monthHint}>Click slot, popup will ask how many seats you want for that slot.</p>
                    <div className={styles.bookingSlotsWrap}>
                      {filteredSlots.length === 0 ? (
                        <div className={styles.noSlots}>No slots available for this date.</div>
                      ) : (
                        <div className={styles.slotGrid}>
                          {filteredSlots.map((slot) => {
                            const isSelected = selectedSlots.some((s) => s.id === slot.id);
                            return (
                              <button key={slot.id} type="button"
                                className={`${styles.slotCard} ${slot.is_full ? styles.slotFull : isSelected ? styles.slotSelected : styles.slotAvailable}`}
                                disabled={slot.is_full} onClick={() => openSeatPopup("day", slot)}>
                                <span className={styles.slotTime}>
                                  {slot.slot_type === "day" ? "Full Day" : `${slot.start_time} - ${slot.end_time}`}
                                </span>
                                <span className={styles.slotMeta}>₹{slot.price} · {slot.capacity - slot.booked} seats left</span>
                                {isSelected && <span className={styles.slotCheckBadge}>{hourlySeatCounts[slot.id] || 0} seat(s)</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {selectedSlots.length > 0 && (
                      <div className={styles.monthSelectionBar}>
                        <p className={styles.monthSelectionTitle}>Selected slots ({selectedSlots.length})</p>
                        <div className={styles.monthSelectedChips}>
                          {selectedSlots.map((slot) => (
                            <span key={slot.id} className={styles.monthChip}>
                              {slot.slot_type === "day" ? "Full Day" : `${slot.start_time}–${slot.end_time}`} • {hourlySeatCounts[slot.id] || 0} seat(s) • ₹{slot.price}
                              <button type="button" className={styles.monthChipRemove} onClick={() => removeHourlySlot(slot.id)}>×</button>
                            </span>
                          ))}
                        </div>
                        <p className={styles.totalPrice}>Total Seats: {hourlyTotalSeats} |Total: ₹{

  (

    hourlyTotalPrice

    +

 selectedAmenities.reduce(

  (sum, item) =>

    sum +

    (

      Number(item.price || 0)

      *

      Number(

        amenityPersons[item.id] || 1

      )

    ),

  0

)
  ).toLocaleString("en-IN")

}</p>

                        <div className={styles.additionalAmenitiesBox}>

  <h3 className={styles.additionalAmenitiesTitle}>
    Additional Amenities
  </h3>

  <div
    className={styles.additionalAmenitiesGrid}
  >

    {additionalAmenities.map(
      (item) => {

      const checked =
        selectedAmenities.some(
          (a) => a.id === item.id
        );

      return (

        <label

          key={item.id}

          className={`${styles.additionalAmenityCard}
          ${
            checked
              ? styles.additionalAmenityCardActive
              : ""
          }`}

        >

          <input

            type="checkbox"

            checked={checked}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedAmenities(

                  (prev) => [

                    ...prev,

                    item

                  ]

                );

              } else {

                setSelectedAmenities(

                  (prev) =>

                    prev.filter(

                      (x) =>

                        x.id !== item.id

                    )

                );

              }

            }}

          />

          <div>

            <h4>
              {item.title}
            </h4>

            <p>
              {item.description}
            </p>

            <span>
              ₹{item.price}
            </span>
            {checked && (

  <select

    className={styles.amenityPersonSelect}

    value={
      amenityPersons[item.id] || ""
    }

    onChange={(e) =>

      setAmenityPersons({

        ...amenityPersons,

        [item.id]:
        Number(e.target.value),

      })

    }

  >

    <option value="">
      Persons
    </option>

    {Array.from({

      length:

      bookingMode === "month"

      ?

      monthlyTotalSeats || 1

      :

      hourlyTotalSeats || 1

    }).map((_, i) => (

      <option
        key={i + 1}
        value={i + 1}
      >

        {i + 1} Person

      </option>

    ))}

  </select>

)}

          </div>

        </label>

      );

    })}

  </div>

</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button type="button" className={styles.bookingBtn}
              disabled={bookingLoading || (bookingMode === "day" && selectedSlots.length === 0) || (bookingMode === "month" && selectedMonths.length === 0)}
              onClick={handleConfirmBooking}>
              {bookingLoading ? "Processing..." : bookingMode === "month" ? "Confirm Monthly Booking" : selectedSlots.length > 1 ? `Confirm ${selectedSlots.length} Slots` : "Confirm Booking"}
            </button>

            {seatPopupOpen && (
              <div className={styles.seatPopupOverlay} onClick={closeSeatPopup}>
                <div className={styles.seatPopupBox} onClick={(e) => e.stopPropagation()}>
                  <h3 className={styles.seatPopupTitle}>Select seats</h3>
                  <p className={styles.seatPopupText}>
                    {seatPopupMode === "day"
                      ? `Enter seats for ${seatPopupTarget?.slot_type === "day" ? "Full Day" : `${seatPopupTarget?.start_time} - ${seatPopupTarget?.end_time}`}`
                      : `Enter seats for ${seatPopupTarget ? `${MONTH_NAMES[Number(seatPopupTarget.month) - 1]} ${seatPopupTarget.year}` : ""}`}
                  </p>
                  <p className={styles.seatPopupAvail}>
                    Available seats: {Math.max(0, Number(seatPopupTarget?.capacity || 0) - Number(seatPopupTarget?.booked || 0))}
                  </p>
                  <select className={styles.capacityInput} value={seatInputValue} onChange={(e) => setSeatInputValue(e.target.value)}>
                    <option value="">Seats</option>
                    {Array.from({ length: Math.max(0, Number(seatPopupTarget?.capacity || 0) - Number(seatPopupTarget?.booked || 0)) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} seat{i + 1 > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                  <div className={styles.seatPopupActions}>
                    <button type="button" className={styles.btnCall} onClick={closeSeatPopup}>Cancel</button>
                    <button type="button" className={styles.btnBook} onClick={confirmSeatSelection}>Confirm</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;
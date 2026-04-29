import { useEffect, useState } from "react";
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const WORKSPACE_TYPES = [
  "All",
  "Hot Desk",
  "Dedicated Desk",
  "Private Office Space",
  "Private Cabin",
  "Meeting Room",
  "Board Room",
  "Event Space",
  "Podcast",
  "Virtual Office",
];

const LOCATIONS = [
  "All",
  "Hitech City",
  "Madhapur",
  "Gachibowli",
  "Kondapur",
  "Financial District",
];

const AMENITY_ICONS = {
  "24hr": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  wifi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  coffee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  firewall: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  security: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  parking: "🅿️",
  meeting: "🏢",
  games: "🎮",
  pantry: "🍽️",
  cleaning: "🧹",
  support: "💬",
  ac: "❄️",
  "air conditioning": "❄️",
  power: "🔌",
  "power backup": "🔌",
  internet: "📶",
  tea: "☕",
  month: "📆",
  bookNow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

function HyderabadWorkspaces() {
  const navigate = useNavigate();
  const location = useLocation();

  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [visibleCount, setVisibleCount] = useState(2);

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMode, setBookingMode] = useState("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState("1");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [slotSearch, setSlotSearch] = useState("");
  const [filteredSlots, setFilteredSlots] = useState([]);

  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [calLoading, setCalLoading] = useState(false);

  const [monthlySlots, setMonthlySlots] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedMonthSlot, setSelectedMonthSlot] = useState(null);

  const params = new URLSearchParams(location.search);
  const queryLocation = params.get("location");
  const showOnlySelectedLocation = !!queryLocation;

  useEffect(() => {
    axiosInstance
      .get("workspaces/")
      .then((res) => {
        const data = res.data || [];
        setWorkspaces(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const state = location.state;
    const token = localStorage.getItem("access");

    if (token && state?.openBooking && state?.workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => String(w.id) === String(state.workspaceId));
      if (workspace) {
        openBookingModal(workspace, state.bookingMode || "day");
        navigate(location.pathname + location.search, { replace: true, state: {} });
      }
    }
  }, [workspaces, location.state, navigate, location.pathname, location.search]);

  useEffect(() => {
    const loc = params.get("location");
    if (loc) {
      setSelectedLocation(loc);
    }
  }, [location.search]);

  useEffect(() => {
    const filtered = workspaces.filter((item) => {
      const typeMatch =
        selectedType === "All" ||
        item.name?.toLowerCase().trim() === selectedType.toLowerCase().trim();

      const locationMatch =
        selectedLocation === "All" ||
        item.location?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.city?.toLowerCase().includes(selectedLocation.toLowerCase());

      return typeMatch && locationMatch;
    });

    setFilteredData(filtered);
    setVisibleCount(2);
  }, [selectedType, selectedLocation, workspaces]);

  useEffect(() => {
    if (!selectedWorkspace || !showBookingModal || bookingMode !== "day") return;
    fetchDateStatuses(selectedWorkspace.id);
  }, [selectedWorkspace, showBookingModal, calMonthOffset, bookingMode]);

  useEffect(() => {
    const value = slotSearch.toLowerCase().trim();

    if (!selectedDate) {
      setFilteredSlots([]);
      return;
    }

    if (!value) {
      setFilteredSlots(slots);
      return;
    }

    setFilteredSlots(
      slots.filter((slot) => {
        const label =
          slot.slot_type === "hour"
            ? `${slot.start_time} - ${slot.end_time}`
            : "Full Day";

        return [
          label,
          slot.slot_type,
          slot.start_time,
          slot.end_time,
          `${slot.price}`,
          `${slot.booked}`,
          `${slot.capacity}`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value);
      })
    );
  }, [slots, slotSearch, selectedDate]);

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

  const renderAmenityIcon = (name) => {
    const key = getAmenityKey(name);
    return AMENITY_ICONS[key] || "•";
  };

  const fetchDateStatuses = async (workspaceId) => {
    setCalLoading(true);
    try {
      const today = new Date();
      const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
      const year = base.getFullYear();
      const month = base.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const map = {};
      const requests = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dd = String(d).padStart(2, "0");
        const mm = String(month + 1).padStart(2, "0");
        const dateStr = `${year}-${mm}-${dd}`;

        requests.push(
          axiosInstance
            .get(`workspaces/slot/${workspaceId}/?date=${dateStr}`)
            .then((res) => {
              const daySlots = res.data || [];
              map[dateStr] =
                daySlots.length === 0
                  ? "unreleased"
                  : daySlots.every((s) => s.is_full)
                  ? "full"
                  : "available";
            })
            .catch(() => {
              map[dateStr] = "unreleased";
            })
        );
      }

      await Promise.all(requests);
      setDateStatusMap(map);
    } catch (e) {
      console.error(e);
    }
    setCalLoading(false);
  };

  const fetchMonthlySlots = (workspaceId) => {
    axiosInstance
      .get(`workspaces/month-slots/${workspaceId}/`)
      .then((res) => {
        setMonthlySlots(res.data || []);
      })
      .catch(() => setMonthlySlots([]));
  };

  const openBookingModal = (item, mode = "day") => {
    setSelectedWorkspace(item);
    setBookingMode(mode);
    setShowBookingModal(true);

    setSelectedDate("");
    setSlots([]);
    setFilteredSlots([]);
    setSelectedSlot(null);

    setSelectedMonths([]);
    setSelectedMonthSlot(null);

    setSlotSearch("");
    setSelectedSeats("1");
    setCalMonthOffset(0);
    setDateStatusMap({});

    if (mode === "month") {
      fetchMonthlySlots(item.id);
    }
  };

  const handleBookNow = (item) => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/auth?type=user", {
        state: {
          from: location,
          openBooking: true,
          workspaceId: item.id,
          bookingMode: "day",
        },
      });
      return;
    }

    openBookingModal(item, "day");
  };

  const handleBookForMonth = (item) => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/auth?type=user", {
        state: {
          from: location,
          openBooking: true,
          workspaceId: item.id,
          bookingMode: "month",
        },
      });
      return;
    }

    openBookingModal(item, "month");
  };

  const fetchSlots = (workspaceId, date) => {
    if (!workspaceId || !date || date.length !== 10) return;

    axiosInstance
      .get(`workspaces/slot/${workspaceId}/?date=${date}`)
      .then((res) => {
        const data = res.data || [];
        setSlots(data);
        setFilteredSlots(data);
        setDateStatusMap((prev) => ({
          ...prev,
          [date]:
            data.length === 0
              ? "unreleased"
              : data.every((s) => s.is_full)
              ? "full"
              : "available",
        }));
      })
      .catch(() => {
        setSlots([]);
        setFilteredSlots([]);
      });
  };

  const handleDateClick = (dateStr) => {
    if (dateStatusMap[dateStr] !== "available") return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSelectedSeats("1");
    setSlotSearch("");
    fetchSlots(selectedWorkspace.id, dateStr);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmBooking = async () => {
    if (
      (bookingMode === "day" && !selectedSlot) ||
      (bookingMode === "month" && selectedMonths.length === 0)
    ) {
      alert("Please select slot/month");
      return;
    }

    if (!selectedSeats || Number(selectedSeats) < 1) {
      alert("Please enter valid seats");
      return;
    }

    if (
      bookingMode === "month" &&
      selectedMonthSlot &&
      Number(selectedSeats) > Number(selectedMonthSlot.capacity - selectedMonthSlot.booked)
    ) {
      alert("Selected seats exceed available seats");
      return;
    }

    if (
      bookingMode === "day" &&
      selectedSlot &&
      Number(selectedSeats) > Number(selectedSlot.capacity - selectedSlot.booked)
    ) {
      alert("Selected seats exceed available seats");
      return;
    }

    try {
      setBookingLoading(true);

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert("Razorpay failed to load");
        setBookingLoading(false);
        return;
      }
      const finalAmount =
  bookingMode === "month"
    ? selectedMonths.length *
      Number(selectedSeats) *
      (
        monthlySlots
          .filter(m => selectedMonths.includes(m.id))
          .reduce((sum, m) => sum + Number(m.price || 0), 0) /
        selectedMonths.length
      )
    : Number(selectedSeats) * Number(selectedSlot?.price || 0);

      const res = await axiosInstance.post("payment/create/", {
        amount: finalAmount,
      });

      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Workspace Booking",
        description:
          bookingMode === "month"
            ? "Monthly Workspace Booking"
            : "Slot Booking Payment",
        order_id: order.id,
        method: { netbanking: true, card: false, upi: false, wallet: false },
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using Netbanking",
                instruments: [{ method: "netbanking" }],
              },
            },
            sequence: ["block.banks"],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: "#f59e0b" },
        handler: async function (response) {
          try {
            console.log("PAYLOAD:", {
  workspace_id: selectedWorkspace.id,
  slot_id: selectedSlot?.id,
  monthly_slot_ids: selectedMonths,
  seats: selectedSeats,
  booking_type: bookingMode,
});
            const verify = await axiosInstance.post("payment/verify/", response);

            if (verify.data.status === "success") {
await axiosInstance.post("cart/create/", {
  workspace_id: selectedWorkspace.id,

  ...(bookingMode === "day" && selectedSlot?.id && {
    slot_id: selectedSlot.id,
  }),

  ...(bookingMode === "month" && selectedMonths.length > 0 && {
    monthly_slot_ids: selectedMonths.map(id => Number(id)),
  }),

  seats: Number(selectedSeats), // MUST be number
  booking_type: bookingMode,
});

              alert(
                bookingMode === "month"
                  ? "Monthly booking confirmed 🎉"
                  : "Booking confirmed 🎉"
              );

              setShowBookingModal(false);
              setSelectedMonths([]);
              setSelectedMonthSlot(null);
              setSelectedSlot(null);

              if (bookingMode === "day") {
                fetchSlots(selectedWorkspace.id, selectedDate);
              } else {
                fetchMonthlySlots(selectedWorkspace.id);
              }
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error(error);
            alert("Booking failed after payment");
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: () => setBookingLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        alert("Payment failed. Try again.");
        setBookingLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment Failed");
      setBookingLoading(false);
    }
  };

  const handleKnowMore = (item) => {
    setSelectedWorkspace(item);
    setActiveTab("overview");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWorkspace(null);
  };

  const renderCalendarMonth = (year, month) => {
    const cells = buildMonthMatrix(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className={styles.calMonth} key={`${year}-${month}`}>
        <div className={styles.calMonthName}>
          {MONTH_NAMES[month]} {year}
        </div>

        <div className={styles.calDayLabels}>
          {DAY_LABELS.map((d, i) => (
            <span key={i} className={styles.calDayLabel}>
              {d}
            </span>
          ))}
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
            else if (status === "full") cellClass += ` ${styles.calDayFull}`;
            else if (status === "available") cellClass += ` ${styles.calDayAvailable}`;
            else cellClass += ` ${styles.calDayUnreleased}`;
            if (isSelected) cellClass += ` ${styles.calDaySelected}`;

            return (
              <button
                key={idx}
                type="button"
                className={cellClass}
                onClick={() => !isPast && status === "available" && handleDateClick(dateStr)}
                disabled={isPast || status !== "available"}
                aria-label={dateStr}
              >
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

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderRing}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading Hyderabad premium workspaces...</p>
      </div>
    );
  }

  const visibleMonths = getVisibleMonths();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.filterBlock}>
          <h3 className={styles.filterLabel}>Locations</h3>
          <div className={styles.pillRow}>
            {(showOnlySelectedLocation ? [selectedLocation] : LOCATIONS).map((loc) => (
              <button
                key={loc}
                type="button"
                className={`${styles.locPill} ${
                  selectedLocation === loc ? styles.locPillActive : ""
                }`}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterBlock}>
          <h3 className={styles.filterLabel}>Workspaces</h3>
          <div className={styles.pillRow}>
            {WORKSPACE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.typePill} ${
                  selectedType === type ? styles.typePillActive : ""
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.cardList}>
          {filteredData.length === 0 ? (
            <div className={styles.empty}>
              <span>🔍</span>
              <p>No workspaces found for your filters.</p>
            </div>
          ) : (
            filteredData.slice(0, visibleCount).map((item) => (
              <div key={item.id} className={styles.card}>
                <div
                  className={styles.cardImgWrap}
                  onClick={() => handleKnowMore(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleKnowMore(item);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  aria-label={`Open details for ${item.name}`}
                >
                  <img src={item.image} alt={item.name} className={styles.cardImg} />
                </div>

                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{item.name}</h2>

                  <p className={styles.cardAddress}>
                    {item.location}
                    {item.area ? `, ${item.area}` : ""}
                    {item.city ? `, ${item.city}` : ""}
                  </p>

                  <div className={styles.amenRow}>
                    {item.amenities?.length > 0 ? (
                      item.amenities.slice(0, 5).map((amenity) => (
                        <span key={amenity.id} className={styles.amenItem}>
                          <span className={styles.amenIcon}>
                            {renderAmenityIcon(amenity.name)}
                          </span>
                          {amenity.name}
                        </span>
                      ))
                    ) : (
                      <span className={styles.noAmenities}>No amenities listed</span>
                    )}
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.priceSymbol}>₹</span>
                    <span className={styles.priceNum}>
                      {Number(item.price || 6500).toLocaleString("en-IN")}
                    </span>
                    <span className={styles.priceOnwards}>
                      {" "}Onwards <span className={styles.priceGst}>+.GST</span>
                    </span>
                  </div>

                  <p className={styles.priceSub}>Base price seat per month</p>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.btnBook}
                      onClick={() => handleBookNow(item)}
                    >
                      <span className={styles.btnIcon}>{AMENITY_ICONS.bookNow}</span>
                      Book Now
                    </button>

                    <button
                      type="button"
                      className={styles.btnCall}
                      onClick={() => handleBookForMonth(item)}
                    >
                      <span className={styles.btnIcon}>{AMENITY_ICONS.month}</span>
                      Book for Month
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {visibleCount < filteredData.length && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={() => setVisibleCount((prev) => prev + 2)}
            >
              View More Workspaces
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <span className={styles.loadMoreCount}>
              Showing {Math.min(visibleCount, filteredData.length)} of {filteredData.length} workspaces
            </span>
          </div>
        )}
      </div>

      {showModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mHero}>
              <img
                src={selectedWorkspace.image}
                alt={selectedWorkspace.name}
                className={styles.mHeroImg}
              />
              <div className={styles.mHeroGrad}></div>

              <div className={styles.mHeroBadges}>
                <span className={styles.mBDay}>
                  {bookingMode === "month" ? "Monthly Access" : "Daily Access"}
                </span>
                <span className={styles.mBRating}>★ 4.8</span>
              </div>

              <button type="button" className={styles.mClose} onClick={closeModal}>
                ×
              </button>

              <div className={styles.mHeroInfo}>
                <h2 className={styles.mTitle}>{selectedWorkspace.name}</h2>
                <div className={styles.mSub}>
                  <span>{selectedWorkspace.location}</span>
                </div>
              </div>
            </div>

            <div className={styles.mTabs}>
              {["overview", "pricing", "location"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.mTab} ${activeTab === tab ? styles.mTabActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.mBody}>
              {activeTab === "overview" && (
                <div className={styles.mContent}>
                  <div className={styles.statsRow}>
                    {[
                      ["🪑", "24", "Seats"],
                      ["📶", "1 Gbps", "Internet"],
                      ["☕", "Free", "Coffee"],
                      ["🚗", "Yes", "Parking"],
                    ].map(([e, v, l]) => (
                      <div key={l} className={styles.statBox}>
                        <span className={styles.statEmoji}>{e}</span>
                        <span className={styles.statVal}>{v}</span>
                        <span className={styles.statLbl}>{l}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>About</h3>
                    <p className={styles.mSectionText}>
                      {selectedWorkspace.description ||
                        "A premium Hyderabad workspace crafted for focus, comfort, and productive daily work. Ideal for freelancers, remote teams, and professionals who need a polished environment."}
                    </p>
                  </div>

                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>Amenities</h3>
                    <div className={styles.amenGrid}>
                      {selectedWorkspace.amenities?.length > 0 ? (
                        selectedWorkspace.amenities.map((amenity) => (
                          <div key={amenity.id} className={styles.amenCard}>
                            <span className={styles.amenEmoji}>
                              {renderAmenityIcon(amenity.name)}
                            </span>
                            <div>
                              <div className={styles.amenName}>{amenity.name}</div>
                              <div className={styles.amenDesc}>
                                Available with this workspace
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={styles.mSectionText}>
                          No amenities listed for this workspace.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className={styles.mContent}>
                  <div className={styles.pricingHero}>
                    <div className={styles.pricingTag}>
                      {bookingMode === "month" ? "Monthly Plan" : "Daily Pass"}
                    </div>
                    <div className={styles.pricingAmt}>
                      <span className={styles.pricingCur}>₹</span>
                      <span className={styles.pricingNum}>
                        {selectedWorkspace.price || 499}
                      </span>
                      <span className={styles.pricingUnit}>
                        {bookingMode === "month" ? "/month" : "/day"}
                      </span>
                    </div>
                    <div className={styles.pricingNote}>
                      Flexible workspace access with premium amenities
                    </div>
                  </div>

                  <div className={styles.includeList}>
                    {selectedWorkspace.amenities?.length > 0 ? (
                      selectedWorkspace.amenities.map((amenity) => (
                        <div key={amenity.id} className={styles.includeRow}>
                          <span className={styles.check}>✓</span>
                          {amenity.name}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={styles.includeRow}>
                          <span className={styles.check}>✓</span>
                          Workspace seat access
                        </div>
                        <div className={styles.includeRow}>
                          <span className={styles.check}>✓</span>
                          Standard workspace facilities
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className={styles.mContent}>
                  <div className={styles.locGrid}>
                    {[
                      ["Area", selectedWorkspace.area],
                      ["City", selectedWorkspace.city],
                      ["Address", selectedWorkspace.location],
                    ].map(([l, v]) => (
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
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapBtn}
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.mFooter}>
              <div className={styles.mFooterPrice}>
                <span className={styles.mFooterNum}>
                  ₹{selectedWorkspace.price || 499}
                </span>
                <span className={styles.mFooterUnit}>
                  {bookingMode === "month" ? "/month" : "/day"}
                </span>
              </div>
              <button
                type="button"
                className={styles.mFooterBtn}
                onClick={() => {
                  setShowModal(false);
                  if (bookingMode === "month") {
                    handleBookForMonth(selectedWorkspace);
                  } else {
                    handleBookNow(selectedWorkspace);
                  }
                }}
              >
                {bookingMode === "month" ? "Book for Month" : "Book This Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={() => setShowBookingModal(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.mClose}
              onClick={() => setShowBookingModal(false)}
            >
              ×
            </button>

            <h2 className={styles.bookingTitle}>
              {bookingMode === "month"
                ? `Book for month at ${selectedWorkspace.name}`
                : `Book your slot at ${selectedWorkspace.name}`}
            </h2>

            {bookingMode === "month" ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
                  {monthlySlots.length === 0 ? (
                    <div className={styles.noSlots}>No monthly slots available.</div>
                  ) : (
                    monthlySlots.map((m) => {
                      const isSelected = selectedMonths.includes(m.id);
                      const availableSeats = Number(m.capacity || 0) - Number(m.booked || 0);

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (m.is_full) return;

                            setSelectedMonths((prev) => {
                              if (prev.includes(m.id)) {
                                const updated = prev.filter((id) => id !== m.id);

                                if (updated.length === 0) {
                                  setSelectedMonthSlot(null);
                                  setSelectedSeats("1");
                                }

                                return updated;
                              } else {
                                setSelectedMonthSlot(m);
                                return [...prev, m.id];
                              }
                            });
                          }}
                          disabled={m.is_full}
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: isSelected ? "2px solid green" : "1px solid #ccc",
                            background: m.is_full ? "#eee" : "#fff",
                            minWidth: "140px",
                            cursor: m.is_full ? "not-allowed" : "pointer",
                          }}
                        >
                          <strong>
                            {m.month}/{m.year}
                          </strong>
                          <br />
                          ₹{m.price}
                          <br />
                          {availableSeats} seats left
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedMonths.length > 0 && selectedMonthSlot && (
                  <div className={styles.capacityBox}>
                    <p>
                      Available Seats:{" "}
                      <strong>
                        {Number(selectedMonthSlot.capacity || 0) - Number(selectedMonthSlot.booked || 0)}
                      </strong>
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Seats"
                      value={selectedSeats}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");

                        if (value === "") {
                          setSelectedSeats("");
                          return;
                        }

                        value = String(
                          Math.max(
                            1,
                            Math.min(
                              Number(value.replace(/^0+/, "") || "0"),
                              Number(selectedMonthSlot.capacity || 0) - Number(selectedMonthSlot.booked || 0)
                            )
                          )
                        );

                        setSelectedSeats(value);
                      }}
                      className={styles.capacityInput}
                    />

                    <p className={styles.totalPrice}>
                      Total: ₹
                      {selectedMonths.length *
                        Number(selectedSeats || 0) *
                        Number(selectedMonthSlot.price || 0)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.calWrapper}>
                {calLoading && <div className={styles.calLoadingBar}></div>}

                <div className={styles.calNav}>
                  <button
                    type="button"
                    className={styles.calNavBtn}
                    onClick={() => setCalMonthOffset((p) => Math.max(p - 1, 0))}
                    disabled={calMonthOffset === 0}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className={styles.calNavBtn}
                    onClick={() => setCalMonthOffset((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>

                <div className={styles.calMonthsRow}>
                  {visibleMonths.map((m) => renderCalendarMonth(m.year, m.month))}
                </div>

                <div className={styles.calLegend}>
                  {[
                    ["calLegendGreen", "Available"],
                    ["calLegendGray", "Full"],
                    ["calLegendBlue", "Not released"],
                    ["calLegendRed", "Past"],
                  ].map(([cls, lbl]) => (
                    <div key={lbl} className={styles.calLegendItem}>
                      <span className={`${styles.calLegendDot} ${styles[cls]}`}></span>
                      {lbl}
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <div className={styles.slotSearchWrap}>
                      <span className={styles.slotSearchIcon}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      </span>

                      <input
                        type="text"
                        className={styles.slotSearchInput}
                        placeholder="Search slot time, type, price..."
                        value={slotSearch}
                        onChange={(e) => setSlotSearch(e.target.value)}
                      />

                      {slotSearch && (
                        <button
                          type="button"
                          className={styles.slotSearchClear}
                          onClick={() => setSlotSearch("")}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className={styles.bookingSlotsWrap}>
                      {filteredSlots.length === 0 ? (
                        <div className={styles.noSlots}>No slots available for this date.</div>
                      ) : (
                        <div className={styles.slotGrid}>
                          {filteredSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              className={`${styles.slotCard} ${
                                slot.is_full
                                  ? styles.slotFull
                                  : selectedSlot?.id === slot.id
                                  ? styles.slotSelected
                                  : styles.slotAvailable
                              }`}
                              disabled={slot.is_full}
                              onClick={() => {
                                if (!slot.is_full) {
                                  setSelectedSlot(slot);
                                  setSelectedSeats("1");
                                }
                              }}
                            >
                              <span className={styles.slotTime}>
                                {slot.slot_type === "day"
                                  ? "Full Day"
                                  : `${slot.start_time} - ${slot.end_time}`}
                              </span>
                              <span className={styles.slotMeta}>
                                ₹{slot.price} · {slot.capacity - slot.booked} seats left
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedSlot && (
                      <div className={styles.capacityBox}>
                        <p>
                          Available Seats:{" "}
                          <strong>{selectedSlot.capacity - selectedSlot.booked}</strong>
                        </p>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Seats"
                          value={selectedSeats}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");

                            if (value === "") {
                              setSelectedSeats("");
                              return;
                            }

                            value = String(
                              Math.max(
                                1,
                                Math.min(
                                  Number(value.replace(/^0+/, "") || "0"),
                                  selectedSlot.capacity - selectedSlot.booked
                                )
                              )
                            );

                            setSelectedSeats(value);
                          }}
                          className={styles.capacityInput}
                        />

                        <p className={styles.totalPrice}>
                          Total: ₹{Number(selectedSeats || 0) * Number(selectedSlot.price || 0)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className={styles.bookingBtn}
              disabled={
                bookingLoading ||
                (bookingMode === "day" && !selectedSlot) ||
                (bookingMode === "month" && selectedMonths.length === 0)
              }
              onClick={handleConfirmBooking}
            >
              {bookingLoading
                ? "Processing..."
                : bookingMode === "month"
                ? "Confirm Monthly Booking"
                : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const AMENITY_ICONS = {
  wifi: "📶",
  security: "🛡️",
  "24hr": "⏰",
  coffee: "☕",
  parking: "🅿️",
  meeting: "🏢",
  games: "🎮",
  pantry: "🍽️",
  cleaning: "🧹",
  support: "💬",
  ac: "❄️",
  printer: "🖨️",
  internet: "🌐",
  power: "🔋",
  workspace: "💼",
  bookNow: "📅",
  phone: "📞",
};

const WORKSPACE_TYPES = [
  "All",
  "Hot Desk",
  "Dedicated Desk",
  "Private Office Space",
  "Private Cabin",
  "Meeting Room",
  "Board Room",
  "Event Space",
  "Podcast Studio",
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

function normalizeType(value = "") {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function getAmenityName(amenity) {
  if (typeof amenity === "object" && amenity !== null) {
    return amenity.name || "Amenity";
  }
  return `Amenity ${amenity}`;
}

function getAmenityKey(amenity, index) {
  if (typeof amenity === "object" && amenity !== null) {
    return amenity.id || index;
  }
  return index;
}

function getAmenityIcon(amenity) {
  if (typeof amenity === "object" && amenity !== null) {
    const key = amenity.icon_display || amenity.icon || "";
    return AMENITY_ICONS[key] || "🔹";
  }
  return "🔹";
}

function HyderabadWorkspaces() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const typeFromURL = searchParams.get("type") || "All";
  const locationFromURL = searchParams.get("location") || "All";

  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState(typeFromURL);
  const [selectedLocation, setSelectedLocation] = useState(locationFromURL);
  const [visibleCount, setVisibleCount] = useState(2);

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState("1");
  const [

  additionalAmenities,

  setAdditionalAmenities

] = useState([]);


const workspaceType =
  location.state?.workspaceType;

useEffect(() => {

  if (workspaceType) {

    setSelectedType(
      workspaceType
    );

  }

}, [workspaceType]);
const [

  selectedAmenities,

  setSelectedAmenities

] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [slotSearch, setSlotSearch] = useState("");
  const [filteredSlots, setFilteredSlots] = useState([]);

  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [calLoading, setCalLoading] = useState(false);

  const fetchWorkspacesData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("workspaces/");
      console.log("WORKSPACES API:", res.data);
      setWorkspaces(Array.isArray(res.data) ? [...res.data] : []);
    } catch (err) {
      console.log("API ERROR:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaceDetails = async (workspaceId) => {
    try {
      const res = await axiosInstance.get("workspaces/");
      const all = Array.isArray(res.data) ? res.data : [];
      const latest = all.find((w) => String(w.id) === String(workspaceId));
      if (latest) {
        setSelectedWorkspace(latest);
        setWorkspaces([...all]);
      }
      return latest || null;
    } catch (err) {
      console.log("Refresh workspace failed:", err);
      return null;
    }
  };

  useEffect(() => {
    setSelectedType(typeFromURL);
    setSelectedLocation(locationFromURL);
  }, [typeFromURL, locationFromURL]);

  useEffect(() => {
    fetchWorkspacesData();
  }, []);

  useEffect(() => {
    const filtered = workspaces.filter((item) => {
      const backendType = normalizeType(
        item.workspace_type || item.type || item.category || item.name || ""
      );

      const typeMatch =
        selectedType === "All" ||
        backendType === normalizeType(selectedType);

      const fullLocationText = `${item.location || ""} ${item.area || ""} ${item.city || ""}`.toLowerCase();

      const locationMatch =
        selectedLocation === "All" ||
        fullLocationText.includes(selectedLocation.toLowerCase());

      return typeMatch && locationMatch;
    });

    setFilteredData(filtered);
    setVisibleCount(2);
  }, [selectedType, selectedLocation, workspaces]);

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

  useEffect(() => {
    if (!selectedWorkspace || !showBookingModal) return;
    fetchDateStatuses(selectedWorkspace.id);
  }, [selectedWorkspace, showBookingModal, calMonthOffset]);

  const updateQueryParams = (nextType, nextLocation) => {
    const params = new URLSearchParams();

    if (nextType && nextType !== "All") params.set("type", nextType);
    if (nextLocation && nextLocation !== "All") {
      params.set("location", nextLocation);
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: false }
    );
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateQueryParams(type, selectedLocation);
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    updateQueryParams(selectedType, loc);
  };

  const fetchDateStatuses = async (workspaceId) => {
    setCalLoading(true);

    try {
      const today = new Date();
      const base = new Date(
        today.getFullYear(),
        today.getMonth() + calMonthOffset,
        1
      );
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

  const handleBookNow = async (item) => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first 🔒");
      navigate("/auth?type=user");
      return;
    }

    const latest = await refreshWorkspaceDetails(item.id);

    setSelectedWorkspace(latest || item);
    setShowBookingModal(true);
    setSelectedDate("");
    setSlots([]);
    setFilteredSlots([]);
    setSelectedSlot(null);
    setSlotSearch("");
    setCalMonthOffset(0);
    setDateStatusMap({});
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

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      alert("Please select a slot");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await axiosInstance.post("payment/create/", {
       amount:

  (

    Number(selectedSeats)

    *

    selectedSlot.price

  )

  +

  selectedAmenities.reduce(

    (sum, item) =>

      sum + Number(item.price),

    0

  ),
      });

      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Workspace Booking",
        description: "Slot Booking Payment",
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
            const verify = await axiosInstance.post("payment/verify/", response);

            if (verify.data.status === "success") {
              await axiosInstance.post("cart/create/", {
                slot_id: selectedSlot.id,
                seats: selectedSeats,
                payment_id: response.razorpay_payment_id,
              });

              alert("Booking Confirmed 🎉");
              setShowBookingModal(false);
              fetchSlots(selectedWorkspace.id, selectedDate);
              fetchWorkspacesData();
            } else {
              alert("Payment verification failed");
            }
          } catch {
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
    } catch {
      alert("Payment Failed");
      setBookingLoading(false);
    }
  };

  const handleKnowMore = async (item) => {
    const latest = await refreshWorkspaceDetails(item.id);
    setSelectedWorkspace(latest || item);
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
                onClick={() =>
                  !isPast &&
                  status === "available" &&
                  handleDateClick(dateStr)
                }
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
    const base = new Date(
      today.getFullYear(),
      today.getMonth() + calMonthOffset,
      1
    );

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
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`${styles.locPill} ${
                  selectedLocation === loc ? styles.locPillActive : ""
                }`}
                onClick={() => handleLocationChange(loc)}
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
                onClick={() => handleTypeChange(type)}
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
                <div className={styles.cardImgWrap}>
                  <img
                    src={item.image || "https://via.placeholder.com/800x500?text=Workspace"}
                    alt={item.name}
                    className={styles.cardImg}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x500?text=Workspace";
                    }}
                  />
                </div>

                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{item.name}</h2>

                  <p className={styles.cardAddress}>
                    {item.location}
                    {item.area ? `, ${item.area}` : ""}
                    {item.city ? `, ${item.city}` : ""}
                  </p>

                  <div className={styles.amenRow}>
                    {Array.isArray(item.amenities) && item.amenities.length > 0 ? (
                      item.amenities.map((amenity, index) => (
                        <span
                          key={getAmenityKey(amenity, index)}
                          className={styles.amenItem}
                        >
                          <span className={styles.amenIcon}>
                            {getAmenityIcon(amenity)}
                          </span>
                          {getAmenityName(amenity)}
                        </span>
                      ))
                    ) : (
                      <span className={styles.amenItem}>No amenities</span>
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

                  <p className={styles.priceSub}>Base Price seat per month</p>

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
                      onClick={() => handleKnowMore(item)}
                    >
                      <span className={styles.btnIcon}>{AMENITY_ICONS.phone}</span>
                      Request Call
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
              Load More
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
              Showing {Math.min(visibleCount, filteredData.length)} of{" "}
              {filteredData.length} workspaces
            </span>
          </div>
        )}
      </div>

      {showModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mHero}>
              <img
                src={selectedWorkspace.image || "https://via.placeholder.com/1200x700?text=Workspace"}
                alt={selectedWorkspace.name}
                className={styles.mHeroImg}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/1200x700?text=Workspace";
                }}
              />
              <div className={styles.mHeroGrad}></div>

              <div className={styles.mHeroBadges}>
                <span className={styles.mBDay}>Daily Access</span>
                <span className={styles.mBRating}>★ 4.8</span>
              </div>

              <button
                type="button"
                className={styles.mClose}
                onClick={closeModal}
              >
                ×
              </button>

              <div className={styles.mHeroInfo}>
                <h2 className={styles.mTitle}>{selectedWorkspace.name}</h2>
                <div className={styles.mSub}>
                  <span>
                    {selectedWorkspace.location}
                    {selectedWorkspace.area ? `, ${selectedWorkspace.area}` : ""}
                    {selectedWorkspace.city ? `, ${selectedWorkspace.city}` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.mTabs}>
              {["overview", "pricing", "location"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.mTab} ${
                    activeTab === tab ? styles.mTabActive : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.mBody}>
              {activeTab === "overview" && (
                <div className={styles.mContent}>
                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>About</h3>
                    <p className={styles.mSectionText}>
                      {selectedWorkspace.description ||
                        "A premium Hyderabad workspace crafted for focus, comfort, and productive daily work."}
                    </p>
                  </div>

                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>Amenities</h3>
                    <div className={styles.amenGrid}>
                      {Array.isArray(selectedWorkspace.amenities) &&
                      selectedWorkspace.amenities.length > 0 ? (
                        selectedWorkspace.amenities.map((amenity, index) => (
                          <div
                            key={getAmenityKey(amenity, index)}
                            className={styles.amenCard}
                          >
                            <span className={styles.amenEmoji}>
                              {getAmenityIcon(amenity)}
                            </span>
                            <div>
                              <div className={styles.amenName}>
                                {getAmenityName(amenity)}
                              </div>
                              <div className={styles.amenDesc}>
                                Available in this workspace
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No amenities available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className={styles.mContent}>
                  <div className={styles.pricingHero}>
                    <div className={styles.pricingTag}>Daily Pass</div>
                    <div className={styles.pricingAmt}>
                      <span className={styles.pricingCur}>₹</span>
                      <span className={styles.pricingNum}>
                        {selectedWorkspace.price || 499}
                      </span>
                      <span className={styles.pricingUnit}>/day</span>
                    </div>
                    <div className={styles.pricingNote}>
                      Flexible workspace access with premium amenities
                    </div>
                  </div>

                  <div className={styles.includeList}>
                    {[
                      "Workspace seat access",
                      "High-speed Wi-Fi",
                      "Complimentary tea / coffee",
                      "Air-conditioned seating",
                    ].map((t) => (
                      <div key={t} className={styles.includeRow}>
                        <span className={styles.check}>✓</span>
                        {t}
                      </div>
                    ))}
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
                <span className={styles.mFooterUnit}>/day</span>
              </div>

              <button
                type="button"
                className={styles.mFooterBtn}
                onClick={() => {
                  setShowModal(false);
                  handleBookNow(selectedWorkspace);
                }}
              >
                Book This Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && selectedWorkspace && (
        <div
          className={styles.overlay}
          onClick={() => setShowBookingModal(false)}
        >
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.mClose}
              onClick={() => setShowBookingModal(false)}
            >
              ×
            </button>

            <h2 className={styles.bookingTitle}>
              Book your slot at {selectedWorkspace.name}
            </h2>

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
                      <div className={styles.noSlots}>
                        No slots available for this date.
                      </div>
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

  Total: ₹{

    (

      Number(selectedSeats || 0)

      *

      selectedSlot.price

    )

    +

    selectedAmenities.reduce(

      (sum, item) =>

        sum + Number(item.price),

      0

    )

  }

</p>
                    </div>
                    
                  )}
                </>
              )}

              <button
                type="button"
                className={styles.bookingBtn}
                disabled={!selectedSlot || bookingLoading}
                onClick={handleConfirmBooking}
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
              <div className={styles.additionalAmenitiesBox}>

  <h3 className={styles.additionalAmenitiesTitle}>
    Additional Amenities
  </h3>

  {additionalAmenities.length === 0 ? (

    <p className={styles.noAmenities}>
      No additional amenities available
    </p>

  ) : (

    <div className={styles.additionalAmenitiesGrid}>

      {additionalAmenities.map((item) => {

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
                {
                  item.description
                }
              </p>

              <span>

                ₹{item.price}

              </span>

            </div>

          </label>

        );

      })}

    </div>

  )}

</div>
            </div>
          </div>
        </div>
      )}
    </div>

    
  );
}

export default HyderabadWorkspaces;
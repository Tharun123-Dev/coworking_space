import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

function HyderabadWorkspaces() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useRef(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [slotSearch, setSlotSearch] = useState("");
  const [filteredSlots, setFilteredSlots] = useState([]);

  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [calLoading, setCalLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("workspaces/")
      .then((res) => {
        setWorkspaces(res.data);
        setFilteredData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const value = search.toLowerCase().trim();
    const filtered = workspaces.filter((item) => {
      return (
        item.name?.toLowerCase().includes(value) ||
        item.location?.toLowerCase().includes(value) ||
        item.city?.toLowerCase().includes(value) ||
        item.area?.toLowerCase().includes(value)
      );
    });
    setFilteredData(filtered);
    setCarouselIndex(0);
  }, [search, workspaces]);

  useEffect(() => {
    if (!selectedWorkspace || !showBookingModal) return;
    fetchDateStatuses(selectedWorkspace.id);
  }, [selectedWorkspace, showBookingModal, calMonthOffset]);

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

    const filtered = slots.filter((slot) => {
      const label =
        slot.slot_type === "hour"
          ? `${slot.start_time} - ${slot.end_time}`
          : "Full Day";

      const searchableText = [
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
        .toLowerCase();

      return searchableText.includes(value);
    });

    setFilteredSlots(filtered);
  }, [slots, slotSearch, selectedDate]);

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
              if (daySlots.length === 0) {
                map[dateStr] = "unreleased";
              } else {
                const allFull = daySlots.every((s) => s.is_full);
                map[dateStr] = allFull ? "full" : "available";
              }
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

 const handleBookNow = (item) => {
  const token = localStorage.getItem("access");
  if (!token) {
    alert("Please login first 🔒");
    navigate("/auth?type=user");
    return;
  
  // Pass workspace as location state
  navigate("/slot-booking", { state: { workspace: item } });
};

    setSelectedWorkspace(item);
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

        if (data.length > 0) {
          const allFull = data.every((s) => s.is_full);
          setDateStatusMap((prev) => ({
            ...prev,
            [date]: allFull ? "full" : "available",
          }));
        } else {
          setDateStatusMap((prev) => ({
            ...prev,
            [date]: "unreleased",
          }));
        }
      })
      .catch((err) => {
        console.error(err);
        setSlots([]);
        setFilteredSlots([]);
      });
  };

  const handleDateClick = (dateStr) => {
    const status = dateStatusMap[dateStr];
    if (status !== "available") return;

    setSelectedDate(dateStr);
    setSelectedSlot(null);
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
        amount: selectedSlot.price,
      });

      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Workspace Booking",
        description: "Slot Booking Payment",
        order_id: order.id,
        method: {
          netbanking: true,
          card: false,
          upi: false,
          wallet: false,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using Netbanking",
                instruments: [{ method: "netbanking" }],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          try {
            const verify = await axiosInstance.post("payment/verify/", response);

            if (verify.data.status === "success") {
              await axiosInstance.post("cart/create/", {
                slot_id: selectedSlot.id,
                payment_id: response.razorpay_payment_id,
              });

              alert("Booking Confirmed 🎉");
              setShowBookingModal(false);
              fetchSlots(selectedWorkspace.id, selectedDate);
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.log(err);
            alert("Booking failed after payment");
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed. Try again.");
        setBookingLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.log(error);
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

  const prevCard = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? filteredData.length - 1 : prev - 1
    );
  };

  const nextCard = () => {
    setCarouselIndex((prev) =>
      prev === filteredData.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? nextCard() : prevCard();
    }
    touchStartX.current = null;
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
            const dateObj = new Date(year, month, day);
            const isPast = dateObj < today;
            const status = dateStatusMap[dateStr];
            const isSelected = selectedDate === dateStr;

            let cellClass = styles.calDay;
            if (isPast) cellClass += ` ${styles.calDayPast}`;
            else if (status === "full") cellClass += ` ${styles.calDayFull}`;
            else if (status === "available") cellClass += ` ${styles.calDayAvailable}`;
            else cellClass += ` ${styles.calDayUnreleased}`;

            if (isSelected) cellClass += ` ${styles.calDaySelected}`;

            const isClickable = !isPast && status === "available";

            return (
              <button
                key={idx}
                type="button"
                className={cellClass}
                onClick={() => isClickable && handleDateClick(dateStr)}
                disabled={!isClickable}
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

    const m1 = { year: base.getFullYear(), month: base.getMonth() };
    const m2Date = new Date(base.getFullYear(), base.getMonth() + 1, 1);
    const m3Date = new Date(base.getFullYear(), base.getMonth() + 2, 1);

    const m2 = { year: m2Date.getFullYear(), month: m2Date.getMonth() };
    const m3 = { year: m3Date.getFullYear(), month: m3Date.getMonth() };

    return [m1, m2, m3];
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

  const currentCard = filteredData[carouselIndex];
  const visibleMonths = getVisibleMonths();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.topBarSearch}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </span>

              <input
                type="text"
                placeholder="Search workspace, area, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />

              {search && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.pill}>
            <span className={styles.dot}></span>
            Premium Hyderabad Workspaces
          </div>
          <h1 className={styles.title}>
            Find Your Perfect <em>Workspace</em>
          </h1>
          <p className={styles.sub}>
            Discover premium coworking spaces across Hyderabad with elegant
            interiors, curated amenities, and flexible daily access.
          </p>
        </div>

        <div className={styles.strip}>
          <div className={styles.stripItem}>
            <span
              className={styles.stripDot}
              style={{ "--c": "#19b67c" }}
            ></span>
            Verified locations
          </div>
          <div className={styles.stripDivider}></div>
          <div className={styles.stripItem}>
            <span
              className={styles.stripDot}
              style={{ "--c": "#e6bf62" }}
            ></span>
            Flexible booking
          </div>
          <div className={styles.stripDivider}></div>
          <div className={styles.stripItem}>
            <span
              className={styles.stripDot}
              style={{ "--c": "#2563eb" }}
            ></span>
            Prime city access
          </div>
        </div>

        <div className={styles.grid}>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div
                key={item.id}
                className={styles.card}
                style={{ "--delay": `${index * 60}ms` }}
              >
                <div className={styles.cardGlow}></div>

                <div className={styles.imgWrap}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.img}
                  />
                  <div className={styles.imgOverlay}></div>
                  <span className={styles.dayBadge}>Open Daily</span>
                  <span className={styles.ratingBadge}>★ 4.8</span>
                </div>

                <div className={styles.body}>
                  <h3 className={styles.cardName}>{item.name}</h3>

                  <div className={styles.cardLoc}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {item.location}, {item.area}
                  </div>

                  <p className={styles.cardMeta}>
                    Elegant workspace with modern ambiance, fast connectivity,
                    and essential professional amenities.
                  </p>

                  <div className={styles.pills}>
                    <span className={styles.amenPill}>Wi-Fi</span>
                    <span className={styles.amenPill}>Coffee</span>
                    <span className={styles.amenPill}>AC</span>
                  </div>

                  <div className={styles.footer}>
                    <div className={styles.price}>
                      <span className={styles.priceNum}>₹{item.price || 499}</span>
                      <span className={styles.pricePer}>/day</span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() => handleKnowMore(item)}
                      >
                        Know More
                      </button>
                      <button
                        type="button"
                        className={styles.btnCart}
                        onClick={() => handleBookNow(item)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <span>🔍</span>
              <p>No workspaces found for your search.</p>
            </div>
          )}
        </div>

        {filteredData.length > 0 && currentCard && (
          <div
            className={styles.carousel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={`${styles.card} ${styles.carouselCard}`}>
              <div className={styles.cardGlow}></div>

              <div className={styles.imgWrap}>
                <img
                  src={currentCard.image}
                  alt={currentCard.name}
                  className={styles.img}
                />
                <div className={styles.imgOverlay}></div>
                <span className={styles.dayBadge}>Open Daily</span>
                <span className={styles.ratingBadge}>★ 4.8</span>
              </div>

              <div className={styles.body}>
                <h3 className={styles.cardName}>{currentCard.name}</h3>

                <div className={styles.cardLoc}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {currentCard.location}, {currentCard.area}
                </div>

                <p className={styles.cardMeta}>
                  Elegant workspace with modern ambiance, fast connectivity,
                  and essential professional amenities.
                </p>

                <div className={styles.pills}>
                  <span className={styles.amenPill}>Wi-Fi</span>
                  <span className={styles.amenPill}>Coffee</span>
                  <span className={styles.amenPill}>AC</span>
                </div>

                <div className={styles.footer}>
                  <div className={styles.price}>
                    <span className={styles.priceNum}>₹{currentCard.price || 499}</span>
                    <span className={styles.pricePer}>/day</span>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() => handleKnowMore(currentCard)}
                    >
                      Know More
                    </button>
                    <button
                      type="button"
                      className={styles.btnCart}
                      onClick={() => handleBookNow(currentCard)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.carouselControls}>
              <div className={styles.carouselDots}>
                {filteredData.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.carouselDot} ${
                      i === carouselIndex ? styles.carouselDotActive : ""
                    }`}
                    onClick={() => setCarouselIndex(i)}
                  ></button>
                ))}
              </div>

              <div className={styles.carouselRight}>
                <button
                  type="button"
                  className={styles.carouselBtn}
                  onClick={prevCard}
                >
                  ‹
                </button>
                <span className={styles.carouselCounter}>
                  {carouselIndex + 1}/{filteredData.length}
                </span>
                <button
                  type="button"
                  className={styles.carouselBtn}
                  onClick={nextCard}
                >
                  ›
                </button>
              </div>
            </div>
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
                  <span>{selectedWorkspace.location}</span>
                </div>
              </div>
            </div>

            <div className={styles.mTabs}>
              <button
                className={`${styles.mTab} ${
                  activeTab === "overview" ? styles.mTabActive : ""
                }`}
                onClick={() => setActiveTab("overview")}
                type="button"
              >
                Overview
              </button>
              <button
                className={`${styles.mTab} ${
                  activeTab === "pricing" ? styles.mTabActive : ""
                }`}
                onClick={() => setActiveTab("pricing")}
                type="button"
              >
                Pricing
              </button>
              <button
                className={`${styles.mTab} ${
                  activeTab === "location" ? styles.mTabActive : ""
                }`}
                onClick={() => setActiveTab("location")}
                type="button"
              >
                Location
              </button>
            </div>

            <div className={styles.mBody}>
              {activeTab === "overview" && (
                <div className={styles.mContent}>
                  <div className={styles.statsRow}>
                    <div className={styles.statBox}>
                      <span className={styles.statEmoji}>🪑</span>
                      <span className={styles.statVal}>24</span>
                      <span className={styles.statLbl}>Seats</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statEmoji}>📶</span>
                      <span className={styles.statVal}>1 Gbps</span>
                      <span className={styles.statLbl}>Internet</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statEmoji}>☕</span>
                      <span className={styles.statVal}>Free</span>
                      <span className={styles.statLbl}>Coffee</span>
                    </div>
                    <div className={styles.statBox}>
                      <span className={styles.statEmoji}>🚗</span>
                      <span className={styles.statVal}>Yes</span>
                      <span className={styles.statLbl}>Parking</span>
                    </div>
                  </div>

                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>About</h3>
                    <p className={styles.mSectionText}>
                      A premium Hyderabad workspace crafted for focus, comfort,
                      and productive daily work. Ideal for freelancers, remote
                      teams, and professionals who need a polished environment.
                    </p>
                  </div>

                  <div className={styles.mSection}>
                    <h3 className={styles.mSectionTitle}>Amenities</h3>
                    <div className={styles.amenGrid}>
                      <div className={styles.amenCard}>
                        <span className={styles.amenEmoji}>📶</span>
                        <div>
                          <div className={styles.amenName}>High-Speed Wi-Fi</div>
                          <div className={styles.amenDesc}>Fast and reliable connectivity</div>
                        </div>
                      </div>

                      <div className={styles.amenCard}>
                        <span className={styles.amenEmoji}>☕</span>
                        <div>
                          <div className={styles.amenName}>Coffee & Tea</div>
                          <div className={styles.amenDesc}>Refreshments included</div>
                        </div>
                      </div>

                      <div className={styles.amenCard}>
                        <span className={styles.amenEmoji}>❄️</span>
                        <div>
                          <div className={styles.amenName}>Air Conditioning</div>
                          <div className={styles.amenDesc}>Comfortable climate all day</div>
                        </div>
                      </div>

                      <div className={styles.amenCard}>
                        <span className={styles.amenEmoji}>🔌</span>
                        <div>
                          <div className={styles.amenName}>Power Backup</div>
                          <div className={styles.amenDesc}>Uninterrupted work sessions</div>
                        </div>
                      </div>
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
                    <div className={styles.includeRow}>
                      <span className={styles.check}>✓</span>
                      Workspace seat access
                    </div>
                    <div className={styles.includeRow}>
                      <span className={styles.check}>✓</span>
                      High-speed Wi-Fi
                    </div>
                    <div className={styles.includeRow}>
                      <span className={styles.check}>✓</span>
                      Complimentary tea / coffee
                    </div>
                    <div className={styles.includeRow}>
                      <span className={styles.check}>✓</span>
                      Air-conditioned seating
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className={styles.mContent}>
                  <div className={styles.locGrid}>
                    <div className={styles.locRow}>
                      <span className={styles.locLbl}>Area</span>
                      <span className={styles.locVal}>{selectedWorkspace.area}</span>
                    </div>
                    <div className={styles.locRow}>
                      <span className={styles.locLbl}>City</span>
                      <span className={styles.locVal}>{selectedWorkspace.city}</span>
                    </div>
                    <div className={styles.locRow}>
                      <span className={styles.locLbl}>Address</span>
                      <span className={styles.locVal}>{selectedWorkspace.location}</span>
                    </div>
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
                  onClick={() =>
                    setCalMonthOffset((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={calMonthOffset === 0}
                >
                  Prev
                </button>

                <button
                  type="button"
                  className={styles.calNavBtn}
                  onClick={() => setCalMonthOffset((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>

              <div className={styles.calMonthsRow}>
                {visibleMonths.map((m) => renderCalendarMonth(m.year, m.month))}
              </div>

              <div className={styles.calLegend}>
                <div className={styles.calLegendItem}>
                  <span className={`${styles.calLegendDot} ${styles.calLegendGreen}`}></span>
                  Available
                </div>
                <div className={styles.calLegendItem}>
                  <span className={`${styles.calLegendDot} ${styles.calLegendGray}`}></span>
                  Full
                </div>
                <div className={styles.calLegendItem}>
                  <span className={`${styles.calLegendDot} ${styles.calLegendBlue}`}></span>
                  Not released
                </div>
                <div className={styles.calLegendItem}>
                  <span className={`${styles.calLegendDot} ${styles.calLegendRed}`}></span>
                  Past
                </div>
              </div>

              {selectedDate && (
                <div className={styles.slotSection}>
                  <div className={styles.slotSectionHead}>
                    <h3 className={styles.slotSectionTitle}>Available slots</h3>
                    <p className={styles.calSelectedDateLabel}>
                      Selected date: <strong>{selectedDate}</strong>
                    </p>
                  </div>

                  <div className={styles.slotSearchWrap}>
                    <span className={styles.slotSearchIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
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
                        {filteredSlots.map((slot) => {
                          const slotClass = `${styles.slotCard} ${
                            slot.is_full
                              ? styles.slotFull
                              : selectedSlot?.id === slot.id
                              ? styles.slotSelected
                              : styles.slotAvailable
                          }`;

                          return (
                            <button
                              type="button"
                              key={slot.id}
                              className={slotClass}
                              disabled={slot.is_full}
                              onClick={() => !slot.is_full && setSelectedSlot(slot)}
                            >
                              <span className={styles.slotTime}>
                                {slot.slot_type === "day"
                                  ? "Full Day"
                                  : `${slot.start_time} - ${slot.end_time}`}
                              </span>

                              <span className={styles.slotMeta}>
                                ₹{slot.price} · {slot.booked}/{slot.capacity} booked
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles.bookingBtn}
                disabled={!selectedSlot || bookingLoading}
                onClick={handleConfirmBooking}
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/HyderabadWorkspaces.module.css";

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

  const handleAddToCart = (workspaceId) => {
    axiosInstance
      .post("cart/add/", { workspace_id: workspaceId, duration: 1 })
      .then(() => alert("Added to cart — book within one day."))
      .catch(() => {
        alert("Please login first 🔒");
        navigate("/auth?type=user");
      });
  };

  const handleBookNow = (item) => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login first to continue 🔒");
      navigate("/auth?type=user");
      return;
    }
    handleAddToCart(item.id);
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
    setCarouselIndex((prev) => (prev === 0 ? filteredData.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setCarouselIndex((prev) => (prev === filteredData.length - 1 ? 0 : prev + 1));
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Top Bar ── */}
        <div className={styles.topBar}>
          <div className={styles.topBarSpacer}></div>
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
                <button className={styles.clearBtn} onClick={() => setSearch("")}>×</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div className={styles.headerCenter}>
          <div className={styles.pill}>
            <span className={styles.dot}></span>
            Hyderabad Exclusive
          </div>
          <h1 className={styles.title}>
            Premium <em>1-Day Workspaces</em>
          </h1>
          <p className={styles.sub}>
            Book elegant coworking spaces across Hyderabad with a premium one-day experience for focused work, meetings and productivity.
          </p>
        </div>

        {/* ── Strip ── */}
        <div className={styles.strip}>
          <div className={styles.stripItem}>
            <span className={styles.stripDot} style={{ "--c": "#c9972c" }}></span>
            Excellent curated spaces
          </div>
          <div className={styles.stripDivider}></div>
          <div className={styles.stripItem}>
            <span className={styles.stripDot} style={{ "--c": "#0ea572" }}></span>
            Fast one-day booking
          </div>
          <div className={styles.stripDivider}></div>
          <div className={styles.stripItem}>
            <span className={styles.stripDot} style={{ "--c": "#2563eb" }}></span>
            Premium Hyderabad locations
          </div>
        </div>

        {/* ── DESKTOP GRID ── */}
        <div className={styles.grid}>
          {filteredData.length > 0 ? (
            filteredData.map((item, idx) => (
              <div key={item.id} className={styles.card} style={{ "--delay": `${idx * 70}ms` }}>
                <div className={styles.cardGlow}></div>
                <div className={styles.imgWrap}>
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900"}
                    alt={item.name}
                    className={styles.img}
                  />
                  <div className={styles.imgOverlay}></div>
                  <span className={styles.dayBadge}>1 Day</span>
                  <span className={styles.ratingBadge}>★ {item.rating || 4.8}</span>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.cardName}>{item.name}</h3>
                  <p className={styles.cardLoc}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                    </svg>
                    {item.location}, {item.area}
                  </p>
                  <p className={styles.cardMeta}>{item.city} · Premium workspace · Instant day pass</p>
                  <div className={styles.pills}>
                    <span className={styles.amenPill}>WiFi</span>
                    <span className={styles.amenPill}>AC</span>
                    <span className={styles.amenPill}>Backup</span>
                    <span className={styles.amenPill}>Meeting</span>
                  </div>
                  <div className={styles.footer}>
                    <div className={styles.price}>
                      <span className={styles.priceNum}>₹{item.price}</span>
                      <span className={styles.pricePer}>/day</span>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.btnGhost} onClick={() => handleKnowMore(item)}>Know More</button>
                      <button className={styles.btnCart} onClick={() => handleBookNow(item)}>Add</button>
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

        {/* ── MOBILE CAROUSEL ── */}
        <div className={styles.carousel}>
          {filteredData.length > 0 && currentCard ? (
            <>
              {/* Full-width card with swipe support */}
              <div
                className={`${styles.card} ${styles.carouselCard}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                key={currentCard.id}
              >
                <div className={styles.cardGlow}></div>
                <div className={styles.imgWrap}>
                  <img
                    src={currentCard.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900"}
                    alt={currentCard.name}
                    className={styles.img}
                  />
                  <div className={styles.imgOverlay}></div>
                  <span className={styles.dayBadge}>1 Day</span>
                  <span className={styles.ratingBadge}>★ {currentCard.rating || 4.8}</span>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.cardName}>{currentCard.name}</h3>
                  <p className={styles.cardLoc}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                    </svg>
                    {currentCard.location}, {currentCard.area}
                  </p>
                  <p className={styles.cardMeta}>{currentCard.city} · Premium workspace · Instant day pass</p>
                  <div className={styles.pills}>
                    <span className={styles.amenPill}>WiFi</span>
                    <span className={styles.amenPill}>AC</span>
                    <span className={styles.amenPill}>Backup</span>
                    <span className={styles.amenPill}>Meeting</span>
                  </div>
                  <div className={styles.footer}>
                    <div className={styles.price}>
                      <span className={styles.priceNum}>₹{currentCard.price}</span>
                      <span className={styles.pricePer}>/day</span>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.btnGhost} onClick={() => handleKnowMore(currentCard)}>Know More</button>
                      <button className={styles.btnCart} onClick={() => handleBookNow(currentCard)}>Add</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls row: dots LEFT · counter + ‹ › RIGHT */}
              <div className={styles.carouselControls}>
                <div className={styles.carouselDots}>
                  {filteredData.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.carouselDot} ${i === carouselIndex ? styles.carouselDotActive : ""}`}
                      onClick={() => setCarouselIndex(i)}
                      aria-label={`Go to workspace ${i + 1}`}
                    />
                  ))}
                </div>
                <div className={styles.carouselRight}>
                  <span className={styles.carouselCounter}>{carouselIndex + 1} / {filteredData.length}</span>
                  <button className={styles.carouselBtn} onClick={prevCard} aria-label="Previous">‹</button>
                  <button className={styles.carouselBtn} onClick={nextCard} aria-label="Next">›</button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <span>🔍</span>
              <p>No workspaces found for your search.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL ── */}
      {showModal && selectedWorkspace && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mHero}>
              <img
                src={selectedWorkspace.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200"}
                alt={selectedWorkspace.name}
                className={styles.mHeroImg}
              />
              <div className={styles.mHeroGrad}></div>
              <button className={styles.mClose} onClick={closeModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className={styles.mHeroBadges}>
                <span className={styles.mBDay}>1 Day</span>
                <span className={styles.mBRating}>★ {selectedWorkspace.rating || 4.8}</span>
              </div>
              <div className={styles.mHeroInfo}>
                <h2 className={styles.mTitle}>{selectedWorkspace.name}</h2>
                <p className={styles.mSub}>{selectedWorkspace.location}, {selectedWorkspace.city}</p>
              </div>
            </div>

            <div className={styles.mTabs}>
              {["overview", "amenities", "pricing", "map"].map((tab) => (
                <button
                  key={tab}
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
                    <div className={styles.statBox}><span className={styles.statEmoji}>⚡</span><span className={styles.statVal}>1 Gbps</span><span className={styles.statLbl}>WiFi</span></div>
                    <div className={styles.statBox}><span className={styles.statEmoji}>🕐</span><span className={styles.statVal}>24/7</span><span className={styles.statLbl}>Access</span></div>
                    <div className={styles.statBox}><span className={styles.statEmoji}>🪑</span><span className={styles.statVal}>50+</span><span className={styles.statLbl}>Seats</span></div>
                    <div className={styles.statBox}><span className={styles.statEmoji}>🏆</span><span className={styles.statVal}>{selectedWorkspace.rating || 4.8}</span><span className={styles.statLbl}>Rating</span></div>
                  </div>
                  <div className={styles.mSection}>
                    <h4 className={styles.mSectionTitle}>About this space</h4>
                    <p className={styles.mSectionText}>A premium Hyderabad coworking space made for one-day productivity, startup work, remote work, meetings and a clean professional experience.</p>
                  </div>
                  <div className={styles.mSection}>
                    <h4 className={styles.mSectionTitle}>Location details</h4>
                    <div className={styles.locGrid}>
                      <div className={styles.locRow}><span className={styles.locLbl}>Address</span><span className={styles.locVal}>{selectedWorkspace.location}</span></div>
                      <div className={styles.locRow}><span className={styles.locLbl}>City</span><span className={styles.locVal}>{selectedWorkspace.city}</span></div>
                      <div className={styles.locRow}><span className={styles.locLbl}>Area</span><span className={styles.locVal}>{selectedWorkspace.area}</span></div>
                      <div className={styles.locRow}><span className={styles.locLbl}>Region</span><span className={styles.locVal}>Hyderabad, Telangana</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "amenities" && (
                <div className={styles.mContent}>
                  <div className={styles.amenGrid}>
                    {[["⚡","1Gbps Fiber WiFi","Fast internet"],["🤝","Meeting Rooms","Professional discussions"],["🕐","24/7 Access","Flexible timing"],["🔋","Power Backup","Continuous work"],["☕","Cafeteria","Tea & coffee"],["🅿️","Parking","2W & 4W slots"],["🖨️","Printer","Fast printing"],["❄️","AC Workspace","Cool comfort"]].map(([emoji, name, desc]) => (
                      <div className={styles.amenCard} key={name}>
                        <span className={styles.amenEmoji}>{emoji}</span>
                        <div><p className={styles.amenName}>{name}</p><p className={styles.amenDesc}>{desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className={styles.mContent}>
                  <div className={styles.pricingHero}>
                    <span className={styles.pricingTag}>1 Day Plan</span>
                    <div className={styles.pricingAmt}>
                      <span className={styles.pricingCur}>₹</span>
                      <span className={styles.pricingNum}>{selectedWorkspace.price}</span>
                      <span className={styles.pricingUnit}>/day</span>
                    </div>
                    <p className={styles.pricingNote}>All taxes included · No hidden charges</p>
                  </div>
                  <div className={styles.mSection}>
                    <h4 className={styles.mSectionTitle}>What's included</h4>
                    <div className={styles.includeList}>
                      {["Full-day hot desk access","Unlimited WiFi","Meeting room usage","Tea & coffee","Printing support","Power backup & AC"].map((item) => (
                        <div className={styles.includeRow} key={item}><span className={styles.check}>✓</span><span>{item}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "map" && (
                <div className={styles.mContent}>
                  <div className={styles.mapCard}>
                    <div className={styles.mapPin}>📍</div>
                    <h4 className={styles.mapName}>{selectedWorkspace.name}</h4>
                    <p className={styles.mapAddr}>{selectedWorkspace.location}, {selectedWorkspace.city}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedWorkspace.location} ${selectedWorkspace.city} Hyderabad`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapBtn}
                    >
                      Open in Google Maps
                    </a>
                  </div>
                  <div className={styles.mSection}>
                    <h4 className={styles.mSectionTitle}>Nearby landmarks</h4>
                    {[["🚇","Metro Station","0.4 km"],["🍽️","Restaurants","0.2 km"],["🏦","ATM / Bank","0.1 km"],["🛒","Supermarket","0.6 km"]].map(([icon, name, dist]) => (
                      <div className={styles.nearRow} key={name}><span>{icon}</span><span className={styles.nearName}>{name}</span><span className={styles.nearDist}>{dist}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.mFooter}>
              <div className={styles.mFooterPrice}>
                <span className={styles.mFooterNum}>₹{selectedWorkspace.price}</span>
                <span className={styles.mFooterUnit}>/day</span>
              </div>
              <button
                className={styles.mFooterBtn}
                onClick={() => { closeModal(); handleBookNow(selectedWorkspace); }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;

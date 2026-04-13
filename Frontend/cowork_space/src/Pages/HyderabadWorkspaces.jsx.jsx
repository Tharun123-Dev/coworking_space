import SearchBar from "../Components/SearchBar";
import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/HyderabadWorkspaces.module.css";
import Reveal from "../Pages/Reveal";
import { useNavigate } from "react-router-dom";

function HyderabadWorkspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axiosInstance.get("workspaces/")
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

  const handleAddToCart = (workspaceId) => {
    axiosInstance.post("cart/add/", { workspace_id: workspaceId, duration: 1 })
      .then(() => alert("Added to cart ✅"))
      .catch(() => {
        alert("Please login first 🔒");
        navigate("/auth?type=user");
      });
  };

  const handleSearch = (city, query) => {
    let data = workspaces;
    if (city) data = data.filter(item => item.city.toLowerCase().includes(city.toLowerCase()));
    if (query) data = data.filter(item => item.location.toLowerCase().includes(query.toLowerCase()));
    setFilteredData(data);
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
    setShowInfo(true);
  };

  const handleViewDetails = (item) => {
    setSelectedWorkspace(item);
    setActiveTab("overview");
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingRing}>
          <div></div><div></div><div></div><div></div>
        </div>
        <h1>Discovering Hyderabad's Premium Spaces...</h1>
        <p>Curating the finest coworking experiences</p>
      </div>
    );
  }

  return (
    <div className={styles.workspacesPage}>
      <section className={styles.workspacesSection} id="hyd">
        <div className={styles.container}>

          <Reveal>
            <div className={styles.heroHead}>
              <span className={styles.heroEyebrow}>
                <span className={styles.eyebrowDot}></span>
                Hyderabad Exclusive
              </span>
              <h2 className={styles.sectionTitle}>
                Premium <em>Workspaces</em>
              </h2>
              <p className={styles.sectionDesc}>
                25+ handpicked coworking spaces across Gachibowli, Hitec City, Banjara Hills &amp; more
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className={styles.bookingBanner}>
              <div className={styles.bannerItem}>
                <div className={`${styles.bannerIconWrap} ${styles.bannerIconDay}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p className={styles.bannerLabel}>Booking Type</p>
                  <p className={styles.bannerVal}>1-Day Only</p>
                </div>
              </div>
              <div className={styles.bannerSep}></div>
              <div className={styles.bannerItem}>
                <div className={`${styles.bannerIconWrap} ${styles.bannerIconLoc}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div>
                  <p className={styles.bannerLabel}>Coverage</p>
                  <p className={styles.bannerVal}>Hyderabad Only</p>
                </div>
              </div>
              <div className={styles.bannerSep}></div>
              <div className={styles.bannerItem}>
                <div className={`${styles.bannerIconWrap} ${styles.bannerIconCart}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </div>
                <div>
                  <p className={styles.bannerLabel}>Checkout</p>
                  <p className={styles.bannerVal}>Multi-space Cart</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className={styles.grid}>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <div key={item.id} className={styles.card} style={{ animationDelay: `${idx * 60}ms` }}>

                  <div className={styles.cardBadges}>
                    <span className={styles.badge1Day}>📅 1 Day</span>
                    <span className={styles.badgeHyd}>📍 Hyd</span>
                  </div>

                  <div className={styles.cardImageContainer}>
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400"}
                      alt={item.name}
                      className={styles.cardImage}
                    />
                    <div className={styles.rating}>
                      ★ {item.rating || 4.8}
                      <span className={styles.ratingCount}>({item.reviews || 120}+)</span>
                    </div>
                    <div className={styles.imageOverlay} onClick={() => handleViewDetails(item)}>
                      <div className={styles.overlayContent}>
                        <div className={styles.overlayEyeIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                        <span className={styles.overlayText}>View Details</span>
                        <span className={styles.overlayArrow}>→</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <p className={styles.cardLocation}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#9ca3af"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      {item.location}
                    </p>
                    <p className={styles.cardCity}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      {item.city} · {item.area}
                    </p>

                    <div className={styles.amenities}>
                      {["1Gbps WiFi", "24/7", "AC", "Backup", "Parking"].map(a => (
                        <span key={a}>{a}</span>
                      ))}
                    </div>

                    <div className={styles.cardPriceRow}>
                      <div className={styles.cardPrice}>
                        <span className={styles.price}>₹{item.price}</span>
                        <span className={styles.duration}>/day</span>
                      </div>
                      <span className={styles.oneDayTag}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        1-Day
                      </span>
                    </div>

                    <div className={styles.cartInfoRow}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      <span>Added to your Hyderabad cart</span>
                    </div>

                    <div className={styles.cardActions}>
                      {/* <button className={styles.btnDetails} onClick={() => handleViewDetails(item)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View Details
                      </button> */}
                      <button className={styles.btnKnow} onClick={() => handleKnowMore(item)}>
                        Know More
                      </button>
                      <button className={styles.btnPrimary} onClick={(e) => { e.stopPropagation(); handleBookNow(item); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>
                <div className={styles.noDataIcon}>🔍</div>
                <h2 className={styles.bufferWord}>
                  Searching Hyderabad Spaces
                  <span className={styles.loadingDots}></span>
                </h2>
                <p className={styles.bufferText}>Finding best matches in Gachibowli, Hitec City...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════ VIEW DETAILS PANEL ══════ */}
      {showDetails && selectedWorkspace && (
        <div className={styles.detailsOverlay} onClick={() => setShowDetails(false)}>
          <div className={styles.detailsPanel} onClick={(e) => e.stopPropagation()}>

            <div className={styles.detailsHero}>
              <img
                src={selectedWorkspace.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"}
                alt={selectedWorkspace.name}
                className={styles.detailsHeroImg}
              />
              <div className={styles.detailsHeroGrad}></div>
              <button className={styles.detailsClose} onClick={() => setShowDetails(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className={styles.detailsHeroBadges}>
                <span className={styles.dhBadgeDay}>📅 1-Day Booking</span>
                <span className={styles.dhBadgeHyd}>📍 Hyderabad</span>
                <span className={styles.dhBadgeRating}>★ {selectedWorkspace.rating || 4.8}</span>
              </div>
              <div className={styles.detailsHeroInfo}>
                <h2 className={styles.detailsTitle}>{selectedWorkspace.name}</h2>
                <p className={styles.detailsSubtitle}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  {selectedWorkspace.location}, {selectedWorkspace.city}
                </p>
              </div>
            </div>

            <div className={styles.detailsTabs}>
              {["overview", "amenities", "pricing", "map"].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.detailsBody}>
              {activeTab === "overview" && (
                <div className={styles.tabContent}>
                  <div className={styles.statsGrid}>
                    {[
                      { icon: "⚡", val: "1 Gbps", lbl: "WiFi Speed" },
                      { icon: "🕐", val: "24/7", lbl: "Access" },
                      { icon: "🪑", val: "50+", lbl: "Seats" },
                      { icon: "🏆", val: selectedWorkspace.rating || 4.8, lbl: "Rating" },
                    ].map(s => (
                      <div key={s.lbl} className={styles.statCard}>
                        <span className={styles.statIcon}>{s.icon}</span>
                        <span className={styles.statVal}>{s.val}</span>
                        <span className={styles.statLbl}>{s.lbl}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.detailsSection}>
                    <h4 className={styles.detailsSectionTitle}>About This Space</h4>
                    <p className={styles.detailsDesc}>
                      A premium Hyderabad coworking experience designed for productivity and growth.
                      Located in the heart of {selectedWorkspace.city}, this space offers ergonomic workstations,
                      blazing-fast 1Gbps fiber internet, fully equipped meeting rooms, and a vibrant professional community.
                      Perfect for startups, remote teams, and freelancers seeking an inspiring work environment.
                    </p>
                  </div>
                  <div className={styles.detailsSection}>
                    <h4 className={styles.detailsSectionTitle}>Location Details</h4>
                    <div className={styles.locationCard}>
                      {[
                        ["Address", selectedWorkspace.location],
                        ["City", selectedWorkspace.city],
                        ["Area", selectedWorkspace.area],
                        ["Region", "Hyderabad, Telangana"],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className={styles.locationRow}>
                          <span className={styles.locationLbl}>{lbl}</span>
                          <span className={styles.locationVal}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "amenities" && (
                <div className={styles.tabContent}>
                  <div className={styles.amenitiesGrid}>
                    {[
                      { icon: "⚡", label: "1Gbps Fiber WiFi", desc: "Lightning-fast connectivity" },
                      { icon: "🤝", label: "Meeting Rooms", desc: "Free for all members" },
                      { icon: "🕐", label: "24/7 Access", desc: "Round the clock entry" },
                      { icon: "🔋", label: "Power Backup", desc: "100% uptime guaranteed" },
                      { icon: "☕", label: "Cafeteria", desc: "Tea, coffee & snacks" },
                      { icon: "🖨️", label: "Printer & Scanner", desc: "High-speed machines" },
                      { icon: "🅿️", label: "Free Parking", desc: "Dedicated 2W & 4W" },
                      { icon: "❄️", label: "AC Workspace", desc: "Temperature controlled" },
                      { icon: "🔐", label: "Secure Locker", desc: "Personal storage space" },
                      { icon: "📞", label: "Phone Booths", desc: "Private call pods" },
                      { icon: "🎮", label: "Breakout Zone", desc: "Chill & recharge" },
                      { icon: "🌐", label: "VPN Ready", desc: "Secure network access" },
                    ].map((a) => (
                      <div key={a.label} className={styles.amenityCard}>
                        <span className={styles.amenityEmoji}>{a.icon}</span>
                        <div>
                          <p className={styles.amenityLabel}>{a.label}</p>
                          <p className={styles.amenityDesc}>{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className={styles.tabContent}>
                  <div className={styles.pricingHero}>
                    <div className={styles.pricingBadge}>1-Day Plan</div>
                    <div className={styles.pricingAmount}>
                      <span className={styles.pricingCurrency}>₹</span>
                      <span className={styles.pricingNum}>{selectedWorkspace.price}</span>
                      <span className={styles.pricingPer}>/day</span>
                    </div>
                    <p className={styles.pricingNote}>All taxes included · No hidden charges</p>
                  </div>
                  <div className={styles.pricingIncludes}>
                    <h4 className={styles.detailsSectionTitle}>What's Included</h4>
                    {[
                      "Full-day hot desk access (9AM – 9PM)",
                      "Unlimited high-speed WiFi",
                      "1 meeting room slot (2 hrs)",
                      "Unlimited tea & coffee",
                      "Printing (up to 10 pages)",
                      "Free secure parking",
                      "Access to all common areas",
                      "Power backup & AC throughout",
                    ].map(item => (
                      <div key={item} className={styles.includeRow}>
                        <span className={styles.includeCheck}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.pricingCartBox}>
                    <span className={styles.pricingCartIcon}>🛒</span>
                    <div>
                      <p className={styles.pricingCartTitle}>Added to Hyderabad Cart</p>
                      <p className={styles.pricingCartSub}>Book multiple spaces in one checkout</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "map" && (
                <div className={styles.tabContent}>
                  <div className={styles.mapPlaceholder}>
                    <div className={styles.mapPin}>📍</div>
                    <h4>{selectedWorkspace.name}</h4>
                    <p>{selectedWorkspace.location}, {selectedWorkspace.city}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedWorkspace.location + " " + selectedWorkspace.city + " Hyderabad")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapLink}
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                  <div className={styles.nearbySection}>
                    <h4 className={styles.detailsSectionTitle}>Nearby Landmarks</h4>
                    {[
                      { icon: "🚇", label: "Metro Station", dist: "0.4 km" },
                      { icon: "🍽️", label: "Restaurants", dist: "0.2 km" },
                      { icon: "🏦", label: "ATM / Bank", dist: "0.1 km" },
                      { icon: "🛒", label: "Supermarket", dist: "0.6 km" },
                    ].map(n => (
                      <div key={n.label} className={styles.nearbyRow}>
                        <span>{n.icon}</span>
                        <span className={styles.nearbyLabel}>{n.label}</span>
                        <span className={styles.nearbyDist}>{n.dist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.detailsFooter}>
              <div className={styles.detailsFooterPrice}>
                <span className={styles.footerPriceNum}>₹{selectedWorkspace.price}</span>
                <span className={styles.footerPricePer}>/day</span>
              </div>
              <button
                className={styles.detailsFooterBtn}
                onClick={() => { setShowDetails(false); handleBookNow(selectedWorkspace); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Hyderabad Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ KNOW MORE POPUP ══════ */}
      {showInfo && selectedWorkspace && (
        <div className={styles.popupOverlay} onClick={() => setShowInfo(false)}>
          <div className={styles.popupBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupImage}>
              <img
                src={selectedWorkspace.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600"}
                alt={selectedWorkspace.name}
              />
              <div className={styles.popupImageOverlay}></div>
              <h2 className={styles.popupImageTitle}>{selectedWorkspace.name}</h2>
              <div className={styles.popupBadges}>
                <span className={styles.popupBadge1Day}>📅 1 Day</span>
                <span className={styles.popupBadgeHyd}>📍 Hyderabad</span>
              </div>
            </div>

            <div className={styles.popupBody}>
              <button className={styles.backBtn} onClick={() => setShowInfo(false)}>
                ← Back to Hyderabad
              </button>
              <div className={styles.popupMeta}>
                <span>📍 {selectedWorkspace.location}</span>
                <span>🏙️ {selectedWorkspace.city}, {selectedWorkspace.area}</span>
                <span className={styles.popupPrice}>₹{selectedWorkspace.price}/day</span>
              </div>
              <div className={styles.popupBookingStrip}>
                <div className={styles.stripItem}>
                  <span className={styles.stripIcon}>🗓️</span>
                  <div>
                    <p className={styles.stripLabel}>Booking</p>
                    <p className={styles.stripValue}>1 Day Only</p>
                  </div>
                </div>
                <div className={styles.stripDivider}></div>
                <div className={styles.stripItem}>
                  <span className={styles.stripIcon}>📍</span>
                  <div>
                    <p className={styles.stripLabel}>Location</p>
                    <p className={styles.stripValue}>Hyderabad</p>
                  </div>
                </div>
                <div className={styles.stripDivider}></div>
                <div className={styles.stripItem}>
                  <span className={styles.stripIcon}>🛒</span>
                  <div>
                    <p className={styles.stripLabel}>Cart</p>
                    <p className={styles.stripValue}>Hyd Cart</p>
                  </div>
                </div>
              </div>
              <p className={styles.popupDesc}>
                Premium Hyderabad coworking space with high-speed WiFi, ergonomic seating,
                and 24/7 access. Perfect for startups, freelancers &amp; remote teams in {selectedWorkspace.city}.
              </p>
              <div className={styles.popupFeatures}>
                {["1Gbps Fiber WiFi", "Meeting Rooms (Free)", "24/7 Access", "Power Backup", "Cafeteria Access", "Printer/Scanner"].map(f => (
                  <div key={f} className={styles.feature}>✔ {f}</div>
                ))}
              </div>
              <div className={styles.popupActions}>
                <button
                  className={styles.popupDetailsBtn}
                  onClick={() => { setShowInfo(false); handleViewDetails(selectedWorkspace); }}
                >
                  View Full Details
                </button>
                <button
                  className={styles.popupBookBtn}
                  onClick={() => { setShowInfo(false); handleBookNow(selectedWorkspace); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Add to Cart — ₹{selectedWorkspace.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;

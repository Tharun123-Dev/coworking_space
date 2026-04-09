import SearchBar from "../Components/SearchBar";
import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/HyderabadWorkspaces.module.css";
import Reveal from "../Pages/Reveal";

function HyderabadWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Fetch workspaces
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
      .catch(() => alert("Please login first 🔒"));
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
    window.location.href = "/auth?type=user";
    return;
  }

  handleAddToCart(item.id);
};

  const handleKnowMore = (item) => {
    setSelectedWorkspace(item);
    setShowInfo(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingEpic}></div>
        <h1>Discovering Hyderabad's Premium Spaces...</h1>
      </div>
    );
  }

  return (
    <div className={styles.workspacesPage}>
      {/* ========== WORKSPACE CARDS ========== */}
      <section className={styles.workspacesSection} id="hyd">
        <div className={styles.container}>
          <Reveal>
            <h2 className={styles.sectionTitle}>
              Hyderabad's Premium Workspaces
              <span className={styles.sectionSubtitle}>25+ Locations</span>
            </h2>
          </Reveal>

          <div className={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className={styles.grid}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardImageContainer}>
                    <Reveal>
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400"}
                        alt={item.name}
                        className={styles.cardImage}
                      />
                    </Reveal>

                    <div className={styles.rating}>
                      ★ {item.rating || 4.8}
                      <span className={styles.ratingCount}>({item.reviews || 120}+)</span>
                    </div>

                    <div className={styles.imageOverlay}>
                      <span>View Details</span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <Reveal>
                      <h3 className={styles.cardTitle}>{item.name}</h3>
                    </Reveal>
                    <Reveal>
                      <p className={styles.cardLocation}>📍 {item.location}</p>
                    </Reveal>
                    <Reveal>
                      <p className={styles.cardCity}>🏙️ {item.city} | {item.area}</p>
                    </Reveal>

                    <div className={styles.amenities}>
                      <span>1Gbps WiFi</span>
                      <span>24/7 Access</span>
                      <span>AC</span>
                      <span>Power Backup</span>
                      <span>Parking</span>
                    </div>

                    <div className={styles.cardPrice}>
                      <span className={styles.price}>₹{item.price}</span>
                      <span className={styles.duration}>/day</span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.btnSecondary}
                        onClick={() => handleKnowMore(item)}
                      >
                        Know More
                      </button>
                      <button
                        className={styles.btnPrimary}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(item);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>
                <Reveal>
                  <h2 className={styles.bufferWord}>
                    Searching Hyderabad Spaces
                    <span className={styles.loadingDots}></span>
                  </h2>
                </Reveal>
                <p className={styles.bufferText}>Finding best matches in Gachibowli, Hitec City...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== KNOW MORE POPUP ========== */}
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
            </div>

            <div className={styles.popupBody}>
              <Reveal>
                <button className={styles.backBtn} onClick={() => setShowInfo(false)}>
                  ← Back to Hyderabad
                </button>
              </Reveal>

              <Reveal>
                <div className={styles.popupMeta}>
                  <span>📍 {selectedWorkspace.location}</span>
                  <span>🏙️ {selectedWorkspace.city}, {selectedWorkspace.area}</span>
                  <span className={styles.popupPrice}>₹{selectedWorkspace.price}/day</span>
                </div>
              </Reveal>

              <Reveal>
                <p className={styles.popupDesc}>
                  Premium Hyderabad coworking space with high-speed WiFi, ergonomic seating, 
                  and 24/7 access. Perfect for startups, freelancers & remote teams in {selectedWorkspace.city}.
                </p>
              </Reveal>

              <Reveal>
                <div className={styles.popupFeatures}>
                  <div className={styles.feature}>✔ 1Gbps Fiber WiFi</div>
                  <div className={styles.feature}>✔ Meeting Rooms (Free)</div>
                  <div className={styles.feature}>✔ 24/7 Access</div>
                  <div className={styles.feature}>✔ Power Backup</div>
                  <div className={styles.feature}>✔ Cafeteria Access</div>
                  <div className={styles.feature}>✔ Printer/Scanner</div>
                </div>
              </Reveal>

              <button
                className={styles.popupBookBtn}
                onClick={() => {
                  setShowInfo(false);
                  handleBookNow(selectedWorkspace);
                }}
              >
                Book Hyderabad Space →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HyderabadWorkspaces;
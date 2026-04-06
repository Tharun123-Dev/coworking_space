import SearchBar from "../Components/SearchBar";
import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";
import Reveal from "../Pages/Reveal";

function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeCount, setActiveCount] = useState({ spaces: 0, cities: 0, users: 0 });
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Name & Email required");
      return;
    }
    try {
      await axiosInstance.post("leads/add/", form);
      setFormSubmitted(true);
      setForm({ name: "", email: "", phone: "", city: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 4000);
    } catch (err) {
      if (err.response?.data?.email) {
        alert("Email already exists");
      } else {
        alert("Something went wrong");
      }
    }
  };

  // Animated counter - Hyderabad focused stats
  useEffect(() => {
    const targets = { spaces: 250, cities: 5, users: 15000 }; // Hyderabad-focused numbers
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setActiveCount({
        spaces: Math.floor(targets.spaces * progress),
        cities: Math.floor(targets.cities * progress),
        users: Math.floor(targets.users.toLocaleString() * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

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
      alert("Please login first 🔒");
      window.location.href = "/auth";
    } else {
      handleAddToCart(item.id);
    }
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
    <div className={styles.home}>

      {/* ========== HERO SECTION ========== */}
      <section className={styles.hero}>

        {/* YouTube Video Background */}
        <div className={styles.videoBg}>
          <iframe
            src="https://www.youtube.com/embed/IxRVa1DbSAg?autoplay=1&mute=1&loop=1&playlist=IxRVa1DbSAg&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
            title="Hyderabad Coworking Background"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className={styles.videoIframe}
          />
        </div>

        {/* Dark overlay */}
        <div className={styles.videoOverlay}></div>

        {/* 3D grid lines */}
        <div className={styles.gridLines}></div>

        {/* Hero content */}
        <div className={styles.heroContent}>

          {/* LEFT - Text + Stats */}
          <div className={styles.heroLeft}>
            <Reveal>
              <div className={styles.heroTag}>
                <span className={styles.tagPulse}></span>
                Hyderabad's #1 Coworking Platform
              </div>

              <h1 className={styles.heroTitle}>
                <span className={styles.goldLayer}>Explore Hyderabad's Finest</span>
                <span className={styles.glowLayer}>Coworking</span>
                <span className={styles.mainLayer}>Spaces</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Premium workspaces across Gachibowli, Hitec City, Madhapur & more.
                Flexible day passes, dedicated desks & private offices for startups & enterprises.
              </p>

              <div className={styles.heroDivider}></div>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{activeCount.spaces}+</span>
                  <span className={styles.statLabel}>Premium Spaces</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{activeCount.cities}+</span>
                  <span className={styles.statLabel}>Key Locations</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{Number(activeCount?.users || 200).toLocaleString()}+</span>
                  <span className={styles.statLabel}>Happy Members</span>
                </div>
              </div>

              <a href="#workspaces" className={styles.exploreBtn}>
                Explore Hyderabad Spaces
                <span className={styles.btnArrow}>→</span>
              </a>
            </Reveal>
          </div>

          {/* RIGHT - Get in Touch Form */}
          <Reveal>
            <div className={styles.formWrapper}>
              <button
                className={styles.formToggle}
                onClick={() => setFormOpen(!formOpen)}
              >
                {formOpen ? "✕ Close" : "📍 Hyderabad Offices"}
              </button>

              <div className={`${styles.heroForm} ${formOpen ? styles.formVisible : ""}`}>
                <div className={styles.formGlow}></div>

                <div className={styles.formHeader}>
                  <h3>Find Your Perfect Space</h3>
                  <p>Visit premium offices in Gachibowli, Hitec City & more</p>
                </div>

                {formSubmitted ? (
                  <div className={styles.successMsg}>
                    <div className={styles.successIcon}>🎉</div>
                    <h4>Space Request Submitted!</h4>
                    <p>Our Hyderabad team will contact you within 12 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                      <label>Full Name</label>
                      <input
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Email Address</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Preferred Location</label>
                      <select name="city" value={form.city} onChange={handleChange}>
                        <option value="">Select Location</option>
                        <option value="Gachibowli">Gachibowli</option>
                        <option value="Hitec City">Hitec City</option>
                        <option value="Madhapur">Madhapur</option>
                        <option value="Banjara Hills">Banjara Hills</option>
                        <option value="Uppal">Uppal</option>
                        <option value="Kukatpally">Kukatpally</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Requirements</label>
                      <textarea
                        name="message"
                        value={form.message}
                        placeholder="Day pass? Dedicated desk? Team office? Let us know..."
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      <span>Find My Space</span>
                      <span className={styles.btnIcon}>→</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollDot}></div>
          <span>Discover Hyderabad spaces</span>
        </div>
      </section>

      {/* ========== WORKSPACE CARDS ========== */}
      <section className={styles.workspacesSection} id="workspaces">
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

export default Home;
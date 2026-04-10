import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";
import Reveal from "../Pages/Reveal";

function HomePage() {
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
        alert("Update You shortly!");
      }
    }
  };

  // Animated counter - Hyderabad focused stats
  useEffect(() => {
    const targets = { spaces: 250, cities: 5, users: 15000 };
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

  return (
    <div className={styles.home}>
      {/* ========== HERO SECTION ========== */}
      <section className={styles.hero}>
        {/* Video Background */}
        <div className={styles.videoBg}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className={styles.videoIframe}
          >
            <source src="/videoplayback.mp4" type="video/mp4" />
          </video>
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

         <a href="#hyd" className={styles.exploreBtn}>
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
    </div>
  );
}

export default HomePage;
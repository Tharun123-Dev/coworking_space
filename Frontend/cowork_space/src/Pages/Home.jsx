import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";
import Reveal from "../Pages/Reveal";

function HomePage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);

    try {
      await axiosInstance.post("leads/add/", form);
      setIsSubmitting(false);
      setFormSubmitted(true);
      setForm({ name: "", email: "", phone: "", city: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err) {
      setIsSubmitting(false);
      if (err.response?.data?.email) {
        alert("Email already exists");
      } else {
        alert("Update You shortly!");
      }
    }
  };

  // Animated counter
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
        users: Math.floor(targets.users * progress),
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
          <video autoPlay muted loop playsInline className={styles.videoIframe}>
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
                Premium workspaces across Gachibowli, Hitec City, Madhapur &amp; more.
                Flexible day passes, dedicated desks &amp; private offices for startups &amp; enterprises.
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

              {/* Mobile toggle — only toggles on very small screens */}
              <button
                className={styles.formToggle}
                onClick={() => setFormOpen(!formOpen)}
                aria-expanded={formOpen}
              >
                {formOpen ? "✕ Close Form" : "📍 Book a Space in Hyderabad"}
              </button>

              <div className={`${styles.heroForm} ${formOpen ? styles.formVisible : ""}`}>
                <div className={styles.formGlow}></div>

                <div className={styles.formHeader}>
                  <h3>Find Your Perfect Space</h3>
                  <p>Visit premium offices in Gachibowli, Hitec City &amp; more</p>
                </div>

                {/* ── SUBMITTING STATE ── */}
                {isSubmitting && (
                  <div className={styles.submittingState}>
                    <div className={styles.submittingRing}>
                      <div></div><div></div><div></div>
                    </div>
                    <div className={styles.submittingText}>
                      <span className={styles.submittingTitle}>Finding Your Space</span>
                      <span className={styles.submittingDots}></span>
                    </div>
                    <p className={styles.submittingHint}>Connecting you with Hyderabad's best offices</p>
                    <div className={styles.submittingBar}>
                      <div className={styles.submittingBarFill}></div>
                    </div>
                  </div>
                )}

                {/* ── SUCCESS STATE ── */}
                {formSubmitted && !isSubmitting && (
                  <div className={styles.successMsg}>
                    <div className={styles.successRing}>
                      <div className={styles.successIcon}>✓</div>
                    </div>
                    <h4>Space Request Submitted!</h4>
                    <p>Our Hyderabad team will contact you within 12 hours.</p>
                    <div className={styles.successDivider}></div>
                    <p className={styles.successSub}>Check your email for confirmation</p>
                  </div>
                )}

                {/* ── FORM ── */}
                {!formSubmitted && !isSubmitting && (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Full Name</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email Address</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="phone">Phone</label>
                        <div className={styles.inputWrap}>
                          <span className={styles.inputIcon}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          </span>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={form.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="city">Location</label>
                        <div className={styles.inputWrap}>
                          <span className={styles.inputIcon}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </span>
                          <select id="city" name="city" value={form.city} onChange={handleChange}>
                            <option value="">Select Area</option>
                            <option value="Gachibowli">Gachibowli</option>
                            <option value="Hitec City">Hitec City</option>
                            <option value="Madhapur">Madhapur</option>
                            <option value="Banjara Hills">Banjara Hills</option>
                            <option value="Uppal">Uppal</option>
                            <option value="Kukatpally">Kukatpally</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="message">Requirements</label>
                      <div className={styles.inputWrap}>
                        <textarea
                          id="message"
                          name="message"
                          value={form.message}
                          placeholder="Day pass? Dedicated desk? Team office? Let us know..."
                          onChange={handleChange}
                          rows="3"
                        />
                      </div>
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

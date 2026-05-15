import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/Home.module.css";
import Reveal from "../Pages/Reveal";

function HomePage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCount, setActiveCount] = useState({ spaces: 0, cities: 0, users: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  useEffect(() => {
  const text = "Explore Hyderabad's Finest";
  let index = 0;
  let deleting = false;

  const interval = setInterval(() => {
    if (!deleting) {
      setTypedText(text.slice(0, index + 1));
      index++;

      if (index === text.length) {
        deleting = true;
        setTimeout(() => {}, 1000);
      }
    } else {
      setTypedText(text.slice(0, index - 1));
      index--;

      if (index === 0) {
        deleting = false;
      }
    }
  }, deleting ? 60 : 120);

  return () => clearInterval(interval);
}, []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: ""
  });

  const scrollToCompanies = () => {
    const el = document.getElementById("workspace-companies-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("workspace-companies-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const validate = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors.name = "Name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "phone":
        if (value.trim() && !/^[+]?[\d\s\-().]{7,15}$/.test(value.trim())) {
          newErrors.phone = "Please enter a valid phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      case "message":
        if (value.trim() && value.trim().length > 500) {
          newErrors.message = "Message must be under 500 characters";
        } else {
          delete newErrors.message;
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (touched[name]) {
      const newErrors = validate(name, value);
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const newErrors = validate(name, value);
    setErrors(newErrors);
    setFocusedField(null);
  };

  const handleFocus = (name) => {
    setFocusedField(name);
  };

  const validateAll = () => {
    let allErrors = {};
    allErrors = validate("name", form.name);
    allErrors = { ...allErrors, ...validate("email", form.email) };
    if (form.phone) allErrors = { ...allErrors, ...validate("phone", form.phone) };
    if (form.message) allErrors = { ...allErrors, ...validate("message", form.message) };

    setErrors(allErrors);
    setTouched({ name: true, email: true, phone: true, city: true, message: true });
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("leads/add/", form);
      setIsSubmitting(false);
      setFormSubmitted(true);
      setForm({ name: "", email: "", phone: "", city: "", message: "" });
      setErrors({});
      setTouched({});
      setTimeout(() => setFormSubmitted(false), 6000);
    } catch (err) {
      setIsSubmitting(false);
      if (err.response?.data?.email) {
        setErrors({ email: "This email is already registered" });
        setTouched({ ...touched, email: true });
      } else {
        alert("We'll update you shortly!");
      }
    }
  };

  // Animated counter
  useEffect(() => {
    const targets = { spaces: 250, cities: 5, users: 15000 };
    const duration = 2200;
    const steps = 70;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.pow(step / steps, 0.72);
      setActiveCount({
        spaces: Math.floor(targets.spaces * progress),
        cities: Math.floor(targets.cities * progress),
        users: Math.floor(targets.users * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.55 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212,175,55,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const getFieldState = (name) => {
    if (errors[name] && touched[name]) return "error";
    if (!errors[name] && touched[name] && form[name]) return "valid";
    return "default";
  };

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

        {/* Overlays */}
        <div className={styles.videoOverlay}></div>
        <div className={styles.noiseTex}></div>

        {/* Particle canvas */}
        <canvas ref={canvasRef} className={styles.particleCanvas} />

        {/* Grid lines */}
        <div className={styles.gridLines}></div>

        {/* Floating orbs */}
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>

        {/* Hero content */}
        <div className={styles.heroContent}>
          {/* LEFT - Text + Stats */}
          <div className={styles.heroLeft}>
            <Reveal>
              <div className={styles.heroTag}>
                <span className={styles.tagPulse}></span>
                <span className={styles.tagPulseRing}></span>
                Hyderabad's #1 Coworking Platform
              </div>

              <h1 className={styles.heroTitle}>
               <span className={styles.goldLayer}>
  {typedText}
</span>
                <span className={styles.glowLayer}>Coworking</span>
                <span className={styles.mainLayer}>
                  Spaces
                  <span className={styles.titleUnderline}></span>
                </span>
              </h1>

              <p className={styles.heroSubtitle}>
                Premium workspaces across Gachibowli, Hitec City, Madhapur & more.
                Flexible day passes, dedicated desks & private offices for startups & enterprises.
              </p>

              <div className={styles.heroDivider}>
                <span className={styles.dividerDot}></span>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{activeCount.spaces}<span className={styles.statPlus}>+</span></span>
                  <span className={styles.statLabel}>Premium Spaces</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{activeCount.cities}<span className={styles.statPlus}>+</span></span>
                  <span className={styles.statLabel}>Key Locations</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{Number(activeCount?.users || 200).toLocaleString()}<span className={styles.statPlus}>+</span></span>
                  <span className={styles.statLabel}>Happy Members</span>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <button onClick={scrollToCompanies} className={styles.exploreBtn}>
                  <span className={styles.btnShine}></span>
                  <span>Explore More</span>
                  <span className={styles.btnArrow}>→</span>
                </button>
                <button onClick={scrollToCompanies} className={styles.ghostBtn}>
                  <span>View More Spaces</span>
                </button>
              </div>

              <div className={styles.trustBadges}>
                <span className={styles.badge}>✦ Verified Spaces</span>
                <span className={styles.badgeDot}></span>
                <span className={styles.badge}>✦ Instant Booking</span>
                <span className={styles.badgeDot}></span>
                <span className={styles.badge}>✦ 24/7 Support</span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT - Form */}
          <Reveal>
            <div className={styles.formWrapper}>
              <button
                className={styles.formToggle}
                onClick={() => setFormOpen(!formOpen)}
                aria-expanded={formOpen}
              >
                <span className={styles.toggleIcon}>{formOpen ? "✕" : "📍"}</span>
                {formOpen ? "Close Form" : "Book a Space in Hyderabad"}
              </button>

              <div className={`${styles.heroForm} ${formOpen ? styles.formVisible : ""}`}>
                {/* Decorative corner lines */}
                <span className={`${styles.corner} ${styles.cornerTL}`}></span>
                <span className={`${styles.corner} ${styles.cornerTR}`}></span>
                <span className={`${styles.corner} ${styles.cornerBL}`}></span>
                <span className={`${styles.corner} ${styles.cornerBR}`}></span>

                <div className={styles.formGlow}></div>
                <div className={styles.formGlowBottom}></div>

                <div className={styles.formHeader}>
                  <div className={styles.formHeaderIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div>
                    <h3>Find Your Perfect Space</h3>
                    <p>Premium offices in Gachibowli, Hitec City & more</p>
                  </div>
                </div>

                <div className={styles.formDivider}></div>

                {/* SUBMITTING */}
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

                {/* SUCCESS */}
                {formSubmitted && !isSubmitting && (
                  <div className={styles.successMsg}>
                    <div className={styles.successRing}>
                      <div className={styles.successRingInner}></div>
                      <div className={styles.successIcon}>✓</div>
                    </div>
                    <h4>Space Request Submitted!</h4>
                    <p>Our Hyderabad team will contact you within 12 hours.</p>
                    <div className={styles.successDivider}></div>
                    <p className={styles.successSub}>Check your email for confirmation</p>
                  </div>
                )}

                {/* FORM */}
                {!formSubmitted && !isSubmitting && (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Full Name <span className={styles.required}>*</span></label>
                      <div className={`${styles.inputWrap} ${focusedField === "name" ? styles.inputFocused : ""} ${getFieldState("name") === "error" ? styles.inputError : ""} ${getFieldState("name") === "valid" ? styles.inputValid : ""}`}>
                        <span className={styles.inputIcon}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={form.name}
                          onChange={handleChange}
                          onFocus={() => handleFocus("name")}
                          onBlur={handleBlur}
                          required
                        />
                        {getFieldState("name") === "valid" && <span className={styles.inputCheck}>✓</span>}
                        {getFieldState("name") === "error" && <span className={styles.inputErrorIcon}>✕</span>}
                      </div>
                      {errors.name && touched.name && (
                        <span className={styles.errorMsg}>{errors.name}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email Address <span className={styles.required}>*</span></label>
                      <div className={`${styles.inputWrap} ${focusedField === "email" ? styles.inputFocused : ""} ${getFieldState("email") === "error" ? styles.inputError : ""} ${getFieldState("email") === "valid" ? styles.inputValid : ""}`}>
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
                          onFocus={() => handleFocus("email")}
                          onBlur={handleBlur}
                          required
                        />
                        {getFieldState("email") === "valid" && <span className={styles.inputCheck}>✓</span>}
                        {getFieldState("email") === "error" && <span className={styles.inputErrorIcon}>✕</span>}
                      </div>
                      {errors.email && touched.email && (
                        <span className={styles.errorMsg}>{errors.email}</span>
                      )}
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="phone">Phone</label>
                        <div className={`${styles.inputWrap} ${focusedField === "phone" ? styles.inputFocused : ""} ${getFieldState("phone") === "error" ? styles.inputError : ""} ${getFieldState("phone") === "valid" ? styles.inputValid : ""}`}>
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
                            onFocus={() => handleFocus("phone")}
                            onBlur={handleBlur}
                          />
                          {getFieldState("phone") === "valid" && <span className={styles.inputCheck}>✓</span>}
                          {getFieldState("phone") === "error" && <span className={styles.inputErrorIcon}>✕</span>}
                        </div>
                        {errors.phone && touched.phone && (
                          <span className={styles.errorMsg}>{errors.phone}</span>
                        )}
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="city">Location</label>
                        <div className={`${styles.inputWrap} ${focusedField === "city" ? styles.inputFocused : ""}`}>
                          <span className={styles.inputIcon}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </span>
                          <select
                            id="city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            onFocus={() => handleFocus("city")}
                            onBlur={handleBlur}
                          >
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
                      <div className={`${styles.inputWrap} ${styles.textareaWrap} ${focusedField === "message" ? styles.inputFocused : ""} ${getFieldState("message") === "error" ? styles.inputError : ""}`}>
                        <textarea
                          id="message"
                          name="message"
                          value={form.message}
                          placeholder="Day pass? Dedicated desk? Team office? Let us know..."
                          onChange={handleChange}
                          onFocus={() => handleFocus("message")}
                          onBlur={handleBlur}
                          rows="3"
                        />
                      </div>
                      {errors.message && touched.message && (
                        <span className={styles.errorMsg}>{errors.message}</span>
                      )}
                      {form.message && (
                        <span className={styles.charCount}>{form.message.length}/500</span>
                      )}
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                      <span className={styles.btnShine}></span>
                      <span>Find My Space</span>
                      <span className={styles.btnIcon}>→</span>
                    </button>

                    <p className={styles.formFootNote}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Your details are safe & never shared
                    </p>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollDot}></div>
          </div>
          <span>Scroll to discover</span>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

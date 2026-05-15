import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/WorkspaceFeature.module.css";

const PHRASES = [
  "Custom Layout & Design",
  "Branded Private Offices",
  "Tailored Meeting Rooms",
  "Flexible Seat Configuration",
  "Personalised Amenity Packages",
  "Dedicated Team Zones",
];

const FEATURES = [

  {
    icon: "🏷️",
    bg: "bgBlue",
    title: "Brand Identity Integration",
    sub: "Your logo, colors, and culture embedded in every corner",
  },
  {
    icon: "🪑",
    bg: "bgGreen",
    title: "Flexible Seating Plans",
    sub: "Hot desks, dedicated desks, or private cabins — your call",
  },
  {
    icon: "📡",
    bg: "bgTeal",
    title: "Tech & Connectivity Setup",
    sub: "Custom IT infrastructure, server rooms, and high-speed internet",
  },
  {
    icon: "🔐",
    bg: "bgRed",
    title: "Private & Secure Access",
    sub: "Biometric entry, CCTV, and dedicated secure zones",
  },
  {
    icon: "📦",
    bg: "bgAmber",
    title: "All-Inclusive Packages",
    sub: "Housekeeping, pantry, power backup — bundled your way",
  },
];

/* ─── Validation Rules ───────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  preferred_location: "",
  message: "",
};

function validateForm(form) {
  const errors = {};

  // Name — required, only letters & spaces, min 2 chars
  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  } else if (!/^[a-zA-Z\s'-]{2,60}$/.test(form.name.trim())) {
    errors.name = "Enter a valid name (letters only, 2–60 chars).";
  }

  // Email — optional but validate format if filled
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  // Phone — required, 10-digit Indian mobile
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  // Company — optional but limit length
  if (form.company.trim() && form.company.trim().length > 80) {
    errors.company = "Company name must be under 80 characters.";
  }

  // Preferred location — required
  if (!form.preferred_location) {
    errors.preferred_location = "Please select a preferred location.";
  }

  // Message — optional but if filled, at least 10 chars
  if (form.message.trim() && form.message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }
  if (form.message.trim().length > 500) {
    errors.message = "Message cannot exceed 500 characters.";
  }

  return errors;
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.type}`]}`}>
          <span>{t.type === "success" ? "✅" : "❌"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function SpecialContact() {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(false);
  const [typed, setTyped]       = useState("");
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [toasts, setToasts]     = useState([]);
  const toastId                 = useRef(0);
  const stateRef                = useRef({ pi: 0, ci: 0, deleting: false });

  /* ── Toast helper ─────────────────────────────────────────────────────── */
  const addToast = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  /* ── Typing effect ────────────────────────────────────────────────────── */
  useEffect(() => {
    let timer;
    const tick = () => {
      const s = stateRef.current;
      const phrase = PHRASES[s.pi];
      if (!s.deleting) {
        s.ci++;
        setTyped(phrase.slice(0, s.ci));
        if (s.ci === phrase.length) { s.deleting = true; timer = setTimeout(tick, 1200); }
        else { timer = setTimeout(tick, 60); }
      } else {
        s.ci--;
        setTyped(phrase.slice(0, s.ci));
        if (s.ci === 0) { s.deleting = false; s.pi = (s.pi + 1) % PHRASES.length; timer = setTimeout(tick, 300); }
        else { timer = setTimeout(tick, 40); }
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  /* ── Field change — validate on the fly if already touched ───────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (touched[name]) {
      const errs = validateForm(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
    }
  };

  /* ── Mark field as touched on blur and validate ───────────────────────── */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateForm(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields to show errors
    const allTouched = Object.keys(EMPTY_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errs = validateForm(form);
    setErrors(errs);

    if (Object.values(errs).some(Boolean)) {
      addToast("Please fix the errors before submitting.", "error");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("leads/modern-lead/create/", form);
      addToast("Request submitted successfully! We'll be in touch soon.", "success");
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Something went wrong. Please try again.";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Helper: field error display ─────────────────────────────────────── */
  const fieldClass = (name) =>
    `${styles.input} ${touched[name] && errors[name] ? styles.inputError : touched[name] && !errors[name] ? styles.inputValid : ""}`;

  const charCount = form.message.trim().length;

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <Toast toasts={toasts} />

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logoDots}>
          <span className={`${styles.dot} ${styles.dotPurple}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
        </div>
        <span className={styles.brand}>CoWork</span>
      </nav>

      {/* MAIN */}
      <section id="spaces-section" className={styles.specialPage}>
        <div className={styles.wrapper}>

          {/* LEFT CONTENT */}
          <div className={styles.leftPanel}>
            <span className={styles.tag}>Customise Your Workspace</span>

            <h1>Build the Office That Works Exactly the Way You Do</h1>

            <div className={styles.typingLine}>
              <span className={styles.tick}>✓</span>
              <span className={styles.typedText}>{typed}</span>
              <span className={styles.cursor} />
            </div>

            <p className={styles.description}>
              No two businesses are alike. Design your perfect workspace — from layout and branding to
              amenities and tech — fully tailored to your team's needs.
            </p>

            <ul className={styles.featureList}>
              {FEATURES.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <div className={`${styles.featureIcon} ${styles[f.bg]}`}>{f.icon}</div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>{f.title}</span>
                    <span className={styles.featureSub}>{f.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM CARD */}
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className={styles.fieldWrap}>
              <input
                name="name"
                placeholder="Full Name *"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("name")}
                maxLength={60}
                autoComplete="name"
              />
              {touched.name && errors.name   && <span className={styles.errMsg}>⚠ {errors.name}</span>}
              {touched.name && !errors.name  && form.name.trim() && <span className={styles.okMsg}>✓ Looks good</span>}
            </div>

            {/* Email */}
            <div className={styles.fieldWrap}>
              <input
                name="email"
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("email")}
                maxLength={100}
                autoComplete="email"
              />
              {touched.email && errors.email   && <span className={styles.errMsg}>⚠ {errors.email}</span>}
              {touched.email && !errors.email  && form.email.trim() && <span className={styles.okMsg}>✓ Valid email</span>}
            </div>

            {/* Company */}
            <div className={styles.fieldWrap}>
              <input
                name="company"
                placeholder="Company (optional)"
                value={form.company}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("company")}
                maxLength={80}
                autoComplete="organization"
              />
              {touched.company && errors.company && <span className={styles.errMsg}>⚠ {errors.company}</span>}
            </div>

            {/* Phone */}
            <div className={styles.fieldWrap}>
              <input
                name="phone"
                placeholder="Phone Number * (10 digits)"
                value={form.phone}
                onChange={(e) => {
                  // Allow only digits, max 10
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleChange({ target: { name: "phone", value: val } });
                }}
                onBlur={handleBlur}
                className={fieldClass("phone")}
                inputMode="numeric"
                autoComplete="tel"
              />
              {touched.phone && errors.phone   && <span className={styles.errMsg}>⚠ {errors.phone}</span>}
              {touched.phone && !errors.phone  && form.phone.trim() && <span className={styles.okMsg}>✓ Valid number</span>}
            </div>

            {/* Preferred Location */}
            <div className={styles.fieldWrap}>
              <select
                name="preferred_location"
                value={form.preferred_location}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldClass("preferred_location")}
              >
                <option value="">Select Preferred Location *</option>
                <option value="Hitech City">Hitech City</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Kondapur">Kondapur</option>
              </select>
              {touched.preferred_location && errors.preferred_location && (
                <span className={styles.errMsg}>⚠ {errors.preferred_location}</span>
              )}
              {touched.preferred_location && !errors.preferred_location && form.preferred_location && (
                <span className={styles.okMsg}>✓ Location selected</span>
              )}
            </div>

            {/* Message */}
            <div className={styles.fieldWrap}>
              <textarea
                name="message"
                placeholder="Describe your workspace requirement... (optional, min 10 chars)"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.textarea} ${
                  touched.message && errors.message ? styles.inputError :
                  touched.message && !errors.message && form.message.trim() ? styles.inputValid : ""
                }`}
                maxLength={500}
              />
              <div className={styles.msgMeta}>
                {touched.message && errors.message
                  ? <span className={styles.errMsg}>⚠ {errors.message}</span>
                  : touched.message && !errors.message && form.message.trim()
                    ? <span className={styles.okMsg}>✓ Great detail</span>
                    : <span />
                }
                <span className={`${styles.charCount} ${charCount > 450 ? styles.charWarn : ""}`}>
                  {charCount}/500
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Submitting…" : "Get a Free Consultation"}
            </button>

          </form>
        </div>
      </section>
    </>
  );
}

export default SpecialContact;

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
    icon: "🎨",
    bg: "bgPurple",
    title: "Custom Interior Design",
    sub: "Craft your office aesthetic — from furniture to flooring",
  },
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

function SpecialContact() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const stateRef = useRef({ pi: 0, ci: 0, deleting: false });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  // 🔹 Typing Effect
  useEffect(() => {
    let timer;

    const tick = () => {
      const s = stateRef.current;
      const phrase = PHRASES[s.pi];

      if (!s.deleting) {
        s.ci++;
        setTyped(phrase.slice(0, s.ci));

        if (s.ci === phrase.length) {
          s.deleting = true;
          timer = setTimeout(tick, 1200);
        } else {
          timer = setTimeout(tick, 60);
        }
      } else {
        s.ci--;
        setTyped(phrase.slice(0, s.ci));

        if (s.ci === 0) {
          s.deleting = false;
          s.pi = (s.pi + 1) % PHRASES.length;
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 40);
        }
      }
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Handle Input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Submit to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      alert("Please fill required fields ❌");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post("leads/modern-lead/create/", form);

      alert("Request submitted successfully ✅");

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });

     
    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      <section className={styles.specialPage}>
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
                  <div className={`${styles.featureIcon} ${styles[f.bg]}`}>
                    {f.icon}
                  </div>
                  <div className={styles.featureText}>
                    <span className={styles.featureTitle}>{f.title}</span>
                    <span className={styles.featureSub}>{f.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM */}
          <form className={styles.formCard} onSubmit={handleSubmit}>

            <input
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />

            <input
              name="company"
              placeholder="Type eg.Company..."
              value={form.company}
              onChange={handleChange}
              className={styles.input}
            />

            <input
              name="phone"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />

            <textarea
              name="message"
              placeholder="Describe your workspace requirement..."
              value={form.message}
              onChange={handleChange}
              className={styles.textarea}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Get a Free Consultation"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default SpecialContact;

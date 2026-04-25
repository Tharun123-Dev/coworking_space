import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/WorkspaceFeature.module.css";

const PHRASES = [
  "Flexible Hot Desks",
  "Private Cabins",
  "Fully Furnished Offices",
  "Meeting & Conference Rooms",
  "Virtual Office Plans",
  "Coworking Day Passes",
];

const FEATURES = [
  {
    icon: "📍",
    bg: "bgBlue",
    title: "Prime Business Address",
    sub: "Establish credibility with a prestigious city-center address",
  },
  {
    icon: "🤝",
    bg: "bgGreen",
    title: "Community & Networking",
    sub: "Weekly events and startup connections",
  },
  {
    icon: "🎁",
    bg: "bgPurple",
    title: "Partner Discounts",
    sub: "Save on tools, legal & business services",
  },
  {
    icon: "✈️",
    bg: "bgAmber",
    title: "Travel Benefits",
    sub: "Airport lounge access & travel comfort",
  },
  {
    icon: "🏢",
    bg: "bgTeal",
    title: "Reception Support",
    sub: "Professional staff & mail handling",
  },
  {
    icon: "🔒",
    bg: "bgRed",
    title: "24/7 Secure Access",
    sub: "Full-time access with security",
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

      navigate("/request-sent");
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
            <span className={styles.tag}>Modern Office Spaces</span>

            <h1>Your Smartest Workspace Decision Starts Here</h1>

            <div className={styles.typingLine}>
              <span className={styles.tick}>✓</span>
              <span className={styles.typedText}>{typed}</span>
              <span className={styles.cursor} />
            </div>

            <p className={styles.description}>
              Join professionals who scale faster using premium coworking spaces.
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
              placeholder="Company"
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
              placeholder="Your requirement..."
              value={form.message}
              onChange={handleChange}
              className={styles.textarea}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Get a Free Callback"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default SpecialContact;
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
    icon: "📍", bg: "bgBlue",
    title: "Prime Business Address",
    sub: "Establish credibility with a prestigious city-center address for GST, courier & branding",
  },
  {
    icon: "🤝", bg: "bgGreen",
    title: "Community & Networking Events",
    sub: "Weekly founder meetups, skill workshops & investor connect sessions to grow faster",
  },
  {
    icon: "🎁", bg: "bgPurple",
    title: "Exclusive Partner Discounts",
    sub: "Save on AWS, Zoho, legal services, accounting & 50+ global business tools",
  },
  {
    icon: "✈️", bg: "bgAmber",
    title: "Airport Lounge Premium Access",
    sub: "Complimentary lounge pass for business travel — work comfortably between flights",
  },
  {
    icon: "🏢", bg: "bgTeal",
    title: "Dedicated Receptionist & Concierge",
    sub: "Professional staff to greet guests, handle mail & manage day-to-day needs",
  },
  {
    icon: "🔒", bg: "bgRed",
    title: "24/7 Secure Access & Support",
    sub: "Round-the-clock building access, CCTV security & instant support anytime",
  },
];

function SpecialContact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const stateRef = useRef({ pi: 0, ci: 0, deleting: false });

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
          timer = setTimeout(tick, 1500);
        } else {
          timer = setTimeout(tick, 65);
        }
      } else {
        s.ci--;
        setTyped(phrase.slice(0, s.ci));
        if (s.ci === 0) {
          s.deleting = false;
          s.pi = (s.pi + 1) % PHRASES.length;
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 38);
        }
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Please fill required fields ❌");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("leads/special/add/", {
        name: form.name, email: form.email, phone: form.phone,
        company: form.company, message: form.message,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      alert("Request Sent Successfully ✅");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
      navigate("/my-orders");
    } catch (error) {
      console.log("Backend error:", error.response?.data);
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logoDots}>
          <span className={`${styles.dot} ${styles.dotPurple}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
        </div>
        <span className={styles.brand}>CoWork</span>
      </nav>

      <section className={styles.specialPage}>
        <div className={styles.wrapper}>

          <div className={styles.leftPanel}>
            <span className={styles.tag}>Modern Office Spaces</span>
            <h1>Your Smartest Workspace Decision Starts Here</h1>

            <div className={styles.typingLine}>
              <span className={styles.tick}>✓</span>
              <span className={styles.typedText}>{typed}</span>
              <span className={styles.cursor} />
            </div>

            <p className={styles.description}>
              Join 2,000+ professionals who scaled their businesses from a CoWork space.
              From solo founders to growing teams — we have the perfect setup for you.
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

          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <input name="name" type="text" placeholder="Full Name *"
                value={form.name} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <input name="email" type="email" placeholder="Email Address"
                value={form.email} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <input name="company" type="text" placeholder="Company Name or Self"
                value={form.company} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <input name="phone" type="text" placeholder="Phone Number *"
                value={form.phone} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <textarea name="message" rows="4"
                placeholder="Team size & workspace requirement (e.g. 5-person private cabin, 3 months)..."
                value={form.message} onChange={handleChange} className={styles.textarea} />
            </div>
            <button type="button" onClick={handleSubmit}
              className={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Get a Free Callback"}
            </button>
          </div>

        </div>
      </section>
    </>
  );
}

export default SpecialContact;
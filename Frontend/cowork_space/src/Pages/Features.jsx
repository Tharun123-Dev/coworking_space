import { useEffect, useState } from "react";
import "../Styles/Features.css";
import R from "../Pages/Reveal";
import { FaWifi, FaCoffee, FaBroom, FaCar } from "react-icons/fa";
import { MdOutlineSupportAgent, MdPrint } from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import { GiNetworkBars } from "react-icons/gi";

const images = [
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
];

const features = [
  { icon: <FaWifi className="feature-icon" />, title: "High Speed WiFi", desc: "Blazing connectivity" },
  { icon: <FaCoffee className="feature-icon" />, title: "Coffee & Tea", desc: "Curated blends daily" },
  { icon: <FaBroom className="feature-icon" />, title: "Daily Cleaning", desc: "Spotless every morning" },
  { icon: <MdOutlineSupportAgent className="feature-icon" />, title: "IT Support", desc: "Expert help on-site" },
  { icon: <MdPrint className="feature-icon" />, title: "Print & Scan", desc: "Full-service hub" },
  { icon: <BsBoxSeam className="feature-icon" />, title: "Office Supplies", desc: "Always stocked up" },
  { icon: <FaCar className="feature-icon" />, title: "Parking", desc: "Reserved spots available" },
  { icon: <GiNetworkBars className="feature-icon" />, title: "Pan-India Access", desc: "100+ locations" }
];

function Feature() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setFading(false);
      }, 300);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleDot = (i) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(i);
      setFading(false);
    }, 300);
  };

  return (
    <section className="feature-section">
      <div className="feature-bg-orb orb-1"></div>
      <div className="feature-bg-orb orb-2"></div>
      <div className="feature-bg-orb orb-3"></div>
      <div className="feature-noise"></div>

      <div className="feature-shell">
        <div className="feature-layout">
          <div className="feature-left">
            <R>
              <p className="feature-eyebrow">
                <span className="eyebrow-dot"></span>
                Premium Benefits
              </p>
            </R>

            <R>
              <h2 className="feature-title">
                Built for a
                <span className="title-accent"> richer workday</span>
              </h2>
            </R>

            <R>
              <p className="feature-subtitle">
                Every detail crafted for professionals who demand the finest environment to think, create, and grow.
              </p>
            </R>

            <div className="feature-grid">
              {features.map((item, index) => (
                <R key={index}>
                  <article className="feature-card">
                    <div className="feature-glow"></div>
                    <div className="feature-card-top">
                      <div className="icon-wrap">{item.icon}</div>
                      <div className="card-text">
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  </article>
                </R>
              ))}
            </div>
          </div>

          <div className="feature-right">
            <R>
              <div className="feature-visual-card">
                <div className="feature-image-wrap">
                  <img
                    src={images[current]}
                    alt="Premium workspace"
                    className={`feature-image ${fading ? "fading" : ""}`}
                  />

                  <div className="feature-image-overlay">
                    <div className="feature-badge">✦ Luxury Workspace</div>

                    <div className="feature-floating-note">
                      <strong>Elegant. Focused. Modern.</strong>
                      <span>Premium environment with high comfort and style.</span>
                    </div>
                  </div>

                  <div className="feature-shine"></div>
                </div>

                <div className="feature-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`feature-dot ${i === current ? "active" : ""}`}
                      onClick={() => handleDot(i)}
                      aria-label={`Show image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </R>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Feature;

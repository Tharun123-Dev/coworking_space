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
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"
];

const features = [
  {
    icon: <FaWifi className="feature-icon" />,
    title: "Lightning-fast Internet",
    text: "Reliable high-speed connectivity for calls, meetings, uploads, and uninterrupted deep work."
  },
  {
    icon: <FaCoffee className="feature-icon" />,
    title: "Coffee, Tea & Snacks",
    text: "Fresh beverages and quick bites that keep your team energized through the day."
  },
  {
    icon: <FaBroom className="feature-icon" />,
    title: "Daily Housekeeping",
    text: "Neat, hygienic, and consistently maintained spaces that feel professional every day."
  },
  {
    icon: <MdOutlineSupportAgent className="feature-icon" />,
    title: "Professional IT Support",
    text: "On-ground support for connectivity, setup issues, and basic tech assistance when needed."
  },
  {
    icon: <MdPrint className="feature-icon" />,
    title: "Printing & Scanning",
    text: "Easy access to printing and scanning for documents, proposals, and client-ready work."
  },
  {
    icon: <BsBoxSeam className="feature-icon" />,
    title: "Office Supplies",
    text: "Everyday essentials available so your team can stay focused on work instead of logistics."
  },
  {
    icon: <FaCar className="feature-icon" />,
    title: "Ample Parking",
    text: "Convenient parking access for members, teams, and visiting clients."
  },
  {
    icon: <GiNetworkBars className="feature-icon" />,
    title: "Pan-India Network",
    text: "Work flexibly across locations with access to a wider professional workspace ecosystem."
  }
];

function Feature() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="feature-section">
      <div className="feature-shell">
        <div className="feature-layout">
          <div className="feature-left">
            <R>
              <p className="feature-eyebrow">Why people choose us</p>
            </R>

            <R>
              <h2 className="feature-title">
                Perks that make
                <span> everyday work feel better</span>
              </h2>
            </R>

            <R>
              <p className="feature-description">
                More than just desks and Wi-Fi — our spaces are designed to help
                freelancers, startups, and growing teams work smoothly, meet
                confidently, and stay productive in comfort.
              </p>
            </R>

            <div className="feature-grid">
              {features.map((item, index) => (
                <R key={index}>
                  <article className="feature-card">
                    <div className="feature-card-top">
                      {item.icon}
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.text}</p>
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
                    alt="Modern coworking workspace"
                    className="feature-image"
                  />

                  <div className="feature-image-overlay">
                    <div className="feature-badge">Premium workspace experience</div>
                    <div className="feature-floating-note">
                      <strong>Smart. Clean. Connected.</strong>
                      <span>Built for focused work and better collaboration.</span>
                    </div>
                  </div>
                </div>

                <div className="feature-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`feature-dot ${i === current ? "active" : ""}`}
                      onClick={() => setCurrent(i)}
                      aria-label={`Show workspace image ${i + 1}`}
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
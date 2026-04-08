import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Companies.css";

const teamOptions = [
  {
    id: 1,
    title: "Small Team",
    subtitle: "20 – 50 Employees",
    desc: "Ideal for growing startups in Hyderabad needing a professional, plug-and-play workspace without long-term commitments.",
    features: ["Private Cabins", "Meeting Rooms", "High-Speed Wi-Fi", "Reception Support"],
    icon: "👥",
    badge: "Starter",
  },
  {
    id: 2,
    title: "Medium Team",
    subtitle: "50 – 100 Employees",
    desc: "Flexible dedicated floors in Hyderabad's prime business districts, with custom branding and full managed services.",
    features: ["Dedicated Floor", "Custom Branding", "HR Concierge", "Pantry & Café"],
    icon: "🏢",
    badge: "Most Popular",
    featured: true,
  },
  {
    id: 3,
    title: "Large Team",
    subtitle: "100+ Employees",
    desc: "Enterprise-grade managed campuses across Hyderabad with SLA-backed uptime and bespoke interior fitouts.",
    features: ["Full-Floor Access", "Executive Lounges", "Bespoke Fitouts", "Dedicated Manager"],
    icon: "🏬",
    badge: "Enterprise",
  },
];

const clientLogos = [
  { name: "FIS Solutions", logo: "/logo1.jpg" },
  { name: "L&T Technology Services", logo: "/logo2.jpg" },
  { name: "Mahindra Logistics", logo: "/logo3.png" },
  { name: "MakeMyTrip", logo: "/logo4.svg" },
  { name: "Moglix", logo: "/logo5.png" },
  { name: "Persistent", logo: "/logo6.png" },
  { name: "ShareChat", logo: "/logo7.png" },
  { name: "Philips", logo: "/logo8.png" },
];

const TeamClientsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="workspace-clients-section" className="tcs-section">
      <div className="tcs-container">

        {/* ── Section Header ── */}
        <div className="tcs-header">
          <span className="tcs-eyebrow">✦ Hyderabad's Premium Workspace Partner ✦</span>
          <h2 className="tcs-heading">Office Space for Every Team Size</h2>
          <p className="tcs-subheading">
            Fully managed, ready-to-move workspaces across Hyderabad's top business districts —
            HITEC City, Gachibowli & Banjara Hills.
          </p>
        </div>

        {/* ── 3 Cards ── */}
        <div className="tcs-cards-grid">
          {teamOptions.map((item, i) => (
            <div
              key={item.id}
              className={`tcs-card ${item.featured ? "tcs-card--featured" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {item.featured && <div className="tcs-ribbon">⭐ Most Popular</div>}

              <div className="tcs-card-head">
                <span className="tcs-badge">{item.badge}</span>
                <span className="tcs-icon">{item.icon}</span>
              </div>

              <h3 className="tcs-card-title">{item.title}</h3>
              <p className="tcs-card-sub">{item.subtitle}</p>
              <p className="tcs-card-desc">{item.desc}</p>

              <ul className="tcs-features">
                {item.features.map((f) => (
                  <li key={f}><span className="tcs-bullet">✦</span>{f}</li>
                ))}
              </ul>

              <div className="tcs-card-footer">
                <button
                  className="tcs-btn-primary"
                  onClick={() => navigate(`/special-contact/${item.id}`)}
                >
                  Get a Quote →
                </button>
                <button
                  className="tcs-btn-ghost"
                  onClick={() => navigate(`/special-contact/${item.id}`, { state: { tour: true } })}
                >
                  Book a Tour
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Clients Marquee ── */}
        <div className="tcs-clients-wrap">
          <p className="tcs-clients-label">Trusted by leading companies in Hyderabad</p>
          <div className="tcs-marquee">
            <div className="tcs-marquee-track">
              {[...clientLogos, ...clientLogos].map((c, i) => (
                <div className="tcs-client" key={`${c.name}-${i}`}>
                  <img src={c.logo} alt={c.name} />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TeamClientsSection;

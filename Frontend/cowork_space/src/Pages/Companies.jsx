
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Companies.css";

const companyOptions = [
  {
    id: 1,
    size: "Small",
    title: "For Small Teams",
    subtitle: "1 – 20 Employees",
    desc: "Flexible workspaces for startups and lean teams that need speed, simplicity, and a professional setup in Hyderabad.",
    features: ["Private Cabins", "Meeting Access", "Wi-Fi & Power Backup"],
  },
  {
    id: 2,
    size: "Medium",
    title: "For Growing Companies",
    subtitle: "20 – 75 Employees",
    desc: "Managed office solutions for growing teams that need more seats, better branding, and room to scale comfortably.",
    features: ["Dedicated Zones", "Custom Branding", "Managed Support"],
    featured: true,
  },
  {
    id: 3,
    size: "Large",
    title: "For Enterprise Teams",
    subtitle: "75 – 200+ Employees",
    desc: "Full-floor and managed office setups for enterprise companies looking for privacy, custom layouts, and operational support.",
    features: ["Full-Floor Access", "Enterprise Fitouts", "Dedicated Manager"],
  },
];

const CompaniesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="workspace-companies-section" className="ncs-section">
      <div className="ncs-container">
        <div className="ncs-header">
          <span className="ncs-eyebrow">Hyderabad enterprise workspace solutions</span>
          <h2 className="ncs-heading">Office Space for Every Team Size</h2>
          <p className="ncs-subheading">
            Simple workspace solutions for startups, growing companies, and enterprise teams across Hyderabad.
          </p>
        </div>

        <div className="ncs-grid">
          {companyOptions.map((item) => (
            <div
              key={item.id}
              className={`ncs-item ${item.featured ? "ncs-item--featured" : ""}`}
            >
              <div className="ncs-topline">
                <span className="ncs-size">{item.size}</span>
                {item.featured && <span className="ncs-tag">Recommended</span>}
              </div>

              <h3 className="ncs-title">{item.title}</h3>
              <p className="ncs-subtitle">{item.subtitle}</p>
              <p className="ncs-desc">{item.desc}</p>

              <div className="ncs-features">
                {item.features.map((feature) => (
                  <span key={feature} className="ncs-feature">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="ncs-actions">
                <button
                  className="ncs-btn ncs-btn--primary"
                  onClick={() => navigate(`/speciall-contact/${item.id}`)}
                >
                  Get a Quote
                </button>
                <button
                  className="ncs-btn ncs-btn--secondary"
                  onClick={() =>
                    navigate(`/speciall-contact/${item.id}`, {
                      state: { tour: true },
                    })
                  }
                >
                  Book a Tour
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
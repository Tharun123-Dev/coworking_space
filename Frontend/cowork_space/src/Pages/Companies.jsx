import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Companies.css";
import QuoteModal from "./QuoteModal";

const companyOptions = [
  {
    id: 1,
    size: "Small",
    subtitle: "1 – 20 Employees",
    features: ["Private Cabins", "Meeting Access", "Wi-Fi & Power Backup"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  },
  {
    id: 2,
    size: "Medium",
    subtitle: "20 – 75 Employees",
    features: ["Dedicated Zones", "Custom Branding", "Managed Support"],
    image:
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&q=80",
    featured: true,
  },
  {
    id: 3,
    size: "Large",
    subtitle: "75 – 200+ Employees",
    features: ["Full-Floor Access", "Enterprise Fitouts", "Dedicated Manager"],
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
  },
];

const CompaniesSection = () => {
  const navigate = useNavigate();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Small");

  const openQuote = (size) => {
    setSelectedSize(size);
    setQuoteOpen(true);
  };

  return (
    <>
      <section id="workspace-companies-section" className="cs-section">
        <div className="cs-header">
          <span className="cs-eyebrow">Workspace Solutions · Hyderabad</span>
          <h2 className="cs-title">Office Space for Every Team Size</h2>
        </div>

        <div className="cs-grid">
          {companyOptions.map((item) => (
            <div
              key={item.id}
              className={`cs-card ${item.featured ? "cs-card--featured" : ""}`}
              style={{ backgroundImage: `url(${item.image})`, cursor: "pointer" }}
              onClick={() =>
                navigate(`/speciall-contact/${item.id}`, {
                  state: { workspaceSize: item.size },
                })
              }
            >
              <div className="cs-overlay" />
              <div className="cs-card-body">
                <div>
                  {item.featured && <span className="cs-badge">Popular</span>}
                  <h3 className="cs-size">{item.size}</h3>
                  <p className="cs-sub">{item.subtitle}</p>
                </div>

                <div>
                  <ul className="cs-features">
                    {item.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  <div className="cs-btn-group">
                    {/* ── Get a Quote → opens QuoteModal ── */}
                    <button
                      className="cs-btn-quote"
                      onClick={(e) => {
                        e.stopPropagation();
                        openQuote(item.size);
                      }}
                    >
                      Get a Quote →
                    </button>

                    <button
                      className="cs-btn-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/speciall-contact/${item.id}`, {
                          state: { workspaceSize: item.size },
                        });
                      }}
                    >
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cs-tour">
          <span>Want to see it in person?</span>
          <div className="cs-tour-actions">
            <button
              className="cs-btn-tour"
              onClick={() =>
                navigate("/speciall-contact/tour", { state: { tour: true } })
              }
            >
              Book a Tour
            </button>
          </div>
        </div>
      </section>

      {/* ── Quote Modal ── */}
      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        defaultSize={selectedSize}
      />
    </>
  );
};

export default CompaniesSection;

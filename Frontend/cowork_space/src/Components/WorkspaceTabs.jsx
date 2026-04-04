import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import "../Styles/WorkspaceTabs.css";
import Reveal from "../Pages/Reveal";

function WorkspaceTabs() {
  const [activeTab, setActiveTab] = useState("day_pass");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get(`workspaces/categories/?type=${activeTab}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [activeTab]);

  const tabs = [
    { key: "day_pass", label: "Day Pass" },
    { key: "meeting", label: "Meeting Rooms" },
    { key: "fixed", label: "Fixed Seats" },
    { key: "cabin", label: "Cabins" },
  ];

  return (
    <section className="workspaces-section">
      <div className="workspaces-container">
        <Reveal>
          <p className="section-tag">Premium workspace options</p>
        </Reveal>

        <Reveal>
          <h2 className="main-title">
            Choose from premium spaces designed for productivity and comfort
          </h2>
        </Reveal>

        <Reveal>
          <p className="section-subtitle">
            Flexible options for solo professionals, client meetings, growing
            teams, and private work setups — all designed with comfort and
            efficiency in mind.
          </p>
        </Reveal>

        <div className="tabs-container">
          {tabs.map((tab) => (
            <Reveal key={tab.key}>
              <button
                className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </Reveal>
          ))}
        </div>

        <div className="cards-wrapper">
          {data.length > 0 ? (
            data.map((item) => (
              <article key={item.id} className="workspace-card">
                <div className="card-image">
                  <Reveal>
                    <img src={item.image} alt={item.name} />
                  </Reveal>
                  <span
                    className={`card-badge ${
                      item.is_available ? "available" : "unavailable"
                    }`}
                  >
                    {item.is_available ? "Available" : "Not Available"}
                  </span>
                </div>

                <div className="card-content">
                  <Reveal>
                    <h3 className="card-title">{item.name}</h3>
                  </Reveal>

                  <Reveal>
                    <p className="card-description">{item.description}</p>
                  </Reveal>

                  <div className="pricing-section">
                    <Reveal>
                      <div className="price-item">
                        <span className="price-label">Hourly</span>
                        <span className="price-value">₹{item.hourly_price}</span>
                      </div>
                    </Reveal>

                    <Reveal>
                      <div className="price-item">
                        <span className="price-label">Daily</span>
                        <span className="price-value">₹{item.daily_price}</span>
                      </div>
                    </Reveal>

                    <Reveal>
                      <div className="price-item">
                        <span className="price-label">Monthly</span>
                        <span className="price-value">₹{item.monthly_price}</span>
                      </div>
                    </Reveal>
                  </div>

                  <Reveal>
                    <div className="card-footer">
                      <button
                        className="know-more-btn"
                        onClick={() => navigate(`/details/${item.id}`)}
                      >
                        Know More
                      </button>
                    </div>
                  </Reveal>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No workspace found</h3>
              <p>Please try another category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WorkspaceTabs;
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
          <p className="section-tag">Hourly Bookings Available</p>
        </Reveal>

        <Reveal>
          <h2 className="main-title">
            Book by the hour — flexible workspaces that fit your schedule
          </h2>
        </Reveal>

        <Reveal>
          <p className="section-subtitle">
            Pay only for the time you need. From solo focus hours to team
            meetings, choose a space and book instantly — no long commitments.
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
            data.map((item, index) => (
              <article
                key={item.id}
                className="workspace-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="card-image">
                  <img src={item.image} alt={item.name} />
                  <span
                    className={`card-badge ${
                      item.is_available ? "available" : "unavailable"
                    }`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                  <div className="image-overlay" />
                </div>

                <div className="card-content">
                  <div className="card-top">
                    <h3 className="card-title">{item.name}</h3>
                    <p className="card-description">{item.description}</p>
                  </div>

                  <div className="card-bottom">
                    <div className="hourly-price-block">
                      <span className="price-label-main">Hourly Rate</span>
                      <div className="price-row">
                        <span className="price-value-main">₹{item.hourly_price}</span>
                        <span className="price-per">/hr</span>
                      </div>
                    </div>

                    <button
                      className="know-more-btn"
                      onClick={() => navigate(`/details/${item.id}`)}
                    >
                      Book Now
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">◻</span>
              <h3>No workspaces found</h3>
              <p>Try selecting a different category above.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WorkspaceTabs;

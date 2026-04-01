import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import "../Styles/WorkspaceTabs.css";
import Reveal from "../Pages/Reveal"
function WorkspaceTabs() {
  const [activeTab, setActiveTab] = useState("day_pass");
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  //  FETCH DATA
  useEffect(() => {
    axiosInstance.get(`workspaces/categories/?type=${activeTab}`)
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, [activeTab]);

  return (
    <div className="workspaces-container">
      <Reveal>
      <h2 className="main-title">Choose from premium spaces designed for productivity and comfort </h2>
</Reveal>
      {/* TABS */}
      <div className="tabs-container">
        <Reveal>
        <div className={`tab-item ${activeTab === "day_pass" ? "active" : ""}`} onClick={() => setActiveTab("day_pass")}>
          Day Pass
        </div>
          </Reveal>
          <Reveal>
        <div className={`tab-item ${activeTab === "meeting" ? "active" : ""}`} onClick={() => setActiveTab("meeting")}>
          Meeting Rooms
        </div>
        </Reveal>
        <Reveal>
        <div className={`tab-item ${activeTab === "fixed" ? "active" : ""}`} onClick={() => setActiveTab("fixed")}>
          Fixed Seats
        </div>
        </Reveal>
        <Reveal>
        <div className={`tab-item ${activeTab === "cabin" ? "active" : ""}`} onClick={() => setActiveTab("cabin")}>
          Cabins
        </div>
        </Reveal>
      
      </div>

      {/* HORIZONTAL CARDS */}
      <div className="cards-wrapper">
        {data.map(item => (
          <div key={item.id} className="workspace-card">
            
            <div className="card-image">
              <Reveal>
              <img src={item.image} alt={item.name} />
              </Reveal>
            </div>
            <div className="card-content">
              <Reveal>
              <h3 className="card-title">{item.name}</h3>
              </Reveal>
              <Reveal>
              <p className="card-description">{item.description}</p>
              </Reveal>
              <div className="pricing-section">
                <div className="price-item">
                  <Reveal>
                  <span className="price-label">💰 Hourly</span>
                  <span className="price-value">₹{item.hourly_price}</span>
                  </Reveal>
                </div>
                <div className="price-item">
                  <Reveal>
                  <span className="price-label">📅 Daily</span>
                  <span className="price-value">₹{item.daily_price}</span>
                  </Reveal>
                </div>
                <div className="price-item">
                  <Reveal>
                  <span className="price-label">📆 Monthly</span>
                  <span className="price-value">₹{item.monthly_price}</span>
                  </Reveal>
                </div>
              </div>
              <div className={`availability ${item.is_available ? "available" : "unavailable"}`}>
                {item.is_available ? "Available" : "Not Available"}
              </div>
            <button
  className="know-more-btn"
  onClick={() => {
    window.location.href = `/details/${item.id}`;
  }}
>
  Know More →
</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkspaceTabs;

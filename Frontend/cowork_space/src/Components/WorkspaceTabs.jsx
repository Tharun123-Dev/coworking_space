import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import "../Styles/WorkspaceTabs.css";

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
      <h2 className="main-title">Choose from premium spaces designed for productivity and comfort </h2>

      {/* TABS */}
      <div className="tabs-container">
        <div className={`tab-item ${activeTab === "day_pass" ? "active" : ""}`} onClick={() => setActiveTab("day_pass")}>
          Day Pass
        </div>
        <div className={`tab-item ${activeTab === "meeting" ? "active" : ""}`} onClick={() => setActiveTab("meeting")}>
          Meeting Rooms
        </div>
        <div className={`tab-item ${activeTab === "fixed" ? "active" : ""}`} onClick={() => setActiveTab("fixed")}>
          Fixed Seats
        </div>
        <div className={`tab-item ${activeTab === "cabin" ? "active" : ""}`} onClick={() => setActiveTab("cabin")}>
          Cabins
        </div>
      </div>

      {/* HORIZONTAL CARDS */}
      <div className="cards-wrapper">
        {data.map(item => (
          <div key={item.id} className="workspace-card">
            <div className="card-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="card-content">
              <h3 className="card-title">{item.name}</h3>
              <p className="card-description">{item.description}</p>
              <div className="pricing-section">
                <div className="price-item">
                  <span className="price-label">💰 Hourly</span>
                  <span className="price-value">₹{item.hourly_price}</span>
                </div>
                <div className="price-item">
                  <span className="price-label">📅 Daily</span>
                  <span className="price-value">₹{item.daily_price}</span>
                </div>
                <div className="price-item">
                  <span className="price-label">📆 Monthly</span>
                  <span className="price-value">₹{item.monthly_price}</span>
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

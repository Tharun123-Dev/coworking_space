import React from "react";
import "./BusinessSection.css";
import Reveal from "../Pages/Reveal";

const BusinessSection = ({ openModal }) => {
  const cards = [
    {
      id: "Startups",
      icon: "🚀",
      title: "Startups",
      desc: "Flexible and cost-effective spaces designed for fast-growing teams who need agility and collaboration.",
      tag: "Most Popular",
    },
    {
      id: "SMB's",
      icon: "🏢",
      title: "SMB's",
      desc: "Professional offices designed for smooth daily operations and seamless team productivity.",
      tag: "Best Value",
    },
    {
      id: "Enterprises",
      icon: "🏗️",
      title: "Enterprises",
      desc: "Custom-built offices with enterprise-grade infrastructure, security and dedicated support.",
      tag: "Premium",
    },
    {
      id: "Virtual Offices",
      icon: "💻",
      title: "Virtual Offices",
      desc: "Build your professional presence and business address without a physical workspace.",
      tag: "Remote Ready",
    },
  ];

  return (
    <section className="business-section">

      {/* ===== LEFT SIDE ===== */}
      <div className="business-left">

        <Reveal>
          <span className="sub-title">
            <span className="sub-dot"></span>
            To Whom We Cater
          </span>
        </Reveal>

        <Reveal>
          <h2>
            From Startups to{" "}
            <span className="highlight">Enterprises,</span>
            <br />
            in Every Stage of Growth
          </h2>
        </Reveal>

        <Reveal>
          <p className="desc">
            We understand that every business is unique. Whether you're just
            starting out or expanding operations, our flexible workspaces are
            designed to support your growth journey — at every stage.
          </p>
        </Reveal>

        {/* Mini stats row */}
        <Reveal>
          <div className="left-stats">
            <div className="left-stat">
              <span className="left-stat-num">500+</span>
              <span className="left-stat-label">Spaces</span>
            </div>
            <div className="left-stat-div"></div>
            <div className="left-stat">
              <span className="left-stat-num">10+</span>
              <span className="left-stat-label">Cities</span>
            </div>
            <div className="left-stat-div"></div>
            <div className="left-stat">
              <span className="left-stat-num">50K+</span>
              <span className="left-stat-label">Members</span>
            </div>
          </div>
        </Reveal>

        {/* Image with floating badge */}
        <Reveal>
          <div className="img-wrapper">
            <img src="/cowork.jpg" alt="workspace" />
            <div className="img-badge">
              <span className="img-badge-icon">⭐</span>
              <div>
                <strong>4.9 / 5</strong>
                <small>Rated by members</small>
              </div>
            </div>
          </div>
        </Reveal>

      </div>

      {/* ===== RIGHT SIDE — CARDS ===== */}
      <div className="business-right">
        {cards.map((card, index) => (
          <div
            className="card"
            key={card.id}
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <div className="card-tag">{card.tag}</div>
            <div className="card-icon">{card.icon}</div>

            <Reveal>
              <h3>{card.title}</h3>
            </Reveal>

            <Reveal>
              <p>{card.desc}</p>
            </Reveal>

            <Reveal>
              <button onClick={() => openModal(card.id)} className="card-btn">
                <span>Know More</span>
                <span className="card-btn-arrow">→</span>
              </button>
            </Reveal>

          </div>
        ))}
      </div>

    </section>
  );
};

export default BusinessSection;

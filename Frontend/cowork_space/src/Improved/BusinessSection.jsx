import React from "react";
import "./BusinessSection.css";
import Reveal from "../Pages/Reveal"

const BusinessSection = ({ openModal }) => {
  return (
    <section className="business-section">

      {/* LEFT SIDE */}
      <div className="business-left">
        <Reveal>

        <h5 className="sub-title">TO WHOM WE CATER</h5>
        </Reveal>
  <Reveal>
        <h2>
          From Startups to Enterprises,
          <br />
          in Every Stage of Growth
        </h2>
        </Reveal>
<Reveal>
        <p className="desc">
          We understand that every business is unique. Whether you're just starting out
          or expanding your operations, our flexible workspaces are designed to support
          your growth journey.
        </p>
        </Reveal>
        <Reveal>

        <img src="/cowork.jpg" alt="workspace" />
        </Reveal>

      </div>

      {/* RIGHT SIDE */}
      <div className="business-right">

        {/* STARTUPS */}
        <div className="card">
            <Reveal>
          <h3>Startups</h3>
          </Reveal>
          <Reveal>
          <p>Flexible and cost-effective spaces for growing teams.</p>
          </Reveal>
          <button onClick={() => openModal("Startups")}>
            Know More →
          </button>
        </div>

        {/* SMB */}
        <div className="card">
        <Reveal>
          
          <h3>SMB's</h3>
          </Reveal>
          
        <Reveal>
          <p>Professional offices designed for smooth operations.</p>
          </Reveal>
          <Reveal>
          <button onClick={() => openModal("SMB's")}>
            Know More →
          </button>
          </Reveal>
        </div>

        {/* ENTERPRISE */}
        <div className="card">
            <Reveal>
          <h3>Enterprises</h3>
          </Reveal>
          <Reveal>
          <p>Custom-built offices with enterprise-grade infrastructure.</p>
          </Reveal>
          <Reveal>
          <button onClick={() => openModal("Enterprises")}>
            Know More →
          </button>
          </Reveal>
        </div>

        {/* VIRTUAL */}
        <div className="card">
            <Reveal>
          <h3>Virtual Offices</h3>
          </Reveal>
          <Reveal>
          <p>Build your presence without a physical workspace.</p>
          </Reveal>
          <Reveal>
          <button onClick={() => openModal("Virtual Offices")}>
            Know More →
          </button>
          </Reveal>
        </div>

      </div>

    </section>
  );
};

export default BusinessSection;
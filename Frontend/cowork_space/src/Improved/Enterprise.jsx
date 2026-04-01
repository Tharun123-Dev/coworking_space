import React, { useRef, useState } from "react";
import "./Enterprise.css";
import axiosInstance from "../Services/Axios";

function Enterprise() {
  const contactRef = useRef(null);

  const scrollToContact = () => {
    contactRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // 🔷 FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    workspace_type: "",
    company_size: "",
    notes: "",
  });

  // 🔷 HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔷 HANDLE SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    axiosInstance
      .post("enterprise-leads/", formData)
      .then(() => {
        alert("✅ Submitted successfully!");

        setFormData({
          name: "",
          phone: "",
          email: "",
          workspace_type: "",
          company_size: "",
          notes: "",
        });
      })
      .catch((err) => {
        console.log(err);
        alert("❌ Error submitting form");
      });
  };

  return (
    <div className="enterprise-container">

      {/* 🔷 HERO */}
      <section className="enterprise-hero">
        <div className="enterprise-hero-content">
          <h1>Looking for an office that’s built for your business?</h1>
          <button onClick={scrollToContact} className="enterprise-btn">
            Get in touch
          </button>
        </div>
      </section>

      {/* 🔷 CONTACT */}
      <section className="enterprise-contact" ref={contactRef}>
        <div className="enterprise-contact-left">
          <img
            src="https://images.unsplash.com/photo-1604328698692-f76ea9498e76"
            alt="workspace"
          />
        </div>

        <div className="enterprise-contact-right">
          <h2>Got questions? We've got answers.</h2>
          <p>
            Fill out the form and our Hyderabad team will get in touch with you.
          </p>

          {/* 🔥 FORM START */}
          <form onSubmit={handleSubmit}>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name*"
              required
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Company email address*"
              required
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number*"
              required
            />

            <select
              name="workspace_type"
              value={formData.workspace_type}
              onChange={handleChange}
              required
            >
              <option value="">Workspace type*</option>
              <option value="Private Office">Private Office</option>
              <option value="Managed Office">Managed Office</option>
            </select>

            <select
              name="company_size"
              value={formData.company_size}
              onChange={handleChange}
              required
            >
              <option value="">Company Size*</option>
              <option value="1-10">1-10</option>
              <option value="10-50">10-50</option>
              <option value="50+">50+</option>
            </select>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional Notes"
            />

            <button type="submit" className="enterprise-submit">
              Submit
            </button>

          </form>
          {/* 🔥 FORM END */}
        </div>
      </section>

      {/* 🔷 ENTERPRISE IT SECTION */}
      <section className="enterprise-it">
        <div className="enterprise-it-left">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
            alt="meeting"
          />
        </div>

        <div className="enterprise-it-right">
          <h2>Enterprise-focused IT solutions</h2>
          <p>
            Enhance your business performance with high-speed internet, secure
            networks, and modern coworking infrastructure in Hyderabad.
          </p>
        </div>
      </section>

      {/* 🔷 SOLUTIONS */}
      <section className="enterprise-solutions">
        <h2>Solutions for enterprise</h2>

        <div className="enterprise-cards">
          <div className="enterprise-card">
            <h3>Private Offices</h3>
            <p>Fully furnished office spaces with 24/7 access.</p>
            <button onClick={scrollToContact}>Enquire Now</button>
          </div>

          <div className="enterprise-card">
            <h3>Team Spaces</h3>
            <p>Flexible seating for growing teams.</p>
            <button onClick={scrollToContact}>Enquire Now</button>
          </div>

          <div className="enterprise-card">
            <h3>Managed Offices</h3>
            <p>Custom-designed office solutions.</p>
            <button onClick={scrollToContact}>Enquire Now</button>
          </div>
        </div>
      </section>

      {/* 🔷 WHY */}
      <section className="enterprise-why">
        <div className="enterprise-why-left">
          <h2>Why choose our Hyderabad coworking?</h2>
          <p>
            We provide scalable office solutions with premium infrastructure and
            flexible pricing.
          </p>

          <ul>
            <li>Hybrid solutions</li>
            <li>Custom office setup</li>
            <li>Flexible pricing</li>
            <li>Prime locations</li>
          </ul>
        </div>

        <div className="enterprise-why-right">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c"
            alt="building"
          />
        </div>
      </section>

      {/* 🔷 FINAL CTA */}
      <section className="enterprise-cta">
        <h2>Ready to scale your business in Hyderabad?</h2>
        <button onClick={scrollToContact} className="enterprise-btn">
          Get in touch
        </button>
      </section>

    </div>
  );
}

export default Enterprise;
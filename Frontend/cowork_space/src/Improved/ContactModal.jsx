import React, { useState } from "react";
import axiosInstance from "../Services/Axios";
import "./ContactModal.css";
import Reveal from "../Pages/Reveal"

const ContactModal = ({ selected, setSelected }) => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    team_size: "",
    message: "",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("leads/leadss/", {
        ...form,
        workspace_type: selected,
      });

      alert("✅ Lead submitted successfully!");

      // reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        team_size: "",
        message: "",
      });

      // close modal
      setSelected(null);

    } catch (error) {
      console.log(error);
      alert("❌ Error submitting form");
    }
  };

  // DO NOT SHOW MODAL IF NOT SELECTED
  if (!selected) return null;

  return (
    <div className="modal-overlay">

      {/* BACK BUTTON */}
      <Reveal>
      <button className="back-btn" onClick={() => setSelected(null)}>
        ← Back
      </button>
      </Reveal>

      <div className="contact-container">

        {/* LEFT SIDE */}
        <div className="contact-left">
          <Reveal>
          <h5 className="sub-title">CONTACT</h5>
          </Reveal>
          <Reveal>

          <h2>Get in Touch</h2>
          </Reveal>
          <Reveal>
          <p>
            Reach out to us to explore workspace options tailored for your business.
          </p>
          </Reveal>

          <div className="contact-info">
            <Reveal>
            <p>📍 Hyderabad Locations</p>
            <p>📞 9696008899</p>
            <p>✉️ we@growork.in</p>
            </Reveal>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="contact-right">
          <Reveal>
          <h3>Send a message</h3>
          </Reveal>
          <Reveal>
          <p className="selected-text">
            Selected: {selected}
          </p>
          </Reveal>

          <form onSubmit={handleSubmit}>

            <label>Name *</label>
            <Reveal>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            </Reveal>

            <label>Email *</label>
            <Reveal>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            </Reveal>

            <label>Phone *</label>
            <Reveal>
            <input
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            </Reveal>

            <label>Team Size *</label>
            <select
              name="team_size"
              value={form.team_size}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>1-3</option>
              <option>4-6</option>
              <option>6-10</option>
              <option>10+</option>
            </select>

            <label>Message</label>
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
            />
            <Reveal>

            <button type="submit">Submit</button>
            </Reveal>

          </form>

        </div>

      </div>
    </div>
  );
};

export default ContactModal;
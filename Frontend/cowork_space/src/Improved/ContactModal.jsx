import React, { useState } from "react";
import axiosInstance from "../Services/Axios";
import "./ContactModal.css";
import Reveal from "../Pages/Reveal";

const ContactModal = ({ selected, setSelected }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    team_size: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("leads/leadss/", {
        ...form,
        workspace_type: selected,
      });

      alert("✅ Lead submitted successfully!");

      setForm({
        name: "",
        email: "",
        phone: "",
        team_size: "",
        message: "",
      });

      setSelected(null);
    } catch (error) {
      console.log(error);
      alert("❌ Error submitting form");
    }
  };

  if (!selected) return null;

  return (
    <div className="cmModalOverlay">
      <div className="cmBackgroundGlow cmGlowOne"></div>
      <div className="cmBackgroundGlow cmGlowTwo"></div>
      <div className="cmBackgroundGrid"></div>

      <Reveal>
        <button className="cmBackButton" onClick={() => setSelected(null)}>
          <span>←</span> Back
        </button>
      </Reveal>

      <div className="cmModalShell">
        <div className="cmInfoPanel">
          <Reveal>
            <p className="cmMiniTag">Contact</p>
          </Reveal>

          <Reveal>
            <h2 className="cmTitle">Get in Touch</h2>
          </Reveal>

          <Reveal>
            <p className="cmDescription">
              Reach out to us to explore workspace options tailored for your
              business and team size.
            </p>
          </Reveal>

          <div className="cmInfoList">
            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">📍</span>
                <p>Hyderabad Locations</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">📞</span>
                <p>9696008899</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">✉️</span>
                <p>we@cowork.in</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="cmSelectedBadge">
              <span className="cmSelectedLabel">Selected Workspace</span>
              <strong>{selected}</strong>
            </div>
          </Reveal>
        </div>

        <div className="cmFormPanel">
          <Reveal>
            <h3 className="cmFormTitle">Send a Message</h3>
          </Reveal>

          <form className="cmForm" onSubmit={handleSubmit}>
            <div className="cmFieldGroup">
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
            </div>

            <div className="cmFieldGroup">
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
            </div>

            <div className="cmFieldGroup">
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
            </div>

            <div className="cmFieldGroup">
              <label>Team Size *</label>
              <Reveal>
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
              </Reveal>
            </div>

            <div className="cmFieldGroup cmFieldFull">
              <label>Message</label>
              <Reveal>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={form.message}
                  onChange={handleChange}
                />
              </Reveal>
            </div>

            <Reveal>
              <button type="submit" className="cmSubmitButton">
                Submit Enquiry
              </button>
            </Reveal>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
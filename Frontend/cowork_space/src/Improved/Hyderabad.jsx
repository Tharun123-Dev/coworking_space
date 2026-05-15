import React, { useEffect, useState } from "react";
import "./Hyderabad.css";
import axiosInstance from "../Services/Axios";
import { useNavigate, useLocation } from "react-router-dom";

// ── 8 workspace types ─────────────────────────────────────────
const workspaces = [
  {
    id: "hot-desk",
    label: "Hot Desk",
    tagline: "We Allow People to Feel Focused and Comfortable",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85",
    amenities: ["High-Speed Wi-Fi", "Ergonomic Chair", "Locker Access", "Cafeteria", "24/7 Access"],
  },
  {
    id: "dedicated-desk",
    label: "Dedicated Desk",
    tagline: "Your Permanent Desk, Your Personal Space",
    image: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1400&q=85",
    amenities: ["Reserved Desk", "Personal Storage", "Mail Handling", "Printing Access", "Meeting Room Credits"],
  },
  {
    id: "private-office",
    label: "Private Office Space",
    tagline: "Fully Branded Private Floors for Your Team",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85",
    amenities: ["Custom Branding", "Dedicated Floor", "IT Infrastructure", "Reception Support", "Concierge Service"],
  },
  {
    id: "private-cabin",
    label: "Private Cabin",
    tagline: "Focused, Enclosed Cabins for Deep Work",
    image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1400&q=85",
    amenities: ["Soundproofing", "Private Entry", "AC Control", "Whiteboards", "Power Backup"],
  },
  {
    id: "meeting-room",
    label: "Meeting Room",
    tagline: "Premium AV-Equipped Rooms for Every Occasion",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1400&q=85",
    amenities: ["4K Display", "Video Conferencing", "Whiteboard", "Seating up to 12", "Tea & Coffee"],
  },
  {
    id: "board-room",
    label: "Board Room",
    tagline: "Flagship Boardrooms for High-Stakes Decisions",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1400&q=85",
    amenities: ["Executive Seating", "Dual Screens", "Catering Service", "Soundproofed Walls", "Secretarial Support"],
  },
  {
    id: "podcast",
    label: "Podcast",
    tagline: "Studio-Grade Recording and Streaming Space",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&q=85",
    amenities: ["Pro Microphones", "Acoustic Treatment", "Live Streaming", "Video Recording", "Editing Suite"],
  },
  {
    id: "virtual-office",
    label: "Virtual Office",
    tagline: "Prestigious Address. Zero Overhead. Pure Freedom.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1400&q=85",
    amenities: ["Business Address", "Mail Forwarding", "Call Answering", "GST Registration", "On-Demand Desk Access"],
  },
];

// ── Contact Modal ─────────────────────────────────────────────
function ContactModal({ onClose, preselect }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    workspace_type: preselect || "",
    preferred_location: "",
    company_size: "",
    notes: "",
  });

  const locations = ["Hitech City", "Madhapur", "Gachibowli", "Kondapur"];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Please fill required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post("enterprise-leads/", formData);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="wm-overlay" onClick={onClose}>
      <div className="wm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wm-close" onClick={onClose} aria-label="Close">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <div className="wm-success">
            <div className="wm-success-icon">✓</div>
            <h3>Request Received!</h3>
            <p>
              Our team will reach out within <strong>12 hours</strong> with
              options tailored to your needs.
            </p>
            <div className="wm-success-note">
              📞 Expect a call from +91 6309383826
            </div>
            <button className="wm-success-close" onClick={onClose}>
              Close
            </button>
          </div>
        ) : isSubmitting ? (
          <div className="wm-loading">
            <div className="wm-spinner"></div>
            <p>Submitting your request…</p>
          </div>
        ) : (
          <>
            <div className="wm-header">
              <span className="wm-eyebrow">Workspace Enquiry</span>
              <h3 className="wm-title">
                Book <em>{preselect || "a Space"}</em>
              </h3>
              <p className="wm-sub">
                Our Hyderabad team will call you within 12 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="wm-form" noValidate>
              <div className="wm-row">
                <div className="wm-field">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <input
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="wm-field">
                  <label>
                    Phone <span>*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="wm-field">
                <label>
                  Work Email <span>*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="work@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="wm-row">
                <div className="wm-field">
                  <label>Workspace Type</label>
                  <select
                    name="workspace_type"
                    value={formData.workspace_type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="Hot Desk">Hot Desk</option>
                    <option value="Dedicated Desk">Dedicated Desk</option>
                    <option value="Private Office Space">Private Office Space</option>
                    <option value="Private Cabin">Private Cabin</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Board Room">Board Room</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Virtual Office">Virtual Office</option>
                  </select>
                </div>
                <div className="wm-field">
                  <label>Company Size</label>
                  <select
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleChange}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1–10 people</option>
                    <option value="10-50">10–50 people</option>
                    <option value="50-200">50–200 people</option>
                    <option value="200+">200+ people</option>
                  </select>
                </div>
                <div className="wm-field">
                  <label>Preferred Location</label>
                  <select
                    name="preferred_location"
                    value={formData.preferred_location}
                    onChange={handleChange}
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wm-field">
                <label>Additional Requirements</label>
                <textarea
                  name="notes"
                  placeholder="Timeline, location preference, fitout needs…"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="wm-submit">
                Submit Request <span>→</span>
              </button>
              <p className="wm-note">
                🔒 Your details are 100% confidential and never shared.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main WorkspaceSection ─────────────────────────────────────
export default function WorkspaceSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceType = location.state?.workspaceType;

  const [selectedType, setSelectedType] = useState("All");
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreselect, setModalPreselect] = useState("");

  useEffect(() => {
    if (workspaceType) {
      setSelectedType(workspaceType);
    }
  }, [workspaceType]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % workspaces.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const openModal = (label) => {
    setModalPreselect(label);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
  };

  const current = workspaces[active];

  return (
    <section className="ws-root">
      <div className="ws-heading">
        <h2>Where Hyderabad Finds Its Focus</h2>
      </div>

      <div className="ws-tabs-wrap">
        <div className="ws-tabs">
          {workspaces.map((ws, i) => (
            <button
              key={ws.id}
              className={`ws-tab${active === i ? " ws-tab--active" : ""}`}
              onClick={() => setActive(i)}
            >
              {ws.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ws-image-shell">
        <div className="ws-image-wrap">
          {workspaces.map((ws, i) => (
            <img
              key={ws.id}
              src={ws.image}
              alt={ws.label}
              className={`ws-image${active === i ? " ws-image--visible" : ""}`}
            />
          ))}

          <div className="ws-bar">
            <div className="ws-bar-left">
              <span className="ws-bar-type">{current.label}</span>
              <span className="ws-bar-tagline">{current.tagline}</span>
              <div className="ws-amenities">
                {current.amenities.map((item) => (
                  <span key={item} className="ws-amenity-tag">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Buttons group — uses CSS class for responsive layout ── */}
            <div className="ws-bar-buttons">
              <button
                className="ws-bar-btn"
                onClick={() => openModal(current.label)}
              >
                Contact Now
              </button>

              <button
                className="ws-bar-btn ws-bar-btn--green"
                onClick={() =>
                  navigate("/Enterprise", {
                    state: { workspaceType: current.label },
                  })
                }
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ContactModal onClose={closeModal} preselect={modalPreselect} />
      )}
    </section>
  );
}

import React, { useRef, useState, useEffect } from "react";
import "./Enterprise.css";
import axiosInstance from "../Services/Axios";

/* ── Trusted enterprise logos (text-based) ── */
const trustedCompanies = [
  "TCS", "Infosys", "Wipro", "Deloitte", "Accenture",
  "KPMG", "EY India", "HCL Tech", "Tech Mahindra", "Capgemini",
  "IBM India", "Oracle", "SAP Labs", "Microsoft", "Google India",
  "Amazon", "Flipkart", "Zomato", "HDFC Bank", "ICICI Bank",
];

/* ── Space types ── */
const spaceTypes = [
  {
    id: "private",
    icon: "🔒",
    label: "Private Offices",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    tag: "Most Booked",
    short: "Fully furnished, branded offices with 24/7 access.",
    features: ["Dedicated floor entry", "Custom branding", "24/7 CCTV", "Ergonomic furniture", "1Gbps fibre", "AC + backup"],
    price: "From ₹18,000/mo",
  },
  {
    id: "managed",
    icon: "🏗️",
    label: "Managed Offices",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600",
    tag: "Enterprise Favourite",
    short: "End-to-end managed offices designed to your spec.",
    features: ["Custom fitout", "Dedicated IT team", "Receptionist", "Pantry service", "SLA guarantee", "GST invoice"],
    price: "Custom pricing",
  },
  {
    id: "team",
    icon: "👥",
    label: "Team Spaces",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
    tag: "Flexible",
    short: "Open or closed team bays for 5–100 members.",
    features: ["Hot desks + cabins", "Collaborative zones", "Standing desks", "Video call booths", "Whiteboards", "Unlimited coffee"],
    price: "From ₹8,500/mo",
  },
  {
    id: "meeting",
    icon: "🤝",
    label: "Meeting Rooms",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600",
    tag: "Book by Hour",
    short: "Premium AV-equipped board rooms & conference halls.",
    features: ["4K display + HDMI", "Video conferencing", "Whiteboards", "Catering available", "Sound-proof pods", "30-seat capacity"],
    price: "From ₹500/hr",
  },
  {
    id: "lounge",
    icon: "☕",
    label: "Executive Lounges",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
    tag: "VIP Access",
    short: "Premium lounge access for client meetings & relaxation.",
    features: ["Barista coffee bar", "Curated seating", "Quiet zones", "Reading library", "Newspaper & TV", "Guest passes"],
    price: "Included in plans",
  },
  {
    id: "virtual",
    icon: "🌐",
    label: "Virtual Offices",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600",
    tag: "Remote Ready",
    short: "Prestigious Hyderabad address for your remote company.",
    features: ["Business address", "Mail & courier handle", "Meeting room credits", "GST-ready docs", "Receptionist calls", "Pan-city access"],
    price: "From ₹2,500/mo",
  },
];

/* ── Perfect Office features ── */
const perfectFeatures = [
  { icon: "⚡", title: "1 Gbps Fibre WiFi", desc: "Dedicated enterprise-grade internet with zero downtime SLA." },
  { icon: "🔐", title: "Bank-Grade Security", desc: "Biometric entry, 24/7 CCTV, and NDA-compliant environments." },
  { icon: "🏆", title: "Prestigious Address", desc: "Prime Hyderabad locations — Gachibowli, Hitec City & Banjara Hills." },
  { icon: "🛠️", title: "IT Infrastructure", desc: "Dedicated server room, VPN-ready network, and on-site IT support." },
  { icon: "🤝", title: "Concierge Service", desc: "Dedicated account manager and on-demand office concierge." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Track space utilization, billing & bookings in real-time." },
  { icon: "☕", title: "Premium Cafeteria", desc: "Gourmet chef, barista counter, and curated healthy menus." },
  { icon: "🚗", title: "Ample Parking", desc: "Reserved car + bike parking with EV charging points." },
];

/* ── Testimonials ── */
const testimonials = [
  {
    quote: "Shifting our 80-person team to this coworking space was the best operational decision we made. Productivity skyrocketed and overheads dropped 40%.",
    name: "Arjun Mehta",
    title: "VP Operations, TechNova India",
    avatar: "AM",
    stars: 5,
  },
  {
    quote: "The managed office setup was ready in 72 hours. The team handled everything — branding, IT, even the pantry. Absolutely enterprise-class.",
    name: "Sneha Rao",
    title: "Director, Deloitte Consulting",
    avatar: "SR",
    stars: 5,
  },
  {
    quote: "We've hosted client visits across 4 of their Hyderabad locations. Every single time, clients are impressed. It reflects well on our brand.",
    name: "Karan Verma",
    title: "Head of BD, FinEdge Solutions",
    avatar: "KV",
    stars: 5,
  },
  {
    quote: "The virtual office plan gave us a credible Hitec City address without the overhead. GST registration was seamless. Highly recommended.",
    name: "Priya Nambiar",
    title: "Founder, CloudStack Labs",
    avatar: "PN",
    stars: 5,
  },
];

/* ── Why Choose ── */
const whyPoints = [
  { icon: "📍", title: "Prime Locations", desc: "25+ spaces across Hyderabad's top business corridors" },
  { icon: "⚙️", title: "Fully Customisable", desc: "Fitout, branding & layout designed around your team" },
  { icon: "📈", title: "Scale Up Instantly", desc: "Add seats or floors within 48 hrs — zero delays" },
  { icon: "💰", title: "Transparent Pricing", desc: "All-inclusive billing — no hidden charges, ever" },
];

/* ── Contact Form Modal ── */
function ContactModal({ onClose, preselect }) {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "",
    workspace_type: preselect || "",
    company_size: "", notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    <div className="ep-modal-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={e => e.stopPropagation()}>
        <button className="ep-modal-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="ep-modal-glow"></div>

        {/* Modal Left */}
        <div className="ep-modal-left">
          <span className="ep-modal-eyebrow">Enterprise Enquiry</span>
          <h3 className="ep-modal-heading">Let's Build Your<br /><em>Perfect Office</em></h3>
          <p className="ep-modal-sub">Our Hyderabad workspace specialists will call you within 12 hours with curated options.</p>
          <div className="ep-modal-divider"></div>
          <div className="ep-modal-perks">
            {["Same-day site visit", "Volume pricing available", "Custom fitout support", "Dedicated account manager"].map(p => (
              <div key={p} className="ep-modal-perk">
                <span className="ep-modal-perk-check">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <a href="tel:6309383826" className="ep-modal-phone">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call us: +91 6309383826
          </a>
        </div>

        {/* Modal Right */}
        <div className="ep-modal-right">
          {submitted ? (
            <div className="ep-modal-success">
              <div className="ep-success-ring"><span>✓</span></div>
              <h4>Request Received!</h4>
              <p>Our enterprise team will reach out within <strong>12 hours</strong> with tailored workspace options for your team.</p>
              <div className="ep-success-note">📞 Expect a call from +91 6309383826</div>
              <button className="ep-success-close" onClick={onClose}>Close</button>
            </div>
          ) : isSubmitting ? (
            <div className="ep-modal-submitting">
              <div className="ep-spin-rings"><div></div><div></div><div></div></div>
              <p className="ep-spin-title">Processing<span className="ep-spin-dots"></span></p>
              <p className="ep-spin-sub">Connecting you with our enterprise team</p>
              <div className="ep-spin-bar"><div className="ep-spin-fill"></div></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ep-modal-form" noValidate>
              <h4 className="ep-form-title">Book a Space / Get a Quote</h4>

              <div className="ep-form-row">
                <div className="ep-form-group">
                  <label>Full Name <span>*</span></label>
                  <div className="ep-input-wrap">
                    <svg className="ep-fi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="ep-form-group">
                  <label>Phone <span>*</span></label>
                  <div className="ep-input-wrap">
                    <svg className="ep-fi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <input name="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="ep-form-group ep-form-full">
                <label>Work Email <span>*</span></label>
                <div className="ep-input-wrap">
                  <svg className="ep-fi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input name="email" type="email" placeholder="work@company.com" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="ep-form-row">
                <div className="ep-form-group">
                  <label>Workspace Type</label>
                  <div className="ep-input-wrap">
                    <svg className="ep-fi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    <select name="workspace_type" value={formData.workspace_type} onChange={handleChange}>
                      <option value="">Select type</option>
                      <option value="Private Office">Private Office</option>
                      <option value="Managed Office">Managed Office</option>
                      <option value="Team Space">Team Space</option>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Virtual Office">Virtual Office</option>
                      <option value="Executive Lounge">Executive Lounge</option>
                    </select>
                  </div>
                </div>
                <div className="ep-form-group">
                  <label>Company Size</label>
                  <div className="ep-input-wrap">
                    <svg className="ep-fi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <select name="company_size" value={formData.company_size} onChange={handleChange}>
                      <option value="">Select size</option>
                      <option value="1-10">1–10 people</option>
                      <option value="10-50">10–50 people</option>
                      <option value="50-200">50–200 people</option>
                      <option value="200+">200+ people</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ep-form-group ep-form-full">
                <label>Additional Requirements</label>
                <div className="ep-input-wrap ep-ta-wrap">
                  <textarea name="notes" placeholder="Custom fitout? Specific floor? Timeline? Let us know..." value={formData.notes} onChange={handleChange} rows="3" />
                </div>
              </div>

              <button type="submit" className="ep-form-submit">
                <span>Submit Enterprise Request</span>
                <span className="ep-submit-arrow">→</span>
              </button>
              <p className="ep-form-note">🔒 Your data is 100% confidential and never shared.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN ENTERPRISE PAGE
════════════════════════════════════════ */
export default function Enterprise() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreselect, setModalPreselect] = useState("");
  const [activeSpace, setActiveSpace] = useState(null);

  const openModal = (preselect = "") => {
    setModalPreselect(preselect);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
  };

  // Ticker clone for seamless loop
  const tickerItems = [...trustedCompanies, ...trustedCompanies];

  return (
    <div className="ep-page">

      {/* ══════════════════════════════
          1. HERO
      ══════════════════════════════ */}
      <section className="ep-hero">
        <div className="ep-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=85"
            alt="Enterprise workspace"
            className="ep-hero-img"
          />
          <div className="ep-hero-overlay"></div>
          <div className="ep-hero-grid"></div>
        </div>

        <div className="ep-hero-content">
          <div className="ep-hero-text">
            <span className="ep-hero-eyebrow">
              <span className="ep-pulse"></span>
              Hyderabad's Enterprise Workspace Leader
            </span>
            <h1 className="ep-hero-title">
              <span className="ep-hero-t1">Offices Built</span>
              <span className="ep-hero-t2">for <em>Enterprise.</em></span>
              <span className="ep-hero-t3">Scale Without Limits.</span>
            </h1>
            <p className="ep-hero-sub">
              Premium managed offices, private suites &amp; team spaces across 25+ Hyderabad locations.
              Trusted by 50+ companies — from Series A startups to Fortune 500s.
            </p>

            <div className="ep-hero-stats">
              {[
                { num: "50+", lbl: "Enterprise Clients" },
                { num: "25+", lbl: "Prime Locations" },
                { num: "5000+", lbl: "Seats Available" },
                { num: "4.9★", lbl: "Client Rating" },
              ].map(s => (
                <div key={s.lbl} className="ep-hero-stat">
                  <span className="ep-hero-stat-num">{s.num}</span>
                  <span className="ep-hero-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>

            <div className="ep-hero-ctas">
              <button className="ep-btn-primary" onClick={() => openModal()}>
                Book a Space Now
                <span>→</span>
              </button>
              <a href="tel:6309383826" className="ep-btn-secondary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Talk to Expert: +91 6309383826
              </a>
            </div>
          </div>
        </div>

        <div className="ep-scroll-hint">
          <div className="ep-scroll-dot"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ══════════════════════════════
          2. TRUSTED BY (TICKER)
      ══════════════════════════════ */}
      <section className="ep-trusted">
        <div className="ep-trusted-header">
          <span className="ep-section-eyebrow">Trusted & Recommended By</span>
          <p className="ep-trusted-sub">50+ enterprises across Hyderabad rely on us daily</p>
        </div>
        <div className="ep-ticker-track">
          <div className="ep-ticker-inner">
            {tickerItems.map((company, i) => (
              <div key={i} className="ep-ticker-item">
                <span className="ep-ticker-dot"></span>
                <span>{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          3. PERFECT OFFICE
      ══════════════════════════════ */}
      <section className="ep-perfect">
        <div className="ep-section-head">
          <span className="ep-section-eyebrow">Everything You Need</span>
          <h2 className="ep-section-title">
            Everything you need for a<br />
            <em>Perfect Office.</em>
          </h2>
          <p className="ep-section-desc">
            From blazing-fast internet to concierge service — every detail is handled so your
            team can focus on what matters most.
          </p>
        </div>

        <div className="ep-perfect-grid">
          {perfectFeatures.map((f, i) => (
            <div key={f.title} className="ep-perfect-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="ep-perfect-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="ep-perfect-cta">
          <button className="ep-btn-primary" onClick={() => openModal()}>
            See More Features
            <span>→</span>
          </button>
          <a href="tel:6309383826" className="ep-expert-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Talk to an Expert
          </a>
        </div>
      </section>

      {/* ══════════════════════════════
          4. SPACE TYPES
      ══════════════════════════════ */}
      <section className="ep-spaces">
        <div className="ep-section-head">
          <span className="ep-section-eyebrow">Our Spaces</span>
          <h2 className="ep-section-title">
            Meeting Rooms, Lounges,<br /><em>Offices & More.</em>
          </h2>
          <p className="ep-section-desc">
            Every space type you need under one roof. Click any space to enquire or book instantly.
          </p>
        </div>

        <div className="ep-spaces-grid">
          {spaceTypes.map((space, idx) => (
            <div
              key={space.id}
              className={`ep-space-card ${activeSpace === space.id ? "ep-space-card--open" : ""}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="ep-space-img-wrap">
                <img src={space.image} alt={space.label} />
                <div className="ep-space-img-overlay"></div>
                <span className="ep-space-tag">{space.tag}</span>
                <div className="ep-space-hover-cta" onClick={() => openModal(space.label)}>
                  <span>📅 Book Now</span>
                </div>
              </div>

              <div className="ep-space-body">
                <div className="ep-space-type-icon">{space.icon}</div>
                <h3>{space.label}</h3>
                <p className="ep-space-short">{space.short}</p>

                {/* Expandable features */}
                {activeSpace === space.id && (
                  <div className="ep-space-features">
                    {space.features.map(f => (
                      <div key={f} className="ep-space-feat">
                        <span className="ep-feat-check">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                    <div className="ep-space-price">{space.price}</div>
                  </div>
                )}

                <div className="ep-space-actions">
                  <button
                    className="ep-space-know"
                    onClick={() => setActiveSpace(activeSpace === space.id ? null : space.id)}
                  >
                    {activeSpace === space.id ? "Less Info ↑" : "Know More ↓"}
                  </button>
                  <button className="ep-space-book" onClick={() => openModal(space.label)}>
                    Book Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          5. WHY CHOOSE US
      ══════════════════════════════ */}
      <section className="ep-why">
        <div className="ep-why-inner">
          <div className="ep-why-left">
            <span className="ep-section-eyebrow">Why Choose Us</span>
            <h2 className="ep-section-title ep-why-title">
              Hyderabad's Most Trusted<br /><em>Enterprise Workspace.</em>
            </h2>
            <p className="ep-section-desc">
              We don't just offer desks — we build environments where enterprises thrive.
              Scalable, beautiful, and built around your business.
            </p>
            <div className="ep-why-points">
              {whyPoints.map(w => (
                <div key={w.title} className="ep-why-point">
                  <div className="ep-why-icon">{w.icon}</div>
                  <div>
                    <p className="ep-why-ptitle">{w.title}</p>
                    <p className="ep-why-pdesc">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="ep-btn-primary" onClick={() => openModal()}>
              Get a Custom Quote
              <span>→</span>
            </button>
          </div>

          <div className="ep-why-right">
            <div className="ep-why-img-stack">
              <img
                className="ep-why-img ep-why-img--top"
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600"
                alt="enterprise workspace"
              />
              <img
                className="ep-why-img ep-why-img--bot"
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600"
                alt="team space"
              />
              <div className="ep-why-float-badge">
                <span className="ep-why-badge-num">50+</span>
                <span className="ep-why-badge-lbl">Enterprise Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════ */}
      <section className="ep-testimonials">
        <div className="ep-section-head">
          <span className="ep-section-eyebrow">What Our Clients Say</span>
          <h2 className="ep-section-title">Trusted by Leaders,<br /><em>Loved by Teams.</em></h2>
        </div>

        <div className="ep-testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={t.name} className="ep-testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="ep-testi-quote-icon">"</div>
              <div className="ep-testi-stars">
                {Array(t.stars).fill(0).map((_, si) => <span key={si}>★</span>)}
              </div>
              <p className="ep-testi-text">"{t.quote}"</p>
              <div className="ep-testi-author">
                <div className="ep-testi-avatar">{t.avatar}</div>
                <div>
                  <p className="ep-testi-name">{t.name}</p>
                  <p className="ep-testi-title">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          7. FINAL CTA BANNER
      ══════════════════════════════ */}
      <section className="ep-final-cta">
        <div className="ep-final-cta-bg">
          <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600" alt="cta bg" />
          <div className="ep-final-cta-overlay"></div>
        </div>
        <div className="ep-final-cta-content">
          <span className="ep-section-eyebrow ep-eyebrow-light">Ready to Scale?</span>
          <h2 className="ep-final-cta-title">
            Book Your Enterprise Workspace<br />in Hyderabad Today.
          </h2>
          <p className="ep-final-cta-sub">
            Our team will have a proposal ready within 24 hours. No obligations, just options.
          </p>
          <div className="ep-final-cta-btns">
            <button className="ep-btn-primary ep-btn-large" onClick={() => openModal()}>
              Book a Space Now
              <span>→</span>
            </button>
            <a href="tel:6309383826" className="ep-btn-call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +91 6309383826
            </a>
          </div>
        </div>
      </section>

      {/* ══ MODAL ══ */}
      {modalOpen && <ContactModal onClose={closeModal} preselect={modalPreselect} />}
    </div>
  );
}

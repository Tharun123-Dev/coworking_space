import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/CompanyContact.css";

const teamSizes = [
  { value: "small", label: "Small", range: "2–10", icon: "👥", desc: "Startups & solo teams" },
  { value: "medium", label: "Medium", range: "11–50", icon: "🏢", desc: "Growing companies" },
  { value: "large", label: "Large", range: "50+", icon: "🏗️", desc: "Enterprises & corps" },
];

const workspaceTypeMap = {
  small: [
    { value: "hot_desk", label: "Hot Desk", icon: "🪑" },
    { value: "dedicated_desk", label: "Dedicated Desk", icon: "💼" },
    { value: "virtual_office", label: "Virtual Office", icon: "🌐" },
  ],
  medium: [
    { value: "private_office_space", label: "Private Office Space", icon: "🏢" },
    { value: "private_cabin", label: "Private Cabin", icon: "🚪" },
    { value: "meeting_room", label: "Meeting Room", icon: "📋" },
  ],
  large: [
    { value: "board_room", label: "Board Room", icon: "🧑‍💼" },
    { value: "event_space", label: "Event Space", icon: "🎤" },
    { value: "podcast", label: "Podcast", icon: "🎙️" },
  ],
};

const LOCATION_OPTIONS = {
  small: ["Madhapur", "Kondapur", "Hitech City"],
  medium: ["Gachibowli", "Hitech City", "Madhapur"],
  large: ["Financial District", "Gachibowli", "Hitech City"],
};

const sizeMap = { Small: "small", Medium: "medium", Large: "large" };

function CompanyContact() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedSize = location.state?.workspaceSize;
  const isTour = location.state?.tour || false;

  const initialSize = passedSize ? sizeMap[passedSize] || "" : "";
  const initialStep = passedSize ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    team_size: initialSize,
    workspace_type: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    message: "",
  });

  const validatePhone = (phone) => /^(\+91|91)?[6-9]\d{9}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name) => name.trim().length >= 2;

  const getPhoneError = (phone) => {
    if (!phone) return "Phone number is required";
    if (phone.startsWith("0")) return "Phone cannot start with 0";
    return "Enter valid 10-digit Indian mobile number (starts with 6-9)";
  };

  const getAvailableLocations = () => LOCATION_OPTIONS[form.team_size] || [];
  const getAvailableWorkspaceTypes = () => workspaceTypeMap[form.team_size] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleTeamSize = (val) => {
    setForm({
      ...form,
      team_size: val,
      workspace_type: "",
      location: "",
    });
    setErrors((prev) => ({
      ...prev,
      team_size: "",
      workspace_type: "",
      location: "",
    }));
  };

  const handleWorkspaceType = (val) => {
    setForm({ ...form, workspace_type: val });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.team_size) newErrors.team_size = "Please select your team size";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!form.name || !validateName(form.name)) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.phone || !validatePhone(form.phone)) {
      newErrors.phone = getPhoneError(form.phone);
    }

    if (!form.location) {
      newErrors.location = "Please select location";
    }

    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "Enter valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post("leads/company/add/", form);
      setIsSubmitting(false);
      setStep(3);
    } catch (err) {
      console.error("Submit error:", err);
      setIsSubmitting(false);
      setErrors({ submit: "Something went wrong. Please try again." });
    }
  };

  const getTeamSizeLabel = () =>
    teamSizes.find((t) => t.value === form.team_size)?.label || "";

  const getTeamSizeRange = () =>
    teamSizes.find((t) => t.value === form.team_size)?.range || "";

  const getWorkspaceLabel = () =>
    getAvailableWorkspaceTypes().find((w) => w.value === form.workspace_type)?.label || "";

  const progressWidth = step === 1 ? "50%" : "100%";

  return (
    <div className="cc-page">
      <div className="cc-grid-bg"></div>
      <div className="cc-blob cc-blob--tl"></div>
      <div className="cc-blob cc-blob--br"></div>

      <div className="cc-wrapper">
        <div className="cc-left">
          <div className="cc-left-inner">
            <span className="cc-eyebrow">
              <span className="cc-eyebrow-dot"></span>
              {isTour ? "Book a Tour" : "Enterprise Solutions"}
            </span>

            <h1 className="cc-heading">
              Your Company,
              <br />
              <em>Our Space.</em>
            </h1>

            <p className="cc-sub">
              Tailored workspaces for teams of every size across Hyderabad's
              premium business districts. From cabins to entire floors.
            </p>

            <div className="cc-divider"></div>

            <div className="cc-perks">
              {[
                { icon: "⚡", title: "Same-Day Response", desc: "Dedicated account manager assigned within hours" },
                { icon: "🏆", title: "Handpicked Spaces", desc: "Curated based on your team size & requirements" },
                { icon: "💰", title: "Volume Pricing", desc: "Negotiated rates for teams of 10 or more" },
                { icon: "🔐", title: "Enterprise SLA", desc: "Guaranteed uptime, security & support" },
              ].map((p) => (
                <div key={p.title} className="cc-perk">
                  <div className="cc-perk-icon">{p.icon}</div>
                  <div>
                    <p className="cc-perk-title">{p.title}</p>
                    <p className="cc-perk-desc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cc-trust-row">
              <div className="cc-trust-item">
                <span className="cc-trust-num">500+</span>
                <span className="cc-trust-lbl">Companies Served</span>
              </div>
              <div className="cc-trust-sep"></div>
              <div className="cc-trust-item">
                <span className="cc-trust-num">25+</span>
                <span className="cc-trust-lbl">Premium Locations</span>
              </div>
              <div className="cc-trust-sep"></div>
              <div className="cc-trust-item">
                <span className="cc-trust-num">4.9★</span>
                <span className="cc-trust-lbl">Avg. Rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cc-right">
          <div className="cc-card">
            <div className="cc-card-glow"></div>

            {step < 3 && (
              <div className="cc-progress">
                <div className="cc-progress-track">
                  <div className="cc-progress-fill" style={{ width: progressWidth }}></div>
                </div>
                <div className="cc-progress-steps">
                  {!passedSize && (
                    <>
                      <span className={`cc-progress-step ${step >= 1 ? "active" : ""}`}>
                        <span className="ps-num">01</span>
                        <span className="ps-lbl">Team Size</span>
                      </span>
                      <span className="cc-progress-line"></span>
                    </>
                  )}
                  <span className={`cc-progress-step ${step >= 2 ? "active" : ""}`}>
                    <span className="ps-num">{passedSize ? "01" : "02"}</span>
                    <span className="ps-lbl">Your Details</span>
                  </span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="cc-step cc-step--1">
                <div className="cc-step-header">
                  <h2>What's your team size?</h2>
                  <p>We'll match you with spaces that fit your crew perfectly</p>
                </div>

                <div className="cc-team-grid">
                  {teamSizes.map((t) => (
                    <button
                      key={t.value}
                      className={`cc-team-card ${form.team_size === t.value ? "cc-team-card--active" : ""}`}
                      onClick={() => handleTeamSize(t.value)}
                      type="button"
                    >
                      <span className="cc-team-icon">{t.icon}</span>
                      <span className="cc-team-label">{t.label}</span>
                      <span className="cc-team-range">{t.range} people</span>
                      <span className="cc-team-desc">{t.desc}</span>
                      {form.team_size === t.value && <span className="cc-team-check">✓</span>}
                    </button>
                  ))}
                </div>

                {errors.team_size && <div className="cc-error-msg">{errors.team_size}</div>}

                {form.team_size && (
                  <div className="cc-field-group">
                    <label className="cc-label">Preferred Workspace Type</label>
                    <div className="cc-workspace-grid">
                      {getAvailableWorkspaceTypes().map((w) => (
                        <button
                          key={w.value}
                          className={`cc-ws-pill ${form.workspace_type === w.value ? "cc-ws-pill--active" : ""}`}
                          onClick={() => handleWorkspaceType(w.value)}
                          type="button"
                        >
                          <span>{w.icon}</span>
                          <span>{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button className="cc-btn-next" onClick={goToStep2}>
                  <span>Continue</span>
                  <span className="cc-btn-arrow">→</span>
                </button>
              </div>
            )}

            {step === 2 && !isSubmitting && (
              <div className="cc-step cc-step--2">
                <div className="cc-step-header">
                  <h2>Tell us about your company</h2>
                  <p>We'll have a workspace specialist reach out within 12 hours</p>
                </div>

                <div className="cc-selection-summary">
                  <span className="cc-summary-tag">
                    {teamSizes.find((t) => t.value === form.team_size)?.icon}&nbsp;
                    {getTeamSizeLabel()} Team ({getTeamSizeRange()})
                  </span>

                  {passedSize ? (
                    <div className="cc-inline-ws">
                      <span className="cc-inline-ws-label">Preferred Workspace Type</span>
                      <div className="cc-workspace-grid cc-workspace-grid--inline">
                        {getAvailableWorkspaceTypes().map((w) => (
                          <button
                            key={w.value}
                            className={`cc-ws-pill ${form.workspace_type === w.value ? "cc-ws-pill--active" : ""}`}
                            onClick={() => handleWorkspaceType(w.value)}
                            type="button"
                          >
                            <span>{w.icon}</span>
                            <span>{w.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    form.workspace_type && (
                      <span className="cc-summary-tag">
                        {getAvailableWorkspaceTypes().find((w) => w.value === form.workspace_type)?.icon}&nbsp;
                        {getWorkspaceLabel()}
                      </span>
                    )
                  )}

                  {!passedSize && (
                    <button className="cc-change-btn" onClick={() => setStep(1)}>
                      ← Change
                    </button>
                  )}
                </div>

                <div className="cc-fields-grid">
                  <div className="cc-field">
                    <label className="cc-label">Full Name <span className="req">*</span></label>
                    <div className="cc-input-wrap">
                      <svg className="cc-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        className={`cc-input ${errors.name ? "cc-input--error" : ""}`}
                      />
                    </div>
                    {errors.name && <div className="cc-error-text">{errors.name}</div>}
                  </div>

                  <div className="cc-field">
                    <label className="cc-label">Company Name</label>
                    <div className="cc-input-wrap">
                      <svg className="cc-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <input
                        name="company"
                        placeholder="Your company"
                        value={form.company}
                        onChange={handleChange}
                        className="cc-input"
                      />
                    </div>
                  </div>

                  <div className="cc-field">
                    <label className="cc-label">Work Email</label>
                    <div className="cc-input-wrap">
                      <svg className="cc-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        name="email"
                        type="email"
                        placeholder="work@company.com"
                        value={form.email}
                        onChange={handleChange}
                        className={`cc-input ${errors.email ? "cc-input--error" : ""}`}
                      />
                    </div>
                    {errors.email && <div className="cc-error-text">{errors.email}</div>}
                  </div>

                  <div className="cc-field">
                    <label className="cc-label">Phone <span className="req">*</span></label>
                    <div className="cc-input-wrap">
                      <svg className="cc-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={handleChange}
                        className={`cc-input ${errors.phone ? "cc-input--error" : ""}`}
                      />
                    </div>
                    {errors.phone && <div className="cc-error-text">{errors.phone}</div>}
                  </div>

                  <div className="cc-field cc-field--full">
                    <label className="cc-label">Preferred Location <span className="req">*</span></label>
                    <div className="cc-input-wrap">
                      <svg className="cc-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <select
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className={`cc-input cc-select ${errors.location ? "cc-input--error" : ""}`}
                      >
                        <option value="">Select preferred area</option>
                        {getAvailableLocations().map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.location && <div className="cc-error-text">{errors.location}</div>}
                  </div>

                  <div className="cc-field cc-field--full">
                    <label className="cc-label">Additional Requirements</label>
                    <div className="cc-input-wrap cc-textarea-wrap">
                      <textarea
                        name="message"
                        placeholder="Any specific needs — security clearance, server room, dedicated floor, branding, etc."
                        value={form.message}
                        onChange={handleChange}
                        className="cc-input cc-textarea"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {errors.submit && <div className="cc-error-msg cc-error-submit">{errors.submit}</div>}

                <button className="cc-btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                  <span>Submit Company Request</span>
                  <span className="cc-btn-arrow">→</span>
                </button>

                <p className="cc-disclaimer">
                  🔒 Your information is confidential and never shared with third parties.
                </p>
              </div>
            )}

            {isSubmitting && (
              <div className="cc-submitting">
                <div className="cc-submit-rings"><div></div><div></div><div></div></div>
                <h3 className="cc-submit-title">Processing Request<span className="cc-submit-dots"></span></h3>
                <p className="cc-submit-hint">Connecting you with our enterprise workspace team</p>
                <div className="cc-submit-bar"><div className="cc-submit-bar-fill"></div></div>
                <div className="cc-submit-steps">
                  {["Validating details", "Matching spaces", "Notifying team"].map((s, i) => (
                    <div key={s} className="cc-submit-step" style={{ animationDelay: `${i * 0.5}s` }}>
                      <span className="cc-submit-step-dot"></span><span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && !isSubmitting && (
              <div className="cc-success">
                <div className="cc-success-ring">
                  <div className="cc-success-check">✓</div>
                </div>
                <h2 className="cc-success-title">Request Received!</h2>
                <p className="cc-success-msg">
                  Your enterprise workspace request has been logged. A dedicated account
                  manager will reach out within <strong>12 hours</strong> with curated options.
                </p>
                <div className="cc-success-divider"></div>
                <div className="cc-success-summary">
                  <div className="cc-ss-item">
                    <span className="cc-ss-lbl">Team Size</span>
                    <span className="cc-ss-val">{getTeamSizeLabel()} ({getTeamSizeRange()} people)</span>
                  </div>
                  {form.workspace_type && (
                    <div className="cc-ss-item">
                      <span className="cc-ss-lbl">Workspace</span>
                      <span className="cc-ss-val">{getWorkspaceLabel()}</span>
                    </div>
                  )}
                  {form.company && (
                    <div className="cc-ss-item">
                      <span className="cc-ss-lbl">Company</span>
                      <span className="cc-ss-val">{form.company}</span>
                    </div>
                  )}
                  {form.location && (
                    <div className="cc-ss-item">
                      <span className="cc-ss-lbl">Location</span>
                      <span className="cc-ss-val">{form.location}, Hyderabad</span>
                    </div>
                  )}
                </div>
                <button className="cc-btn-home" onClick={() => navigate("/")}>← Back to Home</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyContact;
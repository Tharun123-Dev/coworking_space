import React, { useState } from "react";
import axiosInstance from "../Services/Axios";
import "./ContactModal.css";
import Reveal from "../Pages/Reveal";

/* ─── Validation ──────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  team_size: "",
  message: "",
};

function validate(form) {
  const e = {};
  if (!form.name.trim())
    e.name = "Full name is required.";
  else if (!/^[a-zA-Z\s'-]{2,60}$/.test(form.name.trim()))
    e.name = "Name must be 2–60 letters only.";

  if (!form.email.trim())
    e.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    e.email = "Enter a valid email address.";

  if (!form.phone.trim())
    e.phone = "Phone number is required.";
  else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
    e.phone = "Enter a valid 10-digit Indian mobile number.";

  if (!form.team_size)
    e.team_size = "Please select your team size.";

  if (form.message.trim() && form.message.trim().length < 10)
    e.message = "Message should be at least 10 characters.";
  if (form.message.trim().length > 500)
    e.message = "Message cannot exceed 500 characters.";

  return e;
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */
function ToastBar({ toasts }) {
  return (
    <div className="cm-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`cm-toast cm-toast--${t.type}`}>
          <span className="cm-toast-icon">{t.type === "success" ? "✅" : "❌"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
const ContactModal = ({ selected, setSelected }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts]   = useState([]);
  const toastRef              = React.useRef(0);

  /* ── Toast helper ── */
  const addToast = (message, type = "success") => {
    const id = ++toastRef.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  /* ── Unchanged handlers (original logic kept) ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields
    const allTouched = Object.keys(EMPTY_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);

    if (Object.values(errs).some(Boolean)) {
      addToast("Please fix the errors before submitting.", "error");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("leads/leadss/", {
        ...form,
        workspace_type:    selected?.type,
        preferred_location: selected?.area,
        offer_workspace:   selected?.workspace_name || selected?.building,
      });
      addToast("Lead submitted successfully! We'll be in touch soon.", "success");
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
      setSelected(null);
    } catch (error) {
      console.log(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Error submitting form. Please try again.";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!selected) return null;

  /* ── Field helpers ── */
  const fc = (name) =>
    `cm-input${touched[name] && errors[name] ? " cm-input--err" : touched[name] && !errors[name] && form[name] ? " cm-input--ok" : ""}`;

  const charCount = form.message.trim().length;

  return (
    <div className="cmModalOverlay">
      <ToastBar toasts={toasts} />

      {/* Original decorative elements — untouched */}
      <div className="cmBackgroundGlow cmGlowOne" />
      <div className="cmBackgroundGlow cmGlowTwo" />
      <div className="cmBackgroundGrid" />

      <Reveal>
        <button className="cmBackButton" onClick={() => setSelected(null)}>
          <span>←</span> Back
        </button>
      </Reveal>

      <div className="cmModalShell">

        {/* ── LEFT INFO PANEL ── */}
        <div className="cmInfoPanel">
          <Reveal><p className="cmMiniTag">Contact</p></Reveal>
          <Reveal><h2 className="cmTitle">Get in Touch</h2></Reveal>
          <Reveal>
            <p className="cmDescription">
              Reach out to us to explore workspace options tailored for your business and team size.
            </p>
          </Reveal>

          <div className="cmInfoList">
            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">📍</span>
                <p>{selected?.area}</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">🏢</span>
                <p>{selected?.workspace_name || selected?.building}</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="cmInfoItem">
                <span className="cmInfoIcon">💺</span>
                <p>{selected?.type}</p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="cmSelectedBadge">
              <span className="cmSelectedLabel">Selected Workspace</span>
              <strong>{selected?.workspace_name || selected?.building}</strong>
              <small>{selected?.area}</small>
            </div>
          </Reveal>

          {/* Progress indicator */}
          <Reveal>
            <div className="cm-progress">
              <div className="cm-progress-step cm-progress-step--done">
                <span>1</span><p>Choose Workspace</p>
              </div>
              <div className="cm-progress-line cm-progress-line--done" />
              <div className="cm-progress-step cm-progress-step--active">
                <span>2</span><p>Your Details</p>
              </div>
              <div className="cm-progress-line" />
              <div className="cm-progress-step">
                <span>3</span><p>Confirmed</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="cmFormPanel">
          <Reveal>
            <h3 className="cmFormTitle">Send a Message</h3>
            <p className="cm-form-sub">Fields marked <span className="cm-req-star">*</span> are required</p>
          </Reveal>

          <form className="cmForm" onSubmit={handleSubmit} noValidate>

            {/* Read-only row */}
            <div className="cm-readonly-row">
              <div className="cmFieldGroup">
                <label>Preferred Location</label>
                <Reveal>
                  <div className="cm-readonly-field">
                    <span>📍</span>
                    <input type="text" value={selected?.area || ""} readOnly tabIndex={-1} />
                  </div>
                </Reveal>
              </div>
              <div className="cmFieldGroup">
                <label>Workspace</label>
                <Reveal>
                  <div className="cm-readonly-field">
                    <span>💺</span>
                    <input type="text" value={selected?.type || ""} readOnly tabIndex={-1} />
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Name */}
            <div className="cmFieldGroup">
              <label>Name <span className="cm-req-star">*</span></label>
              <Reveal>
                <div className="cm-field-wrap">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fc("name")}
                    maxLength={60}
                    autoComplete="name"
                  />
                  {touched.name && errors.name  && <span className="cm-err">⚠ {errors.name}</span>}
                  {touched.name && !errors.name && form.name.trim() && <span className="cm-ok">✓ Looks good</span>}
                </div>
              </Reveal>
            </div>

            {/* Email */}
            <div className="cmFieldGroup">
              <label>Email <span className="cm-req-star">*</span></label>
              <Reveal>
                <div className="cm-field-wrap">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fc("email")}
                    maxLength={100}
                    autoComplete="email"
                  />
                  {touched.email && errors.email  && <span className="cm-err">⚠ {errors.email}</span>}
                  {touched.email && !errors.email && form.email.trim() && <span className="cm-ok">✓ Valid email</span>}
                </div>
              </Reveal>
            </div>

            {/* Phone */}
            <div className="cmFieldGroup">
              <label>Phone <span className="cm-req-star">*</span></label>
              <Reveal>
                <div className="cm-field-wrap">
                  <input
                    type="text"
                    name="phone"
                    placeholder="10-digit Mobile Number"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleChange({ target: { name: "phone", value: val } });
                    }}
                    onBlur={handleBlur}
                    className={fc("phone")}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                  {touched.phone && errors.phone  && <span className="cm-err">⚠ {errors.phone}</span>}
                  {touched.phone && !errors.phone && form.phone.trim() && <span className="cm-ok">✓ Valid number</span>}
                </div>
              </Reveal>
            </div>

            {/* Team Size */}
            <div className="cmFieldGroup">
              <label>Team Size <span className="cm-req-star">*</span></label>
              <Reveal>
                <div className="cm-field-wrap">
                  <select
                    name="team_size"
                    value={form.team_size}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fc("team_size")}
                  >
                    <option value="">Select team size</option>
                    <option>1-3</option>
                    <option>4-6</option>
                    <option>6-10</option>
                    <option>10+</option>
                  </select>
                  {touched.team_size && errors.team_size  && <span className="cm-err">⚠ {errors.team_size}</span>}
                  {touched.team_size && !errors.team_size && form.team_size && <span className="cm-ok">✓ Selected</span>}
                </div>
              </Reveal>
            </div>

            {/* Message */}
            <div className="cmFieldGroup cmFieldFull">
              <label>Message <span className="cm-optional">(optional)</span></label>
              <Reveal>
                <div className="cm-field-wrap">
                  <textarea
                    name="message"
                    placeholder="Describe your requirement... (min 10 chars if filled)"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`cm-input cm-textarea${touched.message && errors.message ? " cm-input--err" : touched.message && !errors.message && form.message.trim() ? " cm-input--ok" : ""}`}
                    maxLength={500}
                  />
                  <div className="cm-msg-meta">
                    {touched.message && errors.message
                      ? <span className="cm-err">⚠ {errors.message}</span>
                      : touched.message && !errors.message && form.message.trim()
                        ? <span className="cm-ok">✓ Great detail</span>
                        : <span />
                    }
                    <span className={`cm-char-count${charCount > 450 ? " cm-char-warn" : ""}`}>{charCount}/500</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <button type="submit" className="cmSubmitButton" disabled={loading}>
                {loading
                  ? <><span className="cm-spinner" /> Submitting…</>
                  : "Submit Enquiry →"
                }
              </button>
            </Reveal>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

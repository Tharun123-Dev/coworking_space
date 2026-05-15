import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import "./GetQuote.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const LOCATIONS = ["Madhapur", "Gachibowli", "Hitech City", "Kondapur"];

const ALL_WORKSPACE_TYPES = [
  { name: "Hot Desk",             icon: "⚡", desc: "Flexible open seating" },
  { name: "Dedicated Desk",       icon: "🖥️", desc: "Your own reserved desk" },
  { name: "Private Office Space", icon: "🏢", desc: "Fully enclosed office" },
  { name: "Private Cabin",        icon: "🔐", desc: "Semi-private workspace" },
  { name: "Podcast",              icon: "🎙️", desc: "Soundproof recording room" },
  { name: "Meeting Room",         icon: "🤝", desc: "Collaborative meeting space" },
  { name: "Day Pass",             icon: "🎫", desc: "Drop-in for the day" },
  { name: "Weekly Pass",          icon: "📅", desc: "Full-week access pass" },
  { name: "Virtual Office",       icon: "🌐", desc: "Business address & mail" },
  { name: "Board Room",           icon: "👔", desc: "Premium boardroom suite" },
  { name: "Event Space",          icon: "🎯", desc: "Host events & workshops" },
];

function workspaceMatchesLocation(workspace, selectedLocation) {
  const loc = selectedLocation.trim().toLowerCase();
  return ["city", "location", "area"].some((field) => {
    const val = (workspace[field] || "").trim().toLowerCase();
    return val === loc || val.includes(loc);
  });
}

// ─── PDF Builder ──────────────────────────────────────────────────────────────
function buildQuoteHTML({ location, rows, companyName, date, leadForm }) {
  const tableRows = rows.map((r) => {
    const price = Number(r.price || 0);
    const units = Number(r.units || 1);
    const cgst  = Math.round(price * 0.09);
    const sgst  = Math.round(price * 0.09);
    const total = price * units;
    return `
      <tr>
        <td>${r.name}</td>
        <td class="tc">${units}</td>
        <td class="tc">&#8377;${price.toLocaleString("en-IN")}.00</td>
        <td class="tc">&#8377;${cgst.toLocaleString("en-IN")}.00</td>
        <td class="tc">&#8377;${sgst.toLocaleString("en-IN")}.00</td>
        <td class="tc bold">&#8377;${total.toLocaleString("en-IN")}.00</td>
      </tr>`;
  }).join("");

  const subtotal   = rows.reduce((s, r) => s + Number(r.price || 0) * Number(r.units || 1), 0);
  const cgstTotal  = Math.round(subtotal * 0.09);
  const sgstTotal  = Math.round(subtotal * 0.09);
  const grandTotal = subtotal + cgstTotal + sgstTotal;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Workspace Quotation</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;padding:44px;color:#1a1a1a;font-size:14px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:22px;border-bottom:3px solid #7c3aed}
  .brand{font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:-1px}
  .brand-sub{font-size:12px;color:#999;margin-top:4px}
  .meta{text-align:right;font-size:12px;color:#555;line-height:2}
  .info-row{display:flex;gap:14px;margin-bottom:22px}
  .info-box{border:1.5px solid #e5e7eb;border-radius:10px;padding:11px 18px;min-width:160px;background:#fafafa}
  .info-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}
  .info-val{font-size:14px;font-weight:800;color:#111}
  table{width:100%;border-collapse:collapse;margin-bottom:28px}
  thead tr{background:#f5f3ff}
  th{padding:12px 14px;text-align:left;font-size:11px;color:#7c3aed;font-weight:800;border-bottom:2px solid #e5e7eb;text-transform:uppercase;letter-spacing:.08em}
  td{padding:13px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#222}
  tr:nth-child(even){background:#fafafa}
  .tc{text-align:center}
  .bold{font-weight:800;color:#7c3aed}
  .summary-wrap{display:flex;justify-content:flex-end}
  .summary{width:300px;background:#f9fafb;border-radius:12px;padding:18px 20px;border:1.5px solid #e5e7eb}
  .s-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee}
  .s-total{display:flex;justify-content:space-between;padding:14px 0 0;font-size:17px;font-weight:900;color:#7c3aed;margin-top:4px}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#bbb;text-align:center}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CoWork</div>
      <div class="brand-sub">Premium Coworking · Hyderabad</div>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${date}</div>
      ${leadForm.name  ? `<div><strong>Name:</strong> ${leadForm.name}</div>`     : ""}
      ${leadForm.email ? `<div><strong>Email:</strong> ${leadForm.email}</div>`   : ""}
      ${leadForm.phone ? `<div><strong>Phone:</strong> ${leadForm.phone}</div>`   : ""}
      ${companyName    ? `<div><strong>Company:</strong> ${companyName}</div>`    : ""}
    </div>
  </div>
  <div class="info-row">
    <div class="info-box"><div class="info-label">Location</div><div class="info-val">📍 ${location}</div></div>
    <div class="info-box"><div class="info-label">Workspace Types</div><div class="info-val">${rows.length} Selected</div></div>
    <div class="info-box"><div class="info-label">Validity</div><div class="info-val">30 Days</div></div>
  </div>
  <table>
    <thead><tr>
      <th>Item Name</th><th class="tc">Units</th><th class="tc">Price / Unit</th>
      <th class="tc">CGST (9%)</th><th class="tc">SGST (9%)</th><th class="tc">Total</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="summary-wrap">
    <div class="summary">
      <div class="s-row"><span>Subtotal</span><span>&#8377;${subtotal.toLocaleString("en-IN")}</span></div>
      <div class="s-row"><span>CGST (9%)</span><span>&#8377;${cgstTotal.toLocaleString("en-IN")}</span></div>
      <div class="s-row"><span>SGST (9%)</span><span>&#8377;${sgstTotal.toLocaleString("en-IN")}</span></div>
      <div class="s-total"><span>Grand Total (incl. GST)</span><span>&#8377;${grandTotal.toLocaleString("en-IN")}</span></div>
    </div>
  </div>
  <div class="footer">CoWork · Hyderabad · contact@cowork.in · Computer-generated quotation · Valid 30 days</div>
  <script>window.onload=function(){window.print()}</script>
</body>
</html>`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div className={`gq-toast gq-toast--${type} ${visible ? "gq-toast--visible" : ""}`}>
      <span className="gq-toast-icon">{type === "success" ? "✓" : "ℹ"}</span>
      {message}
    </div>
  );
}

// ─── Lead Popup ───────────────────────────────────────────────────────────────
function LeadPopup({ onConfirm, onCancel }) {
  const [form,    setForm]    = useState({ name: "", email: "", phone: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const popupRef              = useRef(null);

  // ── Scroll the popup into view as soon as it mounts ──
  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone is required.";
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter valid 10-digit number.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    await onConfirm(form);
    setLoading(false);
  };

  const fields = [
    { key: "name",  placeholder: "Full Name",     type: "text",  icon: "👤" },
    { key: "email", placeholder: "Email Address", type: "email", icon: "✉️" },
    { key: "phone", placeholder: "Phone Number",  type: "text",  icon: "📞" },
  ];

  return (
    <div
      className="gq-lead-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* ref attached to popup card so scrollIntoView targets the form */}
      <div className="gq-lead-popup" ref={popupRef}>

        <div className="gq-lead-top">
          <div className="gq-lead-icon-ring">
            <span>📄</span>
          </div>
          <h2 className="gq-lead-title">Almost There!</h2>
          <p className="gq-lead-sub">Share your details to get the quotation PDF</p>
        </div>

        <div className="gq-lead-fields">
          {fields.map(({ key, placeholder, type, icon }) => (
            <div className="gq-lead-field" key={key}>
              <div className={`gq-lead-input-box ${errors[key] ? "gq-lead-input-box--err" : ""}`}>
                <span className="gq-lead-field-icon">{icon}</span>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  className="gq-lead-input"
                  autoComplete="off"
                  onChange={(e) => {
                    const val = key === "phone"
                      ? e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                      : e.target.value;
                    setForm({ ...form, [key]: val });
                    if (errors[key]) setErrors({ ...errors, [key]: "" });
                  }}
                />
              </div>
              {errors[key] && <span className="gq-lead-err">{errors[key]}</span>}
            </div>
          ))}
        </div>

        <div className="gq-lead-actions">
          <button className="gq-lead-confirm-btn" onClick={handleConfirm} disabled={loading}>
            {loading
              ? <span className="gq-spinner" />
              : <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download PDF
                </>
            }
          </button>
          <button className="gq-lead-cancel-btn" onClick={onCancel}>Cancel</button>
        </div>

        <p className="gq-lead-privacy">🔒 Your info is private and used only for this quotation.</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GetQuote() {
  const navigate = useNavigate();

  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [location,      setLocation]      = useState(LOCATIONS[0]);
  const [locOpen,       setLocOpen]       = useState(false);
  const [typeOpen,      setTypeOpen]      = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [unitInputs,    setUnitInputs]    = useState({});
  const [companyName,   setCompanyName]   = useState("");
  const [showLead,      setShowLead]      = useState(false);
  const [toast,         setToast]         = useState({ visible: false, message: "", type: "success" });
  const [mounted,       setMounted]       = useState(false);

  const locRef     = useRef();
  const typeRef    = useRef();
  const toastTimer = useRef();

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    axiosInstance
      .get("workspaces/")
      .then((res) => setAllWorkspaces(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAllWorkspaces([]));
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (locRef.current  && !locRef.current.contains(e.target))  setLocOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message: msg, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const getPrice = (typeName) => {
    const matches = allWorkspaces.filter(
      (w) => (w.name || "").trim().toLowerCase() === typeName.trim().toLowerCase()
    );
    if (!matches.length) return 0;
    const locMatch = matches.find((w) => workspaceMatchesLocation(w, location));
    return Number((locMatch || matches[0]).price || 0);
  };

  const toggleType = (name) => {
    setSelectedTypes((prev) => {
      if (prev.includes(name)) return prev.filter((t) => t !== name);
      showToast(`${name} added`, "success");
      return [...prev, name];
    });
    if (!unitInputs[name]) setUnitInputs((p) => ({ ...p, [name]: "1" }));
  };

  const removeRow = (name) => {
    setSelectedTypes((prev) => prev.filter((t) => t !== name));
    showToast(`${name} removed`, "info");
  };

  const clearAll = () => {
    setSelectedTypes([]);
    setUnitInputs({});
    showToast("Quote cleared", "info");
  };

  const adjustUnit = (name, delta) => {
    setUnitInputs((p) => ({
      ...p,
      [name]: String(Math.max(1, (parseInt(p[name]) || 1) + delta)),
    }));
  };

  const getUnits = (name) => {
    const n = parseInt(unitInputs[name] || "1", 10);
    return isNaN(n) || n < 1 ? 1 : n;
  };

  const rows = selectedTypes.map((name) => {
    const price = getPrice(name);
    const units = getUnits(name);
    return { name, price, units, total: price * units };
  });

  const subtotal    = rows.reduce((s, r) => s + r.total, 0);
  const cgst        = Math.round(subtotal * 0.09);
  const sgst        = Math.round(subtotal * 0.09);
  const grandTotal  = subtotal + cgst + sgst;
  const hasPrice    = rows.some((r) => r.price > 0);
  const canDownload = rows.length > 0 && hasPrice;

  const typeLabel = selectedTypes.length === 0
    ? "Select Space Type"
    : selectedTypes.length === 1
      ? selectedTypes[0]
      : `${selectedTypes[0]} +${selectedTypes.length - 1} more`;

  const handleDownload = async (leadForm) => {
    try {
      await axiosInstance.post("leads/create-quotation-lead/", {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        company: companyName,
        preferred_location: location,
        workspace_type: selectedTypes.join(", "),
        total_amount: grandTotal,
        quotation_details: rows,
      });
    } catch (err) {
      console.warn("Lead API error:", err);
    }

    const html = buildQuoteHTML({
      location,
      rows: rows.map((r) => ({ name: r.name, price: r.price, units: r.units })),
      companyName,
      date: new Date().toLocaleDateString("en-IN"),
      leadForm,
    });

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank", "width=1000,height=750");
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    if (win) win.focus();
    setShowLead(false);
    showToast("Quotation PDF ready!", "success");
  };

  return (
    <div className={`gq-page ${mounted ? "gq-page--mounted" : ""}`}>

      <Toast {...toast} />

      {/* ── Hero ── */}
      <div className="gq-hero">
        <div className="gq-hero-orb gq-hero-orb--1" />
        <div className="gq-hero-orb gq-hero-orb--2" />
        <div className="gq-hero-inner">
          <button className="gq-back-btn" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>

          <div className="gq-hero-content">
            <div className="gq-hero-pill">
              <span className="gq-hero-pill-dot" />
              Instant Quotation
            </div>
            <h1 className="gq-hero-title">Get a Quote</h1>
            <p className="gq-hero-sub">
              Pick your location &amp; workspace types — get a professional PDF in seconds.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="gq-progress">
            {[
              { label: "Location",  done: true },
              { label: "Workspace", done: selectedTypes.length > 0 },
              { label: "Download",  done: canDownload },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <div className={`gq-prog-step ${s.done ? "gq-prog-step--done" : ""}`}>
                  <div className="gq-prog-dot">
                    {s.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span>{i + 1}</span>
                    }
                  </div>
                  <span className="gq-prog-label">{s.label}</span>
                </div>
                {i < 2 && <div className={`gq-prog-line ${s.done ? "gq-prog-line--done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="gq-container">

        {/* ── Filters Card ── */}
        <div className="gq-filters-card">
          <div className="gq-filters">

            {/* Location Dropdown */}
            <div className="gq-field-group" ref={locRef}>
              <label className="gq-field-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Location
              </label>
              <div
                className={`gq-select-box ${locOpen ? "gq-select-box--open" : ""}`}
                onClick={() => { setLocOpen((o) => !o); setTypeOpen(false); }}
              >
                <span className="gq-select-val">{location}</span>
                <svg className={`gq-chevron ${locOpen ? "gq-chevron--up" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {locOpen && (
                <div className="gq-drop-list">
                  {LOCATIONS.map((loc) => (
                    <div
                      key={loc}
                      className={`gq-drop-item ${location === loc ? "gq-drop-item--active" : ""}`}
                      onClick={() => { setLocation(loc); setLocOpen(false); }}
                    >
                      <span className="gq-drop-ico">📍</span>
                      <span>{loc}</span>
                      {location === loc && (
                        <svg className="gq-drop-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Type Dropdown */}
            <div className="gq-field-group gq-field-group--wide" ref={typeRef}>
              <label className="gq-field-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Space Type
                {selectedTypes.length > 0 && (
                  <span className="gq-count-badge">{selectedTypes.length}</span>
                )}
              </label>
              <div
                className={`gq-select-box gq-select-box--accent ${typeOpen ? "gq-select-box--open" : ""}`}
                onClick={() => { setTypeOpen((o) => !o); setLocOpen(false); }}
              >
                <span className={`${selectedTypes.length === 0 ? "gq-select-placeholder" : "gq-select-val"}`}>
                  {typeLabel}
                </span>
                <svg className={`gq-chevron ${typeOpen ? "gq-chevron--up" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {typeOpen && (
                <div className="gq-drop-list gq-drop-list--types">
                  <div className="gq-drop-list-header">
                    <span>Choose workspace types</span>
                    {selectedTypes.length > 0 && (
                      <button
                        className="gq-clear-sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedTypes([]); setUnitInputs({}); }}
                      >Clear all</button>
                    )}
                  </div>
                  {ALL_WORKSPACE_TYPES.map((ws) => {
                    const checked = selectedTypes.includes(ws.name);
                    const price   = getPrice(ws.name);
                    return (
                      <label key={ws.name} className={`gq-type-item ${checked ? "gq-type-item--checked" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleType(ws.name)}
                          className="gq-type-checkbox"
                        />
                        <span className="gq-type-icon">{ws.icon}</span>
                        <span className="gq-type-info">
                          <span className="gq-type-name">{ws.name}</span>
                          <span className="gq-type-desc">{ws.desc}</span>
                        </span>
                        <span className={`gq-type-price ${price > 0 ? "gq-type-price--set" : ""}`}>
                          {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "N/A"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Company */}
            <div className="gq-field-group gq-field-group--grow">
              <label className="gq-field-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Company <span className="gq-opt-text">(optional)</span>
              </label>
              <input
                className="gq-text-input"
                placeholder="Your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Chips Row ── */}
        {selectedTypes.length > 0 && (
          <div className="gq-chips-bar">
            <span className="gq-chips-label">Selected:</span>
            <div className="gq-chips">
              {selectedTypes.map((name) => {
                const ws = ALL_WORKSPACE_TYPES.find((w) => w.name === name);
                return (
                  <span key={name} className="gq-chip">
                    {ws?.icon} {name}
                    <button className="gq-chip-x" onClick={() => removeRow(name)}>×</button>
                  </span>
                );
              })}
            </div>
            <button className="gq-clear-btn" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {/* ── Main Content ── */}
        {selectedTypes.length === 0 ? (

          <div className="gq-empty">
            <div className="gq-empty-art">
              <div className="gq-empty-ring gq-empty-ring--1" />
              <div className="gq-empty-ring gq-empty-ring--2" />
              <span className="gq-empty-emoji">🗂️</span>
            </div>
            <h3 className="gq-empty-title">Your quote is empty</h3>
            <p className="gq-empty-body">Choose a location and select workspace types above to generate your personalised quote.</p>
            <button className="gq-empty-cta" onClick={() => setTypeOpen(true)}>
              + Select Workspace Types
            </button>
          </div>

        ) : (
          <div className="gq-content">

            {/* ── Table Card ── */}
            <div className="gq-table-card">
              <div className="gq-table-card-header">
                <div className="gq-table-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Quotation Details
                </div>
                <div className="gq-table-card-meta">📍 {location} · {selectedTypes.length} item{selectedTypes.length > 1 ? "s" : ""}</div>
              </div>

              <div className="gq-table-scroll">
                <table className="gq-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th className="gq-tc">Units</th>
                      <th className="gq-tc">Price / Unit</th>
                      <th className="gq-tc">CGST (9%)</th>
                      <th className="gq-tc">SGST (9%)</th>
                      <th className="gq-tc">Total</th>
                      <th className="gq-tc" style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const ws = ALL_WORKSPACE_TYPES.find((w) => w.name === row.name);
                      return (
                        <tr key={row.name} className="gq-tr" style={{ animationDelay: `${idx * 40}ms` }}>
                          <td>
                            <div className="gq-item-cell">
                              <span className="gq-item-emoji">{ws?.icon}</span>
                              <div>
                                <div className="gq-item-name">{row.name}</div>
                                <div className="gq-item-sub">{ws?.desc}</div>
                              </div>
                            </div>
                          </td>
                          <td className="gq-tc">
                            <div className="gq-stepper">
                              <button className="gq-stepper-btn" onClick={() => adjustUnit(row.name, -1)}>−</button>
                              <input
                                className="gq-stepper-input"
                                type="text"
                                inputMode="numeric"
                                value={unitInputs[row.name] || "1"}
                                onChange={(e) =>
                                  setUnitInputs((p) => ({
                                    ...p,
                                    [row.name]: e.target.value.replace(/[^0-9]/g, ""),
                                  }))
                                }
                              />
                              <button className="gq-stepper-btn" onClick={() => adjustUnit(row.name, +1)}>+</button>
                            </div>
                          </td>
                          <td className="gq-tc gq-cell-price">
                            {row.price > 0
                              ? `₹${row.price.toLocaleString("en-IN")}.00`
                              : <span className="gq-na">N/A</span>
                            }
                          </td>

                          {/* ── CGST — Included tag ── */}
                          <td className="gq-tc gq-cell-tax">
                            {row.price > 0
                              ? <span className="gq-included-tag">Included</span>
                              : "—"
                            }
                          </td>

                          {/* ── SGST — Included tag ── */}
                          <td className="gq-tc gq-cell-tax">
                            {row.price > 0
                              ? <span className="gq-included-tag">Included</span>
                              : "—"
                            }
                          </td>

                          {/* ── Total — base price only ── */}
                          <td className="gq-tc">
                            {row.price > 0
                              ? <span className="gq-total-tag">₹{row.total.toLocaleString("en-IN")}.00</span>
                              : <span className="gq-cell-tax">—</span>
                            }
                          </td>

                          <td className="gq-tc">
                            <button className="gq-remove-btn" onClick={() => removeRow(row.name)} title="Remove">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="gq-bottom">
              <div className="gq-bottom-left">
                <button
                  className="gq-download-btn"
                  disabled={!canDownload}
                  onClick={() => setShowLead(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Quotation PDF
                </button>
                {!hasPrice && (
                  <div className="gq-warn-box">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    No pricing available for <strong>{location}</strong> with selected types.
                  </div>
                )}
                <p className="gq-privacy-note">🔒 Secure. Your details are only used for this quote.</p>
              </div>

              <div className="gq-summary-box">
                <div className="gq-summary-head">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  Summary
                </div>
                <div className="gq-summary-rows">
                  <div className="gq-summary-row">
                    <span>Amount</span>
                    <span>₹ {subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {/* ── CGST & SGST show Included ── */}
                  <div className="gq-summary-row">
                    <span>CGST (9%)</span>
                    <span className="gq-included-tag">Included</span>
                  </div>
                  <div className="gq-summary-row">
                    <span>SGST (9%)</span>
                    <span className="gq-included-tag">Included</span>
                  </div>
                </div>
                <div className="gq-summary-sep" />
                {/* ── Total shows base subtotal only ── */}
                <div className="gq-summary-total">
                  <span>Total</span>
                  <span className="gq-grand-total">₹ {subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {showLead && (
        <LeadPopup onConfirm={handleDownload} onCancel={() => setShowLead(false)} />
      )}
    </div>
  );
}

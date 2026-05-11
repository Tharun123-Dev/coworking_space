import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import "../Styles/Companies.css";

const LOCATIONS = ["Madhapur", "Gachibowli", "Hitech City", "Kondapur"];

const SIZE_CONFIG = {
  Small: {
    subtitle: "Mini Workspace",
    seatRange: "0 – 20 Seats",
    minSeats: 0,
    maxSeats: 20,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    featured: false,
    types: ["Hot Desk", "Dedicated Desk", "Virtual Office"],
    minUnits: 1,
    maxUnits: 20,
    displayLabel: "Small",
    accent: "#6366f1",
    accentLight: "#eef2ff",
    description: "Perfect for freelancers & early-stage teams",
    icon: "🪑",
  },
  Medium: {
    subtitle: "Team Workspace",
    seatRange: "20 – 50 Seats",
    minSeats: 20,
    maxSeats: 50,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
    featured: true,
    types: ["Private Office Space", "Private Cabin", "Meeting Room"],
    minUnits: 1,
    maxUnits: 50,
    displayLabel: "Medium",
    accent: "#7c3aed",
    accentLight: "#ede9fe",
    description: "Ideal for growing teams & startups",
    icon: "🏢",
  },
  Large: {
    subtitle: "Enterprise Workspace",
    seatRange: "50 – 200 Seats",
    minSeats: 50,
    maxSeats: 200,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    featured: false,
    types: ["Board Room", "Event Space", "Podcast"],
    minUnits: 1,
    maxUnits: 200,
    displayLabel: "Large",
    accent: "#0f766e",
    accentLight: "#f0fdfa",
    description: "Built for enterprises & large organizations",
    icon: "🏬",
  },
};

const UPGRADE_HINTS = {
  Small: {
    tooHigh: {
      icon: "🏢",
      title: "Looks like a Medium-tier requirement!",
      body: "Your seat count exceeds the Small plan limit of 20. Our Medium workspace plans (20–50 seats) fit perfectly.",
      badge: "Switch to Medium",
      switchTo: "Medium",
    },
  },
  Medium: {
    tooHigh: {
      icon: "🏬",
      title: "Sounds like a Large workspace setup!",
      body: "For more than 50 seats, our Large workspace plans (50–200 seats) are the right fit.",
      badge: "Switch to Large",
      switchTo: "Large",
    },
  },
  Large: {
    tooHigh: {
      icon: "⚠️",
      title: "Exceeds maximum capacity (200 seats)",
      body: "We support up to 200 seats in the Large plan. Please enter a value within that range.",
      badge: null,
      switchTo: null,
    },
  },
};

function workspaceMatchesLocation(workspace, selectedLocation) {
  const loc = selectedLocation.trim().toLowerCase();
  const city = (workspace.city || "").trim().toLowerCase();
  const location = (workspace.location || "").trim().toLowerCase();
  const area = (workspace.area || "").trim().toLowerCase();
  return (
    city === loc || city.includes(loc) ||
    location === loc || location.includes(loc) ||
    area === loc || area.includes(loc)
  );
}

function getUnitHint(rawVal, size) {
  if (rawVal === "" || rawVal === undefined) return null;
  const n = parseInt(rawVal, 10);
  if (isNaN(n) || n <= 0) return null;
  const { maxUnits } = SIZE_CONFIG[size];
  const hints = UPGRADE_HINTS[size];
  if (n > maxUnits) return hints?.tooHigh || null;
  return null;
}

// ─── Seat Capacity Bar ────────────────────────────────────────────────────────
function SeatCapacityBar({ size, currentUnits }) {
  const config = SIZE_CONFIG[size];
  const pct = Math.min((currentUnits / config.maxUnits) * 100, 100);
  const isOver = currentUnits > config.maxUnits;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
          Seat Capacity Used
        </span>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: isOver ? "#ef4444" : config.accent,
          background: isOver ? "#fee2e2" : config.accentLight,
          padding: "2px 10px",
          borderRadius: 99,
        }}>
          {currentUnits} / {config.maxUnits} seats
        </span>
      </div>
      <div style={{
        height: 8,
        background: "#f3f4f6",
        borderRadius: 99,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isOver
            ? "linear-gradient(90deg, #f87171, #ef4444)"
            : `linear-gradient(90deg, ${config.accent}99, ${config.accent})`,
          borderRadius: 99,
          transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{config.minSeats} seats</span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{config.maxSeats} seats</span>
      </div>
    </div>
  );
}

// ─── Hint Banner ──────────────────────────────────────────────────────────────
function HintBanner({ hint, onSwitch }) {
  if (!hint) return null;
  const isWarning = !hint.switchTo;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      background: isWarning ? "#fef3c7" : "#ede9fe",
      border: `1.5px solid ${isWarning ? "#fcd34d" : "#c4b5fd"}`,
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 16,
      fontSize: 13,
      color: isWarning ? "#92400e" : "#4c1d95",
      lineHeight: 1.5,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{hint.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{hint.title}</div>
        <div style={{ opacity: 0.85 }}>{hint.body}</div>
      </div>
      {hint.badge && (
        <button
          onClick={() => onSwitch(hint.switchTo)}
          style={{
            flexShrink: 0,
            alignSelf: "center",
            padding: "6px 14px",
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {hint.badge} →
        </button>
      )}
    </div>
  );
}

function buildQuoteHTML({ location, rows, companyName, date, size, leadForm }) {
  const config = SIZE_CONFIG[size];
  const tableRows = rows
    .map((r) => {
      const price = Number(r.price || 0);
      const units = Number(r.units || 1);
      const total = price * units;
      return `
        <tr>
          <td class="td">${r.name}</td>
          <td class="td tc">${units}</td>
          <td class="td tc">&#8377;${price.toLocaleString("en-IN")}.00</td>
          <td class="td tc">&#8377;${Math.round(price * 0.09).toLocaleString("en-IN")}.00</td>
          <td class="td tc">&#8377;${Math.round(price * 0.09).toLocaleString("en-IN")}.00</td>
          <td class="td tc bold">&#8377;${total.toLocaleString("en-IN")}.00</td>
        </tr>`;
    })
    .join("");

  const totalAmount = rows.reduce(
    (s, r) => s + Number(r.price || 0) * Number(r.units || 1),
    0
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Workspace Quotation - ${location}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#fff;padding:40px;color:#1a1a1a;font-size:14px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .logo{font-size:22px;font-weight:700;color:#7c3aed}
  .top-right{text-align:right;font-size:12px;color:#666;line-height:1.7}
  .box{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:14px}
  .box-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em}
  .box-val{font-size:14px;font-weight:600;color:#111}
  table{width:100%;border-collapse:collapse;margin:18px 0}
  thead tr{background:#f3f4f6}
  th{padding:10px 12px;text-align:left;font-size:12px;color:#374151}
  td{padding:12px;border-bottom:1px solid #e5e7eb;font-size:13px}
  .tc{text-align:center}
  .bold{font-weight:700}
  .summary{width:280px;margin-left:auto;border-top:2px solid #e5e7eb;padding-top:14px}
  .summary-row{display:flex;justify-content:space-between;padding:4px 0}
  .summary-total{display:flex;justify-content:space-between;padding-top:10px;margin-top:8px;border-top:1px solid #111;font-weight:700}
  .meta{margin-bottom:16px}
</style>
</head>
<body>
  <div class="top">
    <div>
      <div class="logo">Co Work</div>
      <div style="font-size:12px;color:#999;margin-top:4px">Premium Coworking · Hyderabad</div>
    </div>
    <div class="top-right">
      <div><strong>Date:</strong> ${date}</div>
      ${leadForm.name ? `<div><strong>Name:</strong> ${leadForm.name}</div>` : ""}
      ${leadForm.email ? `<div><strong>Email:</strong> ${leadForm.email}</div>` : ""}
      ${leadForm.phone ? `<div><strong>Phone:</strong> ${leadForm.phone}</div>` : ""}
      ${companyName ? `<div><strong>Company:</strong> ${companyName}</div>` : ""}
    </div>
  </div>
  <div class="meta">
    <div class="box"><div class="box-label">Location</div><div class="box-val">${location}</div></div>
    <div class="box"><div class="box-label">Package Size</div><div class="box-val">${size} (${config.seatRange})</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item Name</th><th class="tc">Seats</th><th class="tc">Price / Seat</th>
        <th class="tc">CGST (9%)</th><th class="tc">SGST (9%)</th><th class="tc">Total</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><span>&#8377;${totalAmount.toLocaleString("en-IN")}</span></div>
    <div class="summary-total"><span>Grand Total</span><span>&#8377;${totalAmount.toLocaleString("en-IN")}</span></div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

// ─── Quote Modal ──────────────────────────────────────────────────────────────
function QuoteModal({ open, onClose, size, onSwitchSize, allWorkspaces }) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.Small;
  const overlayRef = useRef();

  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([config.types[0]]);
  const [unitInputs, setUnitInputs] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    setSelectedTypes([config.types[0]]);
    setUnitInputs({});
    setCompanyName("");
    setLeadForm({ name: "", email: "", phone: "" });
    setFormErrors({});
  }, [size]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".qm-dropdown-wrap")) {
        setLocationOpen(false);
        setTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const getPrice = (typeName) => {
    const nameMatches = allWorkspaces.filter(
      (w) => (w.name || "").trim().toLowerCase() === typeName.trim().toLowerCase()
    );
    if (nameMatches.length === 0) return 0;
    const locationMatch = nameMatches.find((w) => workspaceMatchesLocation(w, location));
    if (locationMatch) return Number(locationMatch.price || 0);
    if (nameMatches.length === 1) return Number(nameMatches[0].price || 0);
    return 0;
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getRaw = (type) => (unitInputs[type] !== undefined ? unitInputs[type] : "1");
  const getEffective = (type) => {
    const n = parseInt(getRaw(type), 10);
    return isNaN(n) || n < 1 ? 1 : n;
  };

  const handleUnitChange = (type, value) => {
    const sanitised = value.replace(/[^0-9]/g, "");
    setUnitInputs((prev) => ({ ...prev, [type]: sanitised }));
  };

  const rows = selectedTypes.map((type) => ({
    name: type,
    price: getPrice(type),
    units: getEffective(type),
    raw: getRaw(type),
  }));

  const rowHints = Object.fromEntries(
    selectedTypes.map((type) => [type, getUnitHint(getRaw(type), size)])
  );

  const activeHint = Object.values(rowHints).find(Boolean) || null;
  const hasOutOfRange = activeHint !== null;
  const hasAnyPrice = rows.some((r) => r.price > 0);

  const totalSeats = rows.reduce((s, r) => s + r.units, 0);

  const totalAmount = rows.reduce(
    (s, r) => s + (r.price > 0 && !rowHints[r.name] ? r.price * r.units : 0),
    0
  );

  const validateForm = () => {
    const errors = {};
    if (!leadForm.name.trim()) errors.name = "Name is required.";
    if (!leadForm.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email)) errors.email = "Enter a valid email.";
    if (!leadForm.phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^[0-9]{10}$/.test(leadForm.phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit phone number.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDownload = async () => {
    if (!validateForm()) return;
    try {
      await axiosInstance.post("leads/create-quotation-lead/", {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        company: companyName,
        preferred_location: location,
        workspace_type: size,
        total_amount: totalAmount,
        quotation_details: rows,
      });
    } catch (error) {
      console.log("Quotation Lead Error", error);
    }

    const html = buildQuoteHTML({
      location, rows, companyName,
      date: new Date().toLocaleDateString("en-IN"),
      size, leadForm,
    });

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank", "width=900,height=700");
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (printWindow) printWindow.focus();
    setShowLeadForm(false);
  };

  return (
    <div
      className="qm-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="qm-modal">
        <button className="qm-close" onClick={onClose}>✕</button>

        {/* ── Modal Header with Seat Range Info ── */}
        <div style={{
          background: `linear-gradient(135deg, ${config.accentLight}, #fff)`,
          border: `1.5px solid ${config.accent}33`,
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            fontSize: 32,
            width: 52,
            height: 52,
            background: config.accentLight,
            border: `1.5px solid ${config.accent}44`,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {config.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                background: config.accent,
                color: "#fff",
                letterSpacing: ".04em",
              }}>
                {config.displayLabel} Plan
              </span>
              <span style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                background: config.accentLight,
                color: config.accent,
                border: `1px solid ${config.accent}44`,
              }}>
                {config.seatRange}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>
              {config.description}
            </p>
          </div>
          <div style={{
            textAlign: "right",
            flexShrink: 0,
            fontSize: 11,
            color: "#9ca3af",
            lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Seat Limit</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: config.accent }}>
              {config.maxSeats}
            </div>
            <div>seats max</div>
          </div>
        </div>

        {/* ── Size Switcher Tabs ── */}
        <div style={{
          display: "flex",
          gap: 6,
          marginBottom: 18,
          background: "#f9fafb",
          borderRadius: 10,
          padding: 4,
          border: "1px solid #e5e7eb",
        }}>
          {["Small", "Medium", "Large"].map((s) => {
            const sc = SIZE_CONFIG[s];
            const isActive = s === size;
            return (
              <button
                key={s}
                onClick={() => onSwitchSize(s)}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? sc.accent : "transparent",
                  color: isActive ? "#fff" : "#6b7280",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12,
                  transition: "all 0.2s",
                  lineHeight: 1.3,
                }}
              >
                <div>{s}</div>
                <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 400 }}>
                  {sc.seatRange}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Seat Capacity Progress Bar ── */}
        <SeatCapacityBar size={size} currentUnits={totalSeats} />

        {/* ── Filters Row ── */}
        <div className="qm-filters-row">
          <div className="qm-dropdown-wrap">
            <div className="qm-dropdown-label">Location</div>
            <div
              className={`qm-dropdown-box ${locationOpen ? "open" : ""}`}
              onClick={() => { setLocationOpen((p) => !p); setTypeOpen(false); }}
            >
              <span>{location}</span>
              <span className="qm-chevron">{locationOpen ? "▲" : "▼"}</span>
            </div>
            {locationOpen && (
              <div className="qm-dropdown-list">
                {LOCATIONS.map((loc) => (
                  <div
                    key={loc}
                    className={`qm-dropdown-item ${location === loc ? "active" : ""}`}
                    onClick={() => { setLocation(loc); setLocationOpen(false); }}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="qm-dropdown-wrap">
            <div className="qm-dropdown-label">Space Type</div>
            <div
              className={`qm-dropdown-box qm-dropdown-box--purple ${typeOpen ? "open" : ""}`}
              onClick={() => { setTypeOpen((p) => !p); setLocationOpen(false); }}
            >
              <span>
                {selectedTypes.length === 0 ? "Select Type" : selectedTypes[0]}
                {selectedTypes.length > 1 ? ` +${selectedTypes.length - 1}` : ""}
              </span>
              <span className="qm-chevron">{typeOpen ? "▲" : "▼"}</span>
            </div>
            {typeOpen && (
              <div className="qm-dropdown-list qm-checkbox-list">
                {config.types.map((type) => {
                  const price = getPrice(type);
                  const checked = selectedTypes.includes(type);
                  return (
                    <label key={type} className="qm-checkbox-item">
                      <input type="checkbox" checked={checked} onChange={() => toggleType(type)} />
                      <span className="qm-checkbox-label">{type}</span>
                      {price > 0 ? (
                        <span className="qm-checkbox-price">₹{price.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="qm-checkbox-price" style={{ color: "#aaa" }}>N/A</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="qm-company-wrap">
            <div className="qm-dropdown-label">Company (optional)</div>
            <input
              className="qm-company-input"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </div>

        <HintBanner hint={activeHint} onSwitch={onSwitchSize} />

        {selectedTypes.length > 0 ? (
          <div className="qm-table-wrap">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th style={{ width: 160 }}>
                    Seats{" "}
                    <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 11 }}>
                      (max {config.maxUnits})
                    </span>
                  </th>
                  <th>Price / Seat</th>
                  <th>CGST (9%)</th>
                  <th>SGST (9%)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const hint = rowHints[row.name];
                  const outOfRange = hint !== null && row.raw !== "";
                  const total = row.price * row.units;
                  return (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            className="qm-units-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="Seats"
                            value={row.raw}
                            onChange={(e) => handleUnitChange(row.name, e.target.value)}
                            style={{
                              width: 80,
                              borderColor: outOfRange ? "#f87171" : undefined,
                              outline: outOfRange ? "2px solid #fee2e2" : undefined,
                            }}
                          />
                          <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                            / {config.maxUnits} max
                          </span>
                        </div>
                        {outOfRange && (
                          <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3, lineHeight: 1.3 }}>
                            Max {config.maxSeats} seats for {size} plan
                          </div>
                        )}
                      </td>
                      <td>
                        {row.price > 0 ? (
                          `₹${row.price.toLocaleString("en-IN")}.00`
                        ) : (
                          <span className="qm-no-price">Not available here</span>
                        )}
                      </td>
                      <td>{row.price > 0 ? "included" : "—"}</td>
                      <td>{row.price > 0 ? "included" : "—"}</td>
                      <td className="qm-total-cell">
                        {row.price > 0 && !outOfRange
                          ? `₹${total.toLocaleString("en-IN")}.00`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!hasAnyPrice && (
              <div style={{
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 13,
                color: "#92400e",
                marginBottom: 16,
              }}>
                ⚠️ No pricing found for <strong>{location}</strong> with the selected type(s).
              </div>
            )}

            <div className="qm-summary-wrap">
              <div className="qm-summary">
                <div className="qm-summary-row">
                  <span>Subtotal</span>
                  <span>{hasOutOfRange ? "—" : `₹${totalAmount.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="qm-summary-total">
                  <span>Grand Total</span>
                  <span>{hasOutOfRange ? "—" : `₹${totalAmount.toLocaleString("en-IN")}`}</span>
                </div>
              </div>
            </div>

            <button
              className="qm-download-btn"
              onClick={() => setShowLeadForm(true)}
              disabled={!hasAnyPrice || hasOutOfRange}
              title={hasOutOfRange ? "Fix seat count before downloading" : undefined}
            >
              ⬇ Download Quotation PDF
            </button>

            {showLeadForm && (
              <div className="qm-form-overlay">
                <div className="qm-lead-popup">
                  <h2>Download Quotation</h2>
                  <p>Enter your details to continue</p>

                  <div className="qm-field">
                    <input
                      type="text"
                      placeholder="Name"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    />
                    {formErrors.name && <span className="qm-error">{formErrors.name}</span>}
                  </div>

                  <div className="qm-field">
                    <input
                      type="email"
                      placeholder="Email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    />
                    {formErrors.email && <span className="qm-error">{formErrors.email}</span>}
                  </div>

                  <div className="qm-field">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={leadForm.phone}
                      onChange={(e) =>
                        setLeadForm({ ...leadForm, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })
                      }
                    />
                    {formErrors.phone && <span className="qm-error">{formErrors.phone}</span>}
                  </div>

                  <button className="qm-download-btn" onClick={handleDownload}>Download PDF</button>
                  <button className="qm-cancel-btn" onClick={() => setShowLeadForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="qm-empty">
            <span>📋</span>
            <p>Select at least one space type to see the quote.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Companies Section ────────────────────────────────────────────────────────
const CompaniesSection = () => {
  const navigate = useNavigate();
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Small");

  useEffect(() => {
    axiosInstance
      .get("workspaces/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAllWorkspaces(data);
      })
      .catch(() => setAllWorkspaces([]));
  }, []);

  const openQuote = (size, e) => {
    e.stopPropagation();
    setSelectedSize(size);
    setQuoteOpen(true);
  };

  const handleSwitchSize = (newSize) => setSelectedSize(newSize);

  const sizes = ["Small", "Medium", "Large"];
  const cardImages = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  ];

  return (
    <>
      <section id="workspace-companies-section" className="cs-section">
        <div className="cs-header">
          <span className="cs-eyebrow">Workspace Solutions · Hyderabad</span>
          <h2 className="cs-title">Office Space for Every Team Size</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
            Choose a plan that fits your team's seat count — from solo desks to enterprise floors.
          </p>
        </div>

        <div className="cs-grid">
          {sizes.map((size, idx) => {
            const config = SIZE_CONFIG[size];
            return (
              <div
                key={size}
                className={`cs-card ${config.featured ? "cs-card--featured" : ""}`}
                style={{ backgroundImage: `url(${cardImages[idx]})` }}
                onClick={() =>
                  navigate(`/speciall-contact/${idx + 1}`, { state: { workspaceSize: size } })
                }
              >
                <div className="cs-overlay" />
                <div className="cs-card-body">
                  <div>
                    {config.featured && <span className="cs-badge">Most Popular</span>}

                    {/* Seat Range Badge */}
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 99,
                      padding: "4px 12px",
                      marginBottom: 10,
                      fontSize: 12,
                      color: "#fff",
                      fontWeight: 600,
                    }}>
                      <span style={{ fontSize: 14 }}>🪑</span>
                      {config.seatRange}
                    </div>

                    <h3 className="cs-size">{size}</h3>
                    <p className="cs-sub">{config.subtitle}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                      {config.description}
                    </p>

                    {/* Seat Dots Visual */}
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3,
                      marginTop: 10,
                      maxWidth: 120,
                    }}>
                      {Array.from({
                        length: size === "Small" ? 5 : size === "Medium" ? 8 : 12
                      }).map((_, i) => (
                        <div key={i} style={{
                          width: size === "Large" ? 8 : 10,
                          height: size === "Large" ? 8 : 10,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.4)",
                        }} />
                      ))}
                      <div style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.7)",
                        alignSelf: "center",
                        marginLeft: 2,
                      }}>
                        up to {config.maxSeats}
                      </div>
                    </div>

                    {/* Space Types */}
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {config.types.map((t) => (
                        <span key={t} style={{
                          fontSize: 10,
                          background: "rgba(255,255,255,0.15)",
                          border: "1px solid rgba(255,255,255,0.25)",
                          borderRadius: 99,
                          padding: "2px 8px",
                          color: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(4px)",
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="cs-btn-group">
                    <button
                      className="cs-btn-quote"
                      onClick={(e) => openQuote(size, e)}
                    >
                      Get a Quote →
                    </button>
                    <button
                      className="cs-btn-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/speciall-contact/${idx + 1}`, { state: { workspaceSize: size } });
                      }}
                    >
                      Book Now →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        size={selectedSize}
        onSwitchSize={handleSwitchSize}
        allWorkspaces={allWorkspaces}
      />
    </>
  );
};

export default CompaniesSection;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import "../Styles/Companies.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATIONS = ["Madhapur", "Gachibowli", "Hitech City", "Kondapur"];

const SIZE_CONFIG = {
  Small: {
    subtitle: "1 – 20 Employees",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    featured: false,
    types: ["Hot Desk", "Dedicated Desk", "Virtual Office"],
    minUnits: 1,
    maxUnits: 10,
  },
  Medium: {
    subtitle: "20 – 75 Employees",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
    featured: true,
    types: ["Private Office Space", "Private Cabin", "Meeting Room"],
    minUnits: 10,
    maxUnits: 50,
  },
  Large: {
    subtitle: "75 – 200+ Employees",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    featured: false,
    types: ["Board Room", "Event Space", "Podcast"],
    minUnits: 50,
    maxUnits: 200,
  },
};

// Hint config per size × direction
const UPGRADE_HINTS = {
  Small: {
    tooHigh: {
      icon: "🏢",
      title: "Looking like a Medium-level company!",
      body: "Your requirement (>10 units) fits our Medium workspace plans perfectly.",
      badge: "Switch to Medium",
      switchTo: "Medium",
    },
    tooLow: null,
  },
  Medium: {
    tooHigh: {
      icon: "🏬",
      title: "Sounds like a Large company setup!",
      body: "For more than 50 units, our Large workspace plans are the right fit.",
      badge: "Switch to Large",
      switchTo: "Large",
    },
    tooLow: {
      icon: "🏠",
      title: "That's a Small team size.",
      body: "For fewer than 10 units, our Small workspace plans suit you better.",
      badge: "Switch to Small",
      switchTo: "Small",
    },
  },
  Large: {
    tooHigh: {
      icon: "⚠️",
      title: "Exceeds maximum capacity (200 seats)",
      body: "We support up to 200 units. Please contact us directly for enterprise solutions beyond this.",
      badge: null,
      switchTo: null,
    },
    tooLow: {
      icon: "🏢",
      title: "That's a Medium-level requirement.",
      body: "For fewer than 50 units, our Medium workspace plans are a better fit.",
      badge: "Switch to Medium",
      switchTo: "Medium",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Returns hint config when the typed value is outside the tier's range,
 * or null when in-range / empty (still typing).
 */
function getUnitHint(rawVal, size) {
  if (rawVal === "" || rawVal === undefined) return null;
  const n = parseInt(rawVal, 10);
  if (isNaN(n) || n === 0) return null;
  const { minUnits, maxUnits } = SIZE_CONFIG[size];
  const hints = UPGRADE_HINTS[size];
  if (n > maxUnits) return hints?.tooHigh || null;
  if (n < minUnits) return hints?.tooLow || null;
  return null;
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

function buildQuoteHTML({ location, rows, companyName, date, size }) {
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
          <td class="td tc">with included</td>
          <td class="td tc">with included</td>
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
<title>Workspace Quotation &#8211; ${location}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;background:#fff;padding:48px 56px;color:#1a1a1a;font-size:14px}
  .logo{font-size:22px;font-weight:700;color:#7c3aed;letter-spacing:-.4px}
  .logo span{color:#1a1a1a}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px}
  .top-right{text-align:right;font-size:12px;color:#666;line-height:1.7}
  .filters{display:flex;gap:24px;margin-bottom:28px}
  .filter-box{border:1.5px solid #d1d5db;border-radius:8px;padding:8px 16px;min-width:180px}
  .filter-label{font-size:10px;color:#999;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
  .filter-val{font-size:14px;font-weight:500;color:#1a1a1a}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead tr{background:#f3f4f6}
  th{padding:12px 14px;text-align:left;font-size:12px;font-weight:600;color:#374151;letter-spacing:.03em}
  th.tc,td.tc{text-align:center}
  .td{padding:14px;border-bottom:1px solid #e5e7eb;font-size:13.5px;color:#1a1a1a}
  .bold{font-weight:600}
  .summary-wrap{display:flex;justify-content:flex-end}
  .summary{width:280px;border-top:2px solid #e5e7eb;padding-top:16px}
  .summary-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;color:#374151}
  .summary-total{display:flex;justify-content:space-between;padding:10px 0 0;margin-top:8px;border-top:1.5px solid #1a1a1a;font-size:15px;font-weight:700;color:#1a1a1a}
  .dl-btn{display:inline-block;margin-top:28px;padding:11px 28px;background:#7c3aed;color:#fff;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none}
  @media print{.dl-btn{display:none}}
</style>
</head>
<body>
<div class="top">
  <div>
    <div class="logo">Workspace<span>Hub</span></div>
    <div style="font-size:12px;color:#999;margin-top:4px">Premium Coworking &middot; Hyderabad</div>
  </div>
  <div class="top-right">
    <div><strong>Date:</strong> ${date}</div>
    ${companyName ? `<div><strong>For:</strong> ${companyName}</div>` : ""}
    <div><strong>Location:</strong> ${location}</div>
    <div><strong>Package:</strong> ${size} &ndash; ${SIZE_CONFIG[size]?.subtitle || ""}</div>
  </div>
</div>
<div class="filters">
  <div class="filter-box">
    <div class="filter-label">Location</div>
    <div class="filter-val">${location}</div>
  </div>
  <div class="filter-box">
    <div class="filter-label">Package Size</div>
    <div class="filter-val">${size}</div>
  </div>
  <div class="filter-box">
    <div class="filter-label">Space Types</div>
    <div class="filter-val">${rows.map((r) => r.name).join(", ")}</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>Item Name</th>
      <th class="tc">Units</th>
      <th class="tc">Price / Unit</th>
      <th class="tc">CGST (9%)</th>
      <th class="tc">SGST (9%)</th>
      <th class="tc">Total</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="summary-wrap">
  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><span>&#8377;${totalAmount.toLocaleString("en-IN")}</span></div>
    <div class="summary-total"><span>Grand Total</span><span>&#8377;${totalAmount.toLocaleString("en-IN")}</span></div>
  </div>
</div>
<button class="dl-btn" onclick="window.print()">&#8595; Download / Print PDF</button>
</body>
</html>`;
}

function downloadQuote(location, rows, companyName, size) {
  const validRows = rows.filter((r) => r.price > 0);
  if (!validRows.length) return;
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const html = buildQuoteHTML({ location, rows: validRows, companyName, date, size });
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quotation_${size}_${location}_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Hint Banner ──────────────────────────────────────────────────────────────

function HintBanner({ hint, onSwitch }) {
  if (!hint) return null;
  const isWarning = !hint.switchTo;
  return (
    <div
      style={{
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
      }}
    >
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

// ─── Quote Modal ──────────────────────────────────────────────────────────────

function QuoteModal({ open, onClose, size, onSwitchSize, allWorkspaces }) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.Small;
  const overlayRef = useRef();

  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([config.types[0]]);
  // Raw string inputs so field can be completely empty while typing
  const [unitInputs, setUnitInputs] = useState({});
  const [companyName, setCompanyName] = useState("");

  // Reset when size changes
  useEffect(() => {
    setSelectedTypes([config.types[0]]);
    setUnitInputs({});
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

  // ── price lookup ──
  const getPrice = (typeName) => {
    const nameMatches = allWorkspaces.filter(
      (w) => (w.name || "").trim().toLowerCase() === typeName.trim().toLowerCase()
    );
    if (nameMatches.length === 0) return 0;
    const locationMatch = nameMatches.find((w) =>
      workspaceMatchesLocation(w, location)
    );
    if (locationMatch) return Number(locationMatch.price || 0);
    if (nameMatches.length === 1) return Number(nameMatches[0].price || 0);
    return 0;
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Raw string stored in state (allows "" so user can clear with backspace)
  const getRaw = (type) =>
    unitInputs[type] !== undefined ? unitInputs[type] : "1";

  // Numeric value used for price calculation; falls back to 1 when empty/invalid
  const getEffective = (type) => {
    const n = parseInt(getRaw(type), 10);
    return isNaN(n) || n < 1 ? 1 : n;
  };

  const handleUnitChange = (type, value) => {
    // Strip anything that isn't a digit; allow empty string
    const sanitised = value.replace(/[^0-9]/g, "");
    setUnitInputs((prev) => ({ ...prev, [type]: sanitised }));
  };

  // Build rows
  const rows = selectedTypes.map((type) => ({
    name: type,
    price: getPrice(type),
    units: getEffective(type),
    raw: getRaw(type),
  }));

  // Per-row hints
  const rowHints = Object.fromEntries(
    selectedTypes.map((type) => [type, getUnitHint(getRaw(type), size)])
  );
  const activeHint = Object.values(rowHints).find(Boolean) || null;
  const hasOutOfRange = activeHint !== null;

  const totalAmount = rows.reduce(
    (s, r) => s + (r.price > 0 && !rowHints[r.name] ? r.price * r.units : 0),
    0
  );
  const hasAnyPrice = rows.some((r) => r.price > 0);

  return (
    <div
      className="qm-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="qm-modal">
        <button className="qm-close" onClick={onClose}>✕</button>

        {/* Size badge */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              background: "#ede9fe",
              color: "#6d28d9",
              letterSpacing: ".04em",
            }}
          >
            {size} · {config.subtitle}
          </span>
          <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            Valid units for this tier:{" "}
            <strong>{config.minUnits}–{config.maxUnits}</strong>
          </p>
        </div>

        {/* Filters row */}
        <div className="qm-filters-row">
          {/* Location */}
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

          {/* Space type */}
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
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleType(type)}
                      />
                      <span className="qm-checkbox-label">{type}</span>
                      {price > 0 ? (
                        <span className="qm-checkbox-price">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="qm-checkbox-price" style={{ color: "#aaa" }}>
                          N/A
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Company */}
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

        {/* Upgrade / downgrade hint banner */}
        <HintBanner hint={activeHint} onSwitch={onSwitchSize} />

        {/* Table */}
        {selectedTypes.length > 0 ? (
          <div className="qm-table-wrap">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th style={{ width: 140 }}>
                    Units{" "}
                    <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 11 }}>
                      ({config.minUnits}–{config.maxUnits})
                    </span>
                  </th>
                  <th>Price / Unit</th>
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

                      {/* ── Free-type input – fully clearable ── */}
                      <td>
                        <input
                          className="qm-units-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter units"
                          value={row.raw}
                          onChange={(e) => handleUnitChange(row.name, e.target.value)}
                          style={{
                            width: 90,
                            borderColor: outOfRange ? "#f87171" : undefined,
                            outline: outOfRange ? "2px solid #fee2e2" : undefined,
                          }}
                        />
                        {outOfRange && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#ef4444",
                              marginTop: 3,
                              lineHeight: 1.3,
                            }}
                          >
                            Out of range
                          </div>
                        )}
                      </td>

                      <td>
                        {row.price > 0 ? (
                          `₹${row.price.toLocaleString("en-IN")}.00`
                        ) : (
                          <span className="qm-no-price">Not available</span>
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
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#92400e",
                  marginBottom: 16,
                }}
              >
                ⚠️ No pricing found for <strong>{location}</strong> with the selected
                type(s).
              </div>
            )}

            {/* Summary */}
            <div className="qm-summary-wrap">
              <div className="qm-summary">
                <div className="qm-summary-row">
                  <span>Subtotal</span>
                  <span>
                    {hasOutOfRange ? "—" : `₹${totalAmount.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="qm-summary-total">
                  <span>Grand Total</span>
                  <span>
                    {hasOutOfRange ? "—" : `₹${totalAmount.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="qm-download-btn"
              onClick={() =>

  setShowLeadForm(true)

}
              disabled={!hasAnyPrice || hasOutOfRange}
              title={hasOutOfRange ? "Fix unit count before downloading" : undefined}
            >
              ⬇ Download Quotation PDF
            </button>
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

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const handleSwitchSize = (newSize) => {
    setSelectedSize(newSize);
  };

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
                  navigate(`/speciall-contact/${idx + 1}`, {
                    state: { workspaceSize: size },
                  })
                }
              >
                <div className="cs-overlay" />
                <div className="cs-card-body">
                  <div>
                    {config.featured && <span className="cs-badge">Popular</span>}
                    <h3 className="cs-size">{size}</h3>
                    <p className="cs-sub">{config.subtitle}</p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.65)",
                        marginTop: 4,
                      }}
                    >
                      {config.minUnits}–{config.maxUnits} units
                    </p>
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
                        navigate(`/speciall-contact/${idx + 1}`, {
                          state: { workspaceSize: size },
                        });
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

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
  },
  Medium: {
    subtitle: "20 – 75 Employees",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
    featured: true,
    types: ["Private Office Space", "Private Cabin", "Meeting Room"],
  },
  Large: {
    subtitle: "75 – 200+ Employees",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    featured: false,
    types: ["Board Room", "Event Space", "Podcast"],
  },
};

// ─── Helper: does this workspace belong to the selected location? ─────────────

function workspaceMatchesLocation(workspace, selectedLocation) {
  const loc = selectedLocation.trim().toLowerCase();
  const city = (workspace.city || "").trim().toLowerCase();
  const location = (workspace.location || "").trim().toLowerCase();
  const area = (workspace.area || "").trim().toLowerCase();

  return (
    city === loc ||
    city.includes(loc) ||
    location === loc ||
    location.includes(loc) ||
    area === loc ||
    area.includes(loc)
  );
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

function buildQuoteHTML({ location, rows, companyName, date }) {
  const tableRows = rows
    .map((r) => {
      const price = Number(r.price || 0);
      const units = Number(r.units || 1);
      const total = price * units;

      return `
        <tr>
          <td class="td">${r.name}</td>
          <td class="td tc">${units}</td>
          <td class="td tc">₹${price.toLocaleString("en-IN")}.00</td>
          <td class="td tc">with included</td>
          <td class="td tc">with included</td>
          <td class="td tc bold">₹${total.toLocaleString("en-IN")}.00</td>
        </tr>`;
    })
    .join("");

  const totalAmount = rows.reduce(
    (s, r) => s + Number(r.price || 0) * Number(r.units || 1),
    0
  );

  const grandTotal = totalAmount;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Workspace Quotation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;background:#fff;padding:48px 56px;color:#1a1a1a;font-size:14px}
  .logo{font-size:22px;font-weight:700;color:#7c3aed;letter-spacing:-.4px}
  .logo span{color:#1a1a1a}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px}
  .top-right{text-align:right;font-size:12px;color:#666;line-height:1.7}
  h1{font-size:20px;font-weight:600;margin-bottom:4px}
  .meta{font-size:13px;color:#666;margin-bottom:28px}
  .filters{display:flex;gap:24px;margin-bottom:28px}
  .filter-box{border:1.5px solid #d1d5db;border-radius:8px;padding:8px 16px;min-width:180px}
  .filter-label{font-size:10px;color:#999;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
  .filter-val{font-size:14px;font-weight:500;color:#1a1a1a}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead tr{background:#f3f4f6}
  th{padding:12px 14px;text-align:left;font-size:12px;font-weight:600;color:#374151;letter-spacing:.03em}
  th.tc,td.tc{text-align:center}
  .td{padding:14px 14px;border-bottom:1px solid #e5e7eb;font-size:13.5px;color:#1a1a1a}
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
    <div style="font-size:12px;color:#999;margin-top:4px">Premium Coworking · Hyderabad</div>
  </div>
  <div class="top-right">
    <div><strong>Date:</strong> ${date}</div>
    ${companyName ? `<div><strong>For:</strong> ${companyName}</div>` : ""}
    <div><strong>Location:</strong> ${location}</div>
  </div>
</div>

<div class="filters">
  <div class="filter-box">
    <div class="filter-label">Location</div>
    <div class="filter-val">${location}</div>
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
      <th class="tc">Price</th>
      <th class="tc">CGST (9%)</th>
      <th class="tc">SGST (9%)</th>
      <th class="tc">Total</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>

<div class="summary-wrap">
  <div class="summary">
    <div class="summary-row"><span>Amount</span><span>₹${totalAmount.toLocaleString("en-IN")}</span></div>
    <div class="summary-total"><span>Total</span><span>₹${grandTotal.toLocaleString("en-IN")}</span></div>
  </div>
</div>

<button class="dl-btn" onclick="window.print()">Download Quotation PDF</button>
</body>
</html>`;
}

function downloadQuote(location, rows, companyName) {
  if (!rows.length) return;
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const html = buildQuoteHTML({ location, rows, companyName, date });
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quotation_${location}_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Quote Modal ──────────────────────────────────────────────────────────────

function QuoteModal({ open, onClose, size, allWorkspaces }) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.Small;
  const overlayRef = useRef();

  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([config.types[0]]);
  const [units, setUnits] = useState({});
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    setSelectedTypes([config.types[0]]);
    setUnits({});
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

  const getUnits = (type) => Number(units[type] || 1);

  const rows = selectedTypes.map((type) => ({
    name: type,
    price: getPrice(type),
    units: getUnits(type),
  }));

  const totalAmount = rows.reduce((s, r) => s + r.price * r.units, 0);
  const grandTotal = totalAmount;

  return (
    <div
      className="qm-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="qm-modal">
        <button className="qm-close" onClick={onClose}>✕</button>

        <div className="qm-filters-row">
          <div className="qm-dropdown-wrap">
            <div className="qm-dropdown-label">Location</div>
            <div
              className={`qm-dropdown-box ${locationOpen ? "open" : ""}`}
              onClick={() => {
                setLocationOpen((p) => !p);
                setTypeOpen(false);
              }}
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
                    onClick={() => {
                      setLocation(loc);
                      setLocationOpen(false);
                    }}
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
              onClick={() => {
                setTypeOpen((p) => !p);
                setLocationOpen(false);
              }}
            >
              <span>
                {selectedTypes.length === 0
                  ? "Select Type"
                  : selectedTypes[0]}
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
                        <span
                          className="qm-checkbox-price"
                          style={{ color: "#aaa" }}
                        >
                          Not available
                        </span>
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

        {selectedTypes.length > 0 ? (
          <div className="qm-table-wrap">
            <table className="qm-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Units</th>
                  <th>Price</th>
                  <th>CGST (9%)</th>
                  <th>SGST (9%)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const total = row.price * row.units;

                  return (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>
                        <input
                          className="qm-units-input"
                          type="number"
                          min="1"
                          value={getUnits(row.name)}
                          onChange={(e) =>
                            setUnits((prev) => ({
                              ...prev,
                              [row.name]: Math.max(1, Number(e.target.value)),
                            }))
                          }
                        />
                      </td>
                      <td>
                        {row.price > 0 ? (
                          `₹${row.price.toLocaleString("en-IN")}.00`
                        ) : (
                          <span className="qm-no-price">Not available</span>
                        )}
                      </td>
                      <td>
                        {row.price > 0 ? "with included" : "—"}
                      </td>
                      <td>
                        {row.price > 0 ? "with included" : "—"}
                      </td>
                      <td className="qm-total-cell">
                        {row.price > 0
                          ? `₹${total.toLocaleString("en-IN")}.00`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.every((r) => r.price === 0) && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#92400e",
                  marginBottom: "16px",
                }}
              >
                ⚠️ No workspace pricing found for <strong>{location}</strong> with the selected type(s).
                The owner may not have added this workspace for this location yet.
              </div>
            )}

            <div className="qm-summary-wrap">
              <div className="qm-summary">
                <div className="qm-summary-row">
                  <span>Amount</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="qm-summary-total">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <button
              className="qm-download-btn"
              onClick={() => downloadQuote(location, rows, companyName)}
              disabled={rows.every((r) => r.price === 0)}
            >
              Download Quotation PDF
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
        console.log("Workspaces from API:", data);
        setAllWorkspaces(data);
      })
      .catch(() => setAllWorkspaces([]));
  }, []);

  const openQuote = (size, e) => {
    e.stopPropagation();
    setSelectedSize(size);
    setQuoteOpen(true);
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
        allWorkspaces={allWorkspaces}
      />
    </>
  );
};

export default CompaniesSection;
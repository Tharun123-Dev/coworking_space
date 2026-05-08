import React, { useState, useEffect, useRef } from "react";
import "../Styles/Quotemodal.css";


const LOCATIONS = ["Hitech City", "Madhapur", "Gachibowli", "Kondapur"];

const SPACE_TYPES = {
  Small: [
    { name: "Private Cabin (per seat)", units: 1, price: 8500 },
    { name: "High-Speed Wi-Fi", units: 1, price: 1200 },
    { name: "Power Backup (24hr)", units: 1, price: 800 },
    { name: "Meeting Room Access (hrs/mo)", units: 5, price: 500 },
  ],
  Medium: [
    { name: "Dedicated Zone (per seat)", units: 1, price: 7200 },
    { name: "Custom Branding Setup", units: 1, price: 4500 },
    { name: "Managed IT Support", units: 1, price: 3000 },
    { name: "Meeting Rooms (hrs/mo)", units: 20, price: 500 },
    { name: "High-Speed Wi-Fi", units: 1, price: 1200 },
  ],
  Large: [
    { name: "Full-Floor Access (per seat)", units: 1, price: 6500 },
    { name: "Enterprise Fitout", units: 1, price: 18000 },
    { name: "Dedicated Account Manager", units: 1, price: 8000 },
    { name: "Meeting Rooms (hrs/mo)", units: 40, price: 500 },
    { name: "24hr Security", units: 1, price: 2500 },
    { name: "High-Speed Wi-Fi (Dedicated)", units: 1, price: 2000 },
  ],
};

const GST_RATE = 0.09; // 9% CGST + 9% SGST

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

/* ── Component ── */
const QuoteModal = ({ open, onClose, defaultSize = "Small" }) => {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [spaceType, setSpaceType] = useState(defaultSize);
  const [quantities, setQuantities] = useState({});
  const overlayRef = useRef(null);

  /* sync spaceType when parent changes defaultSize */
  useEffect(() => {
    setSpaceType(defaultSize);
    setQuantities({});
  }, [defaultSize, open]);

  const items = SPACE_TYPES[spaceType] || [];

  const getQty = (name) => quantities[name] ?? 1;
  const setQty = (name, val) =>
    setQuantities((q) => ({ ...q, [name]: Math.max(1, Number(val) || 1) }));

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.units * getQty(i.name),
    0
  );
  const cgst = subtotal * GST_RATE;
  const sgst = subtotal * GST_RATE;
  const total = subtotal + cgst + sgst;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleDownload = () => {
    const rows = items
      .map(
        (i) =>
          `${i.name}\t${i.units * getQty(i.name)}\t₹${fmt(i.price)}\t₹${fmt(
            i.price * i.units * getQty(i.name) * GST_RATE
          )}\t₹${fmt(
            i.price * i.units * getQty(i.name) * GST_RATE
          )}\t₹${fmt(i.price * i.units * getQty(i.name))}`
      )
      .join("\n");

    const content = `COWORK — QUOTATION\n${"=".repeat(60)}\nLocation : ${location}\nPlan     : ${spaceType}\nDate     : ${new Date().toLocaleDateString(
      "en-IN"
    )}\n\n${"Item Name\t\t\tUnits\tPrice\tCGST\tSGST\tTotal"}\n${rows}\n\n${"=".repeat(
      60
    )}\nSub-total : ₹${fmt(subtotal)}\nCGST (9%) : ₹${fmt(
      cgst
    )}\nSGST (9%) : ₹${fmt(sgst)}\nTotal     : ₹${fmt(total)}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WorkNest_Quote_${spaceType}_${location.replace(
      /\s/g,
      ""
    )}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="qm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="qm-modal">
        {/* ── Header ── */}
        <div className="qm-header">
          <div className="qm-header-left">
            <span className="qm-eyebrow">WorkNest · Quotation</span>
            <h2 className="qm-title">Office Space Quote</h2>
          </div>
          <button className="qm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="qm-filters">
          <div className="qm-field">
            <label className="qm-label">Location</label>
            <div className="qm-select-wrap">
              <select
                className="qm-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <span className="qm-chevron">▾</span>
            </div>
          </div>

          <div className="qm-field">
            <label className="qm-label">Space Type</label>
            <div className="qm-select-wrap">
              <select
                className="qm-select"
                value={spaceType}
                onChange={(e) => {
                  setSpaceType(e.target.value);
                  setQuantities({});
                }}
              >
                {Object.keys(SPACE_TYPES).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <span className="qm-chevron">▾</span>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="qm-table-wrap">
          <table className="qm-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Units</th>
                <th>Price</th>
                <th>CGST (9%)</th>
                <th>SGST (9%)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const qty = getQty(item.name);
                const lineBase = item.price * item.units * qty;
                const lineCgst = lineBase * GST_RATE;
                const lineSgst = lineBase * GST_RATE;
                const lineTotal = lineBase + lineCgst + lineSgst;
                return (
                  <tr key={item.name}>
                    <td className="qm-item-name">{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="qm-qty-input"
                        value={qty}
                        onChange={(e) => setQty(item.name, e.target.value)}
                      />
                    </td>
                    <td>{item.units}</td>
                    <td>₹{fmt(item.price)}</td>
                    <td>₹{fmt(lineCgst)}</td>
                    <td>₹{fmt(lineSgst)}</td>
                    <td className="qm-line-total">₹{fmt(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="qm-footer">
          <button className="qm-download-btn" onClick={handleDownload}>
            <span className="qm-dl-icon">⬇</span> Download Quotation PDF
          </button>

          <div className="qm-summary">
            <div className="qm-summary-row">
              <span>Amount</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            <div className="qm-summary-row">
              <span>CGST (9%)</span>
              <span>₹{fmt(cgst)}</span>
            </div>
            <div className="qm-summary-row">
              <span>SGST (9%)</span>
              <span>₹{fmt(sgst)}</span>
            </div>
            <div className="qm-summary-row qm-summary-total">
              <span>Total</span>
              <span>₹{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;

import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminAmenities.css";

const ICON_OPTIONS = [
  { key: "wifi",     label: "📶 WiFi" },
  { key: "coffee",   label: "☕ Coffee" },
  { key: "24hr",     label: "⏰ 24/7" },
  { key: "security", label: "🛡️ Security" },
  { key: "parking",  label: "🅿️ Parking" },
  { key: "meeting",  label: "🏢 Meeting" },
  { key: "games",    label: "🎮 Games" },
  { key: "pantry",   label: "🍽️ Pantry" },
  { key: "cleaning", label: "🧹 Cleaning" },
  { key: "support",  label: "💬 Support" },
  { key: "ac",       label: "❄️ AC" },
  { key: "printer",  label: "🖨️ Printer" },
  { key: "cctv",     label: "📹 CCTV" },
  { key: "charging", label: "🔌 Charging" },
];

const ICON_MAP = {
  wifi: "📶", coffee: "☕", "24hr": "⏰", security: "🛡️",
  parking: "🅿️", meeting: "🏢", games: "🎮", pantry: "🍽️",
  cleaning: "🧹", support: "💬", ac: "❄️", printer: "🖨️",
  cctv: "📹", charging: "🔌",
};

function resolveIcon(a) {
  if (a.custom_icon) return a.custom_icon;
  if (a.icon && ICON_MAP[a.icon]) return ICON_MAP[a.icon];
  const key = (a.name || "").toLowerCase();
  if (key.includes("wifi") || key.includes("wi-fi")) return "📶";
  if (key.includes("coffee")) return "☕";
  if (key.includes("24") || key.includes("hour")) return "⏰";
  if (key.includes("security")) return "🛡️";
  if (key.includes("parking")) return "🅿️";
  if (key.includes("meeting")) return "🏢";
  if (key.includes("games")) return "🎮";
  if (key.includes("pantry")) return "🍽️";
  if (key.includes("cleaning")) return "🧹";
  if (key.includes("support")) return "💬";
  return a.icon_display || "🔹";
}

function AdminDashboard() {
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "", custom_icon: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAmenities = () => {
    axiosInstance.get("workspaces/amenities/")
      .then((res) => setAmenities(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => { fetchAmenities(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert("Enter amenity name"); return; }
    try {
      setLoading(true);
      if (editId) {
        await axiosInstance.put(`workspaces/amenities/update/${editId}/`, form);
      } else {
        await axiosInstance.post("workspaces/amenities/add/", form);
      }
      resetForm();
      fetchAmenities();
    } catch (err) {
      console.log(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this amenity?")) return;
    try {
      await axiosInstance.delete(`workspaces/amenities/delete/${id}/`);
      fetchAmenities();
    } catch (err) { console.log(err); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name || "", icon: item.icon || "", custom_icon: item.custom_icon || "" });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({ name: "", icon: "", custom_icon: "" });
    setEditId(null);
  };

  const previewIcon = form.custom_icon || ICON_MAP[form.icon] || (form.name ? "🔹" : null);

  return (
    <div className="ad-shell">

      {/* PAGE HEADER */}
      <div className="ad-page-header">
        <div className="ad-page-header-left">
          <span className="ad-page-icon">⚙️</span>
          <div>
            <h1 className="ad-page-title">Admin Dashboard</h1>
            <p className="ad-page-sub">Manage your platform amenities</p>
          </div>
        </div>
        <div className="ad-stats-row">
          <div className="ad-stat">
            <strong>{amenities.length}</strong>
            <span>Amenities</span>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <section className="ad-section">
        <div className="ad-section-header">
          <span className="ad-section-icon">{editId ? "✏️" : "➕"}</span>
          <div>
            <h2 className="ad-section-title">{editId ? "Edit Amenity" : "Add New Amenity"}</h2>
            <p className="ad-section-sub">{editId ? "Update the amenity details below" : "Fill in the details to add a new amenity"}</p>
          </div>
        </div>

        <div className="ad-form-grid">
          <div className="ad-field">
            <label>Amenity Name *</label>
            <input
              type="text"
              placeholder="e.g. High-speed WiFi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="ad-field">
            <label>Icon Preset</label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value, custom_icon: "" })}
            >
              <option value="">Select icon</option>
              {ICON_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="ad-field">
            <label>Custom Icon <span className="ad-optional">(emoji, optional)</span></label>
            <input
              type="text"
              placeholder="e.g. 🚿"
              value={form.custom_icon}
              onChange={(e) => setForm({ ...form, custom_icon: e.target.value, icon: "" })}
            />
          </div>

          <div className="ad-field">
            <label>Preview</label>
            <div className="ad-preview-pill">
              <span className="ad-preview-emoji">{previewIcon || "—"}</span>
              <span className="ad-preview-text">{form.name || "Amenity name"}</span>
            </div>
          </div>
        </div>

        <div className="ad-form-actions">
          <button className="ad-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : editId ? "Update Amenity" : "Add Amenity"}
          </button>
          {editId && (
            <button className="ad-btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </section>

      {/* LIST SECTION */}
      <section className="ad-section">
        <div className="ad-section-header">
          <span className="ad-section-icon">🏷️</span>
          <div>
            <h2 className="ad-section-title">All Amenities</h2>
            <p className="ad-section-sub">{amenities.length} amenit{amenities.length !== 1 ? "ies" : "y"} configured</p>
          </div>
        </div>

        {amenities.length === 0 ? (
          <div className="ad-empty">
            <span>🔍</span>
            <p>No amenities yet. Add one above!</p>
          </div>
        ) : (
          <>
            {/* TABLE HEADER */}
            <div className="ad-table-head">
              <span>#</span>
              <span>Icon</span>
              <span>Name</span>
              <span>Actions</span>
            </div>

            {/* ROWS */}
            <div className="ad-rows">
              {amenities.map((a, i) => (
                <div key={a.id} className={`ad-row ${editId === a.id ? "ad-row-editing" : ""}`}>
                  <span className="ad-row-num">{i + 1}</span>

                  <span className="ad-row-icon-wrap">
                    <span className="ad-icon-badge">{resolveIcon(a)}</span>
                  </span>

                  <span className="ad-row-name">
                    {a.name}
                    {editId === a.id && <span className="ad-editing-tag">editing</span>}
                  </span>

                  <span className="ad-row-actions">
                    <button className="ad-btn-edit" onClick={() => handleEdit(a)}>Edit</button>
                    <button className="ad-btn-delete" onClick={() => handleDelete(a.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
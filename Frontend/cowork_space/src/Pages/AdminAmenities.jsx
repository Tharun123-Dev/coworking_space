import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminAmenities.css";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ICON_OPTIONS = [
  { key: "wifi",     label: "📶 WiFi" },
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
  wifi: "📶", "24hr": "⏰", security: "🛡️",
  parking: "🅿️", meeting: "🏢", games: "🎮", pantry: "🍽️",
  cleaning: "🧹", support: "💬", ac: "❄️", printer: "🖨️",
  cctv: "📹", charging: "🔌",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
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

function exportCSV(amenities) {
  const rows = [["#", "Icon", "Name"]];
  amenities.forEach((a, i) =>
    rows.push([i + 1, resolveIcon(a), a.name])
  );
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "amenities.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="ad-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`ad-toast ad-toast--${t.type} ad-toast--in`}>
          <span className="ad-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="ad-toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Confirm Modal ──────────────────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="ad-modal-backdrop" onClick={onCancel}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <p className="ad-modal-msg">{message}</p>
        <div className="ad-modal-actions">
          <button className="ad-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ad-btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function AdminDashboard() {
  const [amenities, setAmenities]     = useState([]);
  const [form, setForm]               = useState({ name: "", icon: "", custom_icon: "" });
  const [editId, setEditId]           = useState(null);
  const [loading, setLoading]         = useState(false);

  // Search & sort
  const [search, setSearch]           = useState("");
  const [sortDir, setSortDir]         = useState("none"); // "none" | "asc" | "desc"

  // Bulk select
  const [selected, setSelected]       = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Drag reorder
  const dragItem                      = useRef(null);
  const dragOver                      = useRef(null);

  // Toasts
  const [toasts, setToasts]           = useState([]);
  const toastId                       = useRef(0);

  // Confirm modal
  const [confirm, setConfirm]         = useState(null); // { message, onConfirm }

  /* ── Toast helper ───────────────────────────────────────────────────────── */
  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  /* ── Confirm helper ─────────────────────────────────────────────────────── */
  const askConfirm = (message) =>
    new Promise((resolve) =>
      setConfirm({
        message,
        onConfirm: () => { setConfirm(null); resolve(true); },
        onCancel:  () => { setConfirm(null); resolve(false); },
      })
    );

  /* ── Fetch ──────────────────────────────────────────────────────────────── */
  const fetchAmenities = useCallback(() => {
    axiosInstance.get("workspaces/amenities/")
      .then((res) => setAmenities(res.data))
      .catch((err) => { console.log(err); addToast("Failed to load amenities", "error"); });
  }, [addToast]);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  /* ── Filtered + sorted list ─────────────────────────────────────────────── */
  const displayed = (() => {
    let list = amenities.filter((a) =>
      (a.name || "").toLowerCase().includes(search.toLowerCase())
    );
    if (sortDir === "asc")  list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortDir === "desc") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  })();

  /* ── Submit (add / edit) ────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!form.name.trim()) { addToast("Enter amenity name", "error"); return; }

    const normalizedName = form.name.trim().toLowerCase();
    const alreadyExists  = amenities.some(
      (a) => a.name?.trim().toLowerCase() === normalizedName && a.id !== editId
    );
    if (alreadyExists) {
      addToast("Amenity already exists", "error"); return;
    }

    try {
      setLoading(true);
      if (editId) {
        await axiosInstance.put(`workspaces/amenities/update/${editId}/`, form);
        addToast("Amenity updated successfully ✨");
      } else {
        await axiosInstance.post("workspaces/amenities/add/", form);
        addToast("Amenity added successfully 🎉");
      }
      resetForm();
      fetchAmenities();
    } catch (err) {
      console.log(err);
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Something went wrong.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Delete single ──────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const ok = await askConfirm("Delete this amenity?");
    if (!ok) return;
    try {
      await axiosInstance.delete(`workspaces/amenities/delete/${id}/`);
      addToast("Amenity deleted");
      fetchAmenities();
    } catch (err) { console.log(err); addToast("Delete failed", "error"); }
  };

  /* ── Edit ───────────────────────────────────────────────────────────────── */
  const handleEdit = (item) => {
    setForm({ name: item.name || "", icon: item.icon || "", custom_icon: item.custom_icon || "" });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Reset ──────────────────────────────────────────────────────────────── */
  const resetForm = () => {
    setForm({ name: "", icon: "", custom_icon: "" });
    setEditId(null);
  };

  /* ── Duplicate ──────────────────────────────────────────────────────────── */
  const handleDuplicate = async (item) => {
    const newName = `${item.name} (Copy)`;
    const alreadyExists = amenities.some((a) => a.name?.toLowerCase() === newName.toLowerCase());
    if (alreadyExists) { addToast("Duplicate name already exists", "error"); return; }
    try {
      await axiosInstance.post("workspaces/amenities/add/", {
        name: newName, icon: item.icon || "", custom_icon: item.custom_icon || "",
      });
      addToast("Amenity duplicated 📋");
      fetchAmenities();
    } catch (err) { console.log(err); addToast("Duplicate failed", "error"); }
  };

  /* ── Bulk select ────────────────────────────────────────────────────────── */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === displayed.length && displayed.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayed.map((a) => a.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await askConfirm(`Delete ${selected.size} selected amenit${selected.size > 1 ? "ies" : "y"}?`);
    if (!ok) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map((id) =>
        axiosInstance.delete(`workspaces/amenities/delete/${id}/`)
      ));
      addToast(`${selected.size} amenit${selected.size > 1 ? "ies" : "y"} deleted`);
      setSelected(new Set());
      fetchAmenities();
    } catch (err) { console.log(err); addToast("Bulk delete failed", "error"); }
    finally { setBulkLoading(false); }
  };

  /* ── Drag-and-drop reorder (local only) ─────────────────────────────────── */
  const handleDragStart = (index) => { dragItem.current = index; };
  const handleDragEnter = (index) => { dragOver.current = index; };
  const handleDragEnd   = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) return;

    // Work on search-filtered list indices mapped back to amenities
    const reordered = [...amenities];
    const fromIdx = amenities.indexOf(displayed[dragItem.current]);
    const toIdx   = amenities.indexOf(displayed[dragOver.current]);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setAmenities(reordered);
    dragItem.current  = null;
    dragOver.current  = null;
    addToast("Order updated locally 🔀", "info");
  };

  /* ── Sort cycle ─────────────────────────────────────────────────────────── */
  const cycleSortDir = () =>
    setSortDir((d) => d === "none" ? "asc" : d === "asc" ? "desc" : "none");

  const sortLabel = sortDir === "asc" ? "A→Z" : sortDir === "desc" ? "Z→A" : "Sort";

  /* ── Preview icon ───────────────────────────────────────────────────────── */
  const previewIcon = form.custom_icon || ICON_MAP[form.icon] || (form.name ? "🔹" : null);

  const allSelected = displayed.length > 0 && selected.size === displayed.length;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="ad-shell">
      <ToastContainer toasts={toasts} />
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}

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
            <span>Total</span>
          </div>
          <div className="ad-stat">
            <strong>{displayed.length}</strong>
            <span>Visible</span>
          </div>
          {selected.size > 0 && (
            <div className="ad-stat ad-stat--selected">
              <strong>{selected.size}</strong>
              <span>Selected</span>
            </div>
          )}
        </div>
      </div>

      {/* ── FORM SECTION ───────────────────────────────────────────────────── */}
      <section className="ad-section">
        <div className="ad-section-header">
          <span className="ad-section-icon">{editId ? "✏️" : "➕"}</span>
          <div>
            <h2 className="ad-section-title">{editId ? "Edit Amenity" : "Add New Amenity"}</h2>
            <p className="ad-section-sub">
              {editId ? "Update the amenity details below" : "Fill in the details to add a new amenity"}
            </p>
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

      {/* ── LIST SECTION ───────────────────────────────────────────────────── */}
      <section className="ad-section">
        <div className="ad-section-header">
          <span className="ad-section-icon">🏷️</span>
          <div>
            <h2 className="ad-section-title">All Amenities</h2>
            <p className="ad-section-sub">
              {amenities.length} amenit{amenities.length !== 1 ? "ies" : "y"} configured
            </p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="ad-toolbar">
          <div className="ad-search-wrap">
            <span className="ad-search-icon">🔍</span>
            <input
              className="ad-search"
              type="text"
              placeholder="Search amenities…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(new Set()); }}
            />
            {search && (
              <button className="ad-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="ad-toolbar-right">
            <button
              className={`ad-btn-tool ${sortDir !== "none" ? "ad-btn-tool--active" : ""}`}
              onClick={cycleSortDir}
              title="Toggle sort A→Z / Z→A"
            >
              {sortDir === "asc" ? "🔤 A→Z" : sortDir === "desc" ? "🔤 Z→A" : "🔤 Sort"}
            </button>

            <button
              className="ad-btn-tool"
              onClick={() => exportCSV(displayed)}
              title="Export visible list as CSV"
            >
              📥 Export
            </button>

            {selected.size > 0 && (
              <button
                className="ad-btn-danger-sm"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
              >
                {bulkLoading ? "Deleting…" : `🗑️ Delete (${selected.size})`}
              </button>
            )}
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="ad-empty">
            <span>{search ? "🔍" : "📭"}</span>
            <p>{search ? `No results for "${search}"` : "No amenities yet. Add one above!"}</p>
          </div>
        ) : (
          <>
            {/* TABLE HEADER */}
            <div className="ad-table-head">
              <span>
                <input
                  type="checkbox"
                  className="ad-checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  title="Select all"
                />
              </span>
              <span>#</span>
              <span>Icon</span>
              <span>Name</span>
              <span className="ad-th-actions">Actions</span>
            </div>

            {/* ROWS */}
            <div className="ad-rows">
              {displayed.map((a, i) => (
                <div
                  key={a.id}
                  className={`ad-row
                    ${editId === a.id ? "ad-row-editing" : ""}
                    ${selected.has(a.id) ? "ad-row-selected" : ""}
                  `}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <span className="ad-row-check">
                    <input
                      type="checkbox"
                      className="ad-checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                  </span>

                  <span className="ad-row-num">{i + 1}</span>

                  <span className="ad-row-icon-wrap">
                    <span className="ad-icon-badge">{resolveIcon(a)}</span>
                  </span>

                  <span className="ad-row-name">
                    <span className="ad-drag-handle" title="Drag to reorder">⠿</span>
                    {a.name}
                    {editId === a.id && <span className="ad-editing-tag">editing</span>}
                  </span>

                  <span className="ad-row-actions">
                    <button className="ad-btn-edit"      onClick={() => handleEdit(a)}      title="Edit">✏️</button>
                    <button className="ad-btn-dupe"      onClick={() => handleDuplicate(a)} title="Duplicate">📋</button>
                    <button className="ad-btn-delete"    onClick={() => handleDelete(a.id)} title="Delete">🗑️</button>
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

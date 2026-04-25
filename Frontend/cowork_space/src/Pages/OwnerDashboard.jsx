import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";
import { useNavigate } from "react-router-dom";
import R from "../Pages/Reveal";

const WORKSPACE_TYPES = [
  "Hot Desk",
  "Dedicated Desk",
  "Private Office Space",
  "Private Cabin",
  "Meeting Room",
  "Board Room",
  "Event Space",
  "Podcast",
  "Virtual Office",
];

const CITY_OPTIONS = [
  "Hitech City",
  "Madhapur",
  "Gachibowli",
  "Kondapur",
  "Financial District",
];

function OwnerDashboard() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  const [revenue, setRevenue] = useState({
    total_revenue: 0,
    confirmed_revenue: 0,
    pending_revenue: 0,
    cancelled_count: 0,
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    price: "",
    image: "",
    description: "",
    is_available: true,
  });

  const [editId, setEditId] = useState(null);
  const hasBookings = true;
  const hasCustomers = true;
  const hasOwnerLeads = true;
  const hasCompanyLeads = true;

  const [slotForm, setSlotForm] = useState({
    workspace_id: "",
    date: "",
    slot_type: "hour",
    start_time: 9,
    end_time: 18,
    interval: 1,
    capacity: 50,
    price: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    hourly_price: "",
    daily_price: "",
    monthly_price: "",
    is_available: true,
  });

  const [slots, setSlots] = useState([]);
  const [editSlotId, setEditSlotId] = useState(null);

  const fetchSlots = () => {
    axiosInstance
      .get("workspaces/slots/owner/")
      .then((res) => setSlots(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchCategories();
    fetchRevenue();
    fetchSlots();
  }, []);

  const fetchWorkspaces = () => {
    axiosInstance
      .get("workspaces/?owner=true")
      .then((res) => setWorkspaces(res.data))
      .catch((err) => console.error("Failed to fetch workspaces:", err));
  };

  const fetchCategories = () => {
    axiosInstance
      .get("workspaces/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  };

  const fetchRevenue = () => {
    axiosInstance
      .get("cart/owner/revenue/")
      .then((res) => setRevenue(res.data))
      .catch((err) => console.error("Failed to fetch revenue:", err));
  };

  const toggleAvailability = (id) => {
    axiosInstance
      .put(`workspaces/toggle/${id}/`)
      .then(() => fetchWorkspaces())
      .catch((err) => {
        console.error("Toggle failed:", err);
        alert("Toggle failed");
      });
  };

  const resetWorkspaceForm = () => {
    setForm({
      name: "",
      city: "",
      location: "",
      price: "",
      image: "",
      description: "",
      is_available: true,
    });
    setEditId(null);
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) {
      alert("Please fill all required fields (Name, City, Price)");
      return;
    }
    const submitData = { ...form };
    if (editId) {
      axiosInstance
        .put(`workspaces/update/${editId}/`, submitData)
        .then(() => {
          alert("Workspace Updated ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
        })
        .catch((err) => {
          console.error("Update failed:", err);
          alert("Update failed");
        });
    } else {
      axiosInstance
        .post("workspaces/add/", submitData)
        .then(() => {
          alert("Workspace Added ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
        })
        .catch((err) => {
          console.error("Add failed:", err);
          alert("Add failed");
        });
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      city: item.city,
      location: item.location || "",
      price: item.price,
      image: item.image || "",
      description: item.description || "",
      is_available: item.is_available,
    });
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      axiosInstance
        .delete(`workspaces/delete/${id}/`)
        .then(() => fetchWorkspaces())
        .catch((err) => {
          console.error("Delete failed:", err);
          alert("Delete failed");
        });
    }
  };

  const createSlot = () => {
    if (!slotForm.workspace_id || !slotForm.date || !slotForm.price) {
      alert("Fill all fields");
      return;
    }
    if (editSlotId) {
      axiosInstance
        .put(`workspaces/slot/update/${editSlotId}/`, slotForm)
        .then(() => {
          alert("Slot Updated ✅");
          setEditSlotId(null);
          fetchSlots();
        });
    } else {
      axiosInstance
        .post("workspaces/slot/create/", slotForm)
        .then(() => {
          alert("Slot Created ✅");
          fetchSlots();
        });
    }
  };

  const handleEditSlot = (s) => {
    setSlotForm({
      workspace_id: s.workspace_id,
      date: s.date,
      slot_type: s.slot_type,
      start_hour: s.start_hour || 9,
      end_hour: s.end_hour || 18,
      capacity: s.capacity,
      price: s.price,
    });
    setEditSlotId(s.id);
  };

  const deleteSlot = (id) => {
    if (!window.confirm("Delete slot?")) return;
    axiosInstance
      .delete(`workspaces/slot/delete/${id}/`)
      .then(() => {
        alert("Deleted ✅");
        fetchSlots();
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.eyebrow}>Workspace Owner System</p>
          <h1 className={styles.pageTitle}>
            Owner <span>Panel</span>
          </h1>
          <p className={styles.pageText}>
            Manage your workspace records and categories in one central place.
          </p>
        </div>

        <div className={styles.topStats}>
          <div className={styles.topStat}>
            <strong>₹{revenue.total_revenue?.toLocaleString()}</strong>
            <span>Total Revenue</span>
          </div>
          <div className={styles.topStat}>
            <strong>₹{revenue.confirmed_revenue?.toLocaleString()}</strong>
            <span>Confirmed</span>
          </div>
          <div className={styles.topStat}>
            <strong>₹{revenue.pending_revenue?.toLocaleString()}</strong>
            <span>Pending</span>
          </div>
          <div className={styles.topStat}>
            <strong>{revenue.cancelled_count}</strong>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      <div className={styles.btnWrapper}>
        <button
          className={`${styles.btnBox} ${styles.goldBtn} ${
            activeSection === "bookings" ? styles.activeBtn : ""
          }`}
          disabled={activeSection !== null && activeSection !== "bookings"}
          onClick={() => {
            setActiveSection("bookings");
            navigate("/owner-bookings");
          }}
        >
          📋 My Bookings
        </button>

        <button
          className={`${styles.btnBox} ${styles.blueBtn} ${
            activeSection === "ownerLeads" ? styles.activeBtn : ""
          }`}
          disabled={activeSection !== null && activeSection !== "ownerLeads"}
          onClick={() => {
            setActiveSection("ownerLeads");
            navigate("/owner-leads");
          }}
        >
          📌 Owner Leads
        </button>

        <button
          className={`${styles.btnBox} ${styles.blueBtn} ${
            activeSection === "companyLeads" ? styles.activeBtn : ""
          }`}
          disabled={activeSection !== null && activeSection !== "companyLeads"}
          onClick={() => {
            setActiveSection("companyLeads");
            navigate("/company-leads");
          }}
        >
          📌 Company Leads
        </button>
      </div>

      {/* ── Workspace Management ── */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🏢</div>
          <div>
            <h2>Workspace Management</h2>
            <p>Add, edit, and manage your workspace listings.</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.form}>

            <div className={styles.formRow}>
              {/* ── Workspace Type dropdown ── */}
              <div className={styles.selectWrap}>
                <label className={styles.selectLabel}>Workspace Type *</label>
                <select
                  className={styles.selectField}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                >
                  <option value="">Select Workspace Type</option>
                  {WORKSPACE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── City dropdown ── */}
              <div className={styles.selectWrap}>
                <label className={styles.selectLabel}>City *</label>
                <select
                  className={styles.selectField}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option value="">Select City</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <input
                placeholder="Location / Address"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <input
                placeholder="Price (₹) *"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <textarea
              placeholder="Description"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={styles.textarea}
            />

            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />

            <div className={styles.formActions}>
              <button onClick={handleSubmit} className={styles.submitBtn}>
                {editId ? "Update Workspace" : "Add Workspace"}
              </button>
              {editId && (
                <button onClick={resetWorkspaceForm} className={styles.cancelBtn}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Location</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.city}</td>
                  <td>{w.location || "-"}</td>
                  <td>₹{parseFloat(w.price).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button onClick={() => handleEdit(w)} className={styles.editBtn}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(w.id)} className={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workspaces.length === 0 && (
            <div className={styles.emptyState}>
              <p>No workspaces found. Add your first workspace above!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Slot Management ── */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>⏰</div>
          <div>
            <h2>Slot Management</h2>
            <p>Create hourly or full-day slots</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.form}>
            <select
              className={styles.selectField}
              value={slotForm.workspace_id}
              onChange={(e) => setSlotForm({ ...slotForm, workspace_id: e.target.value })}
            >
              <option value="">Select Workspace</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.city}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={slotForm.date}
              onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
            />

            <select
              className={styles.selectField}
              value={slotForm.slot_type}
              onChange={(e) => setSlotForm({ ...slotForm, slot_type: e.target.value })}
            >
              <option value="hour">Hourly</option>
              <option value="day">Full Day</option>
            </select>

            {slotForm.slot_type === "hour" && (
              <div className={styles.formRow}>
                <input
                  type="number"
                  placeholder="Start Hour (9)"
                  value={slotForm.start_hour}
                  onChange={(e) => setSlotForm({ ...slotForm, start_hour: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="End Hour (18)"
                  value={slotForm.end_hour}
                  onChange={(e) => setSlotForm({ ...slotForm, end_hour: e.target.value })}
                />
              </div>
            )}

            <input
              type="number"
              placeholder="Capacity"
              value={slotForm.capacity}
              onChange={(e) => setSlotForm({ ...slotForm, capacity: e.target.value })}
            />

            <input
              type="number"
              placeholder="Price ₹"
              value={slotForm.price}
              onChange={(e) => setSlotForm({ ...slotForm, price: e.target.value })}
            />

            <button className={styles.submitBtn} onClick={createSlot}>
              {editSlotId ? "Update Slot" : "Create Slots"}
            </button>
          </div>
        </div>
      </section>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Date</th>
              <th>Type</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <td>{s.workspace_name}</td>
                <td>{s.date}</td>
                <td>{s.slot_type === "hour" ? "Hourly" : "Full Day"}</td>
                <td>{s.slot_type === "hour" ? `${s.start_time} - ${s.end_time}` : "Full Day"}</td>
                <td>{s.capacity}</td>
                <td>₹{s.price}</td>
                <td>
                  <button onClick={() => handleEditSlot(s)} className={styles.editBtn}>Edit</button>
                  <button onClick={() => deleteSlot(s.id)} className={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OwnerDashboard;

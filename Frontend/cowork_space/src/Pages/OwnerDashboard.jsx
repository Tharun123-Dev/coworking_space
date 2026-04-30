import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";
import { useNavigate } from "react-router-dom";

const AMENITY_ICONS = {
  wifi: "📶",
  coffee: "☕",
  "24hr": "⏰",
  security: "🛡️",
  parking: "🅿️",
  meeting: "🏢",
  games: "🎮",
  pantry: "🍽️",
  cleaning: "🧹",
  support: "💬",
};

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

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const NAV_ITEMS = [
  { key: "overview", icon: "⊞", label: "Overview" },
  { key: "workspaces", icon: "🏢", label: "Workspaces" },

  { key: "slots", icon: "⏰", label: "Slot Management" },
  { key: "monthlySlots", icon: "📅", label: "Monthly Slots" },
  { key: "bookings", icon: "📋", label: "My Bookings", route: "/owner-bookings" },
  { key: "ownerLeads", icon: "📌", label: "Owner Leads", route: "/owner-leads" },
  { key: "companyLeads", icon: "🏷️", label: "Company Leads", route: "/company-leads" },
    { key: "suggestedWorkspaces", icon: "🧭", label: "Suggested Workspaces" },
];

function OwnerDashboard() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [slots, setSlots] = useState([]);
  const [monthlySlots, setMonthlySlots] = useState([]);
  const [editMonthId, setEditMonthId] = useState(null);

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [revenue, setRevenue] = useState({
    total_revenue: 0,
    confirmed_revenue: 0,
    pending_revenue: 0,
    cancelled_count: 0,
  });

  const [monthlyForm, setMonthlyForm] = useState({
    workspace_id: "",
    year: new Date().getFullYear(),
    months: [],
    capacity: 50,
    price: "",
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    price: "",
    image: "",
    description: "",
    amenities: [],
  });

  const [editId, setEditId] = useState(null);

  const [slotForm, setSlotForm] = useState({
    workspace_id: "",
    date: "",
    slot_type: "hour",
    start_time: 9,
    end_time: 18,
    capacity: 50,
    price: "",
  });

  const [editSlotId, setEditSlotId] = useState(null);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [suggestSearch, setSuggestSearch] = useState("");

  const fetchAmenities = () =>
    axiosInstance
      .get("workspaces/amenities/")
      .then((res) => setAmenitiesList(res.data))
      .catch((err) => console.error("Amenities fetch error:", err));

  const fetchWorkspaces = () =>
    axiosInstance
      .get("workspaces/?owner=true")
      .then((res) => setWorkspaces(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Workspace fetch error:", err));

  const fetchAllWorkspaces = () =>
    axiosInstance
      .get("workspaces/")
      .then((res) => setAllWorkspaces(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("All workspaces fetch error:", err));

  const fetchRevenue = () =>
    axiosInstance
      .get("cart/owner/revenue/")
      .then((res) => setRevenue(res.data))
      .catch((err) => console.error("Revenue fetch error:", err));

  const fetchSlots = () =>
    axiosInstance
      .get("workspaces/slots/owner/")
      .then((res) => setSlots(res.data))
      .catch((err) => console.error("Slot fetch error:", err));

  const fetchMonthlySlots = () =>
    axiosInstance
      .get("workspaces/monthly-slots/")
      .then((res) => setMonthlySlots(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Monthly slots fetch error:", err));

  useEffect(() => {
    fetchWorkspaces();
    fetchAllWorkspaces();
    fetchRevenue();
    fetchSlots();
    fetchAmenities();
    fetchMonthlySlots();
  }, []);

  const resetWorkspaceForm = () => {
    setForm({
      name: "",
      city: "",
      location: "",
      price: "",
      image: "",
      description: "",
      amenities: [],
    });
    setEditId(null);
  };

  const resetMonthlyForm = () => {
    setMonthlyForm({
      workspace_id: "",
      year: new Date().getFullYear(),
      months: [],
      capacity: 50,
      price: "",
    });
    setEditMonthId(null);
  };

  const getAmenityLabel = (amenity) => {
    if (typeof amenity === "object" && amenity !== null) {
      return amenity.name || "Amenity";
    }
    const found = amenitiesList.find((a) => a.id === Number(amenity));
    return found ? found.name : "Amenity";
  };

  const getAmenityIcon = (amenity) => {
    const label =
      typeof amenity === "object" && amenity !== null
        ? amenity.name
        : getAmenityLabel(amenity);

    const key = String(label || "").toLowerCase().trim();

    if (key.includes("wifi") || key.includes("wi-fi")) return AMENITY_ICONS.wifi;
    if (key.includes("coffee")) return AMENITY_ICONS.coffee;
    if (key.includes("24") || key.includes("hour")) return AMENITY_ICONS["24hr"];
    if (key.includes("security")) return AMENITY_ICONS.security;
    if (key.includes("parking")) return AMENITY_ICONS.parking;
    if (key.includes("meeting")) return AMENITY_ICONS.meeting;
    if (key.includes("games")) return AMENITY_ICONS.games;
    if (key.includes("pantry")) return AMENITY_ICONS.pantry;
    if (key.includes("cleaning")) return AMENITY_ICONS.cleaning;
    if (key.includes("support")) return AMENITY_ICONS.support;

    return "🔹";
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) {
      alert("Please fill required fields (Name, City, Price)");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      amenities: form.amenities.map(Number),
    };

    if (editId) {
      axiosInstance
        .put(`workspaces/update/${editId}/`, payload)
        .then(() => {
          alert("Workspace Updated ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
          fetchAllWorkspaces();
        })
        .catch((err) => {
          console.error(err?.response?.data || err);
          alert("Update failed");
        });
    } else {
      axiosInstance
        .post("workspaces/add/", payload)
        .then(() => {
          alert("Workspace Added ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
          fetchAllWorkspaces();
        })
        .catch((err) => {
          console.error(err?.response?.data || err);
          alert("Add failed");
        });
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      city: item.city || "",
      location: item.location || "",
      price: item.price || "",
      image: item.image || "",
      description: item.description || "",
      amenities: Array.isArray(item.amenities)
        ? item.amenities.map((a) => (typeof a === "object" ? a.id : a))
        : [],
    });

    setEditId(item.id);
    setActiveSection("workspaces");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this workspace?")) return;

    axiosInstance
      .delete(`workspaces/delete/${id}/`)
      .then(() => {
        fetchWorkspaces();
        fetchAllWorkspaces();
      })
      .catch((err) => {
        console.error(err?.response?.data || err);
        alert("Delete failed");
      });
  };

  const resetSlotForm = () => {
    setSlotForm({
      workspace_id: "",
      date: "",
      slot_type: "hour",
      start_time: 9,
      end_time: 18,
      capacity: 50,
      price: "",
    });
    setEditSlotId(null);
  };

  const createSlot = () => {
    if (!slotForm.workspace_id || !slotForm.date || !slotForm.price) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      ...slotForm,
      workspace_id: Number(slotForm.workspace_id),
      start_time:
        slotForm.slot_type === "hour" ? Number(slotForm.start_time) : null,
      end_time:
        slotForm.slot_type === "hour" ? Number(slotForm.end_time) : null,
      capacity: Number(slotForm.capacity),
      price: Number(slotForm.price),
    };

    if (editSlotId) {
      axiosInstance
        .put(`workspaces/slot/update/${editSlotId}/`, payload)
        .then(() => {
          alert("Slot Updated ✅");
          resetSlotForm();
          fetchSlots();
        })
        .catch((err) => {
          console.error(err?.response?.data || err);
          alert("Slot update failed");
        });
    } else {
      axiosInstance
        .post("workspaces/slot/create/", payload)
        .then(() => {
          alert("Slot Created ✅");
          resetSlotForm();
          fetchSlots();
        })
        .catch((err) => {
          console.error(err?.response?.data || err);
          alert("Slot create failed");
        });
    }
  };

  const createMonthlySlots = () => {
    if (
      !monthlyForm.workspace_id ||
      !monthlyForm.year ||
      monthlyForm.months.length === 0 ||
      !monthlyForm.capacity ||
      !monthlyForm.price
    ) {
      alert("Please fill all monthly slot fields");
      return;
    }

    const payload = {
      workspace_id: Number(monthlyForm.workspace_id),
      year: Number(monthlyForm.year),
      months: monthlyForm.months.map(Number),
      capacity: Number(monthlyForm.capacity),
      price: Number(monthlyForm.price),
    };

    axiosInstance
      .post("workspaces/month-slots/create/", payload)
      .then(() => {
        alert("Monthly slots created ✅");
        resetMonthlyForm();
        fetchMonthlySlots();
      })
      .catch((err) => {
        console.error(err?.response?.data || err);
        alert("Error creating monthly slots");
      });
  };

  const handleEditSlot = (s) => {
    setSlotForm({
      workspace_id: s.workspace_id || "",
      date: s.date || "",
      slot_type: s.slot_type || "hour",
      start_time: s.start_time || 9,
      end_time: s.end_time || 18,
      capacity: s.capacity || 50,
      price: s.price || "",
    });
    setEditSlotId(s.id);
    setActiveSection("slots");
  };

  const deleteSlot = (id) => {
    if (!window.confirm("Delete slot?")) return;

    axiosInstance
      .delete(`workspaces/slot/delete/${id}/`)
      .then(() => {
        alert("Deleted ✅");
        fetchSlots();
      })
      .catch((err) => {
        console.error(err?.response?.data || err);
        alert("Delete slot failed");
      });
  };

  const handleEditMonth = (slot) => {
    setMonthlyForm({
      workspace_id: String(slot.workspace_id || ""),
      year: slot.year || new Date().getFullYear(),
      months: [String(slot.month)],
      capacity: slot.capacity || 50,
      price: slot.price || "",
    });

    setEditMonthId(slot.id);
    setActiveSection("monthlySlots");
  };

  const updateMonthlySlot = () => {
    if (!editMonthId) return;

    axiosInstance
      .put(`workspaces/monthly-slot/update/${editMonthId}/`, {
        capacity: Number(monthlyForm.capacity),
        price: Number(monthlyForm.price),
      })
      .then(() => {
        alert("Updated ✅");
        resetMonthlyForm();
        fetchMonthlySlots();
      })
      .catch((err) => {
        console.error(err?.response?.data || err);
        alert("Update failed");
      });
  };

  const deleteMonthlySlot = (id) => {
    if (!window.confirm("Delete this monthly slot?")) return;

    axiosInstance
      .delete(`workspaces/monthly-slot/delete/${id}/`)
      .then(() => {
        alert("Deleted ✅");
        fetchMonthlySlots();
      })
      .catch((err) => {
        console.error(err?.response?.data || err);
        alert("Delete failed");
      });
  };

  const handleNav = (item) => {
    if (item.route) {
      navigate(item.route);
      return;
    }
    setActiveSection(item.key);
  };

  const myWorkspaceIds = useMemo(
    () => new Set(workspaces.map((w) => w.id)),
    [workspaces]
  );

  const suggestedWorkspaces = useMemo(() => {
    return allWorkspaces.filter((w) => !myWorkspaceIds.has(w.id));
  }, [allWorkspaces, myWorkspaceIds]);

  const filteredMyWorkspaces = useMemo(() => {
    const q = workspaceSearch.toLowerCase().trim();
    if (!q) return workspaces;
    return workspaces.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.city?.toLowerCase().includes(q) ||
        w.location?.toLowerCase().includes(q)
    );
  }, [workspaces, workspaceSearch]);

  const filteredSuggestedWorkspaces = useMemo(() => {
    const q = suggestSearch.toLowerCase().trim();
    if (!q) return suggestedWorkspaces;
    return suggestedWorkspaces.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.city?.toLowerCase().includes(q) ||
        w.location?.toLowerCase().includes(q)
    );
  }, [suggestedWorkspaces, suggestSearch]);

  const renderOverview = () => (
    <div className={styles.overviewGrid}>
      <div className={`${styles.statCard} ${styles.gold}`}>
        <span className={styles.statIcon}>💰</span>
        <div>
          <p className={styles.statValue}>
            ₹{revenue.total_revenue?.toLocaleString()}
          </p>
          <p className={styles.statLabel}>Total Revenue</p>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.green}`}>
        <span className={styles.statIcon}>✅</span>
        <div>
          <p className={styles.statValue}>
            ₹{revenue.confirmed_revenue?.toLocaleString()}
          </p>
          <p className={styles.statLabel}>Confirmed</p>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.amber}`}>
        <span className={styles.statIcon}>⏳</span>
        <div>
          <p className={styles.statValue}>
            ₹{revenue.pending_revenue?.toLocaleString()}
          </p>
          <p className={styles.statLabel}>Pending</p>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.red}`}>
        <span className={styles.statIcon}>❌</span>
        <div>
          <p className={styles.statValue}>{revenue.cancelled_count}</p>
          <p className={styles.statLabel}>Cancelled</p>
        </div>
      </div>

      <div className={styles.overviewInfo}>
        <h3>Quick Summary</h3>
        <p>
          {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} listed
        </p>
        <p>
          {slots.length} slot{slots.length !== 1 ? "s" : ""} created
        </p>
        <p>
          {monthlySlots.length} monthly slot
          {monthlySlots.length !== 1 ? "s" : ""} created
        </p>
        <p>
          {suggestedWorkspaces.length} suggestion workspace
          {suggestedWorkspaces.length !== 1 ? "s" : ""} available
        </p>
      </div>
    </div>
  );

  const renderWorkspaces = () => (
    <div className={styles.sectionBody}>
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>
          {editId ? "✏️ Edit Workspace" : "➕ Add Workspace"}
        </h3>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label>Workspace Type *</label>
            <select
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            >
              <option value="">Select Type</option>
              {WORKSPACE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>City *</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="">Select City</option>
              {CITY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Location / Address</label>
            <input
              placeholder="Enter address"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Price (₹) *</label>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Description</label>
            <textarea
              rows="3"
              placeholder="Describe this workspace…"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Select Amenities</label>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              {amenitiesList.length === 0 ? (
                <p>No amenities found</p>
              ) : (
                amenitiesList.map((a) => (
                  <label
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      border: "1px solid #ccc",
                      borderRadius: "20px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={a.id}
                      checked={form.amenities.includes(a.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            amenities: [...form.amenities, a.id],
                          });
                        } else {
                          setForm({
                            ...form,
                            amenities: form.amenities.filter((id) => id !== a.id),
                          });
                        }
                      }}
                    />
                    {a.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label>Image URL</label>
            <input
              placeholder="https://…"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            {editId ? "Update Workspace" : "Add Workspace"}
          </button>
          {editId && (
            <button className={styles.cancelBtn} onClick={resetWorkspaceForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableTopBar}>
        <input
          className={styles.searchInput}
          placeholder="Search my workspaces..."
          value={workspaceSearch}
          onChange={(e) => setWorkspaceSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>City</th>
              <th>Location</th>
              <th>Price</th>
              <th>Amenities</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredMyWorkspaces.map((w, i) => (
              <tr key={w.id}>
                <td>{i + 1}</td>
                <td>
                  <strong>{w.name}</strong>
                </td>
                <td>{w.city}</td>
                <td>{w.location || "—"}</td>
                <td className={styles.priceCell}>
                  ₹{parseFloat(w.price || 0).toLocaleString()}
                </td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      maxWidth: "280px",
                    }}
                  >
                    {Array.isArray(w.amenities) && w.amenities.length > 0 ? (
                      w.amenities.map((amenity, idx) => (
                        <span
                          key={
                            typeof amenity === "object"
                              ? amenity.id || idx
                              : idx
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            background: "#f5f7fb",
                            border: "1px solid #dbe2ea",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#243447",
                          }}
                        >
                          <span>{getAmenityIcon(amenity)}</span>
                          <span>{getAmenityLabel(amenity)}</span>
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#999" }}>No amenities</span>
                    )}
                  </div>
                </td>

                <td>
                  <button
                    onClick={() => handleEdit(w)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMyWorkspaces.length === 0 && (
          <div className={styles.empty}>No workspaces yet. Add one above!</div>
        )}
      </div>
    </div>
  );

  const renderSuggestedWorkspaces = () => (
    <div className={styles.sectionBody}>
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>Suggested Workspaces</h3>
        <p style={{ marginTop: "-4px", color: "#667085", marginBottom: "14px" }}>
          View workspaces added by other owners. This is only for reference view.
          Your slot management stays only for your own workspaces.
        </p>

        <div className={styles.tableTopBar}>
          <input
            className={styles.searchInput}
            placeholder="Search suggested workspaces..."
            value={suggestSearch}
            onChange={(e) => setSuggestSearch(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {filteredSuggestedWorkspaces.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#fff",
                border: "1px solid #e6eaf0",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  height: "160px",
                  background: "#eef2f7",
                  overflow: "hidden",
                }}
              >
                {w.image ? (
                  <img
                    src={w.image}
                    alt={w.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "40px",
                    }}
                  >
                    🏢
                  </div>
                )}
              </div>

              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
                    {w.name}
                  </h4>
                </div>

                <p style={{ margin: "0 0 6px", color: "#475467", fontWeight: 600 }}>
                  {w.city}
                </p>
                <p style={{ margin: "0 0 10px", color: "#667085", fontSize: "14px" }}>
                  {w.location || "No location provided"}
                </p>
                <p style={{ margin: "0 0 12px", color: "#111827", fontWeight: 700, fontSize: "15px" }}>
                  ₹{parseFloat(w.price || 0).toLocaleString()}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {Array.isArray(w.amenities) && w.amenities.length > 0 ? (
                    w.amenities.slice(0, 4).map((amenity, idx) => (
                      <span
                        key={typeof amenity === "object" ? amenity.id || idx : idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 10px",
                          background: "#f5f7fb",
                          border: "1px solid #dbe2ea",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#243447",
                        }}
                      >
                        <span>{getAmenityIcon(amenity)}</span>
                        <span>{getAmenityLabel(amenity)}</span>
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#999" }}>No amenities</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>City</th>
              <th>Location</th>
              <th>Price</th>
              <th>Amenities</th>
            </tr>
          </thead>

          <tbody>
            {filteredSuggestedWorkspaces.map((w, i) => (
              <tr key={w.id}>
                <td>{i + 1}</td>
                <td>
                  <strong>{w.name}</strong>
                </td>
                <td>{w.city}</td>
                <td>{w.location || "—"}</td>
                <td className={styles.priceCell}>
                  ₹{parseFloat(w.price || 0).toLocaleString()}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      maxWidth: "280px",
                    }}
                  >
                    {Array.isArray(w.amenities) && w.amenities.length > 0 ? (
                      w.amenities.map((amenity, idx) => (
                        <span
                          key={
                            typeof amenity === "object"
                              ? amenity.id || idx
                              : idx
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            background: "#f5f7fb",
                            border: "1px solid #dbe2ea",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#243447",
                          }}
                        >
                          <span>{getAmenityIcon(amenity)}</span>
                          <span>{getAmenityLabel(amenity)}</span>
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#999" }}>No amenities</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSuggestedWorkspaces.length === 0 && (
          <div className={styles.empty}>
            No suggested workspaces available from other owners.
          </div>
        )}
      </div>
    </div>
  );

  const renderSlots = () => (
    <div className={styles.sectionBody}>
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>
          {editSlotId ? "✏️ Edit Slot" : "➕ Create Slot"}
        </h3>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label>Workspace</label>
            <select
              value={slotForm.workspace_id}
              onChange={(e) =>
                setSlotForm({ ...slotForm, workspace_id: e.target.value })
              }
            >
              <option value="">Select Workspace</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.city}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Date</label>
            <input
              type="date"
              value={slotForm.date}
              onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Slot Type</label>
            <select
              value={slotForm.slot_type}
              onChange={(e) =>
                setSlotForm({ ...slotForm, slot_type: e.target.value })
              }
            >
              <option value="hour">Hourly</option>
              <option value="day">Full Day</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Capacity</label>
            <input
              type="number"
              placeholder="50"
              value={slotForm.capacity}
              onChange={(e) =>
                setSlotForm({ ...slotForm, capacity: e.target.value })
              }
            />
          </div>

          {slotForm.slot_type === "hour" && (
            <>
              <div className={styles.fieldGroup}>
                <label>Start Hour</label>
                <input
                  type="number"
                  placeholder="9"
                  value={slotForm.start_time}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, start_time: e.target.value })
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>End Hour</label>
                <input
                  type="number"
                  placeholder="18"
                  value={slotForm.end_time}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, end_time: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <div className={styles.fieldGroup}>
            <label>Price (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={slotForm.price}
              onChange={(e) => setSlotForm({ ...slotForm, price: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button className={styles.submitBtn} onClick={createSlot}>
            {editSlotId ? "Update Slot" : "Create Slot"}
          </button>
          {editSlotId && (
            <button className={styles.cancelBtn} onClick={resetSlotForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
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
                <td>
                  <strong>{s.workspace_name}</strong>
                </td>
                <td>{s.date}</td>
                <td>{s.slot_type === "hour" ? "Hourly" : "Full Day"}</td>
                <td>
                  {s.slot_type === "hour"
                    ? `${s.start_time} – ${s.end_time}`
                    : "All Day"}
                </td>
                <td>{s.capacity}</td>
                <td className={styles.priceCell}>₹{s.price}</td>
                <td>
                  <button
                    onClick={() => handleEditSlot(s)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSlot(s.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {slots.length === 0 && <div className={styles.empty}>No slots yet.</div>}
      </div>
    </div>
  );

  const renderMonthlySlots = () => (
    <div className={styles.sectionBody}>
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>
          {editMonthId ? "✏️ Edit Monthly Slot" : "📆 Create Monthly Slots"}
        </h3>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label>Workspace</label>
            <select
              value={monthlyForm.workspace_id}
              onChange={(e) =>
                setMonthlyForm({ ...monthlyForm, workspace_id: e.target.value })
              }
              disabled={!!editMonthId}
            >
              <option value="">Select Workspace</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.city}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Year</label>
            <input
              type="number"
              value={monthlyForm.year}
              onChange={(e) =>
                setMonthlyForm({ ...monthlyForm, year: e.target.value })
              }
              disabled={!!editMonthId}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Select Months</label>
            <select
              multiple
              value={monthlyForm.months}
              style={{ height: "140px" }}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setMonthlyForm({ ...monthlyForm, months: selected });
              }}
              disabled={!!editMonthId}
            >
              {MONTH_OPTIONS.map((month, i) => (
                <option key={i} value={String(i + 1)}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Capacity</label>
            <input
              type="number"
              value={monthlyForm.capacity}
              onChange={(e) =>
                setMonthlyForm({ ...monthlyForm, capacity: e.target.value })
              }
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Price per Seat</label>
            <input
              type="number"
              value={monthlyForm.price}
              onChange={(e) =>
                setMonthlyForm({ ...monthlyForm, price: e.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.formActions}>
          {editMonthId ? (
            <>
              <button className={styles.submitBtn} onClick={updateMonthlySlot}>
                Update Monthly Slot
              </button>
              <button className={styles.cancelBtn} onClick={resetMonthlyForm}>
                Cancel
              </button>
            </>
          ) : (
            <button className={styles.submitBtn} onClick={createMonthlySlots}>
              Create Monthly Slots
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>City</th>
              <th>Month</th>
              <th>Year</th>
              <th>Capacity</th>
              <th>Booked</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {monthlySlots.map((s) => (
              <tr key={s.id}>
                <td>{s.workspace_name}</td>
                <td>{s.city}</td>
                <td>{MONTH_OPTIONS[Number(s.month) - 1] || s.month}</td>
                <td>{s.year}</td>
                <td>{s.capacity}</td>
                <td>{s.booked}</td>
                <td>₹{s.price}</td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditMonth(s)}
                  >
                    Edit
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteMonthlySlot(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {monthlySlots.length === 0 && (
          <div className={styles.empty}>No monthly slots yet.</div>
        )}
      </div>
    </div>
  );

  const sectionTitles = {
    overview: {
      icon: "⊞",
      title: "Overview",
      sub: "Revenue summary and quick stats",
    },
    workspaces: {
      icon: "🏢",
      title: "Workspace Management",
      sub: "Add, edit, and manage your listings",
    },
    suggestedWorkspaces: {
      icon: "🧭",
      title: "Suggested Workspaces",
      sub: "View workspaces added by other owners",
    },
    slots: {
      icon: "⏰",
      title: "Slot Management",
      sub: "Create and manage booking slots",
    },
    monthlySlots: {
      icon: "📅",
      title: "Monthly Slots",
      sub: "Create, update, and manage monthly slot pricing",
    },
  };

  const current = sectionTitles[activeSection];

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {sidebarCollapsed ? "O" : "Owner Panel"}
          </div>

          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${
                activeSection === item.key ? styles.navActive : ""
              }`}
              onClick={() => handleNav(item)}
              title={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarStats}>
              <div>
                <strong>{workspaces.length}</strong>
                <span>My Spaces</span>
              </div>
              <div>
                <strong>{suggestedWorkspaces.length}</strong>
                <span>Suggestions</span>
              </div>
              <div>
                <strong>{slots.length}</strong>
                <span>Slots</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className={styles.main}>
        <header className={styles.mainHeader}>
          {current && (
            <div className={styles.pageHeading}>
              <span className={styles.headIcon}>{current.icon}</span>
              <div>
                <h1>{current.title}</h1>
                <p>{current.sub}</p>
              </div>
            </div>
          )}

          <div className={styles.headerRevenue}>
            <span>Total Revenue</span>
            <strong>₹{revenue.total_revenue?.toLocaleString()}</strong>
          </div>
        </header>

        <div className={styles.content}>
          {activeSection === "overview" && renderOverview()}
          {activeSection === "workspaces" && renderWorkspaces()}
          {activeSection === "suggestedWorkspaces" && renderSuggestedWorkspaces()}
          {activeSection === "slots" && renderSlots()}
          {activeSection === "monthlySlots" && renderMonthlySlots()}
        </div>
      </main>
    </div>
  );
}

export default OwnerDashboard;
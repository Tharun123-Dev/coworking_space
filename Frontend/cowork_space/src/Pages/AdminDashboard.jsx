import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";
import R from "../Pages/Reveal";

function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    axiosInstance.get("owners/").then(res => setOwners(res.data));
  }, []);

  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm] = useState({
    name: "", city: "", location: "", price: "", image: "", description: ""
  });
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "", category: "", description: "", image: "",
    hourly_price: "", daily_price: "", monthly_price: "", is_available: true
  });

  useEffect(() => {
    fetchWorkspaces();
    fetchCategories();
  }, []);

  const fetchWorkspaces = () => {
    axiosInstance.get("workspaces/").then(res => setWorkspaces(res.data));
  };
  const fetchCategories = () => {
    axiosInstance.get("workspaces/categories/").then(res => setCategories(res.data));
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) { alert("Fill all fields"); return; }
    if (editId) {
      axiosInstance.put(`workspaces/update/${editId}/`, form).then(() => {
        alert("Updated ✅");
        setEditId(null);
        setForm({ name: "", city: "", location: "", price: "", image: "", description: "" });
        fetchWorkspaces();
      });
    } else {
      axiosInstance.post("workspaces/add/", form).then(() => {
        alert("Added ✅");
        setForm({ name: "", city: "", location: "", price: "", image: "", description: "" });
        fetchWorkspaces();
      });
    }
  };

  const handleAddCategory = () => {
    axiosInstance.post("workspaces/categories/add/", categoryForm)
      .then(() => {
        alert("Category Added ✅");
        setCategoryForm({
          name: "", category: "", description: "", image: "",
          hourly_price: "", daily_price: "", monthly_price: "", is_available: true
        });
        fetchCategories();
      })
      .catch(err => console.log(err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this workspace?")) return;
    axiosInstance.delete(`workspaces/delete/${id}/`).then(() => {
      alert("Deleted ✅");
      fetchWorkspaces();
    });
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm("Delete this category?")) return;
    axiosInstance.delete(`workspaces/categories/delete/${id}/`).then(() => {
      alert("Category Deleted ✅");
      fetchCategories();
    });
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.container}>

      {/* ═══════ TOP BAR WITH RECENT ACTIVITY BUTTON ═══════ */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <p className={styles.eyebrow}>Internal Workspace System</p>
          <h1 className={styles.pageTitle}>Admin <span>Panel</span></h1>
          <p className={styles.pageText}>
            Manage workspace records, categories, users, and leads from one central place.
          </p>
        </div>
        <div className={styles.topBarRight}>
          {/* RECENT ACTIVITY BUTTON - TOP RIGHT CORNER */}
          {/* <button
            className={`${styles.recentActivityBtn} ${styles.shadowBtn}`}
            onClick={() => navigate("/recent-activity")}
          >
            <span className={styles.navBtnIcon}>📊</span>
            <span className={styles.recentActivityText}>Recent Activity</span>
          </button> */}
          <div className={styles.topStats}>
            <div className={styles.topStat}>
              <strong>{workspaces.length}</strong>
              <span>Workspaces</span>
            </div>
            <div className={styles.topStat}>
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
            <div className={styles.topStat}>
              <strong>{categories.filter(c => c.is_available).length}</strong>
              <span>Available</span>
            </div>
            <div className={styles.topStat}>
              <strong>{owners.length}</strong>
              <span>Owners</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
        QUICK NAVIGATION GROUPS (REMOVED RECENT ACTIVITY)
      ═══════════════════════════════════════════ */}
      <div className={styles.navPanel}>

        {/* ── GROUP 1: Leads ── */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>📋</span>
              <div>
                <p className={styles.navGroupTitle}>Leads</p>
                <p className={styles.navGroupSub}>General customer enquiries</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnGold}`}
                onClick={() => navigate("/admin-leads")}
              >
                <span className={styles.navBtnIcon}>📋</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>View Leads</span>
                  <span className={styles.navBtnDesc}>Normal customer leads</span>
                </span>
              </button>
            </div>
          </div>
        </R>

        {/* ── GROUP 2: Management ── */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>⚙️</span>
              <div>
                <p className={styles.navGroupTitle}>Management</p>
                <p className={styles.navGroupSub}>Users & owner accounts</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnBlue}`}
                onClick={() => navigate("/admin-users")}
              >
                <span className={styles.navBtnIcon}>👥</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Manage Users</span>
                  <span className={styles.navBtnDesc}>User accounts & access</span>
                </span>
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnBlue}`}
                onClick={() => navigate("/create-owner")}
              >
                <span className={styles.navBtnIcon}>🏠</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Owner Management</span>
                  <span className={styles.navBtnDesc}>Create & manage owners</span>
                </span>
              </button>
            </div>
          </div>
        </R>

        {/* ── GROUP 3: Enterprise & Company Leads ── */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>🏗️</span>
              <div>
                <p className={styles.navGroupTitle}>Enterprise & Company</p>
                <p className={styles.navGroupSub}>High-value business leads</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnAmber}`}
                onClick={() => navigate("/admin-Enterprise")}
              >
                <span className={styles.navBtnIcon}>🏗️</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Enterprise Leads</span>
                  <span className={styles.navBtnDesc}>Large-scale enquiries</span>
                </span>
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnAmber}`}
                onClick={() => navigate("/enterprise-business")}
              >
                <span className={styles.navBtnIcon}>🏢</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Enterprise Business</span>
                  <span className={styles.navBtnDesc}>Business-level deals</span>
                </span>
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnAmber}`}
                onClick={() => navigate("/company-special-leads")}
              >
                <span className={styles.navBtnIcon}>🏦</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Company Leads</span>
                  <span className={styles.navBtnDesc}>Company-level requests</span>
                </span>
              </button>
            </div>
          </div>
        </R>

        {/* ── GROUP 4: Owner Activity ── */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>🔑</span>
              <div>
                <p className={styles.navGroupTitle}>Owner Activity</p>
                <p className={styles.navGroupSub}>Bookings & category leads</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnGreen}`}
                onClick={() => navigate("/admin-bookings")}
              >
                <span className={styles.navBtnIcon}>📅</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Bookings</span>
                  <span className={styles.navBtnDesc}>All space bookings</span>
                </span>
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnGreen}`}
                onClick={() => navigate("/owner-special-leads")}
              >
                <span className={styles.navBtnIcon}>🗂️</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Owner Leads</span>
                  <span className={styles.navBtnDesc}>Category-based leads</span>
                </span>
              </button>
            </div>
          </div>
        </R>

        {/* ── GROUP 5: Special Offer Leads ── */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>🔥</span>
              <div>
                <p className={styles.navGroupTitle}>Special Offers</p>
                <p className={styles.navGroupSub}>Limited-time offer leads</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnRed}`}
                onClick={() => navigate("/admin-leadss")}
              >
                <span className={styles.navBtnIcon}>🎯</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Manage Offer Leads</span>
                  <span className={styles.navBtnDesc}>FIFO special offer requests</span>
                </span>
              </button>
            </div>
          </div>
        </R>

        {/* ── GROUP 6: Support Tickets ── (REMOVED RECENT ACTIVITY BUTTON) */}
        <R>
          <div className={styles.navGroup}>
            <div className={styles.navGroupHead}>
              <span className={styles.navGroupIcon}>🎫</span>
              <div>
                <p className={styles.navGroupTitle}>Support</p>
                <p className={styles.navGroupSub}>User tickets & issues</p>
              </div>
            </div>
            <div className={styles.navGroupBtns}>
              <button
                className={`${styles.navBtn} ${styles.navBtnPurple}`}
                onClick={() => navigate("/admin-tickets")}
              >
                <span className={styles.navBtnIcon}>🎫</span>
                <span className={styles.navBtnText}>
                  <span className={styles.navBtnLabel}>Tickets</span>
                  <span className={styles.navBtnDesc}>User support requests</span>
                </span>
              </button>
            </div>
          </div>
        </R>

      </div>

      {/* ═══════════════════════════════════════════
        WORKSPACE MANAGEMENT (UNCHANGED)
      ═══════════════════════════════════════════ */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🏢</div>
          <div>
            <h2>Workspace Management</h2>
            <p>
              Add, edit &amp; delete master workspace records.
              <span className={styles.sectionNote}>Owners manage their own space categories independently.</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <p className={styles.formLabel}>{editId ? "✏️ Editing Workspace" : "＋ Add New Workspace"}</p>
          <div className={styles.form}>
            <input
              placeholder="Workspace Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            <input
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
            />
            <button onClick={handleSubmit} className={styles.formSubmitBtn}>
              {editId ? "✏️ Update Workspace" : "＋ Add Workspace"}
            </button>
            {editId && (
              <button
                className={styles.formCancelBtn}
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", city: "", location: "", price: "", image: "", description: "" });
                }}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>City</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((item, i) => (
                <tr key={item.id}>
                  <td className={styles.tdSerial}>{String(i + 1).padStart(2, "0")}</td>
                  <td>{item.name}</td>
                  <td>{item.city}</td>
                  <td className={styles.tdPrice}>₹{item.price}</td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>No workspaces found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
        WORKSPACE CATEGORIES (UNCHANGED)
      ═══════════════════════════════════════════ */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🗂️</div>
          <div>
            <h2>Workspace Categories</h2>
            <p>
              Create &amp; manage categories and pricing tiers.
              <span className={styles.sectionNote}>Owners can also manage their own categories from their panel.</span>
            </p>
          </div>
        </div>

        {/* Category form */}
        <div className={styles.formCard}>
          <p className={styles.formLabel}>＋ Add New Category</p>
          <div className={styles.form}>
            <input
              placeholder="Category Name"
              value={categoryForm.name}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
            <select
              value={categoryForm.owner}
              onChange={e => setCategoryForm({ ...categoryForm, owner: e.target.value })}
            >
              <option value="">Assign Owner</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.username}</option>
              ))}
            </select>
            <select
              value={categoryForm.category}
              onChange={e => setCategoryForm({ ...categoryForm, category: e.target.value })}
            >
              <option value="">Select Category Type</option>
              <option value="day_pass">Day Pass</option>
              <option value="meeting">Meeting Rooms</option>
              <option value="fixed">Fixed Seats</option>
              <option value="cabin">Cabins</option>
            </select>
            <input
              placeholder="Description"
              value={categoryForm.description}
              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
            <input
              placeholder="Image URL"
              value={categoryForm.image}
              onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
            />
            <input
              placeholder="Hourly Price (₹)"
              value={categoryForm.hourly_price}
              onChange={e => setCategoryForm({ ...categoryForm, hourly_price: e.target.value })}
            />
            <input
              placeholder="Daily Price (₹)"
              value={categoryForm.daily_price}
              onChange={e => setCategoryForm({ ...categoryForm, daily_price: e.target.value })}
            />
            <input
              placeholder="Monthly Price (₹)"
              value={categoryForm.monthly_price}
              onChange={e => setCategoryForm({ ...categoryForm, monthly_price: e.target.value })}
            />
            <select
              value={String(categoryForm.is_available)}
              onChange={e => setCategoryForm({ ...categoryForm, is_available: e.target.value === "true" })}
            >
              <option value="true">✅ Available</option>
              <option value="false">❌ Not Available</option>
            </select>
            <button onClick={handleAddCategory} className={styles.formSubmitBtn}>
              ＋ Add Category
            </button>
          </div>
        </div>

        {/* Category cards */}
        <div className={styles.categoryList}>
          {categories.map(item => (
            <div key={item.id} className={styles.categoryCard}>
              <div className={styles.categoryInfo}>
                <h4>
                  {item.name}
                  <span>{item.category}</span>
                </h4>
                <p>{item.description || "No description added."}</p>
                <div className={styles.priceRow}>
                  <span>⏱ Hourly: ₹{item.hourly_price || "—"}</span>
                  <span>📅 Daily: ₹{item.daily_price || "—"}</span>
                  <span>🗓 Monthly: ₹{item.monthly_price || "—"}</span>
                </div>
              </div>
              <div className={styles.categoryAction}>
                <span className={item.is_available ? styles.statusActive : styles.statusMuted}>
                  {item.is_available ? "Available" : "Unavailable"}
                </span>
                <button onClick={() => handleDeleteCategory(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className={styles.emptyRow} style={{ padding: "32px", textAlign: "center" }}>
              No categories found
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;
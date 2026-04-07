import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";
import R from "../Pages/Reveal";

function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners]=useState([])
   useEffect(()=>{
   axiosInstance.get("owners/")
   .then(res=>setOwners(res.data))},[])


  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    price: "",
    image: "",
    description: ""
  });

  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    hourly_price: "",
    daily_price: "",
    monthly_price: "",
    is_available: true
  });

  useEffect(() => {
    fetchWorkspaces();
    fetchCategories();
  }, []);

  const fetchWorkspaces = () => {
    axiosInstance.get("workspaces/").then((res) => setWorkspaces(res.data));
  };

  const fetchCategories = () => {
    axiosInstance.get("workspaces/categories/").then((res) => setCategories(res.data));
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) {
      alert("Fill all fields");
      return;
    }

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
    axiosInstance
      .post("workspaces/categories/add/", categoryForm)
      .then(() => {
        alert("Category Added ✅");
        setCategoryForm({
          name: "", category: "", description: "", image: "",
          hourly_price: "", daily_price: "", monthly_price: "", is_available: true
        });
        fetchCategories();
      })
      .catch((err) => console.log(err));
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

      {/* ===== TOP BAR ===== */}
      <div className={styles.topBar}>
        <div>
          <p className={styles.eyebrow}>Internal Workspace System</p>
          <h1 className={styles.pageTitle}>
            Admin <span>Panel</span>
          </h1>
          <p className={styles.pageText}>
            Manage workspace records, categories, users, and leads from one central place.
          </p>
        </div>

        {/* Quick stats */}
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
        </div>
      </div>

      {/* ===== NAV BUTTONS ===== */}
      <div className={styles.btnWrapper}>
        <R>
          <button className={`${styles.btnBox} ${styles.goldBtn}`} onClick={() => navigate("/admin-leads")}>
            📋 View Leads
          </button>
        </R>
        <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/admin-users")}>
            👥 Manage Users
          </button>
        </R>
        <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/admin-leadss")}>
            📌 Manage Leads
          </button>
        </R>
        <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/admin-Enterprise")}>
            🏗️ Enterprise Leads
          </button>
        </R>
         <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/create-owner")}>
           Owner Management
          </button>
        </R>

          <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/admin-bookings")}>
           Bookings
          </button>
        </R>

           <R>
          <button className={`${styles.btnBox} ${styles.greenBtn}`} onClick={() => navigate("/owner-special-leads")}>
           Owners Leads[Categories]
          </button>
        </R>
      </div>

      {/* ===== WORKSPACE MANAGEMENT ===== */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🏢</div>
          <div>
            <h2>Workspace Management</h2>
            <p>Add, edit, and delete workspace records.</p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <div className={styles.form}>
            <input
              placeholder="Workspace Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <input
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <button onClick={handleSubmit}>
              {editId ? "✏️ Update Workspace" : "＋ Add Workspace"}
            </button>
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
                  <td style={{ color: "rgba(201,168,76,0.6)", fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.city}</td>
                  <td style={{ color: "#f0c040", fontWeight: 700 }}>₹{item.price}</td>
                  <td className={styles.actionCell}>
                    <button className={styles.editBtn} onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "rgba(245,240,232,0.3)", padding: "32px" }}>
                    No workspaces found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🗂️</div>
          <div>
            <h2>Workspace Categories</h2>
            <p>Create and manage workspace categories and pricing tiers.</p>
          </div>
        </div>

        {/* Category form */}
        <div className={styles.formCard}>
          <div className={styles.form}>
            <input
              placeholder="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
            <select
value={categoryForm.owner}
onChange={(e)=>
setCategoryForm({
...categoryForm,
owner:e.target.value
})
}
>

<option value="">Assign Owner</option>

{owners.map(o=>(
<option value={o.id}>{o.username}</option>
))}

</select>
            <select
              value={categoryForm.category}
              onChange={(e) => setCategoryForm({ ...categoryForm, category: e.target.value })}
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
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
            <input
              placeholder="Image URL"
              value={categoryForm.image}
              onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
            />
            <input
              placeholder="Hourly Price (₹)"
              value={categoryForm.hourly_price}
              onChange={(e) => setCategoryForm({ ...categoryForm, hourly_price: e.target.value })}
            />
            <input
              placeholder="Daily Price (₹)"
              value={categoryForm.daily_price}
              onChange={(e) => setCategoryForm({ ...categoryForm, daily_price: e.target.value })}
            />
            <input
              placeholder="Monthly Price (₹)"
              value={categoryForm.monthly_price}
              onChange={(e) => setCategoryForm({ ...categoryForm, monthly_price: e.target.value })}
            />

            <select
              value={String(categoryForm.is_available)}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, is_available: e.target.value === "true" })
              }
            >
              <option value="true">✅ Available</option>
              <option value="false">❌ Not Available</option>
            </select>

            <button onClick={handleAddCategory}>＋ Add Category</button>
          </div>
        </div>

        {/* Category cards */}
        <div className={styles.categoryList}>
          {categories.map((item) => (
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
                <button onClick={() => handleDeleteCategory(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "32px",
              color: "rgba(245,240,232,0.3)",
              fontSize: "14px"
            }}>
              No categories found
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;

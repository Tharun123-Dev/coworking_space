import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";
import { useNavigate } from "react-router-dom";
import R from "../Pages/Reveal";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);

  const [revenue, setRevenue] = useState({
    total_revenue: 0,
    confirmed_revenue: 0,
    pending_revenue: 0,
    cancelled_count: 0
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    location: "",
    price: "",
    image: "",
    description: ""
  });

  const [editId, setEditId] = useState(null);

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
    fetchRevenue();
  }, []);

  // OWNER WORKSPACES
  const fetchWorkspaces = () => {
    axiosInstance
      .get("workspaces/?owner=true")
      .then((res) => setWorkspaces(res.data));
  };

  const fetchCategories = () => {
    axiosInstance
      .get("workspaces/categories/")
      .then((res) => setCategories(res.data));
  };

  // OWNER REVENUE
  const fetchRevenue = () => {
    axiosInstance
      .get("cart/owner/revenue/")
      .then((res) => setRevenue(res.data));
  };

  const resetWorkspaceForm = () => {
    setForm({
      name: "",
      city: "",
      location: "",
      price: "",
      image: "",
      description: ""
    });
    setEditId(null);
  };

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) {
      alert("Fill all required fields");
      return;
    }

    if (editId) {
      axiosInstance
        .put(`workspaces/update/${editId}/`, form)
        .then(() => {
          alert("Workspace Updated ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
        });
    } else {
      axiosInstance
        .post("workspaces/add/", form)
        .then(() => {
          alert("Workspace Added ✅");
          resetWorkspaceForm();
          fetchWorkspaces();
        });
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    axiosInstance.delete(`workspaces/delete/${id}/`)
      .then(fetchWorkspaces);
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

        {/* UPDATED STATS */}
        <div className={styles.topStats}>
          <div className={styles.topStat}>
            <strong>₹{revenue.total_revenue}</strong>
            <span>Total Revenue</span>
          </div>

          <div className={styles.topStat}>
            <strong>₹{revenue.confirmed_revenue}</strong>
            <span>Confirmed</span>
          </div>

          <div className={styles.topStat}>
            <strong>₹{revenue.pending_revenue}</strong>
            <span>Pending</span>
          </div>

          <div className={styles.topStat}>
            <strong>{revenue.cancelled_count}</strong>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      <div className={styles.btnWrapper}>
        <R>
          <button
            className={`${styles.btnBox} ${styles.goldBtn}`}
            onClick={() => navigate("/owner-bookings")}
          >
            📋 My Bookings
          </button>
        </R>

        <R>
          <button
            className={`${styles.btnBox} ${styles.greenBtn}`}
            onClick={() => navigate("/owner-users")}
          >
            👥 Customers
          </button>
        </R>

        <R>
          <button
            className={`${styles.btnBox} ${styles.blueBtn}`}
            onClick={() => navigate("/owner-leads")}
          >
            📌 Owner Leads
          </button>
        </R>

            <R>
          <button
            className={`${styles.btnBox} ${styles.blueBtn}`}
            onClick={() => navigate("/company-leads")}
          >
            📌 Company Leads
          </button>
        </R>
      </div>

      {/* Workspace Section */}
      <section className={styles.panelSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>🏢</div>
          <div>
            <h2>Workspace Management</h2>
            <p>Add, edit, and delete workspace records.</p>
          </div>
        </div>

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
              {editId ? "Update Workspace" : "Add Workspace"}
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.city}</td>
                <td>₹{w.price}</td>
                <td>
                  <button onClick={() => handleEdit(w)}>Edit</button>
                  <button onClick={() => handleDelete(w.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}

export default OwnerDashboard;
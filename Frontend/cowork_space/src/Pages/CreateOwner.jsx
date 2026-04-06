import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/CreateOwner.module.css";

function CreateOwner() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [owners, setOwners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = () => {
    axiosInstance.get("owners/")
      .then(res => setOwners(res.data))
      .catch(err => console.log(err));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: ""
    });
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || (!editId && !form.password)) {
      alert("All required fields must be filled ❌");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        await axiosInstance.put(`owners/update/${editId}/`, form);
        alert("Owner updated ✅");
      } else {
        await axiosInstance.post("admin/create-owner/", form);
        alert("Owner created successfully 🎉");
      }

      resetForm();
      fetchOwners();
    } catch (err) {
      console.log(err);
      alert("Error occurred ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (owner) => {
    setEditId(owner.id);
    setForm({
      username: owner.username,
      email: owner.email,
      password: ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete owner?")) return;

    axiosInstance.delete(`owners/delete/${id}/`)
      .then(() => {
        alert("Owner deleted");
        fetchOwners();
      })
      .catch(() => alert("Delete failed ❌"));
  };

  const filteredOwners = owners.filter((owner) =>
    owner.username.toLowerCase().includes(search.toLowerCase()) ||
    owner.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.badge}>Admin Panel</p>
            <h2>{editId ? "Update Owner" : "Create Owner"}</h2>
            <p className={styles.subText}>
              Manage owner accounts, update details, and monitor all registered owners.
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>Total Owners</span>
            <h3>{owners.length}</h3>
          </div>

          <div className={styles.statCard}>
            <span>Visible Results</span>
            <h3>{filteredOwners.length}</h3>
          </div>

          <div className={styles.statCard}>
            <span>Mode</span>
            <h3>{editId ? "Edit" : "Create"}</h3>
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>
              {editId ? "Edit Owner Details" : "Add New Owner"}
            </h3>

            <div className={styles.form}>
              <input
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                className={styles.input}
              />

              <input
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
              />

              <input
                type="password"
                name="password"
                placeholder={editId ? "Enter new password (optional)" : "Enter password"}
                value={form.password}
                onChange={handleChange}
                className={styles.input}
              />

              <div className={styles.formActions}>
                <button onClick={handleSubmit} className={styles.primaryBtn}>
                  {loading ? "Please wait..." : editId ? "Update Owner" : "Create Owner"}
                </button>

                {editId && (
                  <button onClick={resetForm} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>Search Owners</h3>

            <input
              type="text"
              placeholder="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.input}
            />

            <div className={styles.searchInfo}>
              <p>Total records: <span>{owners.length}</span></p>
              <p>Filtered: <span>{filteredOwners.length}</span></p>
            </div>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3>Manage Owners</h3>
          </div>

          {filteredOwners.length === 0 ? (
            <div className={styles.emptyState}>
              <h4>No owners found</h4>
              <p>Try changing the search value or create a new owner.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOwners.map((o, index) => (
                    <tr key={o.id}>
                      <td>{index + 1}</td>
                      <td>{o.username}</td>
                      <td>{o.email}</td>
                      <td>
                        <span className={styles.statusBadge}>Owner</span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(o)}
                          >
                            Edit
                          </button>

                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(o.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateOwner;

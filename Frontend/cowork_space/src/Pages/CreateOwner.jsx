import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/CreateOwner.module.css";

function CreateOwner() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [owners, setOwners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = () => {
    axiosInstance
      .get("owners/")
      .then((res) => setOwners(res.data))
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ username: "", email: "", password: "" });
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
        const payload = {
          username: form.username,
          email: form.email,
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await axiosInstance.put(`owners/update/${editId}/`, payload);
        alert("Owner updated ✅");
      } else {
        await axiosInstance.post("admin/create-owner/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        alert("Owner created successfully 🎉");
      }

      resetForm();
      fetchOwners();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Error occurred ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (owner) => {
    setEditId(owner.id);
    setForm({
      username: owner.username || "",
      email: owner.email || "",
      password: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;

    axiosInstance
      .delete(`owners/delete/${id}/`)
      .then(() => {
        alert("Owner deleted");
        fetchOwners();
      })
      .catch(() => alert("Delete failed ❌"));
  };

  const filteredOwners = owners.filter(
    (owner) =>
      owner.username?.toLowerCase().includes(search.toLowerCase()) ||
      owner.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>Admin Panel</span>
            <h1 className={styles.title}>
              {editId ? "Update Owner" : "Owner Management"}
            </h1>
            <p className={styles.subtitle}>
              Create, manage, and monitor all registered owner accounts.
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className={styles.statLabel}>Total Owners</p>
              <h3 className={styles.statValue}>{owners.length}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div>
              <p className={styles.statLabel}>Search Results</p>
              <h3 className={styles.statValue}>{filteredOwners.length}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${
                editId ? styles.statIconEdit : styles.statIconCreate
              }`}
            >
              {editId ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <div>
              <p className={styles.statLabel}>Current Mode</p>
              <h3 className={styles.statValue}>{editId ? "Editing" : "Create"}</h3>
            </div>
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                {editId ? "Edit Owner Details" : "Add New Owner"}
              </h3>
              <p className={styles.cardDesc}>
                {editId
                  ? "Update the information below"
                  : "Fill in the details to create a new owner account"}
              </p>
            </div>

            <div className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Username</label>
                <input
                  name="username"
                  placeholder="e.g. john_doe"
                  value={form.username}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Password {editId && <span className={styles.optional}>(optional)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={
                    editId ? "Leave blank to keep current" : "Enter a strong password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={handleSubmit}
                  className={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.loadingRow}>
                      <span className={styles.spinner}></span>
                      Processing...
                    </span>
                  ) : editId ? (
                    "Update Owner"
                  ) : (
                    "Create Owner"
                  )}
                </button>

                {editId && (
                  <button onClick={resetForm} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Search Owners</h3>
              <p className={styles.cardDesc}>Filter by username or email address</p>
            </div>

            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />

              {search && (
                <button className={styles.clearBtn} onClick={() => setSearch("")}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className={styles.searchStats}>
              <div className={styles.searchStatItem}>
                <span
                  className={styles.searchStatDot}
                  style={{ background: "#6366f1" }}
                ></span>
                <span>Total Records</span>
                <strong>{owners.length}</strong>
              </div>
              <div className={styles.searchStatItem}>
                <span
                  className={styles.searchStatDot}
                  style={{ background: "#10b981" }}
                ></span>
                <span>Filtered</span>
                <strong>{filteredOwners.length}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.listHeader}>
            <div>
              <h3 className={styles.cardTitle}>Manage Owners</h3>
              <p className={styles.cardDesc}>View, edit, or remove owner accounts</p>
            </div>
            <span className={styles.countBadge}>{filteredOwners.length} owners</span>
          </div>

          {filteredOwners.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4>No owners found</h4>
              <p>Try a different search term or create a new owner.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOwners.map((o, index) => (
                    <tr key={o.id} className={editId === o.id ? styles.activeRow : ""}>
                      <td className={styles.indexCell}>{index + 1}</td>

                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {o.username?.charAt(0).toUpperCase()}
                          </div>
                          <span>{o.username}</span>
                        </div>
                      </td>

                      <td className={styles.emailCell}>{o.email}</td>

                      <td>
                        <span className={styles.roleBadge}>Owner</span>
                      </td>

                      <td>
                        <div className={styles.tableActions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(o)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(o.id)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
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
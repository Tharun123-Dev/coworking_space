import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminUsers.module.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("leads/users/all/");
      setUsers(res.data);
    } catch {
      alert("Only admin allowed ❌");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    try {
      await axiosInstance.post("leads/users/create/", form);
      alert("User created 🎉");
      setForm({
        username: "",
        email: "",
        phone: "",
        password: "",
      });
      fetchUsers();
    } catch {
      alert("Error creating user");
    }
  };

  const handleEditClick = (user) => {
    setEditUser({
      ...user,
      is_admin: user.is_admin ?? user.is_superuser ?? false,
      phone: user.phone || "",
    });
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`leads/users/update/${editUser.id}/`, {
        username: editUser.username,
        email: editUser.email,
        phone: editUser.phone,
        is_admin: editUser.is_admin,
      });
      alert("Updated ✅");
      setEditUser(null);
      fetchUsers();
    } catch {
      alert("Update failed ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`leads/users/delete/${id}/`);
      fetchUsers();
    } catch {
      alert("Delete failed ❌");
    }
  };

  const filteredUsers = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value) return users;

    return users.filter((user) =>
      [user.username, user.email, user.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [users, searchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>👥 User Management</h2>
        <p>Manage platform users, roles, and account details.</p>
      </div>

      <div className={styles.topGrid}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Create User</h3>

          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <input
              className={styles.input}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className={styles.input}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button className={styles.primaryBtn} onClick={handleCreate}>
              Create User
            </button>
          </div>
        </div>

        {editUser && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Edit User</h3>

            <div className={styles.form}>
              <input
                className={styles.input}
                value={editUser.username || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, username: e.target.value })
                }
              />

              <input
                className={styles.input}
                value={editUser.email || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />

              <input
                className={styles.input}
                placeholder="Phone"
                value={editUser.phone || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
              />

              <label className={styles.checkboxRow}>
                <span>Admin Access</span>
                <input
                  type="checkbox"
                  checked={editUser.is_admin || false}
                  onChange={(e) =>
                    setEditUser({ ...editUser, is_admin: e.target.checked })
                  }
                />
              </label>

              <div className={styles.actionRow}>
                <button className={styles.primaryBtn} onClick={handleUpdate}>
                  Save Changes
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.statsBar}>
        <h3>
          Total Users: <span>{users.length}</span>
        </h3>

        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by username, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.userGrid}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{user.username}</h3>
                  <p>{user.email}</p>
                  <p>📞 {user.phone || "No Phone"}</p>
                </div>
              </div>

              <div className={styles.roleBadge}>
                {user.is_admin || user.is_superuser ? "Admin" : "User"}
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noUsers}>No users found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
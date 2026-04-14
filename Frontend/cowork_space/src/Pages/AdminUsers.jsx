import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminUsers.module.css";
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser]=useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone:"",
    password: ""
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
      setForm({ username: "", email: "", password: "" });
      fetchUsers();
    } catch {
      alert("Error creating user ");
    }
  };

  const handleEditClick=(user)=>{
    setEditUser(user);
  }

 const handleUpdate = () => {
  axiosInstance.put(`leads/users/update/${editUser.id}/`, {
    username: editUser.username,
    email: editUser.email,
    is_superuser: editUser.is_superuser
  })
  .then(() => {
    alert("Updated ✅");
    setEditUser(null);
    fetchUsers();
  })
  .catch(() => alert("Update failed ❌"));
};

  const handleDelete = async (id) => {
    await axiosInstance.delete(`leads/users/delete/${id}/`);
    fetchUsers();
  };
return (
  <div className={styles.container}>
    <div className={styles.header}>
      <h2>👥 User Management</h2>
      <p>Manage platform users, roles, and account details.</p>
    </div>

    <div className={styles.topGrid}>
      {/* CREATE USER */}
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
  onChange={(e)=>setForm({...form,phone:e.target.value})}
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

      {/* EDIT USER */}
      {editUser && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Edit User</h3>

          <div className={styles.form}>
            <input
              className={styles.input}
              value={editUser?.username || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, username: e.target.value })
              }
            />

            <input
              className={styles.input}
              value={editUser?.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <label className={styles.checkboxRow}>
              <span>Admin Access</span>
              <input
                type="checkbox"
                checked={editUser?.is_admin || false}
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
      <h3>Total Users: <span>{users.length}</span></h3>
    </div>

    <div className={styles.userGrid}>
      {users.map((user) => (
        <div key={user.id} className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.avatar}>
              {user.username?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{user.username}</h3>
              <p>{user.email}</p>
              <p>📞{user.phone || "No Phone"}</p>
            </div>
          </div>

          <div className={styles.roleBadge}>
            {user.is_admin ? "Admin" : "User"}
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.editBtn}
              onClick={() => setEditUser(user)}
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
      ))}
    </div>
  </div>
);
 
}
export default AdminUsers;
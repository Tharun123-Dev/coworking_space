import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser]=useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
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
    <div style={styles.container}>
      <h2>👥 User Management</h2>

      {/* CREATE USER */}
      <div style={styles.form}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={handleCreate}>Create</button>
      </div>
     
     
     {editUser && (
  <div>
    <input
      value={editUser?.username || ""}
      onChange={(e) =>
        setEditUser({ ...editUser, username: e.target.value })
      }
    />

    <input
      value={editUser?.email || ""}
      onChange={(e) =>
        setEditUser({ ...editUser, email: e.target.value })
      }
    />

    <label>
      Admin:
      <input
        type="checkbox"
        checked={editUser?.is_admin || false}
        
        onChange={(e) =>
          setEditUser({ ...editUser, is_admin: e.target.checked })
        }
      />
    </label>

    <button onClick={handleUpdate}>Save</button>
    <button onClick={() => setEditUser(null)}>Cancel</button>
  </div>
)}
     


<h3>Total Users: {users.length}</h3>
      {/* USERS LIST */}
      {users.map((user) => (
        <div key={user.id} style={styles.card}>
          <h3>{user.username}</h3>
          <p>{user.email}</p>
          <p>{user.is_admin ? "Admin" : "User"}</p>


          <button onClick={() => setEditUser(user)}>Edit</button>
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px"
  },
  form: {
    marginBottom: "20px"
  },
  card: {
    border: "1px solid #ddd",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px"
  }
};

export default AdminUsers;
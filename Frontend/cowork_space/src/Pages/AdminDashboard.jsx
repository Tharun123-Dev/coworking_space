import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

   const navigate = useNavigate();

  // ================= OLD WORKSPACE =================
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

  // ================= NEW CATEGORY =================
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

  // ================= FETCH =================
  useEffect(() => {
    fetchWorkspaces();
    fetchCategories();
  }, []);

  const fetchWorkspaces = () => {
    axiosInstance.get("workspaces/")
      .then(res => setWorkspaces(res.data));
  };

  const fetchCategories = () => {
    axiosInstance.get("workspaces/categories/")
      .then(res => setCategories(res.data));
  };

  // ================= WORKSPACE SUBMIT =================
  const handleSubmit = () => {
    if (!form.name || !form.city || !form.price) {
      alert("Fill all fields ");
      return;
    }

    if (editId) {
      axiosInstance.put(`workspaces/update/${editId}/`, form)
        .then(() => {
          alert("Updated ");
          setEditId(null);
          fetchWorkspaces();
        });
    } else {
      axiosInstance.post("workspaces/add/", form)
        .then(() => {
          alert("Added ");

          setForm({
            name: "",
            city: "",
            location: "",
            price: "",
            image: "",
            description: ""
          });

          fetchWorkspaces();
        });
    }
  };

  // ================= CATEGORY ADD =================
  const handleAddCategory = () => {
    axiosInstance.post("workspaces/categories/add/", categoryForm)
      .then(() => {
        alert("Category Added ");

        setCategoryForm({
          name: "",
          category: "",
          description: "",
          image: "",
          hourly_price: "",
          daily_price: "",
          monthly_price: "",
          is_available: true
        });

        fetchCategories();
      })
      .catch(err => console.log(err));
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    axiosInstance.delete(`workspaces/delete/${id}/`)
      .then(() => {
        alert("Deleted ");
        fetchWorkspaces();
      });
  };

  const handleDeleteCategory = (id) => {
    axiosInstance.delete(`workspaces/categories/delete/${id}/`)
      .then(() => {
        alert("Deleted Category ");
        fetchCategories();
      });
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  return (
    <div className={styles.container}>

      <h1>Admin Panel</h1>
<div className="btnWrapper">
  
  <button
    className="btnBox leftBtn"
    onClick={() => navigate("/admin-leads")}
  >
    View Leads
  </button>

  <button
    className="btnBox rightBtn"
    onClick={() => navigate("/admin-users")}
  >
    Manage Users
  </button>

</div>

      {/* ================= WORKSPACE SECTION ================= */}
      <h2>Add Workspace</h2>



      <div className={styles.form}>
        <input placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
        />
        <input placeholder="City"
          value={form.city}
          onChange={(e) => setForm({...form, city: e.target.value})}
        />
        <input placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
        />
        <input placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({...form, price: e.target.value})}
        />
        <input placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
        />
        <input placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({...form, image: e.target.value})}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update Workspace" : "Add Workspace"}
        </button>
      </div>

      {/* TABLE */}
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
          {workspaces.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.city}</td>
              <td>{item.price}</td>

              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>



      {/* ================= CATEGORY SECTION ================= */}

      <h2 style={{marginTop: "50px"}}>Workspace Categories</h2>

      <div className={styles.form}>
        <input placeholder="Name"
          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
        />

        <select onChange={(e) => setCategoryForm({...categoryForm, category: e.target.value})}>
          <option>Select Category</option>
          <option value="day_pass">Day Pass</option>
          <option value="meeting">Meeting Rooms</option>
          <option value="fixed">Fixed Seats</option>
          <option value="cabin">Cabins</option>
        </select>

        <input placeholder="Description"
          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
        />

        <input placeholder="Image URL"
          onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
        />

        <input placeholder="Hourly Price"
          onChange={(e) => setCategoryForm({...categoryForm, hourly_price: e.target.value})}
        />

        <input placeholder="Daily Price"
          onChange={(e) => setCategoryForm({...categoryForm, daily_price: e.target.value})}
        />

        <input placeholder="Monthly Price"
          onChange={(e) => setCategoryForm({...categoryForm, monthly_price: e.target.value})}
        />

        <select onChange={(e) => setCategoryForm({...categoryForm, is_available: e.target.value === "true"})}>
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>

        <button onClick={handleAddCategory}>
          Add Category
        </button>
      </div>

      {/* CATEGORY LIST */}
      {categories.map(item => (
        <div key={item.id} style={{marginTop:"10px", background:"#fff", padding:"10px"}}>
          <h4>{item.name} ({item.category})</h4>
          <p>₹{item.daily_price}</p>

          <button onClick={() => handleDeleteCategory(item.id)}>
            Delete
          </button>
        </div>
      ))}

    </div>
  );
}

export default AdminDashboard;
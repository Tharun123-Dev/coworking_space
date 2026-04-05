import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";

function CreateOwner() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  // 🔹 HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 SUBMIT
  const handleSubmit = async () => {
    // ✅ Validation
    if (!form.username || !form.email || !form.password) {
      alert("All fields required ❌");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be 6+ characters ❌");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending Data 👉", form); // 🔍 DEBUG

      const res = await axiosInstance.post("admin/create-owner/", form);

      console.log("Response 👉", res.data);

      alert("Owner created successfully 🎉");

      // 🔥 RESET FORM
      setForm({
        username: "",
        email: "",
        password: ""
      });

      // 🔥 OPTIONAL REDIRECT
      navigate("/admin-dashboard");

    } catch (err) {
      console.log("ERROR 👉", err.response?.data);

      // ✅ SHOW EXACT ERROR
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else if (err.response?.data?.username) {
        alert("Username already exists ❌");
      } else if (err.response?.data?.email) {
        alert("Email already exists ❌");
      } else {
        alert("Failed to create owner ❌");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Owner</h2>

      <input
        name="username"
        placeholder="Enter username"
        value={form.username}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="email"
        placeholder="Enter email"
        value={form.email}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        type="password"
        name="password"
        placeholder="Enter password"
        value={form.password}
        onChange={handleChange}
        style={styles.input}
      />

      <button onClick={handleSubmit} style={styles.button}>
        {loading ? "Creating..." : "Create Owner"}
      </button>
    </div>
  );
}

export default CreateOwner;

// 🎨 SIMPLE STYLES
const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#ff6600",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};
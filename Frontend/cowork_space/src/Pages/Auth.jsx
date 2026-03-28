import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Auth.module.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async () => {

    // ✅ BASIC VALIDATION
    if (!formData.username.trim() || !formData.password.trim()) {
      alert("Please fill all required fields ❌");
      return;
    }

    if (!isLogin && !formData.email.trim()) {
      alert("Email is required ❌");
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      alert("Password must be at least 6 characters ❌");
      return;
    }

    try {
      setLoading(true);

      // ================= LOGIN =================
      if (isLogin) {
        const res = await axiosInstance.post("login/", {
          username: formData.username,
          password: formData.password
        });

        // 🔥 IMPORTANT CHECK
        if (!res.data || !res.data.access) {
          alert("Invalid login response ❌");
          return;
        }

        // ✅ STORE DATA
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh || "");
        localStorage.setItem("username", res.data.username || "");
        localStorage.setItem("is_admin", res.data.is_admin || false);

        alert("Login successful ✅");

        // RESET FORM
        setFormData({
          username: "",
          email: "",
          password: ""
        });

        // REDIRECT
        navigate(res.data.is_admin ? "/admin-dashboard" : "/");
      }

      // ================= REGISTER =================
      else {
        await axiosInstance.post("register/", {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        alert("Registered successfully 🎉");

        // RESET FORM
        setFormData({
          username: "",
          email: "",
          password: ""
        });

        // SWITCH TO LOGIN
        setIsLogin(true);
      }

    } catch (err) {
      console.log("ERROR:", err);

      const data = err.response?.data;

      // 🔥 SMART ERROR HANDLING
      if (data) {
        if (data.username) {
          alert("Username already exists ❌");
        } 
        else if (data.email) {
          alert("Email already exists ❌");
        } 
        else if (data.password) {
          alert("Password error: " + data.password);
        } 
        else if (data.error) {
          alert(data.error); // backend custom error
        }
        else if (data.detail) {
          alert(data.detail); // JWT / auth errors
        } 
        else {
          alert("Something went wrong ❌");
        }
      } else {
        alert("Server error ❌");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      {/* USERNAME */}
      <input 
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className={styles.input}
      />

      {/* EMAIL (ONLY SIGNUP) */}
      {!isLogin && (
        <input 
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
        />
      )}

      {/* PASSWORD */}
      <input 
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className={styles.input}
      />

      {/* BUTTON */}
      <button 
        onClick={handleSubmit} 
        className={styles.button}
        disabled={loading}
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
      </button>

      {/* TOGGLE */}
      <p 
        onClick={() => setIsLogin(!isLogin)} 
        className={styles.toggleLink}
      >
        {isLogin ? "Create account?" : "Already have account?"}
      </p>
    </div>
  );
}

export default Auth;
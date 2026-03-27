import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Auth.module.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // 🔥 loader
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    // Validation
    if (!formData.username || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    if (!isLogin && !formData.email) {
      alert("Email is required");
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true); // start loader

      if (isLogin) {
        //  LOGIN
        const res = await axiosInstance.post("login/", {
          username: formData.username,
          password: formData.password
        });

        localStorage.setItem("access", res.data.access);
        if (res.data.refresh) {
          localStorage.setItem("refresh", res.data.refresh);
        }

        localStorage.setItem("is_admin", res.data.is_admin);
        localStorage.setItem("username", res.data.username);

        alert("Login successful");

        if (res.data.is_admin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }

      } else {
        //  REGISTER
        await axiosInstance.post("register/", formData);

        alert("Registered successfully");
        setIsLogin(true);
      }

    } catch (err) {
      console.log(err);

      //Smart error handling from backend
      if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.username) {
          alert("Username already exists");
        } else if (data.email) {
          alert("Email already exists");
        } else if (data.password) {
          alert("Password error: " + data.password);
        } else if (data.detail) {
          alert(data.detail); // login error
        } else {
          alert("Something went wrong");
        }
      } else {
        alert("Server error");
      }

    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className={styles.container}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <input 
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className={styles.input}
      />

      {!isLogin && (
        <input 
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className={styles.input}
        />
      )}

      <input 
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className={styles.input}
      />

      <button 
        onClick={handleSubmit} 
        className={styles.button}
        disabled={loading}
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
      </button>

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
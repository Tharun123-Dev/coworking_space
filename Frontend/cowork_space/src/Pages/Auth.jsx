import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../Styles/Auth.module.css";

function Auth() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleType = params.get("type");

  const [isLogin, setIsLogin] = useState(roleType !== "user");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (roleType === "owner" || roleType === "admin") {
      setIsLogin(true);
    }
  }, [roleType]);

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

      if (isLogin) {
        const res = await axiosInstance.post("login/", {
          username: formData.username,
          password: formData.password
        });

        if (!res.data || !res.data.access) {
          alert("Invalid login response ❌");
          return;
        }

        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh || "");
        localStorage.setItem("username", res.data.username || "");
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("remember_me", rememberMe);

        alert("Login successful ✅");

        setFormData({
          username: "",
          email: "",
          password: ""
        });

        const role = res.data.role;

        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "owner") {
          navigate("/owner-dashboard");
        } else {
          navigate("/");
        }

      } else {

        await axiosInstance.post("register/", {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        alert("Registered successfully 🎉");

        setFormData({
          username: "",
          email: "",
          password: ""
        });

        setIsLogin(true);
      }

    } catch (err) {
      console.log("ERROR:", err);

      const data = err.response?.data;

      if (data) {
        if (data.username) {
          alert("Username already exists ❌");
        } else if (data.email) {
          alert("Email already exists ❌");
        } else if (data.password) {
          alert("Password error: " + data.password);
        } else if (data.error) {
          alert(data.error);
        } else if (data.detail) {
          alert(data.detail);
        } else {
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
    <section className={styles.authPage}>
      <div className={styles.authWrapper}>

        <div className={styles.authContent}>
          <p className={styles.badge}>
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </p>

          <h1>
            {isLogin
              ? "Access your workspace with a smooth and secure login"
              : "Join us and start managing your workspace smarter"}
          </h1>

          <p className={styles.subText}>
            {isLogin
              ? "Login to manage your bookings, check workspace details, and continue your journey with a secure and modern experience."
              : "Create your account to explore flexible workspaces, manage bookings, and access a better work environment with ease."}
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span>01</span>
              <h3>Secure Access</h3>
              <p>Protected authentication flow with reliable account access.</p>
            </div>

            <div className={styles.featureCard}>
              <span>02</span>
              <h3>Easy Management</h3>
              <p>Track bookings, account info, and workspace activity in one place.</p>
            </div>

            <div className={styles.featureCard}>
              <span>03</span>
              <h3>Responsive UI</h3>
              <p>Clean and smooth design that works well on all screen sizes.</p>
            </div>

            <div className={styles.featureCard}>
              <span>04</span>
              <h3>Fast Experience</h3>
              <p>Minimal and user-friendly layout for quick login and signup.</p>
            </div>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.formTop}>
            <h2>{isLogin ? "Login" : "Signup"}</h2>
            <p>
              {isLogin
                ? "Enter your credentials to continue"
                : "Fill the form below to create a new account"}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {!isLogin && roleType === "user" && (
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} className={styles.button}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>

          {roleType === "user" && (
            <p onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create account?" : "Already have account?"}
            </p>
          )}

        </div>
      </div>
    </section>
  );
}

export default Auth;
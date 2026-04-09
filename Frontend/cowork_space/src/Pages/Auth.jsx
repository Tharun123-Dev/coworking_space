import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../Styles/Auth.module.css";

function Auth() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleType = params.get("type");

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(roleType !== "user");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);

const handleClick = async (role) => {
  setLoadingRole(role);
  await handleGuestLogin(role);   // your existing login
  setLoadingRole(null);
};

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (roleType === "owner" || roleType === "admin") {
      setIsLogin(true);
    } else if (roleType === "user") {
      setIsLogin(true);
    }
  }, [roleType]);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateLogin = () => {
    if (!formData.username.trim()) {
      showPopup("error", "Username is required");
      return false;
    }

    if (!formData.password.trim()) {
      showPopup("error", "Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      showPopup("error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const validateSignup = () => {
    if (!formData.username.trim()) {
      showPopup("error", "Username is required");
      return false;
    }

    if (formData.username.trim().length < 3) {
      showPopup("error", "Username must be at least 3 characters");
      return false;
    }

    if (!formData.email.trim()) {
      showPopup("error", "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showPopup("error", "Enter a valid email address");
      return false;
    }

    if (!formData.password.trim()) {
      showPopup("error", "Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      showPopup("error", "Password must be at least 6 characters");
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      showPopup("error", "Password must include uppercase, lowercase and number");
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      showPopup("error", "Confirm password is required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showPopup("error", "Passwords do not match");
      return false;
    }

    return true;
  };
   


const handleGuestLogin = async (role) => {
  try {
    let credentials = {};

    if (role === "admin") {
      credentials = { username: "Fis", password: "Fis123" };
    } 
    else if (role === "owner") {
      credentials = { username: "nani", password: "nani123" };
    } 
    else {
      credentials = { username: "tharun", password: "tharun123" };
    }

    const res = await axiosInstance.post("login/", credentials);

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh || "");
    localStorage.setItem("username", res.data.username);
    localStorage.setItem("role", res.data.role);

    showPopup("success", "Guest Login Successful");

    setTimeout(() => {
      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (res.data.role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    }, 700);

  } catch (err) {
    showPopup("error", "Guest login failed");
  }
};






  const handleSubmit = async () => {
    if (loading) return;

    if (isLogin) {
      if (!validateLogin()) return;
    } else {
      if (!validateSignup()) return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        const res = await axiosInstance.post("login/", {
          username: formData.username,
          password: formData.password,
        });

        if (!res.data?.access) {
          showPopup("error", "Invalid login response");
          return;
        }

        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh || "");
        localStorage.setItem("username", res.data.username || formData.username);
        localStorage.setItem("role", res.data.role || "user");
        localStorage.setItem("remember_me", rememberMe ? "true" : "false");

        showPopup("success", "Login successful");

        const role = res.data.role;

        setTimeout(() => {
          if (role === "admin") {
            navigate("/admin-dashboard");
          } else if (role === "owner") {
            navigate("/owner-dashboard");
          } else {
            navigate("/");
          }
        }, 800);
      } else {
        await axiosInstance.post("register/", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        showPopup("success", "Registered successfully");
        resetForm();

        setTimeout(() => {
          setIsLogin(true);
        }, 700);
      }
    } catch (err) {
      console.log("ERROR:", err);
      const data = err.response?.data;

      if (data?.username) {
        showPopup("error", Array.isArray(data.username) ? data.username[0] : "Username already exists");
      } else if (data?.email) {
        showPopup("error", Array.isArray(data.email) ? data.email[0] : "Email already exists");
      } else if (data?.password) {
        showPopup("error", Array.isArray(data.password) ? data.password[0] : "Password error");
      } else if (data?.detail) {
        showPopup("error", data.detail);
      } else if (data?.error) {
        showPopup("error", data.error);
      } else {
        showPopup("error", "Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      {popup.show && (
        <div
          className={`${styles.popup} ${
            popup.type === "success" ? styles.popupSuccess : styles.popupError
          }`}
        >
          {popup.message}
        </div>
      )}

      <div className={styles.authWrapper}>
        <div className={styles.authContent}>
          <p className={styles.badge}>
            {isLogin ? "Welcome Back (Login 👇)" : "Create Your Account"}
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
                ? "Enter your username and password to continue"
                : "Create your account with a short signup form"}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
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
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div className={styles.optionsRow}>
              <label className={styles.rememberBox}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <span className={styles.forgotLink}>Forgot password?</span>
            </div>
          )}

          <button onClick={handleSubmit} className={styles.button} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>

          <div style={{marginTop:"10px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
  



<button
  onClick={() => handleClick("admin")}
  disabled={loadingRole === "admin"}
  style={{
    background: "linear-gradient(135deg, #d4af37, #f5d76e)",
    color: "#000",
    border: "2px solid #d4af37",
    borderRadius: "999px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    margin: "8px",
    boxShadow: "0 6px 14px rgba(212, 175, 55, 0.35)",
    transition: "all 0.3s ease",
    transform: "scale(1)",
    opacity: loadingRole === "admin" ? 0.7 : 1
  }}
>
  {loadingRole === "admin" ? "Submitting..." : "Admin Guest"}
</button>


<button
  onClick={() => handleClick("owner")}
  disabled={loadingRole === "owner"}
  style={{
    background: "linear-gradient(135deg, #d4af37, #f5d76e)",
    color: "#000",
    border: "2px solid #d4af37",
    borderRadius: "999px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    margin: "8px",
    boxShadow: "0 6px 14px rgba(212, 175, 55, 0.35)",
    transition: "all 0.3s ease",
    transform: "scale(1)",
    opacity: loadingRole === "owner" ? 0.7 : 1
  }}
>
  {loadingRole === "owner" ? "Submitting..." : "Owner Guest"}
</button>


<button
  onClick={() => handleClick("user")}
  disabled={loadingRole === "user"}
  style={{
    background: "linear-gradient(135deg, #d4af37, #f5d76e)",
    color: "#000",
    border: "2px solid #d4af37",
    borderRadius: "999px",
    padding: "12px 24px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    margin: "8px",
    boxShadow: "0 6px 14px rgba(212, 175, 55, 0.35)",
    transition: "all 0.3s ease",
    transform: "scale(1)",
    opacity: loadingRole === "user" ? 0.7 : 1
  }}
>
  {loadingRole === "user" ? "Submitting..." : "User Guest"}
</button>

</div>

          {roleType === "user" && (
            <p className={styles.switchText} onClick={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}>
              {isLogin ? "Create account?" : "Already have account?"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Auth;
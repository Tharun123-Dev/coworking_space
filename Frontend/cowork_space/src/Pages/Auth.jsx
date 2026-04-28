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

  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (roleType === "owner" || roleType === "admin" || roleType === "user") {
      setIsLogin(true);
    }
  }, [roleType]);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", phone: "", password: "", confirmPassword: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateLogin = () => {
    if (!formData.username.trim()) return showPopup("error", "Username is required"), false;
    if (!formData.password.trim()) return showPopup("error", "Password is required"), false;
    if (formData.password.length < 6) return showPopup("error", "Password must be at least 6 characters"), false;
    return true;
  };

  const validateSignup = () => {
    if (!formData.username.trim()) return showPopup("error", "Username is required"), false;
    if (formData.username.trim().length < 3) return showPopup("error", "Username must be at least 3 characters"), false;
    if (!formData.email.trim()) return showPopup("error", "Email is required"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return showPopup("error", "Enter a valid email address"), false;
    if (!formData.password.trim()) return showPopup("error", "Password is required"), false;
    if (formData.password.length < 6) return showPopup("error", "Password must be at least 6 characters"), false;
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) return showPopup("error", "Password must include uppercase, lowercase and number"), false;
    if (!formData.confirmPassword.trim()) return showPopup("error", "Confirm password is required"), false;
    if (formData.password !== formData.confirmPassword) return showPopup("error", "Passwords do not match"), false;
    return true;
  };

  const handleGuestLogin = async (role) => {
    const map = {
      admin: { username: "Fis", password: "Fis123" },
      owner: { username: "nani", password: "nani123" },
      user:  { username: "tharun", password: "tharun123" },
    };
    try {
      const res = await axiosInstance.post("login/", map[role]);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      showPopup("success", "Guest Login Successful");
      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin-dashboard");
        else if (res.data.role === "owner") navigate("/owner-dashboard");
        else navigate("/");
      }, 700);
    } catch {
      showPopup("error", "Guest login failed");
    }
  };

  const handleClick = async (role) => {
    setLoadingRole(role);
    await handleGuestLogin(role);
    setLoadingRole(null);
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (isLogin ? !validateLogin() : !validateSignup()) return;
    try {
      setLoading(true);
      if (isLogin) {
        const res = await axiosInstance.post("login/", {
          username: formData.username,
          password: formData.password,
        });
        if (!res.data?.access) return showPopup("error", "Invalid login response");
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh || "");
        localStorage.setItem("username", res.data.username || formData.username);
        localStorage.setItem("role", res.data.role || "user");
        localStorage.setItem("remember_me", rememberMe ? "true" : "false");
        showPopup("success", "Login successful");
        setTimeout(() => {
          const role = res.data.role;
          if (role === "admin") navigate("/admin-dashboard");
          else if (role === "owner") navigate("/owner-dashboard");
          else navigate("/");
        }, 800);
      } else {
        await axiosInstance.post("register/", {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        showPopup("success", "Registered successfully");
        resetForm();
        setTimeout(() => setIsLogin(true), 700);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) showPopup("error", Array.isArray(data.username) ? data.username[0] : "Username already exists");
      else if (data?.email) showPopup("error", Array.isArray(data.email) ? data.email[0] : "Email already exists");
      else if (data?.detail) showPopup("error", data.detail);
      else if (data?.error) showPopup("error", data.error);
      else showPopup("error", "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      {/* Popup */}
      {popup.show && (
        <div className={`${styles.popup} ${popup.type === "success" ? styles.popupSuccess : styles.popupError}`}>
          <span className={styles.popupIcon}>{popup.type === "success" ? "✓" : "✕"}</span>
          {popup.message}
        </div>
      )}

      <div className={styles.authWrapper}>

        {/* ── LEFT PANEL ── */}
        <div className={styles.leftPanel}>
          <div className={styles.brandMark}>
            <div className={styles.brandLogo}>CW</div>
            <span>CoWork Space</span>
          </div>
          <div className={styles.leftBody}>
            <h1 className={styles.leftTitle}>
              {isLogin ? "Welcome\nBack." : "Start Your\nJourney."}
            </h1>
            <p className={styles.leftSub}>
              {isLogin
                ? "Sign in to manage your workspace, bookings, and more."
                : "Create an account and explore modern workspaces."}
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}><span>✦</span> Secure Authentication</div>
              <div className={styles.featureItem}><span>✦</span> Manage Bookings Easily</div>
              <div className={styles.featureItem}><span>✦</span> Real-time Activity Feed</div>
              <div className={styles.featureItem}><span>✦</span> Works on all Devices</div>
            </div>
          </div>
          <div className={styles.leftDecor} aria-hidden="true">
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={styles.rightPanel}>
          {/* Tab toggle */}
          <div className={styles.tabRow}>
            <button
              className={`${styles.tab} ${isLogin ? styles.tabActive : ""}`}
              onClick={() => { setIsLogin(true); resetForm(); }}
            >Login</button>
            {roleType === "user" && (
              <button
                className={`${styles.tab} ${!isLogin ? styles.tabActive : ""}`}
                onClick={() => { setIsLogin(false); resetForm(); }}
              >Sign Up</button>
            )}
          </div>

          <p className={styles.formSub}>
            {isLogin ? "Enter your credentials to continue" : "Fill in the details below"}
          </p>

          {/* Form fields */}
          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Username</label>
              <input
                name="username"
                placeholder="your_username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                autoComplete="username"
              />
            </div>

            {!isLogin && (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Phone</label>
                  <input
                    name="phone"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.passwordWrap}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                    autoComplete="new-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className={styles.optionsRow}>
                <label className={styles.rememberBox}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <span className={styles.forgotLink}>Forgot password?</span>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button onClick={handleSubmit} className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? "Please wait…" : isLogin ? "Login" : "Create Account"}
          </button>

          {/* Divider */}
          <div className={styles.divider}><span>or try a guest account</span></div>

          {/* Guest buttons */}
          <div className={styles.guestRow}>
            {["admin", "owner", "user"].map((role) => (
              <button
                key={role}
                className={styles.guestBtn}
                onClick={() => handleClick(role)}
                disabled={loadingRole === role}
              >
                {loadingRole === role ? "…" : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {/* Switch link */}
          {roleType === "user" && (
            <p className={styles.switchText} onClick={() => { setIsLogin(!isLogin); resetForm(); }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span>{isLogin ? "Sign Up" : "Login"}</span>
            </p>
          )}
        </div>

      </div>
    </section>
  );
}

export default Auth;

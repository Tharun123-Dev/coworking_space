import { useState, useEffect, useRef } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const orbs = useRef([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (clientX - cx) / cx;
      const dy = (clientY - cy) / cy;
      orbs.current.forEach((orb, i) => {
        if (!orb) return;
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (roleType === "owner" || roleType === "admin" || roleType === "user") {
      setIsLogin(true);
    }
  }, [roleType]);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3500);
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

  const redirectAfterLogin = (role) => {
    if (role === "admin") { navigate("/admin-dashboard", { replace: true }); return; }
    if (role === "owner") { navigate("/owner-dashboard", { replace: true }); return; }
    const fromState = location.state;
    const fromPath = fromState?.from?.pathname
      ? fromState.from.pathname + (fromState.from.search || "") : "/";
    navigate(fromPath, {
      replace: true,
      state: {
        openBooking: fromState?.openBooking || false,
        workspaceId: fromState?.workspaceId || null,
        bookingMode: fromState?.bookingMode || "day",
      },
    });
  };

  const handleGuestLogin = async (role) => {
    const map = {
      admin: { username: "Fis", password: "Fis123" },
      owner: { username: "manager1", password: "manager1" },
      user:  { username: "Tharun", password: "Tharun123" },
    };
    try {
      const res = await axiosInstance.post("login/", map[role]);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user_location", res.data.location);
      showPopup("success", `Welcome, ${res.data.username}!`);
      setTimeout(() => redirectAfterLogin(res.data.role), 700);
    } catch {
      showPopup("error", "Guest login failed. Try again.");
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
        localStorage.setItem("user_location", res.data.location);
        localStorage.setItem("remember_me", rememberMe ? "true" : "false");
        showPopup("success", `Welcome back, ${res.data.username || formData.username}!`);
        setTimeout(() => redirectAfterLogin(res.data.role), 800);
      } else {
        await axiosInstance.post("register/", {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        showPopup("success", "Account created! Please login.");
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

  const handleClose = () => {
    navigate(-1);
  };

  const isOwnerOrAdmin = roleType === "owner" || roleType === "admin";

  const guestRoles = isOwnerOrAdmin
    ? [roleType]
    : ["admin", "owner", "user"];

  return (
    <section className={`${styles.authPage} ${mounted ? styles.mounted : ""}`}>
      {/* Animated Background Orbs */}
      <div className={styles.bgScene}>
        <div ref={el => orbs.current[0] = el} className={`${styles.orb} ${styles.orb1}`} />
        <div ref={el => orbs.current[1] = el} className={`${styles.orb} ${styles.orb2}`} />
        <div ref={el => orbs.current[2] = el} className={`${styles.orb} ${styles.orb3}`} />
        <div className={styles.gridLines} />
        <div className={styles.noiseTex} />
      </div>

      {/* Toast Popup */}
      {popup.show && (
        <div className={`${styles.toast} ${popup.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span className={styles.toastIcon}>{popup.type === "success" ? "✦" : "✕"}</span>
          <span>{popup.message}</span>
        </div>
      )}

      <div className={`${styles.card} ${!isLogin ? styles.cardExpanded : ""}`}>

        {/* ─── CLOSE BUTTON ─── */}
        <button
          type="button"
          className={styles.closeAuthBtn}
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ─── LEFT PANEL ─── */}
        <div className={styles.leftPanel}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <span>CW</span>
              <div className={styles.logoRing} />
            </div>
            <span className={styles.brandName}>CoWork Space</span>
          </div>

          <div className={styles.leftContent}>
            <h1 className={styles.leftTitle}>
              {isLogin
                ? <><span className={styles.titleLine1}>Welcome</span><span className={styles.titleLine2}>Back.</span></>
                : <><span className={styles.titleLine1}>Start Your</span><span className={styles.titleLine2}>Journey.</span></>
              }
            </h1>
            <p className={styles.leftDesc}>
              {isLogin
                ? "Sign in to manage your workspace, bookings, and team — all in one place."
                : "Join thousands of professionals in next-gen collaborative workspaces."}
            </p>

            <ul className={styles.featureList}>
              {["Secure & Encrypted Auth", "Smart Booking System", "Real-time Notifications", "Works on all Devices"].map((f, i) => (
                <li key={i} className={styles.featureItem} style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                  <span className={styles.featureDot} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.leftGlow} />
          <div className={styles.leftDecorCircle1} />
          <div className={styles.leftDecorCircle2} />
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className={styles.rightPanel}>

          {/* Tab row — only show Sign Up tab for users */}
          <div className={styles.tabs}>
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
            <div
              className={styles.tabIndicator}
              style={roleType === "user"
                ? { left: isLogin ? "4px" : "50%", width: "calc(50% - 4px)" }
                : { left: "4px", width: "calc(100% - 8px)" }
              }
            />
          </div>

          <p className={styles.formSub}>
            {isLogin ? "Enter your credentials to continue" : "Fill in your details below"}
          </p>

          {/* ─── FORM FIELDS ─── */}
          <div className={styles.fields}>

            {/* Login: single column | Signup: 2-col grid */}
            <div className={`${styles.fieldGrid} ${!isLogin ? styles.fieldGridTwo : ""}`}>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Username</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input
                    name="username"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.input}
                    autoComplete="username"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Phone</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6.29 6.29l1.45-1.45a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <input
                      name="phone"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
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
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
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
                      {showConfirmPassword
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isLogin && (
              <div className={styles.optionsRow}>
                <label className={styles.rememberLabel}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={styles.checkbox} />
                  <span className={styles.checkmark} />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button onClick={handleSubmit} className={styles.submitBtn} disabled={loading}>
            <span className={styles.btnText}>
              {loading
                ? <><span className={styles.spinner} /> Please wait…</>
                : isLogin ? "Sign In →" : "Create Account →"
              }
            </span>
            <span className={styles.btnGlow} />
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or try a guest account</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Guest Buttons */}
          <div className={styles.guestRow}>
            {guestRoles.map((role) => (
              <button
                key={role}
                className={`${styles.guestBtn} ${styles[`guest_${role}`]}`}
                onClick={() => handleClick(role)}
                disabled={loadingRole === role}
              >
                <span className={styles.guestIcon}>
                  {role === "admin" ? "⚙" : role === "owner" ? "🏢" : "👤"}
                </span>
                <span>{loadingRole === role ? "Loading…" : role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Switch link — only for users */}
          {roleType === "user" && (
            <p className={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => { setIsLogin(!isLogin); resetForm(); }}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Auth;

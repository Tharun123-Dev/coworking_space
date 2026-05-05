import { useState, useRef, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/ForgotPassword.module.css";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [done, setDone] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const checkPasswordStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
  };

  // OTP box handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSendOtp = async () => {
    setError("");
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post("forgot-password/", { email });
      setSuccess(res.data.message || "OTP sent to your email!");
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || "No account found with this email");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setError("Please enter the complete 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post("verify-otp/", { email, otp: otpStr });
      setSuccess(res.data.message || "OTP verified!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post("forgot-password/", { email });
      setSuccess("New OTP sent!");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post("reset-password/", { email, password });
      setSuccess(res.data.message || "Password reset successfully!");
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#e74c3c", "#e67e22", "#f39c12", "#16a34a"];

  const steps = ["Email", "Verify OTP", "New Password"];

  return (
    <div className={styles.page}>
      {/* Background orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.gridLines}></div>

      <div className={styles.card}>
        {/* Corner accents */}
        <span className={`${styles.corner} ${styles.cornerTL}`}></span>
        <span className={`${styles.corner} ${styles.cornerTR}`}></span>
        <span className={`${styles.corner} ${styles.cornerBL}`}></span>
        <span className={`${styles.corner} ${styles.cornerBR}`}></span>

        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span>CoWork</span>
        </div>

        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.subtitle}>
          {step === 1 && "Enter your email to receive a verification code"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && !done && "Create a new secure password"}
          {done && "Your password has been updated"}
        </p>

        {/* Step Indicator */}
        {!done && (
          <div className={styles.stepRow}>
            {steps.map((label, i) => (
              <div key={i} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepActive : styles.stepPending}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`${styles.stepLabel} ${step === i + 1 ? styles.stepLabelActive : ""}`}>{label}</span>
                {i < 2 && <div className={`${styles.stepLine} ${step > i + 1 ? styles.stepLineDone : ""}`}></div>}
              </div>
            ))}
          </div>
        )}

        <div className={styles.formDivider}></div>

        {/* Error / Success banners */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
        )}
        {success && step > 1 && (
          <div className={styles.successBanner}>
            <span>✓</span> {success}
          </div>
        )}

        {/* ===== DONE STATE ===== */}
        {done && (
          <div className={styles.doneState}>
            <div className={styles.doneRing}>
              <div className={styles.doneIconWrap}>✓</div>
            </div>
            <p>You can now log in with your new password.</p>
            <a href="/auth" className={styles.loginBtn}>
              <span>Go to Login</span>
              <span>→</span>
            </a>
          </div>
        )}

        {/* ===== STEP 1: EMAIL ===== */}
        {step === 1 && (
          <div className={styles.formBody}>
            <div className={styles.inputGroup}>
              <label htmlFor="fp-email">Email Address</label>
              <div className={`${styles.inputWrap} ${error && !emailValid ? styles.inputError : email && emailValid ? styles.inputValid : ""}`}>
                <span className={styles.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailValid(validateEmail(e.target.value));
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoFocus
                />
                {emailValid && <span className={styles.inputCheck}>✓</span>}
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={handleSendOtp} disabled={loading || !email}>
              {loading ? <span className={styles.spinner}></span> : null}
              <span>{loading ? "Sending..." : "Send Verification Code"}</span>
              {!loading && <span>→</span>}
            </button>

            <p className={styles.footNote}>
              <a href="/login">← Back to Login</a>
            </p>
          </div>
        )}

        {/* ===== STEP 2: OTP ===== */}
        {step === 2 && (
          <div className={styles.formBody}>
            <p className={styles.otpHint}>
              Code sent to <strong>{email}</strong>
              <button className={styles.changeEmail} onClick={() => { setStep(1); setError(""); setSuccess(""); }}>Change</button>
            </p>

            <div className={styles.otpRow} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className={`${styles.otpBox} ${digit ? styles.otpFilled : ""} ${error ? styles.otpError : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? <span className={styles.spinner}></span> : null}
              <span>{loading ? "Verifying..." : "Verify Code"}</span>
              {!loading && <span>→</span>}
            </button>

            <p className={styles.resendRow}>
              Didn't receive it?{" "}
              <button
                className={`${styles.resendBtn} ${resendTimer > 0 ? styles.resendDisabled : ""}`}
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </p>
          </div>
        )}

        {/* ===== STEP 3: RESET PASSWORD ===== */}
        {step === 3 && !done && (
          <div className={styles.formBody}>
            <div className={styles.inputGroup}>
              <label htmlFor="fp-pass">New Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="fp-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                    setError("");
                  }}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBars}>
                    {[1,2,3,4].map(i => (
                      <div key={i} className={styles.strengthBar} style={{ background: passwordStrength >= i ? strengthColors[passwordStrength] : "rgba(166,124,40,0.12)" }}></div>
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strengthColors[passwordStrength] }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="fp-confirm">Confirm Password</label>
              <div className={`${styles.inputWrap} ${confirmPassword && password !== confirmPassword ? styles.inputError : confirmPassword && password === confirmPassword ? styles.inputValid : ""}`}>
                <span className={styles.inputIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <input
                  id="fp-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "🙈" : "👁"}
                </button>
                {confirmPassword && password === confirmPassword && <span className={styles.inputCheck} style={{right: "36px"}}>✓</span>}
              </div>
            </div>

            <div className={styles.passwordRules}>
              {[
                { rule: password.length >= 8, label: "At least 8 characters" },
                { rule: /[A-Z]/.test(password), label: "One uppercase letter" },
                { rule: /[0-9]/.test(password), label: "One number" },
                { rule: /[^A-Za-z0-9]/.test(password), label: "One special character" },
              ].map(({ rule, label }, i) => (
                <span key={i} className={`${styles.rule} ${rule ? styles.ruleMet : ""}`}>
                  {rule ? "✓" : "○"} {label}
                </span>
              ))}
            </div>

            <button
              className={styles.primaryBtn}
              onClick={handleResetPassword}
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? <span className={styles.spinner}></span> : null}
              <span>{loading ? "Resetting..." : "Reset Password"}</span>
              {!loading && <span>→</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

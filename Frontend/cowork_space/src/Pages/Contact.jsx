import { useNavigate } from "react-router-dom";
import "../Styles/Contact.css";
 

function Contact() {
  const navigate = useNavigate();
  return (
    <div className="contact-container">

      {/* LOGO */}
      <h1 className="logo">CoWork</h1>

      {/* TITLE */}
      <h2 className="main-title">
        Please enter your contact details to get started
      </h2>

      <p className="subtitle">
        We will solely use this information to contact you about our products and services.
      </p>

      {/* FORM */}
      <div className="form-card">

        {/* EMAIL */}
        <div className="input-box">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" />
        </div>

        {/* PHONE */}
        <div className="phone-box">
          <div className="flag">🇮🇳</div>
          <span className="code">(+91)</span>
          <input type="text" placeholder="Phone number" />
        </div>

        {/* PRIVACY */}
        <p className="privacy">
          By submitting this form you agree to our <span>Privacy Policy</span>
        </p>

        {/* BUTTON */}
         <button
      className="submit-btn"
      onClick={() => navigate("/")}
    >
      Get Started →
    </button>
      </div>

    </div>
  );
}

export default Contact;
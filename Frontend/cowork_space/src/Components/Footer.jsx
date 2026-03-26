import styles from "../Styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      {/*  Background Pattern */}
      <div className={styles.bgPattern}></div>
      
      {/*  Main Content */}
      <div className={styles.container}>
        {/* Logo & Co-working Description */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
           <h1 style={{ color: "#f97316" }}>Co Work</h1>
            <div className={styles.logoGlow}></div>
          </div>
          <p>Premium co-working spaces across 50+ cities in India. Flexible daily passes, monthly desks & meeting rooms for freelancers, startups & enterprises.</p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener" className={styles.icon} title="Facebook">
              <span>📘</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.icon} title="Instagram">
              <span>📷</span>
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener" className={styles.icon} title="WhatsApp">
              <span>💬</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" className={styles.icon} title="LinkedIn">
              <span>💼</span>
            </a>
          </div>
        </div>

        {/* Co-working Cities */}
        <div className={styles.linkSection}>
          <h4>Our Cities</h4>
          <ul>
            <li><a href="#">Hyderabad</a></li>
            <li><a href="#">Bangalore</a></li>
            <li><a href="#">Mumbai</a></li>
            <li><a href="#">Delhi NCR</a></li>
            <li><a href="#">Chennai</a></li>
          </ul>
        </div>

        {/*  Services */}
        <div className={styles.linkSection}>
          <h4>Services</h4>
          <ul>
            <li><a href="#">Hot Desk</a></li>
            <li><a href="#">Dedicated Desk</a></li>
            <li><a href="#">Private Office</a></li>
            <li><a href="#">Meeting Rooms</a></li>
            <li><a href="#">Virtual Office</a></li>
          </ul>
        </div>

        {/*  Company */}
        <div className={styles.linkSection}>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.contactSection}>
          <h4>Get In Touch</h4>
          <ul>
            <li>📍 Hyderabad, Telangana 500001</li>
            <li>📞 +91 98765 43210</li>
            <li>✉️ hello@cowork.co</li>
            <li>🕒 Mon-Sat 9AM-10PM</li>
          </ul>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>&copy; 2026 WorkHub Co-working Spaces Pvt Ltd. All rights reserved. GST: 36ABCDE1234F1Z5</p>
          <div className={styles.privacyLinks}>
            <a href="#">Privacy Policy</a> | 
            <a href="#">Terms of Service</a> | 
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

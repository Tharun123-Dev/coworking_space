import styles from "../Styles/Footer.module.css";
import Reveal from "../Pages/Reveal";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedinIn } from "react-icons/fa";
function Footer() {
  return (
    <footer className={styles.footer}>
      <Reveal>
        {/* Background pattern / gradient shade */}
        <div className={styles.bgPattern}></div>

        {/* Main content grid */}
        <div className={styles.container}>
          {/* Logo & tagline */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <Reveal>
                <h1 className={styles.logoText}>Co Work</h1>
              </Reveal>
              <div className={`${styles.logoGlow} ${styles.logoGlowLeft}`}></div>
              <div className={`${styles.logoGlow} ${styles.logoGlowRight}`}></div>
            </div>

            <Reveal>
              <p className={styles.tagline}>
                Premium co‑working spaces across 50+ cities in India. Flexible daily passes,
                monthly desks & meeting rooms for freelancers, startups & enterprises.
              </p>
            </Reveal>

            <Reveal>
              <p className={styles.smallPrint}>
                Secure, modern, and designed for productivity.
              </p>
            </Reveal>
{/* Social icons */}
<div className={styles.socialIcons}>
  <a
    href="https://www.facebook.com/"
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.icon} ${styles.iconHover}`}
    title="Facebook"
  >
    <FaFacebookF className={styles.iconInner} />
  </a>

  <a
    href="https://www.instagram.com/tharun_naniiii/"
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.icon} ${styles.iconHover}`}
    title="Instagram"
  >
    <FaInstagram className={styles.iconInner} />
  </a>

  <a
    href="https://wa.me/916309383826"
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.icon} ${styles.iconHover}`}
    title="WhatsApp"
  >
    <FaWhatsapp className={styles.iconInner} />
  </a>

  <a
    href="https://www.linkedin.com/in/tharun9949/"
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.icon} ${styles.iconHover}`}
    title="LinkedIn"
  >
    <FaLinkedinIn className={styles.iconInner} />
  </a>
</div>
</div>

          {/* Our Cities */}
          <div className={styles.linkSection}>
            <Reveal>
              <h4 className={styles.secTitle}>Our Cities</h4>
            </Reveal>
            <ul className={styles.linkList}>
              <Reveal>
                <li>
                  <a href="#" className={styles.link}>Hyderabad</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Bangalore</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Mumbai</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Delhi NCR</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Chennai</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Pune</a>
                </li>
              </Reveal>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.linkSection}>
            <Reveal>
              <h4 className={styles.secTitle}>Services</h4>
            </Reveal>
            <ul className={styles.linkList}>
              <Reveal>
                <li>
                  <a href="#" className={styles.link}>Hot Desk</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Dedicated Desk</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Private Office</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Meeting Rooms</a>
                </li>
                <li>
                  <a href="#" className={styles.link}>Virtual Office</a>
                </li>
              </Reveal>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.linkSection}>
            <Reveal>
              <h4 className={styles.secTitle}>Company</h4>
            </Reveal>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>About Us</a>
              </li>
              <li>
                <a href="#" className={styles.link}>Careers</a>
              </li>
              <li>
                <a href="#" className={styles.link}>Blog</a>
              </li>
              <li>
                <a href="#" className={styles.link}>Press</a>
              </li>
              <li>
                <a href="#" className={styles.link}>Partners</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactSection}>
            <Reveal>
              <h4 className={styles.secTitle}>Get In Touch</h4>
            </Reveal>
            <ul className={styles.contactList}>
              <Reveal>
                <li>
                  <span className={styles.contactIcon}>📍</span> Hyderabad, Telangana 500001
                </li>
                <li>
                  <span className={styles.contactIcon}>📞</span> +91 98765 43210
                </li>
                <li>
                  <span className={styles.contactIcon}>✉️</span> hello@cowork.co
                </li>
                <li>
                  <span className={styles.contactIcon}>🕒</span> Mon–Sat 9 AM–10 PM
                </li>
              </Reveal>
            </ul>

            <Reveal>
              <button className={styles.ctaButton}>Book a Tour</button>
            </Reveal>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomContainer}>
            <Reveal>
              <p className={styles.copyright}>
                &copy; 2026 WorkHub Co‑working Spaces Pvt Ltd. All rights reserved. GST: 36ABCDE1234F1Z5
              </p>
            </Reveal>

            <div className={styles.privacyLinks}>
              <a href="#" className={styles.privacyLink}>Privacy Policy</a>
              <span> | </span>
              <a href="#" className={styles.privacyLink}>Terms of Service</a>
              <span> | </span>
              <a href="#" className={styles.privacyLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}

export default Footer;
import styles from "../Styles/Footer.module.css";
import Reveal from "../Pages/Reveal";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  const handleBookTour = () => {
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleHomeLinkClick = (e) => {
    e.preventDefault();
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className={styles.footer}>
      <Reveal>
        <div className={styles.bgPattern}></div>

        <div className={styles.container}>
          {/* Left */}
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

          {/* Center */}
          <div className={styles.middleWrapper}>
            <div className={styles.linkSection}>
              <Reveal>
                <h4 className={styles.secTitle}>Our Cities</h4>
              </Reveal>
              <ul className={styles.linkList}>
                <Reveal>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Hyderabad</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Bangalore</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Mumbai</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Delhi NCR</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Chennai</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Pune</a></li>
                </Reveal>
              </ul>
            </div>

            <div className={styles.linkSection}>
              <Reveal>
                <h4 className={styles.secTitle}>Services</h4>
              </Reveal>
              <ul className={styles.linkList}>
                <Reveal>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Hot Desk</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Dedicated Desk</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Private Office</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Meeting Rooms</a></li>
                  <li><a href="/" onClick={handleHomeLinkClick} className={styles.link}>Virtual Office</a></li>
                </Reveal>
              </ul>
            </div>

            <div className={styles.linkSection}>
              <Reveal>
                <h4 className={styles.secTitle}>Company</h4>
              </Reveal>
<ul
  className={styles.linkList}
  style={{ margin: 0, padding: 0, listStyle: "none" }}
>
  <li style={{ margin: "-2px 0", lineHeight: "1.2" }}>
    <a href="/" onClick={handleHomeLinkClick} className={styles.link}>About Us</a>
  </li>
  <li style={{ margin: "-2px 0", lineHeight: "1.2" }}>
    <a href="/" onClick={handleHomeLinkClick} className={styles.link}>Careers</a>
  </li>
  <li style={{ margin: "-2px 0", lineHeight: "1.2" }}>
    <a href="/" onClick={handleHomeLinkClick} className={styles.link}>Blog</a>
  </li>
  <li style={{ margin: "-2px 0", lineHeight: "1.2" }}>
    <a href="/" onClick={handleHomeLinkClick} className={styles.link}>Press</a>
  </li>
  <li style={{ margin: "-2px 0", lineHeight: "1.2" }}>
    <a href="/" onClick={handleHomeLinkClick} className={styles.link}>Partners</a>
  </li>
</ul>
            </div>
          </div>

          {/* Right */}
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
                  <span className={styles.contactIcon}>✉️</span>{" "}
                  <a href="mailto:hello@cowork.co">hello@cowork.co</a>
                </li>
                <li>
                  <span className={styles.contactIcon}>🕒</span> Mon–Sat 9 AM–10 PM
                </li>
              </Reveal>
            </ul>

            <Reveal>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={handleBookTour}
              >
                Book a Tour
              </button>
            </Reveal>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomContainer}>
            <Reveal>
              <p className={styles.copyright}>
                © 2026 WorkHub Co‑working Spaces Pvt Ltd. All rights reserved. GST: 36ABCDE1234F1Z5
              </p>
            </Reveal>

            <div className={styles.privacyLinks}>
              <a href="/" onClick={handleHomeLinkClick} className={styles.privacyLink}>Privacy Policy</a>
              <span> | </span>
              <a href="/" onClick={handleHomeLinkClick} className={styles.privacyLink}>Terms of Service</a>
              <span> | </span>
              <a href="/" onClick={handleHomeLinkClick} className={styles.privacyLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}

export default Footer;
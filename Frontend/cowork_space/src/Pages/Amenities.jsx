import React from "react";
import styles from "../Styles/Amenities.module.css";
import {
  FaWifi,
  FaShieldAlt,
  FaParking,
  FaUsers,
  FaVideo,
  FaPhone,
  FaLock,
  FaServer,
  FaNetworkWired,
  FaDesktop,
  FaIdCard,
  FaPlug,
  FaHeadset,
  FaUserShield,
  FaFileAlt,
  FaDoorOpen,
} from "react-icons/fa";

const amenities = [
  { icon: <FaDoorOpen />, text: "24x7 Access" },
  { icon: <FaPlug />, text: "Air Conditioning" },
  { icon: <FaIdCard />, text: "Front Desk" },
  { icon: <FaServer />, text: "IT Services" },
  { icon: <FaWifi />, text: "Unlimited Internet" },
  { icon: <FaShieldAlt />, text: "Firewall" },
  { icon: <FaNetworkWired />, text: "Structured Network" },
  { icon: <FaNetworkWired />, text: "Managed VLAN" },
  { icon: <FaPlug />, text: "Switches & Routers" },
  { icon: <FaServer />, text: "Rack Spaces" },
  { icon: <FaHeadset />, text: "IT Support" },
  { icon: <FaUsers />, text: "Meeting Rooms" },
  { icon: <FaDesktop />, text: "Projectors / Display" },
  { icon: <FaLock />, text: "Access Control" },
  { icon: <FaPhone />, text: "IP Phones" },
  { icon: <FaFileAlt />, text: "Documentation Area" },
  { icon: <FaUsers />, text: "Social Hub" },
  { icon: <FaParking />, text: "Parking" },
  { icon: <FaUserShield />, text: "24x7 Security" },
  { icon: <FaVideo />, text: "24x7 CCTV" },
];

function Amenities() {
  return (
    <section className={styles.container}>
      <div className={styles.top}>
        <div className={styles.logoBadge}>CW</div>
        <h1 className={styles.title}>Business Amenities</h1>
        <p className={styles.subtitle}>Secure · Connected · Premium</p>
      </div>

      <div className={styles.grid}>
        {amenities.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.iconWrap}>
              <div className={styles.icon}>{item.icon}</div>
            </div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Amenities;
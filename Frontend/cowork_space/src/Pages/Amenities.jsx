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
  { icon: <FaDoorOpen />, text: "24x7 Access To Office" },
  { icon: <FaPlug />, text: "24/7 Air Conditioning" },
  { icon: <FaIdCard />, text: "Front Desk" },
  { icon: <FaServer />, text: "Comprehensive IT Services" },
  { icon: <FaWifi />, text: "Unlimited Data & Internet" },
  { icon: <FaShieldAlt />, text: "Firewall" },

  { icon: <FaNetworkWired />, text: "Structured Networking" },
  { icon: <FaNetworkWired />, text: "Managed VLAN's" },
  { icon: <FaPlug />, text: "Switches & Routers" },
  { icon: <FaServer />, text: "Dedicated Rack Spaces" },
  { icon: <FaHeadset />, text: "Extensive IT Solutions" },
  { icon: <FaUsers />, text: "Meeting Rooms" },

  { icon: <FaDesktop />, text: "Projectors / Display" },
  { icon: <FaLock />, text: "Door Access Control System" },
  { icon: <FaPhone />, text: "IP Phones" },
  { icon: <FaFileAlt />, text: "Documentation Area" },
//   { icon: <FaHandshake />, text: "Business Support Services" },
  { icon: <FaUsers />, text: "Social Hub" },

  { icon: <FaParking />, text: "Parking" },
  { icon: <FaUserShield />, text: "24x7 Security" },
  { icon: <FaVideo />, text: "24x7 CCTV" },
];

function Amenities() {
  return (
    <div className={styles.container}>
      <h1>Business Amenities</h1>

      <div className={styles.grid}>
        {amenities.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{item.icon}</div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Amenities;
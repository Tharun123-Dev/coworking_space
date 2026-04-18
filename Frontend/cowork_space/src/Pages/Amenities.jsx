// import React from "react";
// import styles from "../Styles/Amenities.module.css";
// import {
//   FaWifi,
//   FaShieldAlt,
//   FaParking,
//   FaUsers,
//   FaVideo,
//   FaPhone,
//   FaLock,
//   FaServer,
//   FaNetworkWired,
//   FaDesktop,
//   FaIdCard,
//   FaPlug,
//   FaHeadset,
//   FaUserShield,
//   FaFileAlt,
//   FaDoorOpen,
// } from "react-icons/fa";

// const amenities = [
//   { icon: <FaDoorOpen />, text: "24x7 Access" },
//   { icon: <FaPlug />, text: "Air Conditioning" },
//   { icon: <FaIdCard />, text: "Front Desk" },
//   { icon: <FaServer />, text: "IT Services" },
//   { icon: <FaWifi />, text: "Unlimited Internet" },
//   { icon: <FaShieldAlt />, text: "Firewall" },
//   { icon: <FaNetworkWired />, text: "Structured Network" },
//   { icon: <FaNetworkWired />, text: "Managed VLAN" },
//   { icon: <FaPlug />, text: "Switches & Routers" },
//   { icon: <FaServer />, text: "Rack Spaces" },
//   { icon: <FaHeadset />, text: "IT Support" },
//   { icon: <FaUsers />, text: "Meeting Rooms" },
//   { icon: <FaDesktop />, text: "Projectors / Display" },
//   { icon: <FaLock />, text: "Access Control" },
//   { icon: <FaPhone />, text: "IP Phones" },
//   { icon: <FaFileAlt />, text: "Documentation Area" },
//   { icon: <FaUsers />, text: "Social Hub" },
//   { icon: <FaParking />, text: "Parking" },
//   { icon: <FaUserShield />, text: "24x7 Security" },
//   { icon: <FaVideo />, text: "24x7 CCTV" },
// ];

// function Amenities() {
//   return (
//     <section className={styles.container}>
//       <div className={styles.top}>
//         <div className={styles.logoBadge}>CW</div>
//         <h1 className={styles.title}>Business Amenities</h1>
//         <p className={styles.subtitle}>Secure · Connected · Premium</p>
//       </div>

//       <div className={styles.grid}>
//         {amenities.map((item, index) => (
//           <div key={index} className={styles.card}>
//             <div className={styles.iconWrap}>
//               <div className={styles.icon}>{item.icon}</div>
//             </div>
//             <p>{item.text}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// export default Amenities;
import React, { useState } from "react";
import styles from "../Styles/Amenities.module.css";
import {
  FaWifi, FaShieldAlt, FaParking, FaUsers, FaVideo,
  FaPhone, FaLock, FaServer, FaNetworkWired, FaDesktop,
  FaIdCard, FaPlug, FaHeadset, FaUserShield, FaFileAlt, FaDoorOpen,
} from "react-icons/fa";

/* ─── All 20 amenities pinned on the image (x/y = % position) ─── */
const imageTags = [
  { icon: <FaDoorOpen />,     text: "24x7 Access",          x: 8,  y: 14 },
  { icon: <FaPlug />,         text: "Air Conditioning",     x: 26, y: 10 },
  { icon: <FaIdCard />,       text: "Front Desk",           x: 46, y: 7  },
  { icon: <FaServer />,       text: "IT Services",          x: 65, y: 12 },
  { icon: <FaWifi />,         text: "Unlimited Internet",   x: 82, y: 8  },
  { icon: <FaShieldAlt />,    text: "Firewall",             x: 91, y: 28 },
  { icon: <FaNetworkWired />, text: "Structured Network",   x: 85, y: 48 },
  { icon: <FaNetworkWired />, text: "Managed VLAN",         x: 78, y: 65 },
  { icon: <FaPlug />,         text: "Switches & Routers",   x: 62, y: 74 },
  { icon: <FaServer />,       text: "Rack Spaces",          x: 44, y: 80 },
  { icon: <FaHeadset />,      text: "IT Support",           x: 26, y: 75 },
  { icon: <FaUsers />,        text: "Meeting Rooms",        x: 10, y: 68 },
  { icon: <FaDesktop />,      text: "Projectors / Display", x: 5,  y: 50 },
  { icon: <FaLock />,         text: "Access Control",       x: 6,  y: 32 },
  { icon: <FaPhone />,        text: "IP Phones",            x: 18, y: 26 },
  { icon: <FaFileAlt />,      text: "Documentation",        x: 36, y: 30 },
  { icon: <FaUsers />,        text: "Social Hub",           x: 55, y: 35 },
  { icon: <FaParking />,      text: "Parking",              x: 70, y: 32 },
  { icon: <FaUserShield />,   text: "24x7 Security",        x: 38, y: 58 },
  { icon: <FaVideo />,        text: "24x7 CCTV",            x: 56, y: 55 },
];

/* ─── Same list for the bottom grid ─── */
const amenities = [
  { icon: <FaDoorOpen />,     text: "24x7 Access"          },
  { icon: <FaPlug />,         text: "Air Conditioning"      },
  { icon: <FaIdCard />,       text: "Front Desk"            },
  { icon: <FaServer />,       text: "IT Services"           },
  { icon: <FaWifi />,         text: "Unlimited Internet"    },
  { icon: <FaShieldAlt />,    text: "Firewall"              },
  { icon: <FaNetworkWired />, text: "Structured Network"    },
  { icon: <FaNetworkWired />, text: "Managed VLAN"          },
  { icon: <FaPlug />,         text: "Switches & Routers"    },
  { icon: <FaServer />,       text: "Rack Spaces"           },
  { icon: <FaHeadset />,      text: "IT Support"            },
  { icon: <FaUsers />,        text: "Meeting Rooms"         },
  { icon: <FaDesktop />,      text: "Projectors / Display"  },
  { icon: <FaLock />,         text: "Access Control"        },
  { icon: <FaPhone />,        text: "IP Phones"             },
  { icon: <FaFileAlt />,      text: "Documentation Area"    },
  { icon: <FaUsers />,        text: "Social Hub"            },
  { icon: <FaParking />,      text: "Parking"               },
  { icon: <FaUserShield />,   text: "24x7 Security"         },
  { icon: <FaVideo />,        text: "24x7 CCTV"             },
];

export default function Amenities() {
  const [activeTag, setActiveTag] = useState(null);

  return (
    <section className={styles.section}>

      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>WorkNest · Facilities</span>
          <h1 className={styles.title}>
            <em>Business</em> Amenities
          </h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.pill}>
            <span className={styles.pillDot} />
            20 Premium Features
          </div>
          <p className={styles.tagline}>Secure · Connected · Premium</p>
        </div>
      </div>

      {/* ── Tagged Hero Image ── */}
      <div className={styles.imageWrap}>
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=95"
          alt="Premium workspace interior"
          className={styles.heroImg}
        />

        {/* Dark vignette edges */}
        <div className={styles.gradTop} />
        <div className={styles.gradBottom} />
        <div className={styles.gradLeft} />
        <div className={styles.gradRight} />

        {/* ── All 20 tags — always visible with name ── */}
        {imageTags.map((tag, i) => (
          <div
            key={i}
            className={`${styles.tag} ${activeTag === i ? styles.tagActive : ""}`}
            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
            onMouseEnter={() => setActiveTag(i)}
            onMouseLeave={() => setActiveTag(null)}
          >
            {/* Pulse ring */}
            <span className={styles.tagRing} style={{ animationDelay: `${i * 0.18}s` }} />

            {/* Icon dot */}
            <span className={styles.tagDot}>
              <span className={styles.tagIcon}>{tag.icon}</span>
            </span>

            {/* Name chip — always shown */}
            <span className={styles.tagChip}>
              {tag.text}
            </span>
          </div>
        ))}

        {/* Caption bar */}
        <div className={styles.imgCaption}>
          <span className={styles.captionLoc}>📍 WorkNest HQ, Hyderabad</span>
          <span className={styles.captionHint}>All amenities tagged</span>
        </div>
      </div>

      {/* ── Grid divider label ── */}
      <div className={styles.gridHeader}>
        <div className={styles.gridLine} />
        <span className={styles.gridLabel}>All Amenities</span>
        <div className={styles.gridLine} />
      </div>

      {/* ── Amenities Card Grid ── */}
      <div className={styles.grid}>
        {amenities.map((item, i) => (
          <div
            key={i}
            className={styles.card}
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <div className={styles.iconWrap}>
              <span className={styles.cardIcon}>{item.icon}</span>
            </div>
            <p className={styles.label}>{item.text}</p>
          </div>
        ))}
      </div>

    </section>
  );
}


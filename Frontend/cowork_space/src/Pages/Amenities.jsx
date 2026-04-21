import React, { useState } from "react";
import styles from "../Styles/Amenities.module.css";
import {
  FaWifi, FaShieldAlt, FaParking, FaUsers, FaVideo,
  FaPhone, FaLock, FaServer, FaNetworkWired, FaDesktop,
  FaIdCard, FaPlug, FaHeadset, FaUserShield, FaFileAlt, FaDoorOpen,
} from "react-icons/fa";

/* ─── 10 tags with their own preview images ─── */
const imageTags = [
  {
    icon: <FaDoorOpen />,
    text: "24x7 Access",
    x: 8, y: 14,
    preview: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=85",
  },
  {
    icon: <FaIdCard />,
    text: "Front Desk",
    x: 26, y: 10,
    preview: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=85",
  },
  {
    icon: <FaServer />,
    text: "IT Services",
    x: 46, y: 7,
    preview: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=85",
  },
  {
    icon: <FaWifi />,
    text: "Unlimited Internet",
    x: 65, y: 12,
    preview: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=85",
  },
  {
    icon: <FaUsers />,
    text: "Meeting Rooms",
    x: 82, y: 8,
    preview: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&q=85",
  },
  {
    icon: <FaParking />,
    text: "Parking",
    x: 91, y: 38,
    preview: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=85",
  },
  {
    icon: <FaVideo />,
    text: "24x7 CCTV",
    x: 82, y: 65,
    preview: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=85",
  },
  {
    icon: <FaUserShield />,
    text: "24x7 Security",
    x: 55, y: 75,
    preview: "https://images.unsplash.com/photo-1521790361543-f645cf042ec4?w=400&q=85",
  },
  {
    icon: <FaDesktop />,
    text: "Projectors / Display",
    x: 26, y: 72,
    preview: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=85",
  },
  {
    icon: <FaLock />,
    text: "Access Control",
    x: 8, y: 48,
    preview: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=85",
  },
];

/* ─── All 20 amenities for the bottom grid ─── */
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

        {/* Edge gradients */}
        <div className={styles.gradTop} />
        <div className={styles.gradBottom} />
        <div className={styles.gradLeft} />
        <div className={styles.gradRight} />

        {/* ── 10 Tags with image previews ── */}
        {imageTags.map((tag, i) => {
          const isActive = activeTag === i;
          /* decide tooltip direction — tags near right edge flip left */
          const flipLeft = tag.x > 60;
          const flipUp   = tag.y > 55;

          return (
            <div
              key={i}
              className={`${styles.tag} ${isActive ? styles.tagActive : ""}`}
              style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
              onMouseEnter={() => setActiveTag(i)}
              onMouseLeave={() => setActiveTag(null)}
            >
              {/* Pulse ring */}
              <span
                className={styles.tagRing}
                style={{ animationDelay: `${i * 0.18}s` }}
              />

              {/* Icon dot */}
              <span className={styles.tagDot}>
                <span className={styles.tagIcon}>{tag.icon}</span>
              </span>

              {/* Name chip */}
              <span className={styles.tagChip}>{tag.text}</span>

              {/* ── Preview card — appears on hover ── */}
              <div
                className={`${styles.tagPreview} ${flipLeft ? styles.previewLeft : styles.previewRight} ${flipUp ? styles.previewUp : styles.previewDown}`}
              >
                <div className={styles.previewImgWrap}>
                  <img
                    src={tag.preview}
                    alt={tag.text}
                    className={styles.previewImg}
                    loading="lazy"
                  />
                  <div className={styles.previewImgOverlay} />
                </div>
                <div className={styles.previewBody}>
                  <span className={styles.previewIcon}>{tag.icon}</span>
                  <span className={styles.previewLabel}>{tag.text}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Caption bar */}
        <div className={styles.imgCaption}>
          <span className={styles.captionLoc}>📍 WorkNest HQ, Hyderabad</span>
          <span className={styles.captionHint}>Hover tags to explore</span>
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

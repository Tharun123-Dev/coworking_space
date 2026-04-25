// Amenities.jsx
import { useState } from "react";
import "../Styles/Amenities.css";

const allAmenities = [
  {
    id: 1,
    title: "24 Hour Open",
    desc: "We are open 24/7 to accommodate your work schedule, no matter the time of day or night.",
    icon: (
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28"/><path d="M32 18v14l8 4"/><path d="M18 10 A22 22 0 0 0 18 54" strokeDasharray="4 3"/></svg>
    ),
  },
  {
    id: 2,
    title: "Free Wi-Fi",
    desc: "Stay connected with our high-speed Wi-Fi, available to all members for free.",
    icon: (
      <svg viewBox="0 0 64 64"><path d="M8 20 Q32 8 56 20"/><path d="M16 30 Q32 20 48 30"/><path d="M24 40 Q32 32 40 40"/><circle cx="32" cy="50" r="3" fill="#7b6fe0" stroke="none"/></svg>
    ),
  },
  {
    id: 3,
    title: "Free Coffee",
    desc: "Enjoy a fresh cup of coffee anytime during your work hours, on the house!",
    icon: (
      <svg viewBox="0 0 64 64"><path d="M20 28 Q20 44 32 44 Q44 44 44 28 Z"/><path d="M44 34 Q52 34 52 28 Q52 22 44 26"/><path d="M26 28 Q26 20 32 16 Q38 20 38 28"/><path d="M24 14 Q22 8 26 6"/><path d="M32 14 Q32 8 32 6"/><path d="M40 14 Q42 8 38 6"/><path d="M20 48 Q20 52 44 52"/></svg>
    ),
  },
  {
    id: 4,
    title: "Free Bike Parking",
    desc: "For our bike-riding members, we offer secure bike parking to keep your ride safe.",
    icon: (
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22"/><text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="700" stroke="none" fill="#7b6fe0" fontFamily="serif">P</text></svg>
    ),
  },
  {
    id: 5,
    title: "Customer Support",
    desc: "Our friendly customer support team is here to help you with any inquiries or issues.",
    icon: (
      <svg viewBox="0 0 64 64"><path d="M20 44 Q10 44 10 34 L10 26 Q10 14 32 14 Q54 14 54 26 L54 34 Q54 44 44 44 L36 44 L28 52 Z"/><path d="M24 30 L28 34 L24 38"/><path d="M40 30 L36 34 L40 38"/></svg>
    ),
  },
  {
    id: 6,
    title: "Power Back-up",
    desc: "Never worry about power outages, we've got you covered with backup power to keep you running.",
    icon: (
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22"/><path d="M36 14 L26 34 L34 34 L28 50 L42 28 L34 28 Z"/></svg>
    ),
  },
  {
    id: 7,
    title: "Meeting Rooms",
    desc: "Book a meeting room for your business calls or team meetings, equipped with all necessary amenities.",
    icon: (
      <svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="8"/><path d="M16 44 Q16 32 32 32 Q48 32 48 44"/><path d="M22 38 L26 50 L32 44 L38 50 L42 38"/></svg>
    ),
  },
  {
    id: 8,
    title: "Games",
    desc: "Take a break and recharge by enjoying a selection of games available for your leisure.",
    icon: (
      <svg viewBox="0 0 64 64"><circle cx="24" cy="32" r="16"/><circle cx="40" cy="32" r="16"/><path d="M20 28 L28 28"/><path d="M24 24 L24 32"/><circle cx="40" cy="28" r="2" fill="#7b6fe0" stroke="none"/><circle cx="44" cy="34" r="2" fill="#7b6fe0" stroke="none"/></svg>
    ),
  },
  {
    id: 9,
    title: "Accessible Commute",
    desc: "Easily reach our location with public and private transport accessibility.",
    icon: (
      <svg viewBox="0 0 64 64"><rect x="12" y="16" width="40" height="26" rx="6"/><path d="M12 28 L52 28"/><circle cx="20" cy="46" r="5"/><circle cx="44" cy="46" r="5"/><path d="M25 46 L39 46"/><path d="M8 34 L12 34"/><path d="M52 34 L56 34"/></svg>
    ),
  },
  {
    id: 10,
    title: "24x7 Surveillance",
    desc: "Your safety is our priority with round-the-clock CCTV monitoring.",
    icon: (
      <svg viewBox="0 0 64 64"><ellipse cx="28" cy="32" rx="16" ry="12"/><path d="M44 28 L56 22 L56 42 L44 36 Z"/><circle cx="28" cy="32" r="4" fill="#7b6fe0" stroke="none"/><path d="M10 48 L56 48"/></svg>
    ),
  },
  {
    id: 11,
    title: "Collab Area",
    desc: "Dedicated spaces to brainstorm and collaborate with your team in comfort.",
    icon: (
      <svg viewBox="0 0 64 64"><rect x="10" y="18" width="44" height="28" rx="4"/><path d="M10 30 L54 30"/><path d="M28 18 L28 46"/><path d="M22 46 L42 46 L42 54 L22 54 Z"/><path d="M18 54 L46 54"/></svg>
    ),
  },
  {
    id: 12,
    title: "Pantry",
    desc: "Grab a quick bite or refresh yourself in our fully stocked pantry.",
    icon: (
      <svg viewBox="0 0 64 64"><rect x="14" y="14" width="16" height="36" rx="3"/><rect x="34" y="14" width="16" height="36" rx="3"/><path d="M14 26 L30 26"/><path d="M34 26 L50 26"/><path d="M10 50 L54 50"/></svg>
    ),
  },
  {
    id: 13,
    title: "House Keeping",
    desc: "Daily professional housekeeping services to maintain a clean, hygienic, and comfortable work environment.",
    icon: (
      <svg viewBox="0 0 64 64"><path d="M20 54 L20 34 Q20 20 32 16 Q44 20 44 34 L44 54"/><path d="M14 54 L50 54"/><path d="M26 16 Q26 8 32 8 Q38 8 38 16"/><path d="M20 38 L44 38"/></svg>
    ),
  },
];

const INITIAL_COUNT = 8;

function Amenities() {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? allAmenities : allAmenities.slice(0, INITIAL_COUNT);

  return (
    <section className="am-section">
      <p className="am-eyebrow">Features & Amenities</p>
      <h2 className="am-title">No more boredom at work.</h2>

      <div className="am-grid">
        {visible.map((item) => (
          <div className="am-item" key={item.id}>
            <div className="am-icon-wrap">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <button className="am-btn" onClick={() => setShowAll(!showAll)}>
        {showAll ? "View Less" : "View More"}
      </button>
    </section>
  );
}

export default Amenities;
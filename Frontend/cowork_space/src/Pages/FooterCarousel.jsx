import React from "react";
import "../Styles/FooterCarousel.css";

const images = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000&h=300&fit=crop"
];

function LeftScrollCarousel() {
  return (
    <div className="scroll-wrapper">
      <div className="scroll-track">
        {[...images, ...images].map((src, i) => (
          <div className="scroll-card" key={i}>
            <img src={src} alt={`scroll-${i}`} loading="lazy" />
            <div className="glow"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeftScrollCarousel;
import React, { useEffect, useRef } from "react";
import "../Styles/FooterCarousel.css";

// LeftScrollCarousel.jsx
const images = [
  // Use your 12+ panorama images for continuous scroll (add more)
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622b4f7f7?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1558618047-3c8c76ca1e86?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516899798812-31d2f9bd510e?w=1000&h=300&fit=crop"
];

function LeftScrollCarousel() {
  return (
    <div className="scroll-wrapper">
      <div className="scroll-track">
        {images.map((src, i) => (
          <div className="scroll-card" key={i}>
            <img src={src} alt={`scroll-${i}`} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeftScrollCarousel;


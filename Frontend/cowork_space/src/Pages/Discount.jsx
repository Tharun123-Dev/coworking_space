import "../Styles/Discount.css";

function DiscountBar() {
  return (
    <div className="discount-bar">
      <div className="discount-track">
        <span>
          🔥 EXCLUSIVE: 20% OFF on booking for 4–8 hours | 
          20% OFF on Saturdays • 
          MEETING ROOM: 50% OFF on first booking | 
          25% OFF full day • 
          FREE Coffee & Wi-Fi included •
        </span>

        {/* Duplicate for smooth infinite scroll */}
        <span>
          🔥 EXCLUSIVE: 20% OFF on booking for 4–8 hours | 
          20% OFF on Saturdays • 
          MEETING ROOM: 50% OFF on first booking | 
          25% OFF full day • 
          FREE Coffee & Wi-Fi included •
        </span>
      </div>
    </div>
  );
}

export default DiscountBar;
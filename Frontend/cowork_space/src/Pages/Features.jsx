import { useEffect, useState } from "react";
import "../Styles/Features.css";
import R from "../Pages/Reveal"

// ICONS
import { FaWifi, FaCoffee, FaBroom, FaCar } from "react-icons/fa";
import { MdOutlineSupportAgent, MdPrint } from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import { GiNetworkBars } from "react-icons/gi";

const images = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1497366216548-37526070297c",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
];

function Feature() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feature-container">

      {/*  LEFT */}
      <div className="feature-left">
   <R>
        <h1 className="feature-title">
          Perks aplenty,<br />when you are at CoWork
        </h1>
        </R>

        <div className="feature-grid">
<R>
          <div className="feature-item">
            <FaWifi className="icon" />
            <span>Lightning-fast Internet</span>
          </div>
          </R>

         <R><div className="feature-item">
            <FaCoffee className="icon" />
            <span>Great Coffee, Tea & Munchies</span>
          </div></R> 
<R>
          <div className="feature-item">
            <FaBroom className="icon" />
            <span>Super Housekeeping</span>
          </div></R>
<R>
          <div className="feature-item">
            <MdOutlineSupportAgent className="icon" />
            <span>Professional IT Support</span>
          </div></R>
          <R>
          <div className="feature-item">
            <MdPrint className="icon" />
            <span>Printing & Scanning</span>
          </div>
          </R>
          <R>

          <div className="feature-item">
            <BsBoxSeam className="icon" />
            <span>Office Supplies</span>
          </div>
          </R>
<R>
          <div className="feature-item">
            <FaCar className="icon" />
            <span>Ample Parking</span>
          </div>
          </R>
<R>
          <div className="feature-item">
            <GiNetworkBars className="icon" />
            <span>Pan-India Network</span>
          
          </div></R>


        </div>
      </div>

      {/* 🖼 RIGHT */}
      <div className="feature-right">
        <R>
        <img src={images[current]} alt="workspace" />
        </R>

        <div className="feature-dots">
          <R>
          {images.map((_, i) => (
            <span key={i} className={i === current ? "active" : ""}></span>
          ))}</R>
        </div>
      </div>

    </div>
  );
}

export default Feature;
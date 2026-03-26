import React from "react";
import "../Styles/Cities.css";
import { useNavigate } from "react-router-dom";

const locations = [
  {
    id: 1,
    name: "Hitech City",
    price: "₹499/day",
    map: "https://www.google.com/maps?q=Hitech+City+Hyderabad&output=embed"
  },
  {
    id: 2,
    name: "Madhapur",
    price: "₹399/day",
    map: "https://www.google.com/maps?q=Madhapur+Hyderabad&output=embed"
  },
  {
    id: 3,
    name: "Gachibowli",
    price: "₹599/day",
    map: "https://www.google.com/maps?q=Gachibowli+Hyderabad&output=embed"
  },
  {
    id: 4,
    name: "Kondapur",
    price: "₹349/day",
    map: "https://www.google.com/maps?q=Kondapur+Hyderabad&output=embed"
  },
  {
    id: 5,
    name: "Banjara Hills",
    price: "₹699/day",
    map: "https://www.google.com/maps?q=Banjara+Hills+Hyderabad&output=embed"
  },
  {
    id: 6,
    name: "Jubilee Hills",
    price: "₹799/day",
    map: "https://www.google.com/maps?q=Jubilee+Hills+Hyderabad&output=embed"
  },
  {
    id: 7,
    name: "Begumpet",
    price: "₹450/day",
    map: "https://www.google.com/maps?q=Begumpet+Hyderabad&output=embed"
  },
  {
    id: 8,
    name: "Ameerpet",
    price: "₹300/day",
    map: "https://www.google.com/maps?q=Ameerpet+Hyderabad&output=embed"
  }
];

const Cities = () => {
  const navigate = useNavigate();   // added

  return (
    <div className="container" id="cities">
      <h2>We have Hyderabad in 8 locations of workspace</h2>

      <div className="horizontal-scroll">
        {locations.map((loc) => (
          <div key={loc.id} className="card">

            {/* Map */}
            <iframe
              src={loc.map}
              title={loc.name}
              loading="lazy"
            ></iframe>

            {/* Info */}
            <h3>{loc.name}</h3>
            <p>{loc.price}</p>

            {/* Updated Button */}
          <button
  onClick={() =>
    window.location.href = `/view?id=${loc.id}`
  }
>
  View Details
</button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Cities;
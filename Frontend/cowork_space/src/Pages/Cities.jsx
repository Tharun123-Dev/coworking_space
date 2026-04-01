import React from "react";
import "../Styles/Cities.css";
import { useNavigate } from "react-router-dom";
import R from "../Pages/Reveal";

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
  const navigate = useNavigate();

  return (
    <section className="container" id="cities">
      <R>
        <div className="cities-head">
          <span className="cities-tag">Workspace Locations</span>
          <h2>We have Hyderabad in 8 locations of workspace</h2>
          <p>
            Choose your ideal workspace across Hyderabad with flexible pricing,
            prime access, and a comfortable professional atmosphere.
          </p>
        </div>
      </R>

      <div className="horizontal-scroll">
        {locations.map((loc) => (
          <div key={loc.id} className="card">
            <R>
              <div className="map-wrap">
                <iframe
                  src={loc.map}
                  title={loc.name}
                  loading="lazy"
                ></iframe>
              </div>
            </R>

            <div className="card-content">
              <R><span className="location-id">0{loc.id}</span></R>
              <R><h3>{loc.name}</h3></R>
              <R><p>{loc.price}</p></R>

              <R>
                <button onClick={() => navigate(`/view?id=${loc.id}`)}>
                  View Details
                </button>
              </R>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Cities;
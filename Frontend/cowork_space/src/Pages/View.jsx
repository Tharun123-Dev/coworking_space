import React, { useMemo, useState } from "react";
import "../Styles/View.css";

import axiosInstance from "../Services/Axios";

const locationsData = [
  {
    id: 1,
    name: "Hitech City Premium Workspace",
    area: "Hitech City",
    price: 499,
    rating: 4.8,
    people: "Freelancers, startups, remote workers",
    mapQuery: "Hitech City Hyderabad",
    images: ["/view2.jpg", "/view1.jpg", "/view3.avif", "/view4.avif"],
    description:
      "This premium coworking space in Hitech City offers a vibrant and professional environment designed for productivity, collaboration, and comfort. It includes modern interiors, ergonomic seating, fast internet, meeting areas, and easy access to transport, food spots, and corporate hubs.",
    features: [
      "High-Speed WiFi",
      "Air Conditioned Workspace",
      "Free Tea & Coffee",
      "Meeting Rooms",
      "Power Backup",
      "24/7 Security",
      "Printer & Scanner",
      "Comfortable Seating",
    ],
    advantages: [
      "Boosts productivity with a professional atmosphere",
      "Networking opportunities with other professionals",
      "Flexible daily pricing",
      "Prime IT corridor access",
      "No long-term commitment required",
    ],
  },
  {
    id: 2,
    name: "Gachibowli Executive Hub",
    area: "Gachibowli",
    price: 549,
    rating: 4.7,
    people: "Tech teams, consultants, founders",
    mapQuery: "Gachibowli Hyderabad",
    images: ["/view1.jpg", "/view2.jpg", "/view3.avif", "/view4.avif"],
    description:
      "A modern workspace in Gachibowli with premium desks, quiet zones, collaboration rooms, and a polished business atmosphere for daily or flexible work use.",
    features: [
      "Dedicated Desks",
      "WiFi",
      "Conference Rooms",
      "Parking",
      "Power Backup",
      "Reception Support",
      "Coffee Bar",
      "Security",
    ],
    advantages: [
      "Near major offices",
      "Strong startup ecosystem",
      "Great for client meetings",
      "Professional ambiance",
      "Flexible booking options",
    ],
  },
  {
    id: 3,
    name: "Madhapur Smart Office",
    area: "Madhapur",
    price: 459,
    rating: 4.6,
    people: "Developers, creators, hybrid workers",
    mapQuery: "Madhapur Hyderabad",
    images: ["/view3.avif", "/view1.jpg", "/view2.jpg", "/view4.avif"],
    description:
      "A stylish and practical coworking office in Madhapur with productive seating, strong connectivity, and all-day convenience for professionals.",
    features: [
      "Fast Internet",
      "Ergonomic Chairs",
      "Meeting Pods",
      "Snacks",
      "AC",
      "Security",
      "Printing",
      "Lounge Area",
    ],
    advantages: [
      "Central work location",
      "Affordable day pricing",
      "Ideal for solo work and meetings",
      "Good nearby food options",
      "Well-connected area",
    ],
  },
  {
    id: 4,
    name: "Kondapur Business Space",
    area: "Kondapur",
    price: 429,
    rating: 4.5,
    people: "Startups, students, remote professionals",
    mapQuery: "Kondapur Hyderabad",
    images: ["/view4.avif", "/view3.avif", "/view1.jpg", "/view2.jpg"],
    description:
      "A compact and comfortable workspace in Kondapur with all essential office amenities and flexible daily access for focused work.",
    features: [
      "WiFi",
      "AC",
      "Tea & Coffee",
      "Meeting Room",
      "Power Backup",
      "Security",
      "Desk Space",
      "Scanner",
    ],
    advantages: [
      "Budget-friendly",
      "Good for daily use",
      "Comfortable setup",
      "Accessible location",
      "Flexible booking",
    ],
  },
  {
    id: 5,
    name: "Banjara Hills Work Lounge",
    area: "Banjara Hills",
    price: 699,
    rating: 4.9,
    people: "Consultants, founders, premium users",
    mapQuery: "Banjara Hills Hyderabad",
    images: ["/view1.jpg", "/view4.avif", "/view2.jpg", "/view3.avif"],
    description:
      "A premium business lounge in Banjara Hills built for professionals who want a polished, quiet, and impressive workspace experience.",
    features: [
      "Luxury Interiors",
      "High-Speed WiFi",
      "Coffee Bar",
      "Private Meeting Rooms",
      "Reception",
      "Parking",
      "AC",
      "Security",
    ],
    advantages: [
      "Premium locality",
      "Great for meetings",
      "High-end environment",
      "Excellent accessibility",
      "Best for executive work",
    ],
  },
  {
    id: 6,
    name: "Jubilee Hills Studio Workspace",
    area: "Jubilee Hills",
    price: 649,
    rating: 4.8,
    people: "Creative teams, freelancers, agencies",
    mapQuery: "Jubilee Hills Hyderabad",
    images: ["/view2.jpg", "/view3.avif", "/view4.avif", "/view1.jpg"],
    description:
      "A modern and creative coworking setup in Jubilee Hills with stylish interiors, collaborative seating, and premium work comfort.",
    features: [
      "Creative Studio Seating",
      "Internet",
      "Meeting Room",
      "Coffee",
      "Printer",
      "Backup Power",
      "Security",
      "Lounge",
    ],
    advantages: [
      "Creative atmosphere",
      "Upscale location",
      "Great for teams",
      "Flexible daily access",
      "Good social vibe",
    ],
  },
  {
    id: 7,
    name: "Begumpet Flexible Desk Space",
    area: "Begumpet",
    price: 399,
    rating: 4.4,
    people: "Job seekers, freelancers, students",
    mapQuery: "Begumpet Hyderabad",
    images: ["/view3.avif", "/view2.jpg", "/view1.jpg", "/view4.avif"],
    description:
      "A practical coworking option in Begumpet for affordable daily work, interviews, study sessions, and freelance tasks.",
    features: [
      "Affordable Pricing",
      "WiFi",
      "AC",
      "Tea",
      "Quiet Zone",
      "Power Backup",
      "Security",
      "Printing",
    ],
    advantages: [
      "Budget-friendly",
      "Good for interviews",
      "Central location",
      "Simple booking",
      "Reliable essentials",
    ],
  },
  {
    id: 8,
    name: "Secunderabad Urban Workpoint",
    area: "Secunderabad",
    price: 379,
    rating: 4.3,
    people: "Remote workers, consultants, daily users",
    mapQuery: "Secunderabad Hyderabad",
    images: ["/view4.avif", "/view1.jpg", "/view2.jpg", "/view3.avif"],
    description:
      "An accessible urban workspace in Secunderabad with flexible seating, basic business amenities, and a comfortable daily working setup.",
    features: [
      "Flexible Desk",
      "Internet",
      "AC",
      "Coffee",
      "Meeting Space",
      "Security",
      "Power Backup",
      "Printer",
    ],
    advantages: [
      "Affordable daily plan",
      "Easy access",
      "Good for focused work",
      "Useful amenities",
      "No long-term contract",
    ],
  },
];

const View = () => {
  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [toast, setToast] = useState("");

  const isLoggedIn = !!localStorage.getItem("acess");

  const selectedLocation = useMemo(() => {
    return locationsData.find((loc) => loc.id === selectedLocationId);
  }, [selectedLocationId]);

const handleBooking = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    setToast("Please login first to continue booking");
    setTimeout(() => {
      window.location.href = "/auth";
    }, 1200);
    return;
  }

  try {
    await axiosInstance.post(
      "cart/add/",
      {
        workspace: selectedLocation.id,
        duration: 1,
        booking_type: "day_pass"
      },
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    setToast("Booking added successfully ✅");

    setTimeout(() => {
      window.location.href = "/my-orders";
    }, 1200);

  } catch (err) {
    console.log(err);
    setToast("Failed to add booking ❌");
  }
};

  const handleLocationChange = (e) => {
    setSelectedLocationId(Number(e.target.value));
    setSelectedImage(0);
  };

  return (
    <div className="view-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="view-container">
        <section className="hero-card">
          <div className="hero-content">
            <p className="eyebrow">Premium Workspaces in Hyderabad</p>
            <h1>{selectedLocation.name}</h1>
            <div className="hero-meta">
              <span>📍 {selectedLocation.area}</span>
              <span>⭐ {selectedLocation.rating}</span>
              <span>👥 {selectedLocation.people}</span>
            </div>
          </div>

          <div className="location-switcher">
            <label>Select Location</label>
            <select value={selectedLocationId} onChange={handleLocationChange}>
              {locationsData.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.area} - ₹{location.price}/Day
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="content-grid">
          <div className="main-content">
            <div className="gallery-section">
              <img
                src={selectedLocation.images[selectedImage]}
                alt={selectedLocation.name}
                className="main-image"
              />

              <div className="thumb-row">
                {selectedLocation.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`workspace ${index + 1}`}
                    className={selectedImage === index ? "thumb active" : "thumb"}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            <div className="map-card">
              <h2>Location Map</h2>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  selectedLocation.mapQuery
                )}&output=embed`}
                title="Workspace map"
                loading="lazy"
              ></iframe>
            </div>

            <section className="info-card">
              <h2>Description</h2>
              <p>{selectedLocation.description}</p>
            </section>

            <section className="info-card">
              <h2>Features</h2>
              <div className="feature-grid">
                {selectedLocation.features.map((feature, index) => (
                  <div className="feature-item" key={index}>
                    <span>✓</span>
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="info-card">
              <h2>Advantages</h2>
              <ul className="advantages-list">
                {selectedLocation.advantages.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="booking-sidebar">
            <div className="price-box">
              <p className="price-label">Starting Price</p>
              <h2>₹{selectedLocation.price} / Day</h2>
              <button onClick={handleBooking}>Book Now</button>
              <button className="secondary-btn">Schedule Visit</button>
            </div>

            <div className="quick-info">
              <h3>Quick Info</h3>
              <p><strong>Area:</strong> {selectedLocation.area}</p>
              <p><strong>Rating:</strong> {selectedLocation.rating}</p>
              <p><strong>Best For:</strong> {selectedLocation.people}</p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default View;
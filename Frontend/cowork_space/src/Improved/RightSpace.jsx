import React from "react";
import "./RightSpace.css";
import R from "../Pages/Reveal";

const LocationsSection = ({ openModal }) => {
  const workspaceLocations = [
    {
      name: "Financial District",
      image:
        "https://aurorealty.com/blog/wp-content/uploads/2025/02/the-pearl-1-1.jpg",
    },
    {
      name: "Madhapur",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Wipro Circle",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <section className="rightSpaceSection">
      <div className="rightSpaceGlow rightSpaceGlowOne"></div>
      <div className="rightSpaceGlow rightSpaceGlowTwo"></div>
      <div className="rightSpaceGridOverlay"></div>

      <R>
        <div className="rightSpaceHeader">
          <span className="rightSpaceBadge">Prime Locations</span>

          <h2 className="rightSpaceTitle">
            Choose the <span>Right Space</span>
            <br />
            for Your Business
          </h2>

          <p className="rightSpaceSubtitle">
            Easily accessible offices in Hyderabad’s top commercial hubs.
          </p>
        </div>
      </R>

      <div className="rightSpaceCards">
        {workspaceLocations.map((loc, index) => (
          <R key={index}>
            <div className="rightSpaceCard">
              <div className="rightSpaceImageWrap">
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  className="rightSpaceImage"
                />
                <div className="rightSpaceImageOverlay"></div>
              </div>

              <div className="rightSpaceContent">
                <div className="rightSpaceTextBlock">
                  <p className="rightSpaceLabel">Business Hub</p>
                  <h3 className="rightSpaceCardTitle">{loc.name}</h3>
                </div>

                <button
                  className="rightSpaceButton"
                  onClick={() => openModal(loc.name)}
                >
                  Book now <span>→</span>
                </button>
              </div>
            </div>
          </R>
        ))}
      </div>
    </section>
  );
};

export default LocationsSection;
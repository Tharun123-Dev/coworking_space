import React from "react";
import "../Styles/View.css";

const View = () => {
  const isLoggedIn = localStorage.getItem("user");

  const handleBooking = () => {
    if (!isLoggedIn) {
      alert("Please login first");
      window.location.href = "/login.html";
    } else {
      alert("Booking Confirmed!");
    }
  };

  return (
    <div className="view-container">

      {/* Title */}
      <h1>Hitech City Premium Workspace</h1>

      {/*Image Gallery */}
      <div className="gallery">
        <img src="https://source.unsplash.com/600x400/?office" alt="" />
        <img src="https://source.unsplash.com/600x400/?coworking" alt="" />
        <img src="https://source.unsplash.com/600x400/?workspace" alt="" />
        <img src="https://source.unsplash.com/600x400/?meeting-room" alt="" />
      </div>

      {/* Map */}
      <div className="map">
        <iframe
          src="https://www.google.com/maps?q=Hitech+City+Hyderabad&output=embed"
          title="map"
        ></iframe>
      </div>

      {/* Price & Book */}
      <div className="price-box">
        <h2>₹499 / Day</h2>
        <button onClick={handleBooking}>Book Now</button>
      </div>

      {/* Description */}
      <section>
        <h2>Description</h2>
        <p>
          This premium coworking space located in Hitech City, Hyderabad offers a
          vibrant and professional work environment designed for productivity and
          innovation. The workspace is equipped with modern infrastructure,
          ergonomic seating, and high-speed internet connectivity to ensure
          seamless working conditions. It is ideal for freelancers, startups,
          remote workers, and corporate teams who seek a flexible yet
          professional office setup.

          The ambiance is thoughtfully designed to promote collaboration while
          maintaining individual focus. With dedicated zones for meetings,
          brainstorming sessions, and quiet work, it caters to diverse working
          styles. The location is strategically positioned in the IT hub of
          Hyderabad, providing easy access to transport, restaurants, and other
          essential services.

          Additionally, the workspace offers a community-driven environment where
          professionals can network, share ideas, and grow together. Regular
          events and workshops are also conducted to enhance professional
          development and collaboration.
        </p>
      </section>

      {/*  Features */}
      <section>
        <h2>Features</h2>
        <ul>
          <li>High-Speed WiFi</li>
          <li>Air Conditioned Workspace</li>
          <li>Free Tea & Coffee</li>
          <li>Meeting Rooms</li>
          <li>Power Backup</li>
          <li>24/7 Security</li>
          <li>Printer & Scanner</li>
          <li>Comfortable Seating</li>
        </ul>
      </section>

      {/*  Advantages */}
      <section>
        <h2>Advantages</h2>
        <ul>
          <li>Boosts productivity with professional environment</li>
          <li>Networking opportunities with professionals</li>
          <li>Flexible daily pricing</li>
          <li>Prime IT location access</li>
          <li>No long-term commitment required</li>
        </ul>
      </section>

      {/* Why Choose This */}
      <section>
        <h2>Why Choose This Workspace?</h2>
        <p>
          Choosing this workspace ensures that you get a perfect blend of comfort,
          convenience, and professionalism. Unlike working from home, this space
          eliminates distractions and enhances focus. It is specifically designed
          for individuals who want a premium office experience without committing
          to long-term leases.

          The strategic location in Hitech City makes it ideal for IT
          professionals and entrepreneurs. Whether you are preparing for
          interviews, working on projects, or conducting meetings, this space
          provides all the necessary tools and environment to succeed.
        </p>
      </section>

    </div>
  );
};

export default View;
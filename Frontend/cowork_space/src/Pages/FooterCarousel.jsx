import React from "react";
import "../Styles/FooterCarousel.css";






function VideoSection() {
  return (
    <section className="videosection">
      <div className="videosection__wrap">
        <div className="videosection__left">
          <p className="videosection__label">Overview</p>

          <h2 className="videosection__title">
            Future of working
            <br />
            space is here
          </h2>

          <p className="videosection__desc">
            At COWORK, we provide modern coworking desks, private cabins,
            meeting rooms, and flexible office solutions for startups,
            freelancers, and growing teams.
          </p>

          <p className="videosection__desc videosection__desc--bold">
            Our mission is simple — create inspiring and productive spaces
            where people can work better every day.
          </p>
        </div>

        <div className="videosection__right">
          <video
            className="videosection__video"
            src="/video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>
    </section>
  );
}

export default VideoSection;
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./BusinessSection.css";
import Reveal from "../Pages/Reveal";

const offers = [
  {
    id: 1,
    area: "Gachibowli",
    building: "Skyline One Tower",
    type: "Private Office Suite",
    originalPrice: 18000,
    icon: "🏢",
    image:
      "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5b47d45fcb981eadd8e8f563e41a7fc10260c724.jpg",
    seats: 6,
    floor: "12th Floor",
    amenities: ["1Gbps WiFi", "Meeting Room", "24/7 Access", "Parking"],
  },
  {
    id: 2,
    area: "Hitec City",
    building: "Cyber Pearl Hub",
    type: "Dedicated Desk",
    originalPrice: 8500,
    icon: "💻",
    image:
      "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/f7ba941c41143e11f1a839090404afd410a9e870.jpg",
    seats: 2,
    floor: "5th Floor",
    amenities: ["Fiber WiFi", "Cafeteria", "Power Backup", "Locker"],
  },
  {
    id: 3,
    area: "Madhapur",
    building: "Avance Business Park",
    type: "Team Cabin",
    originalPrice: 25000,
    icon: "🏗️",
    image:
      "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/02cd5b2e519627b90a4ee5bef2b958af7835d3cb.jpg",
    seats: 10,
    floor: "8th Floor",
    amenities: ["Dedicated Server", "Board Room", "AC", "Receptionist"],
  },
  {
    id: 4,
    area: "Banjara Hills",
    building: "Prestige Nexus",
    type: "Hot Desk",
    originalPrice: 5000,
    icon: "🚀",
    image:
      "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/2f1c40b63b64780c519d9ab2ad2b13869a325692.jpg",
    seats: 1,
    floor: "3rd Floor",
    amenities: ["WiFi", "Café Access", "AC","Printer", "24/7"],
  },
];

function useCountdown(hours = 11, mins = 47, secs = 33) {
  const [time, setTime] = useState({ h: hours, m: mins, s: secs });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;

        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };

        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return time;
}

const LimitedOfferSection = ({ openModal }) => {
  const time = useCountdown(11, 47, 33);
  const sectionRef = useRef(null);
  const audioRef = useRef(null);

  const [audioReady, setAudioReady] = useState(false);
  const [isInsideSection, setIsInsideSection] = useState(false);

  const handleClaim = (id) => {
    if (openModal) {
      openModal("offer_" + id);
    } else {
      alert("Lead submitted! Our team will contact you within 12 hrs. 🎉");
    }
  };

  const pad = (n) => String(n).padStart(2, "0");

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.4;

    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }, [audioReady]);

  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = 0;
      const promise = audio.play();

      if (promise && typeof promise.then === "function") {
        promise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0.4;
            setAudioReady(true);
          })
          .catch(() => {});
      } else {
        setAudioReady(true);
      }
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInsideSection(true);
        } else {
          setIsInsideSection(false);
          stopAudio();
        }
      },
      { threshold: 0.55 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [stopAudio]);

  useEffect(() => {
    if (isInsideSection && audioReady) {
      playAudio();
    }

    if (!isInsideSection) {
      stopAudio();
    }
  }, [isInsideSection, audioReady, playAudio, stopAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <section className="offer-section" ref={sectionRef}>
      <audio
        ref={audioRef}
        src="/offers-alert.mp3"
        preload="auto"
        playsInline
        style={{ display: "none" }}
      />

      <div className="offer-particles">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i }}></span>
        ))}
      </div>

      <div className="offer-header">
        <Reveal>
          <div className="offer-eyebrow">
            <span className="eyebrow-fire">🔥</span>
            <span>Limited Time Offer</span>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="offer-title">
            <span className="offer-title-top">Exclusive Space.</span>
            <span className="offer-title-mid">
              50% <em>Off.</em>
            </span>
            <span className="offer-title-bot">Grab Your Workspace Today.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="offer-subtitle">
            Secure your workspace at half the price for the first month.
            These premium office spaces are available for a limited time only.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="offer-meta-row"
            style={{ justifyContent: "center" }}
          >
            <div className="countdown-box">
              <span className="countdown-label">Offer Expires In</span>

              <div className="countdown-digits">
                <div className="digit-block">
                  <span className="digit">{pad(time.h)}</span>
                  <span className="digit-lbl">HRS</span>
                </div>

                <span className="digit-sep">:</span>

                <div className="digit-block">
                  <span className="digit">{pad(time.m)}</span>
                  <span className="digit-lbl">MIN</span>
                </div>

                <span className="digit-sep">:</span>

                <div className="digit-block">
                  <span className="digit digit-urgent">{pad(time.s)}</span>
                  <span className="digit-lbl">SEC</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="offer-grid">
        {offers.map((offer, index) => {
          const discountPrice = Math.round(offer.originalPrice / 2);

          return (
            <div
              key={offer.id}
              className="offer-card offer-card--available"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-ribbon">50% OFF</div>

              <div className="offer-card-img">
                <img src={offer.image} alt={offer.building} />
                <div className="offer-card-img-overlay"></div>

                <div className="offer-card-area-tag">
                  <span>{offer.icon}</span>
                  {offer.area}
                </div>
              </div>
              <div className="offer-card-body">
                <p className="offer-card-type">{offer.type}</p>
                <h3 className="offer-card-title">{offer.building}</h3>

                <div className="offer-card-meta">
                  <span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    {offer.floor}
                  </span>

                  <span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {offer.seats} {offer.seats === 1 ? "Seat" : "Seats"}
                  </span>
                </div>

                <div className="offer-amenities">
                  {offer.amenities.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>

                <div className="offer-price-row">
                  <div className="offer-price">
                    <span className="price-original">
                      ₹{offer.originalPrice.toLocaleString()}
                    </span>
                    <span className="price-slash">/mo</span>
                  </div>

                  <div className="price-now">
                    <span className="price-tag">You Pay</span>
                    <span className="price-discounted">
                      ₹{discountPrice.toLocaleString()}
                      <small>/mo</small>
                    </span>
                  </div>
                </div>

                <div className="offer-urgency">
                  <span className="urgency-pulse"></span>
                  <span>Limited offer available now</span>
                </div>

                <button
                  className="offer-claim-btn"
                  onClick={() => handleClaim(offer.id)}
                >
                  <span>Claim 50% Off Now</span>
                  <span className="claim-arrow">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LimitedOfferSection;
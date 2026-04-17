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
    image: "/cowork.jpg",
    seats: 6,
    floor: "12th Floor",
    amenities: ["1Gbps WiFi", "Meeting Room", "24/7 Access", "Parking"],
    claimedBy: "Rahul S.",
    claimedAgo: "2 hrs ago",
    status: "available",
  },
  {
    id: 2,
    area: "Hitec City",
    building: "Cyber Pearl Hub",
    type: "Dedicated Desk",
    originalPrice: 8500,
    icon: "💻",
    image: "/cowork.jpg",
    seats: 2,
    floor: "5th Floor",
    amenities: ["Fiber WiFi", "Cafeteria", "Power Backup", "Locker"],
    claimedBy: null,
    claimedAgo: null,
    status: "available",
  },
  {
    id: 3,
    area: "Madhapur",
    building: "Avance Business Park",
    type: "Team Cabin",
    originalPrice: 25000,
    icon: "🏗️",
    image: "/cowork.jpg",
    seats: 10,
    floor: "8th Floor",
    amenities: ["Dedicated Server", "Board Room", "AC", "Receptionist"],
    claimedBy: "Priya K.",
    claimedAgo: "5 hrs ago",
    status: "claimed",
  },
  {
    id: 4,
    area: "Banjara Hills",
    building: "Prestige Nexus",
    type: "Hot Desk",
    originalPrice: 5000,
    icon: "🚀",
    image: "/cowork.jpg",
    seats: 1,
    floor: "3rd Floor",
    amenities: ["WiFi", "Café Access", "Printer", "24/7"],
    claimedBy: null,
    claimedAgo: null,
    status: "available",
  },
];

function useCountdown(hours = 11, mins = 47, secs = 33) {
  const [time, setTime] = useState({ h: hours, m: mins, s: secs });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;

        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };

        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);

    return () => clearInterval(t);
  }, []);

  return time;
}

const LimitedOfferSection = ({ openModal }) => {
  const time = useCountdown(11, 47, 33);
  const sectionRef = useRef(null);
  const audioRef = useRef(null);

  const [claimedIds] = useState(
    offers.filter((o) => o.status === "claimed").map((o) => o.id)
  );

  const [audioReady, setAudioReady] = useState(false);
  const [isInsideSection, setIsInsideSection] = useState(false);

  const availableCount = offers.filter((o) => !claimedIds.includes(o.id)).length;

  const handleClaim = (id) => {
    if (openModal) {
      openModal("offer_" + id);
    } else {
      alert("Lead submitted! Our team will contact you within 12 hrs. You are in the queue. 🎉");
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

    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // autoplay blocked if page is not unlocked yet
      });
    }
  }, [audioReady]);

  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = 0;
      const p = audio.play();

      if (p && typeof p.then === "function") {
        p.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.4;
          setAudioReady(true);
        }).catch(() => {});
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
      {
        threshold: 0.55,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
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

    const handleEnded = () => {
      // keep ready for next section re-entry
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
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
            <span className="eyebrow-badge">FIFO</span>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="offer-title">
            <span className="offer-title-top">One Space.</span>
            <span className="offer-title-mid">
              50% <em>Off.</em>
            </span>
            <span className="offer-title-bot">First Come, First Served.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="offer-subtitle">
            Each building has exactly <strong>1 exclusive offer slot</strong>. The first person to submit
            their lead gets 50% off for their first month — no negotiations, no exceptions.
            Miss it and it's gone.
          </p>
        </Reveal>

        <Reveal>
          <div className="offer-meta-row">
            <div className="countdown-box">
              <span className="countdown-label">Offer Resets In</span>
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

            <div className="availability-box">
              <div className="avail-top">
                <span className="avail-label">Slots Available</span>
                <span className="avail-count">
                  {availableCount} / {offers.length}
                </span>
              </div>

              <div className="avail-bar">
                {offers.map((o) => (
                  <div
                    key={o.id}
                    className={`avail-seg ${claimedIds.includes(o.id) ? "seg-claimed" : "seg-free"}`}
                    title={o.area}
                  ></div>
                ))}
              </div>

              <p className="avail-hint">
                <span className="avail-dot free"></span> Available &nbsp;
                <span className="avail-dot claimed"></span> Claimed
              </p>
            </div>

            <div className="fifo-box">
              <div className="fifo-icon">⚡</div>
              <div>
                <p className="fifo-title">How It Works</p>
                <p className="fifo-rule">
                  Submit lead → Get verified → First in line gets 50% off Month 1
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="offer-grid">
        {offers.map((offer, index) => {
          const isClaimed = claimedIds.includes(offer.id);
          const discountPrice = Math.round(offer.originalPrice / 2);

          return (
            <div
              key={offer.id}
              className={`offer-card ${isClaimed ? "offer-card--claimed" : "offer-card--available"}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {!isClaimed && <div className="card-ribbon">50% OFF</div>}
              {isClaimed && <div className="card-ribbon card-ribbon--claimed">CLAIMED</div>}

              <div className="offer-card-img">
                <img src={offer.image} alt={offer.building} />
                <div className="offer-card-img-overlay"></div>

                <div className="offer-card-area-tag">
                  <span>{offer.icon}</span>
                  {offer.area}
                </div>

                {isClaimed && (
                  <div className="claimed-shield">
                    <span>🔒</span>
                    <p>Claimed</p>
                    {offer.claimedBy && (
                      <small>
                        by {offer.claimedBy} · {offer.claimedAgo}
                      </small>
                    )}
                  </div>
                )}
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
                    <span className="price-original">₹{offer.originalPrice.toLocaleString()}</span>
                    <span className="price-slash">/mo</span>
                  </div>

                  {!isClaimed ? (
                    <div className="price-now">
                      <span className="price-tag">You Pay</span>
                      <span className="price-discounted">
                        ₹{discountPrice.toLocaleString()}
                        <small>/mo</small>
                      </span>
                    </div>
                  ) : (
                    <div className="price-taken">
                      <span>Offer Taken</span>
                    </div>
                  )}
                </div>

                {!isClaimed && (
                  <div className="offer-urgency">
                    <span className="urgency-pulse"></span>
                    <span>Only 1 slot · Be first to claim</span>
                  </div>
                )}

                {!isClaimed ? (
                  <button
                    className="offer-claim-btn"
                    onClick={() => handleClaim(offer.id)}
                  >
                    <span>Claim 50% Off Now</span>
                    <span className="claim-arrow">→</span>
                  </button>
                ) : (
                  <button className="offer-claim-btn offer-claim-btn--disabled" disabled>
                    <span>🔒 Slot Claimed</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Reveal>
        <div className="offer-bottom-banner">
          <div className="bottom-banner-left">
            <span className="bottom-banner-icon">📋</span>
            <div>
              <p className="bottom-banner-title">How FIFO Works</p>
              <p className="bottom-banner-desc">
                Leads are time-stamped the moment you submit. First verified lead per building wins the
                50% discount for Month 1. No exceptions. No extensions.
              </p>
            </div>
          </div>

          <div className="bottom-banner-steps">
            {[
              { step: "01", label: "Submit Lead" },
              { step: "02", label: "Get Verified" },
              { step: "03", label: "First = 50% Off" },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="step-item">
                  <span className="step-num">{s.step}</span>
                  <span className="step-label">{s.label}</span>
                </div>
                {i < 2 && <span className="step-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default LimitedOfferSection;
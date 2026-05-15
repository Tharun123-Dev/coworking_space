import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import axiosInstance from "../Services/Axios";
import "./BusinessSection.css";
import Reveal from "../Pages/Reveal";

function useCountdown(hours = 11, mins = 47, secs = 33) {
  const [time, setTime] = useState({
    h: hours,
    m: mins,
    s: secs,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;

        if (s > 0) {
          return { h, m, s: s - 1 };
        }

        if (m > 0) {
          return { h, m: m - 1, s: 59 };
        }

        if (h > 0) {
          return { h: h - 1, m: 59, s: 59 };
        }

        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return time;
}

const LimitedOfferSection = ({ openModal }) => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [offerCoupons, setOfferCoupons] = useState([]);
  const [claimedCoupons, setClaimedCoupons] = useState(
    JSON.parse(localStorage.getItem("claimedCoupons")) || []
  );
  const [workspaces, setWorkspaces] = useState([]);

  const time = useCountdown(11, 47, 33);

  const sectionRef = useRef(null);
  const audioRef = useRef(null);

  const [audioReady, setAudioReady] = useState(false);
  const [isInsideSection, setIsInsideSection] = useState(false);

  const fetchOffers = () => {
    axiosInstance
      .get("workspaces/offers/")
      .then((res) => {
        setOffers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Offer fetch error:", err);
      });
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    axiosInstance
      .get("workspaces/")
      .then((res) => {
        setWorkspaces(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Workspace fetch error:", err);
      });
  }, []);

  useEffect(() => {
   axiosInstance
  .get(
    "workspaces/offer-coupons/"
  )

  .then((res) => {

    console.log(
      "Coupons API Response:",
      res.data
    );

    setOfferCoupons(

      Array.isArray(res.data)
        ? res.data
        : []

    );

  })

  .catch((err) => {

    console.log(
      "Coupon Fetch Error:",
      err
    );

  });
  }, []);

const getMatchedCoupons = useCallback(() => {

  if (!selectedOffer)
    return [];

  return offerCoupons.filter((coupon) => {

    const couponWorkspace =
      (
        coupon.workspace_name || ""
      )
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();

    const offerType =
      (
        selectedOffer.type || ""
      )
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();

    return (
      couponWorkspace ===
      offerType
    );

  });

}, [
  offerCoupons,
  selectedOffer,
]);
  const handleClaim = (offer) => {
    setSelectedOffer(offer);
    setSelectedCoupon(null);
    setShowCouponModal(true);
  };

const handleApplyCoupon = (coupon) => {

  const remaining =

    Number(coupon.capacity || 0)

    -

    Number(coupon.used_count || 0);

  if (remaining <= 0) {

    alert("Coupon Fully Claimed");

    return;

  }

  const originalPrice =
    Number(
      selectedOffer.original_price
    );

  const discountAmount =

    (
      originalPrice *

      Number(
        coupon.discount_percentage
      )
    ) / 100;

  const finalPrice =

    originalPrice -
    discountAmount;

setSelectedCoupon({

  ...coupon,

  originalPrice,

  discountAmount,

  finalPrice,

});

// ✅ AUTO SCROLL DOWN

setTimeout(() => {

  const element = document.querySelector(
    ".selected-coupon-box"
  );

  if (element) {

    element.scrollIntoView({

      behavior: "smooth",
      block: "center",

    });

  }

}, 100);

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

    return () => {
      window.removeEventListener("click", unlockAudio);
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

  const matchedCoupons = getMatchedCoupons();

  return (
    <>
      {showCouponModal && selectedOffer && (
        <div className="coupon-modal-overlay">
          <div className="coupon-modal">
            <button
              className="coupon-close"
              onClick={() => {
                setShowCouponModal(false);
                setSelectedCoupon(null);
              }}
              type="button"
            >
              ✕
            </button>

            <div className="coupon-modal-top">
              <h2>🎉 Special Coupons</h2>
              <p>Select your best offer</p>
            </div>
           
            <div className="coupon-grid">
              {matchedCoupons.length > 0 ? (
                matchedCoupons.map((coupon) => {
                  const used = Number(coupon.used_count || 0);
                  const capacity = Number(coupon.capacity || 0);
                  const left = capacity - used;
                  const alreadyClaimed = claimedCoupons.includes(coupon.id);
                  const disabled =
  left <= 0;

                  return (
                    <div
                      key={coupon.id}
                      className={`coupon-card ${disabled ? "coupon-disabled" : ""}`}
                    >
                      <div className="coupon-top">
                        <span className="coupon-fire">🔥</span>
                        <span className="coupon-percent">
                          {coupon.discount_percentage}% OFF
                        </span>
                      </div>

                      <h3>{coupon.coupon_code}</h3>
                      <p>Limited Time Offer</p>

                      <div className="coupon-capacity">
                        🎟 Remaining: {left}
                      </div>

                      <button
                        type="button"
                        disabled={disabled}
                        className="apply-coupon-btn"
                        onClick={() => handleApplyCoupon(coupon)}
                      >
                        {left <= 0
  ? "Expired"
  : "Apply Coupon"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="coupon-empty-state">
                  No coupons available for this workspace type right now.
                </div>
              )}
            </div>

            {selectedCoupon && (
              <div className="selected-coupon-box">
                <h3>✅ Coupon Applied</h3>

                <div className="price-row">
                  <span>Original Price</span>
                  <strong className="old-price">
                    ₹{selectedCoupon.originalPrice}
                  </strong>
                </div>

                <div className="price-row">
                  <span>Discount</span>
                  <strong className="green-price">
                    {selectedCoupon.discount_percentage}% OFF
                  </strong>
                </div>

                <div className="price-row">
                  <span>You Save</span>
                  <strong className="green-price">
                    ₹{selectedCoupon.discountAmount}
                  </strong>
                </div>

                <div className="price-row total-price">
                  <span>Final Price</span>
                  <strong>₹{selectedCoupon.finalPrice}</strong>
                </div>

                <div className="coupon-applied-code">
                  🎟 {selectedCoupon.coupon_code}
                </div>

                <button
                  className="continue-btn"
                  type="button"
                  onClick={() => {
                    localStorage.setItem(
                      "claimedCoupons",
                      JSON.stringify([...claimedCoupons, selectedCoupon.id])
                    );

                    setClaimedCoupons([
                      ...claimedCoupons,
                      selectedCoupon.id,
                    ]);

                   openModal({
  ...selectedOffer,
  coupon: selectedCoupon,

  updateCouponState:
    (couponId) => {

      setOfferCoupons((prev) =>

        prev.map((coupon) => {

          if (
            coupon.id ===
            couponId
          ) {

            return {

              ...coupon,

              used_count:
                Number(
                  coupon.used_count || 0
                ) + 1,

            };

          }

          return coupon;

        })

      );

    },

});

                    setShowCouponModal(false);
                  }}
                >
                  Continue To Contact Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
            <span
              key={i}
              className="particle"
              style={{ "--i": i }}
            ></span>
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
                Special <em>Offers.</em>
              </span>
              <span className="offer-title-bot">
                Grab Your Workspace Today.
              </span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="offer-timer">
              <div className="timer-box">
                <strong>{pad(time.h)}</strong>
                <span>Hours</span>
              </div>
              <div className="timer-box">
                <strong>{pad(time.m)}</strong>
                <span>Mins</span>
              </div>
              <div className="timer-box">
                <strong>{pad(time.s)}</strong>
                <span>Secs</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="offer-grid">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="offer-card offer-card--available"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="card-ribbon">
                {offerCoupons.find(
                  (c) => Number(c.workspace) === Number(offer.id)
                )?.discount_percentage || 50}
                % OFF
              </div>

              <div className="offer-card-img">
                <img src={offer.image} alt={offer.building} />
              </div>

              <div className="offer-card-body">
                <p className="offer-card-type">{offer.type}</p>

                <h3 className="offer-card-title">
                  {offer.area}
                  {" | "}
                  {workspaces.find(
                    (w) =>
                      (
                        w.workspacename ||
                        w.name ||
                        w.title
                      )
                        ?.trim()
                        .toLowerCase() ===
                      offer.type?.trim().toLowerCase()
                  )?.location || offer.building}
                  {" | "}
                  {offer.type}
                </h3>

                <div className="offer-card-meta">
                  <span>🏬 {offer.floor}</span>
                  <span>👥 {offer.seats} Seats</span>
                </div>

                <div className="offer-amenities">
                  {offer.amenities?.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>

                <div className="offer-price-row">
                  <div className="offer-price">
                    <span className="price-original">
                      ₹{Number(offer.original_price).toLocaleString()}
                    </span>
                  </div>

                  <div className="price-now">
                    <span className="price-tag">Starting From</span>
                    <span className="price-discounted">
                      ₹{Number(offer.offer_price).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  className="offer-claim-btn"
                  type="button"
                  onClick={() => handleClaim(offer)}
                >
                  <span>View Special Coupons</span>
                  <span className="claim-arrow">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default LimitedOfferSection;
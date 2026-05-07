import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import axiosInstance from "../Services/Axios";

import "./BusinessSection.css";

import Reveal from "../Pages/Reveal";

function useCountdown(
  hours = 11,
  mins = 47,
  secs = 33
) {

  const [time, setTime] =
    useState({
      h: hours,
      m: mins,
      s: secs,
    });

  useEffect(() => {

    const timer = setInterval(() => {

      setTime((prev) => {

        let { h, m, s } = prev;

        if (s > 0)
          return {
            h,
            m,
            s: s - 1,
          };

        if (m > 0)
          return {
            h,
            m: m - 1,
            s: 59,
          };

        if (h > 0)
          return {
            h: h - 1,
            m: 59,
            s: 59,
          };

        return {
          h: 0,
          m: 0,
          s: 0,
        };
      });

    }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  return time;
}

const LimitedOfferSection = ({
  openModal,
}) => {

  const [offers, setOffers] =
    useState([]);

  const time = useCountdown(
    11,
    47,
    33
  );

  const sectionRef = useRef(null);

  const audioRef = useRef(null);

  const [audioReady, setAudioReady] =
    useState(false);

  const [
    isInsideSection,
    setIsInsideSection,
  ] = useState(false);

  // FETCH OFFERS
  const fetchOffers = () => {

    axiosInstance
      .get("workspaces/offers/")

      .then((res) => {

        setOffers(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })

      .catch((err) => {

        console.error(
          "Offer fetch error:",
          err
        );
      });
  };

  useEffect(() => {
    fetchOffers();
  }, []);

const handleClaim = (offer) => {

  if (openModal) {

    openModal(offer);

  } else {

    alert(
      "Lead submitted successfully!"
    );
  }
};

  const pad = (n) =>
    String(n).padStart(2, "0");

  const stopAudio = useCallback(() => {

    const audio =
      audioRef.current;

    if (!audio) return;

    audio.pause();

    audio.currentTime = 0;

  }, []);

  const playAudio = useCallback(() => {

    const audio =
      audioRef.current;

    if (
      !audio ||
      !audioReady
    )
      return;

    audio.pause();

    audio.currentTime = 0;

    audio.volume = 0.4;

    const promise =
      audio.play();

    if (
      promise &&
      typeof promise.catch ===
        "function"
    ) {
      promise.catch(() => {});
    }

  }, [audioReady]);

  useEffect(() => {

    const unlockAudio = () => {

      const audio =
        audioRef.current;

      if (!audio) return;

      audio.volume = 0;

      const promise =
        audio.play();

      if (
        promise &&
        typeof promise.then ===
          "function"
      ) {

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

    window.addEventListener(
      "click",
      unlockAudio,
      { once: true }
    );

    return () => {

      window.removeEventListener(
        "click",
        unlockAudio
      );
    };

  }, []);

  useEffect(() => {

    const section =
      sectionRef.current;

    if (!section) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {

          if (
            entry.isIntersecting
          ) {

            setIsInsideSection(
              true
            );

          } else {

            setIsInsideSection(
              false
            );

            stopAudio();
          }
        },
        {
          threshold: 0.55,
        }
      );

    observer.observe(section);

    return () =>
      observer.disconnect();

  }, [stopAudio]);

  useEffect(() => {

    if (
      isInsideSection &&
      audioReady
    ) {
      playAudio();
    }

    if (!isInsideSection) {
      stopAudio();
    }

  }, [
    isInsideSection,
    audioReady,
    playAudio,
    stopAudio,
  ]);

  return (

    <section
      className="offer-section"
      ref={sectionRef}
    >

      <audio
        ref={audioRef}
        src="/offers-alert.mp3"
        preload="auto"
        playsInline
        style={{
          display: "none",
        }}
      />

      <div className="offer-particles">

        {[...Array(18)].map(
          (_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                "--i": i,
              }}
            ></span>
          )
        )}

      </div>

      <div className="offer-header">

        <Reveal>

          <div className="offer-eyebrow">

            <span className="eyebrow-fire">
              🔥
            </span>

            <span>
              Limited Time Offer
            </span>

          </div>

        </Reveal>

        <Reveal>

          <h2 className="offer-title">

            <span className="offer-title-top">
              Exclusive Space.
            </span>

            <span className="offer-title-mid">
              50% <em>Off.</em>
            </span>

            <span className="offer-title-bot">
              Grab Your Workspace Today.
            </span>

          </h2>

        </Reveal>

        <Reveal>

          <p className="offer-subtitle">

            Secure your workspace
            at half the price for
            the first month.

          </p>

        </Reveal>

        <Reveal>

          <div
            className="offer-meta-row"
            style={{
              justifyContent:
                "center",
            }}
          >

            <div className="countdown-box">

              <span className="countdown-label">
                Offer Expires In
              </span>

              <div className="countdown-digits">

                <div className="digit-block">

                  <span className="digit">
                    {pad(time.h)}
                  </span>

                  <span className="digit-lbl">
                    HRS
                  </span>

                </div>

                <span className="digit-sep">
                  :
                </span>

                <div className="digit-block">

                  <span className="digit">
                    {pad(time.m)}
                  </span>

                  <span className="digit-lbl">
                    MIN
                  </span>

                </div>

                <span className="digit-sep">
                  :
                </span>

                <div className="digit-block">

                  <span className="digit digit-urgent">
                    {pad(time.s)}
                  </span>

                  <span className="digit-lbl">
                    SEC
                  </span>

                </div>

              </div>

            </div>

          </div>

        </Reveal>

      </div>

      <div className="offer-grid">

        {offers.map(
          (offer, index) => (

            <div
              key={offer.id}
              className="offer-card offer-card--available"
              style={{
                animationDelay:
                  `${index * 0.1}s`,
              }}
            >

              <div className="card-ribbon">
                50% OFF
              </div>

              <div className="offer-card-img">

                <img
                  src={offer.image}
                  alt={
                    offer.building
                  }
                />

                <div className="offer-card-img-overlay"></div>

                <div className="offer-card-area-tag">

                  <span>
                    🏢
                  </span>

                  {offer.area}

                </div>

              </div>

              <div className="offer-card-body">

                <p className="offer-card-type">
                  {offer.type}
                </p>

                <h3 className="offer-card-title">
                  {offer.building}
                </h3>

                <div className="offer-card-meta">

                  <span>
                    🏬 {offer.floor}
                  </span>

                  <span>
                    👥 {offer.seats}
                    Seats
                  </span>

                </div>

                <div className="offer-amenities">

                  {offer.amenities?.map(
                    (a) => (
                      <span
                        key={a}
                      >
                        {a}
                      </span>
                    )
                  )}

                </div>

                <div className="offer-price-row">

                  <div className="offer-price">

                    <span className="price-original">

                      ₹
                      {Number(
                        offer.original_price
                      ).toLocaleString()}

                    </span>

                    <span className="price-slash">
                      /day
                    </span>

                  </div>

                  <div className="price-now">

                    <span className="price-tag">
                      You Pay
                    </span>

                    <span className="price-discounted">

                      ₹
                      {Number(
                        offer.offer_price
                      ).toLocaleString()}

                      <small>
                        /day
                      </small>

                    </span>

                  </div>

                </div>

                <div className="offer-urgency">

                  <span className="urgency-pulse"></span>

                  <span>
                    Limited offer
                    available now
                  </span>

                </div>

                <button
                  className="offer-claim-btn"
                  onClick={() =>
                    handleClaim(
                      offer
                    )
                  }
                >

                  <span>
                    Claim 50% Off
                    Now
                  </span>

                  <span className="claim-arrow">
                    →
                  </span>

                </button>

              </div>

            </div>
          )
        )}

      </div>

    </section>
  );
};

export default LimitedOfferSection;
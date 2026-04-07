import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/Details.css";

/* ── Gallery images ── */
const GALLERY = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=900",
];

/* ── Static reviews ── */
const REVIEWS = [
  { id: 1, name: "Aditya R.",  rating: 5, date: "Mar 2025", text: "Exceptional space — fast internet, great ambience, and very professional staff. Highly recommend for remote teams." },
  { id: 2, name: "Sneha M.",   rating: 4, date: "Feb 2025", text: "Very comfortable seating and calm environment. Perfect for deep work sessions. The coffee is a bonus!" },
  { id: 3, name: "Rahul K.",   rating: 5, date: "Jan 2025", text: "Prime location, modern interiors and 24/7 access made this our go-to office for the entire quarter." },
  { id: 4, name: "Priya T.",   rating: 4, date: "Dec 2024", text: "Great value for money. Clean, quiet and well-equipped. Would definitely book again for client meetings." },
];

/* ── Amenities ── */
const AMENITIES = [
  { icon: "⚡", label: "High-Speed WiFi" },
  { icon: "❄️", label: "Air Conditioning" },
  { icon: "🅿️", label: "Free Parking" },
  { icon: "☕", label: "Cafeteria & Coffee" },
  { icon: "📽️", label: "Meeting Rooms" },
  { icon: "🖨️", label: "Printing & Scanning" },
  { icon: "🔒", label: "24/7 Security" },
  { icon: "💡", label: "Power Backup" },
  { icon: "🛋️", label: "Lounge Area" },
  { icon: "📦", label: "Storage Lockers" },
];

/* ── Working hours ── */
const HOURS = [
  { day: "Monday – Friday", time: "6:00 AM – 11:00 PM" },
  { day: "Saturday",         time: "8:00 AM – 10:00 PM" },
  { day: "Sunday",           time: "9:00 AM – 8:00 PM"  },
];

/* ── Stars component ── */
const Stars = ({ rating }) => (
  <span className="stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= rating ? "star filled" : "star"}>★</span>
    ))}
  </span>
);

function Details({ openModal }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [data,     setData]     = useState(null);
  const [related,  setRelated]  = useState([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    axiosInstance.get("workspaces/categories/")
      .then(res => {
        const all  = res.data;
        const item = all.find(i => i.id == id);
        setData(item);
        setRelated(all.filter(i => i.id != id && i.category === item?.category).slice(0, 3));
      });
  }, [id]);

  /* Auto-advance slider */
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setSlideIdx(p => (p + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [autoPlay, data]);

  const slides   = data?.image ? [data.image, ...GALLERY.slice(1)] : GALLERY;
  const prevSlide = () => { setAutoPlay(false); setSlideIdx(p => (p === 0 ? slides.length - 1 : p - 1)); };
  const nextSlide = () => { setAutoPlay(false); setSlideIdx(p => (p + 1) % slides.length); };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { setShareMsg("Link copied!"); setTimeout(() => setShareMsg(""), 2500); })
      .catch(() => { setShareMsg("Copy failed"); setTimeout(() => setShareMsg(""), 2500); });
  };

const handleBook = () => {
  if (!data.is_available) {
    alert("Not Available Now");
    return;
  }

  const token = localStorage.getItem("access");

  if (!token) {
    alert("Please login first");
    navigate("/auth");
    return;
  }

  // navigate to SpecialContact page
  navigate(`/special-contact/${data.id}`, {
    state: {
      workspace: data
    }
  });
};

  if (!data) {
    return (
      <div className="details-loading">
        <div className="details-spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  const avgRating = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div className="details-page">

      {/* ── TOP BAR ── */}
      <div className="details-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="details-actions">
          <button
            className={`action-btn ${wishlist ? "wishlisted" : ""}`}
            onClick={() => setWishlist(w => !w)}
          >
            {wishlist ? "♥" : "♡"} {wishlist ? "Saved" : "Save"}
          </button>
          <button className="action-btn" onClick={handleShare}>
            ↗ Share
          </button>
          {shareMsg && <span className="share-toast">{shareMsg}</span>}
        </div>
      </div>

      {/* ── IMAGE SLIDER ── */}
      <div className="gallery-wrap">
        <div className="gallery-main">
          <img src={slides[slideIdx]} alt="workspace" className="gallery-img" key={slideIdx} />
          <div className="gallery-overlay"></div>
          <button className="gallery-arrow gallery-prev" onClick={prevSlide}>‹</button>
          <button className="gallery-arrow gallery-next" onClick={nextSlide}>›</button>
          <div className="gallery-dots">
            {slides.map((_, i) => (
              <button key={i}
                className={`gallery-dot ${i === slideIdx ? "gallery-dot-active" : ""}`}
                onClick={() => { setAutoPlay(false); setSlideIdx(i); }}
              />
            ))}
          </div>
          <div className="gallery-counter">
            {String(slideIdx + 1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="gallery-thumbs">
          {slides.map((src, i) => (
            <div key={i}
              className={`gallery-thumb ${i === slideIdx ? "gallery-thumb-active" : ""}`}
              onClick={() => { setAutoPlay(false); setSlideIdx(i); }}
            >
              <img src={src} alt={`thumb-${i}`} />
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="details-grid">

        {/* LEFT */}
        <div className="details-left">

          {/* Header */}
          <div className="details-header">
            <span className={`avail-badge ${data.is_available ? "avail-yes" : "avail-no"}`}>
              <span className="avail-dot"></span>
              {data.is_available ? "Available Now" : "Unavailable"}
            </span>
            <h1 className="details-title">{data.name}</h1>
            <div className="details-meta">
              <span className="meta-rating">
                <Stars rating={Math.round(Number(avgRating))} />
                {avgRating} ({REVIEWS.length} reviews)
              </span>
              <span className="meta-tag">{data.category?.replace("_"," ") || "Coworking"}</span>
            </div>
          </div>

          <p className="details-description">{data.description}</p>

          {/* About */}
          <div className="details-about">
            <h3 className="section-label">About This Space</h3>
            <p>
              A premium coworking space designed to provide flexible, modern, and fully
              equipped work environments for freelancers, startups, remote workers, and
              enterprises. Choose from different workspace types based on your needs,
              duration, and budget. Seamless booking, real-time availability, and premium
              amenities ensure your productivity and comfort every single day. No long-term
              contracts required — book by the hour, day, or month.
            </p>
          </div>

          {/* Amenities */}
          <div className="amenities-section">
            <h3 className="section-label">Amenities</h3>
            <div className="amenities-grid">
              {AMENITIES.map((a, i) => (
                <div key={i} className="amenity-item">
                  <span className="amenity-icon">{a.icon}</span>
                  <span className="amenity-label">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Working hours */}
          <div className="hours-section">
            <h3 className="section-label">Working Hours</h3>
            <div className="hours-list">
              {HOURS.map((h, i) => (
                <div key={i} className="hours-row">
                  <span className="hours-day">{h.day}</span>
                  <span className="hours-time">{h.time}</span>
                </div>
              ))}
              <div className="hours-note">
                <span>🔑</span>
                <span>24/7 access available for monthly members</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="reviews-section">
            <h3 className="section-label">
              Reviews
              <span className="reviews-avg">
                <Stars rating={Math.round(Number(avgRating))} />
                {avgRating} / 5
              </span>
            </h3>
            <div className="reviews-list">
              {REVIEWS.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-top">
                    <div className="review-avatar">{r.name.charAt(0)}</div>
                    <div className="review-info">
                      <strong>{r.name}</strong>
                      <span>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT — Sticky booking card */}
        <div className="details-right">
          <div className="booking-card">
            <div className="booking-card-topbar"></div>
            <h3 className="booking-card-title">Book This Space</h3>
            <p className="booking-card-sub">Flexible plans — no hidden charges</p>

            <div className="booking-prices">
              <div className="b-price-row">
                <span className="b-price-label">Hourly</span>
                <span className="b-price-val">₹{data.hourly_price || "—"}</span>
              </div>
              <div className="b-price-row b-price-highlight">
                <span className="b-price-label">Daily</span>
                <span className="b-price-val">₹{data.daily_price || "—"}</span>
              </div>
              <div className="b-price-row">
                <span className="b-price-label">Monthly</span>
                <span className="b-price-val">₹{data.monthly_price || "—"}</span>
              </div>
            </div>

            <div className="booking-includes">
              <p className="booking-includes-title">Includes</p>
              {["High-speed WiFi","Cafeteria access","Free Parking","24/7 Support"].map((f,i) => (
                <div key={i} className="booking-include-item">
                  <span className="include-check">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <button className="book-btn" onClick={handleBook} disabled={!data?.is_available}>
              {data?.is_available ? "Book Now →" : "Not Available"}
            </button>

            <div className="booking-card-bottom">
              <button className={`card-wish-btn ${wishlist ? "wishlisted" : ""}`}
                onClick={() => setWishlist(w => !w)}>
                {wishlist ? "♥ Saved" : "♡ Save"}
              </button>
              <button className="card-share-btn" onClick={handleShare}>↗ Share</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED WORKSPACES ── */}
      {related.length > 0 && (
        <div className="related-section">
          <h3 className="section-label">Similar Workspaces</h3>
          <div className="related-grid">
            {related.map(item => (
              <div key={item.id} className="related-card"
                onClick={() => navigate(`/details/${item.id}`)}>
                <div className="related-img-wrap">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"}
                    alt={item.name}
                  />
                  <div className="related-overlay"></div>
                  <h4 className="related-name">{item.name}</h4>
                </div>
                <div className="related-body">
                  <p className="related-cat">{item.category?.replace("_"," ") || "Coworking"}</p>
                  <span className="related-price">₹{item.daily_price || item.hourly_price}/day</span>
                  <button className="related-btn">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Details;

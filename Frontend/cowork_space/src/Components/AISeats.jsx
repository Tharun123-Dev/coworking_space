import { useState } from "react";
import axios from "axios";
import "../Styles/AISeats.css";
import Reveal from "../Pages/Reveal";

function Recommendations() {
  const [form, setForm] = useState({
    city: "",
    min_price: "",
    max_price: "",
    rating: "",
    workspace_type: "",
    amenities: [],
    capacity: "",
  });

  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmenities = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value],
    }));
  };

  const handleSubmit = () => {
    axios
      // .post("http://127.0.0.1:8000/api/recommend/", form)
       .post(" https://coworking-sv4x.onrender.com/api/recommend/", form)
      .then((res) => {
        setResults(res.data);
        setForm({
          city: "",
          min_price: "",
          max_price: "",
          rating: "",
          workspace_type: "",
          amenities: [],
          capacity: "",
        });
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="ai-page">

      {/* ========== TOP HERO — LEFT TEXT + RIGHT AI BOX ========== */}
      <div className="ai-hero">

        {/* ===== LEFT SIDE — Full descriptive text ===== */}
        <div className="ai-left">

          <Reveal>
            <span className="ai-section-tag">
              <span className="ai-tag-dot"></span>
              AI Powered
            </span>
          </Reveal>

          <Reveal>
            <h1 className="ai-left-title">
              Find Your Perfect
              <span className="ai-gold-text"> Workspace</span>
              <br />
              With AI Precision
            </h1>
          </Reveal>

          <Reveal>
            <p className="ai-left-desc">
              Our intelligent recommendation engine analyzes your budget,
              preferred location, workspace type, and amenity needs — then
              surfaces the most compatible coworking spaces tailored exactly
              to your requirements.
            </p>
          </Reveal>

          {/* Feature points */}
          <Reveal>
            <div className="ai-features">
              <div className="ai-feature-item">
                <span className="ai-feature-icon">⚡</span>
                <div>
                  <strong>Instant Results</strong>
                  <p>Get matched workspaces in seconds using smart filters.</p>
                </div>
              </div>
              <div className="ai-feature-item">
                <span className="ai-feature-icon">🎯</span>
                <div>
                  <strong>Precision Matching</strong>
                  <p>AI scores each space based on your exact preferences.</p>
                </div>
              </div>
              <div className="ai-feature-item">
                <span className="ai-feature-icon">💼</span>
                <div>
                  <strong>Every Business Type</strong>
                  <p>From solo freelancers to enterprise teams, we have it.</p>
                </div>
              </div>
              <div className="ai-feature-item">
                <span className="ai-feature-icon">📍</span>
                <div>
                  <strong>Location Aware</strong>
                  <p>Discover top-rated spaces across prime city locations.</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Trust badges row */}
          <Reveal>
            <div className="ai-trust">
              <div className="ai-trust-item">
                <span className="ai-trust-num">500+</span>
                <span className="ai-trust-label">Spaces Listed</span>
              </div>
              <div className="ai-trust-div"></div>
              <div className="ai-trust-item">
                <span className="ai-trust-num">10+</span>
                <span className="ai-trust-label">Cities</span>
              </div>
              <div className="ai-trust-div"></div>
              <div className="ai-trust-item">
                <span className="ai-trust-num">50K+</span>
                <span className="ai-trust-label">Happy Members</span>
              </div>
            </div>
          </Reveal>

        </div>

        {/* ===== RIGHT SIDE — AI Box ===== */}
        <div className="ai-right">
          <Reveal>
            <div className="ai-mini-box">

              {/* Animated gold top bar */}
              <div className="ai-box-topbar"></div>

              <div className="ai-top-head">
                <Reveal>
                  <span className="ai-badge">✦ AI Workspace Finder</span>
                </Reveal>
                <Reveal>
                  <h2>Tell Us What You Need</h2>
                </Reveal>
                <Reveal>
                  <p>
                    Fill in your preferences and our AI will suggest the
                    most suitable workspace options for you.
                  </p>
                </Reveal>
              </div>

              {/* Form inputs grid */}
              <div className="ai-form-grid">
                <Reveal>
                  <div className="ai-input-group">
                    <label>City</label>
                    <input
                      name="city"
                      placeholder="e.g. Hyderabad"
                      onChange={handleChange}
                      value={form.city}
                    />
                  </div>
                </Reveal>

                <Reveal>
                  <div className="ai-input-group">
                    <label>Min Price (₹)</label>
                    <input
                      name="min_price"
                      placeholder="e.g. 500"
                      onChange={handleChange}
                      value={form.min_price}
                    />
                  </div>
                </Reveal>

                <Reveal>
                  <div className="ai-input-group">
                    <label>Max Price (₹)</label>
                    <input
                      name="max_price"
                      placeholder="e.g. 5000"
                      onChange={handleChange}
                      value={form.max_price}
                    />
                  </div>
                </Reveal>

                <Reveal>
                  <div className="ai-input-group">
                    <label>Min Rating</label>
                    <input
                      name="rating"
                      placeholder="e.g. 4.5"
                      onChange={handleChange}
                      value={form.rating}
                    />
                  </div>
                </Reveal>

                <Reveal>
                  <div className="ai-input-group">
                    <label>Workspace Type</label>
                    <input
                      name="workspace_type"
                      placeholder="Fixed desk / Hotdesk"
                      onChange={handleChange}
                      value={form.workspace_type}
                    />
                  </div>
                </Reveal>

                <Reveal>
                  <div className="ai-input-group">
                    <label>Capacity</label>
                    <input
                      name="capacity"
                      placeholder="e.g. 10"
                      onChange={handleChange}
                      value={form.capacity}
                    />
                  </div>
                </Reveal>
              </div>

              {/* Amenities checkboxes */}
              <div className="ai-amenities">
                <Reveal>
                  <span className="ai-amenities-title">Select Amenities</span>
                </Reveal>
                <div className="ai-check-wrap">
                  {["wifi", "ac", "parking", "cafeteria", "meeting room"].map((amenity) => (
                    <label key={amenity} className="check-label">
                      <div className={`check-chip ${form.amenities.includes(amenity) ? "checked" : ""}`}>
                        <input
                          type="checkbox"
                          value={amenity}
                          checked={form.amenities.includes(amenity)}
                          onChange={handleAmenities}
                        />
                        <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <Reveal>
                <button className="ai-main-btn" onClick={handleSubmit}>
                  <span>Get AI Recommendations</span>
                  <span className="ai-btn-icon">→</span>
                </button>
              </Reveal>

            </div>
          </Reveal>
        </div>
      </div>

      {/* ========== RESULTS GRID ========== */}
      {results.length > 0 && (
        <div className="ai-results-section">
          <Reveal>
            <div className="ai-results-head">
              <span className="ai-section-tag">
                <span className="ai-tag-dot"></span>
                AI Results
              </span>
              <h2>Top Matched Workspaces</h2>
              <p>{results.length} spaces found based on your preferences</p>
            </div>
          </Reveal>

          <div className="gridd">
            {results.map((item) => (
              <Reveal key={item.id}>
                <div className="cardd">
                  <div className="cardd-img-wrap">
                    <img src={item.image} alt={item.name} />
                    <div className="cardd-score">Score: {item.score}</div>
                  </div>
                  <div className="cardd-body">
                    <h3>{item.name}</h3>
                    <p className="cardd-city">📍 {item.city}</p>
                    <p className="cardd-price">₹{item.price} <span>/day</span></p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Recommendations;

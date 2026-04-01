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
      .post("https://coworking-space-3.onrender.com/api/recommend/", form)
      // .post("http://127.0.0.1:8000/api/recommend/", form)
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
    <div className="contain">
      <div className="ai-mini-box">
        <div className="ai-top-head">
          <Reveal>
            <span className="ai-badge">AI Workspace Finder</span>
          </Reveal>

          <Reveal>
            <h2>Find Your Workspace</h2>
          </Reveal>

          <Reveal>
            <p>
              Tell us your budget, workspace type, amenities, and seating needs.
              We will suggest the most suitable workspace options for you.
            </p>
          </Reveal>
        </div>

        <div className="ai-form-grid">
          <Reveal>
            <input
              name="city"
              placeholder="City (Must use Hyderabad)"
              onChange={handleChange}
              value={form.city}
            />
          </Reveal>

          <Reveal>
            <input
              name="min_price"
              placeholder="Min Price"
              onChange={handleChange}
              value={form.min_price}
            />
          </Reveal>

          <Reveal>
            <input
              name="max_price"
              placeholder="Max Price"
              onChange={handleChange}
              value={form.max_price}
            />
          </Reveal>

          <Reveal>
            <input
              name="rating"
              placeholder="Rating"
              onChange={handleChange}
              value={form.rating}
            />
          </Reveal>

          <Reveal>
            <input
              name="workspace_type"
              placeholder="Type (Eg. Fixed desk, Hotdesk)"
              onChange={handleChange}
              value={form.workspace_type}
            />
          </Reveal>

          <Reveal>
            <input
              name="capacity"
              placeholder="Capacity"
              onChange={handleChange}
              value={form.capacity}
            />
          </Reveal>
        </div>

        <div className="ai-amenities">
          <Reveal>
            <span className="ai-amenities-title">Select Amenities</span>
          </Reveal>

          <div className="ai-check-wrap">
            <label>
              <Reveal>
                <div className="check-chip">
                  <input
                    type="checkbox"
                    value="wifi"
                    checked={form.amenities.includes("wifi")}
                    onChange={handleAmenities}
                  />
                  <span>WiFi</span>
                </div>
              </Reveal>
            </label>

            <label>
              <Reveal>
                <div className="check-chip">
                  <input
                    type="checkbox"
                    value="ac"
                    checked={form.amenities.includes("ac")}
                    onChange={handleAmenities}
                  />
                  <span>AC</span>
                </div>
              </Reveal>
            </label>

            <label>
              <Reveal>
                <div className="check-chip">
                  <input
                    type="checkbox"
                    value="parking"
                    checked={form.amenities.includes("parking")}
                    onChange={handleAmenities}
                  />
                  <span>Parking</span>
                </div>
              </Reveal>
            </label>
          </div>
        </div>

        <Reveal>
          <button className="ai-main-btn" onClick={handleSubmit}>
            Get Recommendations
          </button>
        </Reveal>
      </div>

      <div className="gridd">
        {results.map((item) => (
          <Reveal key={item.id}>
            <div className="cardd">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.city}</p>
              <p>₹{item.price}</p>
              <p>Score: {item.score}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
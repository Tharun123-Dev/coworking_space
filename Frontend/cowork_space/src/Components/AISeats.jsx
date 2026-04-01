import { useState } from "react";
import axios from "axios";
import "../Styles/AISeats.css";
import Reveal from "../Pages/Reveal"
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
      // .post("https://coworking-space-3.onrender.com/api/recommend/", form)
      .post("http://127.0.0.1:8000/api/recommend/", form)
      .then((res) => {
        setResults(res.data);
        // Clear all fields after successful submit
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
      <Reveal>
      <h2>Find Your Workspace (🤖 AI Recommended)</h2>
</Reveal>
 <Reveal>
      <input name="city" placeholder="City(Must use Hyderabad)" onChange={handleChange} value={form.city} />
      <input name="min_price" placeholder="Min Price" onChange={handleChange} value={form.min_price} />
      <input name="max_price" placeholder="Max Price" onChange={handleChange} value={form.max_price} />
      <input name="rating" placeholder="Rating" onChange={handleChange} value={form.rating} />
      <input name="workspace_type" placeholder="Type(Eg.Fixed deskHotdesk....)" onChange={handleChange} value={form.workspace_type} />
      <input name="capacity" placeholder="Capacity" onChange={handleChange} value={form.capacity} />
</Reveal>
      <div>
        <label>
           <Reveal>
          <input
            type="checkbox"
            value="wifi"
            checked={form.amenities.includes("wifi")}
            onChange={handleAmenities}
          />{" "}
          WiFi
          </Reveal>
        </label>

        <label>
          <Reveal>
          <input
            type="checkbox"
            value="ac"
            checked={form.amenities.includes("ac")}
            onChange={handleAmenities}
          />{" "}
          AC
          </Reveal>
        </label>
        <label>
          <Reveal>
          <input
            type="checkbox"
            value="parking"
            checked={form.amenities.includes("parking")}
            onChange={handleAmenities}
          />{" "}
          Parking
          </Reveal>
          

        </label>
      </div>

      <button onClick={handleSubmit}>Get Recommendations</button>

      <div className="gridd">
        {results.map((item) => (
          <div className="cardd" key={item.id}>
            <img src={item.image} alt="" />
            <h3>{item.name}</h3>
            <p>{item.city}</p>
            <p>₹{item.price}</p>
            <p>Score: {item.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;

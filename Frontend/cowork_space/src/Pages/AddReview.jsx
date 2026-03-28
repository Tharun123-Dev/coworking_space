import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AddReview.css";

function ReviewWidget() {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    rating: 5,
    comment: ""
  });

  const token = localStorage.getItem("access");

  //  FETCH REVIEWS (FIXED)
  const fetchReviews = () => {
    axiosInstance.get("reviews/all/")
      .then(res => setReviews(res.data))
      .catch(() => console.log("Error loading reviews"));
  };

  // RUN ON LOAD
  useEffect(() => {
    fetchReviews();
  }, []);

  // ADD REVIEW
  const handleSubmit = () => {

    if (!token) {
      alert("Please login first ❌");
      return;
    }

    if (!form.comment) {
      alert("Write something ❌");
      return;
    }

    setLoading(true);

    axiosInstance.post("reviews/add/", {
      rating: form.rating,
      comment: form.comment
    })
    .then(() => {
      alert("Review added 🎉");

      // REFRESH REVIEWS
      fetchReviews();

      setForm({ rating: 5, comment: "" });
    })
    .catch((err) => {
      alert(err.response?.data?.error || "Error ❌");
    })
    .finally(() => setLoading(false));
  };

  return (
    <>
      {/*  FLOATING BUTTON */}
      <div className="review-btn" onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* PANEL */}
      <div className={`review-panel ${open ? "open" : ""}`}>
        
        <div className="review-header">
          <h3>⭐ Reviews</h3>
          <span onClick={() => setOpen(false)}>✖</span>
        </div>

        {/* FORM */}
        <div className="review-form">
          <textarea
            placeholder="Write your review..."
            value={form.comment}
            onChange={(e) =>
              setForm({ ...form, comment: e.target.value })
            }
          />

          <select
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: e.target.value })
            }
          >
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* REVIEWS */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-card">
                <h4>👤 {r.username}</h4>
                <p className="stars">{"⭐".repeat(r.rating)}</p>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}

export default ReviewWidget;
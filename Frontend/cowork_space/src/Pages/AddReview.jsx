import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AddReview.css";
import "../Improved/Chatbot.css";
import R from "../Pages/Reveal";

function ReviewChatWidget() {
  const [openReview, setOpenReview] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // REVIEW STATE
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    comment: ""
  });

  // CHAT STATE
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const token = localStorage.getItem("access");

  // ================= FETCH REVIEWS =================
  const fetchReviews = () => {
    axiosInstance.get("reviews/all/")
      .then(res => setReviews(res.data))
      .catch(() => console.log("Error loading reviews"));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ================= AUTO POPUP ON LOAD =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1500); // show after 1.5 sec

    const hideTimer = setTimeout(() => {
      setShowPopup(false);
    }, 6000); // auto hide

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ================= AUTO BOT MESSAGE =================
  // useEffect(() => {
  //   if (openChat && messages.length === 0) {
  //     setMessages([
  //       { sender: "bot", text: "Hi there 👋 How can I help you?" }
  //     ]);
  //   }
  // }, [openChat]);

  // ================= ADD REVIEW =================
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

    axiosInstance.post("reviews/add/", form)
      .then(() => {
        alert("Review added 🎉");
        fetchReviews();
        setForm({ rating: 5, comment: "" });
      })
      .catch(err => {
        alert(err.response?.data?.error || "Error ❌");
      })
      .finally(() => setLoading(false));
  };

  // ================= CHAT SEND =================
  const sendMessage = () => {
    if (!input) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    axiosInstance.post("chatbot/", { message: input })
      .then(res => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: res.data.reply }
        ]);
      })
      .catch(() => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Something went wrong ❌" }
        ]);
      });

    setInput("");
  };

  return (
    <>
      {/* ================= CHATBOT BUTTON ================= */}
      {/* <div
        className="chatbot-btn"
        onClick={() => {
          setOpenChat(!openChat);
          setOpenReview(false);
          setShowPopup(false); // hide popup when clicked
        }}
      >
        🤖
      </div> */}

      {/* ================= POPUP MESSAGE ================= */}
      {/* {showPopup && (
        <div className="chatbot-popup">
          <p>Hi there 👋<br />How can I help you?</p>
          <span onClick={() => setShowPopup(false)}>✖</span>
        </div>
      )} */}

      {/* ================= REVIEW BUTTON ================= */}
      <div
        className="review-btn"
        onClick={() => {
          setOpenReview(!openReview);
          setOpenChat(false);
        }}
      >
        💬
      </div>

      {/* ================= REVIEW PANEL ================= */}
      <div className={`review-panel ${openReview ? "open" : ""}`}>
        <div className="review-header">
          <R><h3>⭐ Reviews</h3></R>
          <span onClick={() => setOpenReview(false)}>✖</span>
        </div>

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

        <div className="review-list">
          {reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="review-card">
                <R><h4>👤 {r.username}</h4></R>
                <R><p className="stars">{"⭐".repeat(r.rating)}</p></R>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= CHATBOT PANEL ================= */}
      {/* <div className={`chatbot-panel ${openChat ? "open" : ""}`}>
        <div className="chatbot-header">
          <h3>AI Assistant</h3>
          <span onClick={() => setOpenChat(false)}>✖</span>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chatbot-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div> */}
    </>
  );
}

export default ReviewChatWidget;
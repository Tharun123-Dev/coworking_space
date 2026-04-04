import { useState, useEffect } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // AUTO MESSAGE
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { sender: "bot", text: "Hi there 👋 How can I help you?" }
      ]);
    }
  }, [open]);

  const sendMessage = () => {
    if (!input) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    axiosInstance.post("chatbot/", { message: input })
      .then(res => {
        const botMsg = { sender: "bot", text: res.data.reply };
        setMessages(prev => [...prev, botMsg]);
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
      {/* FLOAT BUTTON */}
      <div className="chatbot-btn" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* PANEL */}
      <div className={`chatbot-panel ${open ? "open" : ""}`}>
        
        <div className="chatbot-header">
          <h3>AI Assistant</h3>
          <span onClick={() => setOpen(false)}>✖</span>
        </div>

        {/* MESSAGES */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="chatbot-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>

      </div>
    </>
  );
}

export default Chatbot;
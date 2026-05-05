// import { useState, useEffect } from "react";
// import axiosInstance from "../Services/Axios";
// // import "./Chatbot.css";

// function Chatbot() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   useEffect(() => {
//     if (open && messages.length === 0) {
//       setMessages([
//         { sender: "bot", text: "Hi there 👋 How can I help you?" }
//       ]);
//     }
//   }, [open, messages.length]);

//   const sendMessage = () => {
//     if (!input.trim()) return;

//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);

//     axiosInstance
//       .post("chatbot/", { message: input })
//       .then((res) => {
//         const botMsg = { sender: "bot", text: res.data.reply };
//         setMessages((prev) => [...prev, botMsg]);
//       })
//       .catch(() => {
//         setMessages((prev) => [
//           ...prev,
//           { sender: "bot", text: "Something went wrong ❌" }
//         ]);
//       });

//     setInput("");
//   };

//   return (
//     <>
//       {!open && (
//         <button className="chatbot-btn" onClick={() => setOpen(true)}>
//           🤖
//         </button>
//       )}

//       <div
//         className={`chatbot-overlay ${open ? "show" : ""}`}
//         onClick={() => setOpen(false)}
//       ></div>

//       <div className={`chatbot-panel ${open ? "open" : ""}`}>
//         <div className="chatbot-header">
//           <h3>AI Assistant</h3>
//           <span onClick={() => setOpen(false)}>✕</span>
//         </div>

//         <div className="chatbot-messages">
//           {messages.map((msg, i) => (
//             <div key={i} className={`msg ${msg.sender}`}>
//               {msg.text}
//             </div>
//           ))}
//         </div>

//         <div className="chatbot-input">
//           <input
//             type="text"
//             placeholder="Ask something..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button onClick={sendMessage}>Send</button>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Chatbot;

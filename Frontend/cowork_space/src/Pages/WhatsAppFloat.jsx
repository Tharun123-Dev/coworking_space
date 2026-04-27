import React from "react";
import "../Styles/WhatsAppFloat.css";

function WhatsAppFloat() {
  const phoneNumber = "916309383826";
  const message = "Hello, I want to know more about your services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-wrap"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <span className="whatsapp-ring"></span>

      <div className="whatsapp-float-btn">
        <div className="whatsapp-icon-area">
          <svg
            className="whatsapp-icon"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.01 3.2c-7.07 0-12.8 5.72-12.8 12.77 0 2.25.59 4.44 1.71 6.37L3 29l6.84-1.79a12.82 12.82 0 0 0 6.17 1.58h.01c7.07 0 12.8-5.72 12.8-12.77S23.08 3.2 16.01 3.2zm0 23.42h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.06 1.06 1.08-3.96-.25-.41a10.56 10.56 0 0 1-1.62-5.59c0-5.85 4.78-10.61 10.65-10.61 2.84 0 5.51 1.1 7.52 3.1a10.53 10.53 0 0 1 3.13 7.51c0 5.85-4.78 10.61-10.65 10.61z" />
            <path d="M19.11 17.21c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.47-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.21s.96 2.57 1.09 2.75c.13.18 1.89 2.88 4.57 4.04.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.8-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
          </svg>
        </div>

        <div className="whatsapp-text-area">
          <span className="whatsapp-main-text">Chat</span>
        </div>
      </div>
    </a>
  );
}

export default WhatsAppFloat;
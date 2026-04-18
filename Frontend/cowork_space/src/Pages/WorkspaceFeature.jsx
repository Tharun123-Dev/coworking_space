import { useState, useRef } from "react";
import "../Styles/WorkspaceFeature.css";
import { useNavigate } from "react-router-dom";
import Reveal from "../Pages/Reveal";

const data = [
  {
    id: 1,
    title: "Desks",
    desc: "Upgrade your desks with sit-stand functionality or choose spacious executive models built for productivity.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c",
    tag: "Most Popular"
  },
  {
    id: 2,
    title: "Chairs",
    desc: "Elevate seating comfort with upgraded chairs offering superior lumbar support and ergonomic design.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    tag: "Premium"
  },
  {
    id: 3,
    title: "Meeting Spaces",
    desc: "Create personalized meeting areas tailored to your team's collaboration and presentation needs.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
    tag: "Enterprise"
  },
  {
    id: 4,
    title: "Furniture Options",
    desc: "Choose additional furnishings to establish a relaxing, productive and inspiring atmosphere.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    tag: "Flexible"
  },
  {
    id: 5,
    title: "Storage Solutions",
    desc: "Ensure your workspace stays organized, clean and secure with our smart storage options.",
    image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344",
    tag: "Smart"
  }
];

function WorkspaceFeature() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const imageSectionRef = useRef(null);

  const prev = () => setIndex(index === 0 ? data.length - 1 : index - 1);
  const next = () => setIndex((index + 1) % data.length);

  const handleItemClick = (i) => {
    setIndex(i);

    if (window.innerWidth <= 768 && imageSectionRef.current) {
      setTimeout(() => {
        imageSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  };

  return (
    <div className="wf-wrapper">
      <Reveal>
        <div className="wf-header">
          <span className="wf-tag">
            <span className="wf-tag-dot"></span>
            Workspace Customization
          </span>
          <h2>Customize Your <span className="wf-gold">Office Space</span></h2>
          <p>Tailor every detail of your workspace to reflect your unique style, brand, and workflow.</p>
        </div>
      </Reveal>

      <div className="wf-container">
        <div className="wf-left">
          {data.map((item, i) => (
            <div
              key={item.id}
              className={`wf-item ${i === index ? "active" : ""}`}
              onClick={() => handleItemClick(i)}
            >
              <span className="number">0{item.id}</span>

              <div className="wf-text">
                <div className="wf-item-top">
                  <h3>{item.title}</h3>
                  <span className="wf-item-tag">{item.tag}</span>
                </div>
                <p>{item.desc}</p>
              </div>

              {i === index && <span className="wf-active-arrow">→</span>}
            </div>
          ))}

          <div className="wf-dots">
            {data.map((_, i) => (
              <button
                key={i}
                className={`wf-dot ${i === index ? "wf-dot-active" : ""}`}
                onClick={() => handleItemClick(i)}
              />
            ))}
          </div>

          <Reveal>
            <button
              className="contact-btn"
              onClick={() => { window.location.href = "/Contact"; }}
            >
              <span>Contact Us</span>
              <span className="contact-btn-arrow">→</span>
            </button>
          </Reveal>
        </div>

        <div className="wf-right" ref={imageSectionRef}>
          <Reveal>
            <div className="wf-img-wrap">
              <img
                src={data[index].image}
                alt={data[index].title}
                key={index}
              />
              <div className="wf-img-overlay"></div>

              <div className="wf-img-caption">
                <span className="wf-caption-tag">{data[index].tag}</span>
                <h4>{data[index].title}</h4>
              </div>

              <div className="wf-counter">
                {String(index + 1).padStart(2, "0")} / {String(data.length).padStart(2, "0")}
              </div>
            </div>
          </Reveal>

          {/* <div className="wf-arrows">
            <button onClick={prev} aria-label="Previous">←</button>
            <button onClick={next} aria-label="Next">→</button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceFeature;
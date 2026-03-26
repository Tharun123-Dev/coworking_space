import { useState } from "react";
import "../Styles/WorkspaceFeature.css";
import { useNavigate } from "react-router-dom";

const data = [
  {
    id: 1,
    title: "Desks",
    desc: "Upgrade your desks with sit-stand functionality or choose spacious executive models.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c"
  },
  {
    id: 2,
    title: "Chairs",
    desc: "Elevate seating comfort with upgraded chairs offering superior lumbar support.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"
  },
  {
    id: 3,
    title: "Meeting spaces",
    desc: "Create personalized meeting areas tailored to your team’s needs.",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786"
  },
  {
    id: 4,
    title: "Furniture options",
    desc: "Choose additional furnishings to establish a relaxing atmosphere.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511"
  },
  {
    id: 5,
    title: "Storage solutions",
    desc: "Ensure your workspace stays organized and secure.",
    image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344"
  }
];

function WorkspaceFeature() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="wf-container">

      {/* LEFT */}
      <div className="wf-left">
        <h1>Customize your office space</h1>
        <p>
          Tailor your workspace to reflect your unique style and workflow.
        </p>

        {data.map((item, i) => (
          <div
            key={item.id}
            className={`wf-item ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          >
            <span className="number">0{item.id}</span>

            <div className="wf-text">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}

      <button
  className="contact-btn"
  onClick={() => {
    window.location.href = "/Contact";
  }}
>
  Contact Us →
</button>
      </div>

      {/* RIGHT */}
      <div className="wf-right">
        <img src={data[index].image} alt="workspace" />

        <div className="wf-arrows">
          <button onClick={() => setIndex(index === 0 ? data.length - 1 : index - 1)}>←</button>
          <button onClick={() => setIndex((index + 1) % data.length)}>→</button>
        </div>
      </div>

    </div>
  );
}

export default WorkspaceFeature;
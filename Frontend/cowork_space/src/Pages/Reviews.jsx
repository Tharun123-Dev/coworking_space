import { useState } from "react";
import "../Styles/FAQ.css";

const faqData = [
  {
    question: "What is CoWork and how is it different from other coworking spaces in Hyderabad?",
    answer: "CoWork is a premium coworking brand built for professionals, startups, and enterprises. We offer curated workspaces with top-tier amenities, flexible plans, and a community-first approach that goes beyond just a desk.",
  },
  {
    question: "What types of workspaces are available at CoWork coworking space in Hyderabad?",
    answer: "We offer hot desks, dedicated desks, private cabins, team offices, and virtual office plans — all available across multiple locations in Hyderabad.",
  },
  {
    question: "Can I book a meeting room at your coworking space in Hyderabad?",
    answer: "Yes, meeting rooms can be booked by the hour or day. Members enjoy discounted rates and priority access, while guests can book on a pay-per-use basis.",
  },
  {
    question: "Is there 24/7 access at CoWork coworking space in Hyderabad?",
    answer: "Selected premium plans include extended-hours and 24/7 access. Please check with your preferred branch for availability and plan details.",
  },
  {
    question: "What amenities are included in CoWork coworking spaces in Hyderabad?",
    answer: "We provide high-speed Wi-Fi, power backup, ergonomic seating, printing & scanning, pantry access, daily housekeeping, CCTV surveillance, and IT support.",
  },
  {
    question: "Who can use CoWork coworking space in Hyderabad?",
    answer: "CoWork is open to freelancers, remote workers, startup founders, small teams, enterprises, and anyone who wants a professional workspace on flexible terms.",
  },
  {
    question: "Are there flexible plans available at CoWork?",
    answer: "Yes — day passes, weekly passes, monthly memberships, and long-term dedicated desk or private office plans are all available. We'll find the right fit for you.",
  },
  {
    question: "Where are CoWork coworking spaces located in Hyderabad?",
    answer: "We have multiple branches across Hyderabad including Hitech City, Banjara Hills, Gachibowli, and Madhapur. More locations coming soon.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">
          Frequently Asked <span>Questions</span>
        </h2>

        <div className="faq-list">
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div className={`faq-item ${isOpen ? "open" : ""}`} key={i}>
                <button
                  className="faq-btn"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-ans-${i}`}
                >
                  <span className="faq-q">{item.question}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </button>

                <div
                  id={`faq-ans-${i}`}
                  className={`faq-body ${isOpen ? "open" : ""}`}
                  aria-hidden={!isOpen}
                >
                  <p className="faq-ans">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
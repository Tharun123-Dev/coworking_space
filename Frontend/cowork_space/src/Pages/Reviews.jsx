import { useState } from "react";
import "../Styles/FAQ.css";

const faqData = [
  {
    question: "What facilities are available in your coworking space?",
    answer:
      "We provide high-speed Wi-Fi, ergonomic seating, power backup, meeting rooms, pantry access, printing support, and a professional work atmosphere."
  },
  {
    question: "Do you offer flexible day passes and monthly plans?",
    answer:
      "Yes, you can choose from day passes, weekly plans, monthly memberships, dedicated desks, and private office options based on your work style."
  },
  {
    question: "Can startups and teams book private cabins?",
    answer:
      "Yes, private cabins and team offices are available for startups, agencies, and growing teams that need privacy and collaboration space."
  },
  {
    question: "Is meeting room booking included?",
    answer:
      "Meeting rooms can be booked separately, and some memberships include discounted or priority booking access."
  },
  {
    question: "Do you provide 24/7 access?",
    answer:
      "Selected plans include extended and 24/7 access, depending on the location and membership type."
  },
  {
    question: "Is parking available for members?",
    answer:
      "Parking depends on the branch, but most locations provide bike parking and limited car parking support."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faqSection">
      <div className="faqContainer">
        <div className="faqHeader">
          <span className="faqBadge">Frequently Asked Questions</span>
          <h2 className="faqTitle">Questions before booking your workspace</h2>
          <p className="faqSubtitle">
            Clear answers about plans, amenities, cabins, meeting rooms, access,
            and workspace flexibility.
          </p>
        </div>

        <div className="faqList">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faqItem ${isOpen ? "active" : ""}`}
                key={index}
              >
                <button
                  className="faqQuestion"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="faqQuestionText">{item.question}</span>

                  <span className={`faqIcon ${isOpen ? "open" : ""}`}>
                    <span className="line horizontal"></span>
                    <span className="line vertical"></span>
                  </span>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`faqAnswerWrap ${isOpen ? "show" : ""}`}
                >
                  <div className="faqAnswer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
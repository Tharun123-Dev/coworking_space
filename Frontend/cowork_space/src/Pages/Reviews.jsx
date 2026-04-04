import { useState } from "react";
import "../Styles/FAQ.css";

const faqData = [
  {
    question: "What facilities are available in your coworking space?",
    answer:
      "We provide high-speed Wi-Fi, ergonomic seating, power backup, meeting rooms, pantry access, printing support, and a professional work atmosphere to keep you focused and productive.",
  },
  {
    question: "Do you offer flexible day passes and monthly plans?",
    answer:
      "Yes, you can choose from day passes, weekly plans, monthly memberships, dedicated desks, and private office options based on your work style and usage frequency.",
  },
  {
    question: "Can startups and teams book private cabins?",
    answer:
      "Yes, private cabins and team offices are available for startups, agencies, and growing teams that need privacy and collaboration space. Sizes and pricing vary by location.",
  },
  {
    question: "Is meeting room booking included in all plans?",
    answer:
      "Meeting rooms can be booked separately, and some memberships include discounted or priority booking access. You can reserve online or via the front desk.",
  },
  {
    question: "Do you provide 24/7 access?",
    answer:
      "Selected plans include extended and 24/7 access, depending on the location and membership type. Contact us for details about your desired branch.",
  },
  {
    question: "Is parking available for members?",
    answer:
      "Parking depends on the branch, but most locations provide bike parking and limited car parking support. Some centers have tie‑ups with nearby parking facilities.",
  },
  {
    question: "What are your day‑pass options and pricing?",
    answer:
      "Day passes give you access from 9:00 AM to 6:00 PM and include Wi‑Fi, seating, and basic support. Flexible pricing is available for startups and frequent visitors.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes, you can upgrade from day passes to weekly/monthly plans or dedicated desks at any time. We’ll help you migrate your data and workspace preferences smoothly.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const handleToggleAll = () => {
    // close all if any is open, otherwise open the first one
    if (openIndex === 0) {
      setOpenIndex(null);
    } else {
      setOpenIndex(0);
      setShowAll(true);
    }
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

          {/* SHOW ALL / HIDE ALL */}
          <button
            type="button"
            className="faqToggleAll"
            onClick={handleToggleAll}
            aria-expanded={openIndex === 0}
          >
            {openIndex === 0 ? "Hide all" : "Show all answers"}
          </button>
        </div>

        <div className="faqList">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faqItem ${isOpen ? "faqItem--active" : ""}`}
                key={index}
              >
                <button
                  className="faqQuestion"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  tabIndex={0}
                >
                  <span className="faqQuestionText">{item.question}</span>

                  <span className={`faqIcon ${isOpen ? "faqIcon--open" : ""}`}>
                    <span className="faqIcon__line faqIcon__line--h"></span>
                    <span className="faqIcon__line faqIcon__line--v"></span>
                  </span>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`faqAnswerWrap ${isOpen ? "faqAnswerWrap--show" : ""}`}
                  aria-hidden={!isOpen}
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
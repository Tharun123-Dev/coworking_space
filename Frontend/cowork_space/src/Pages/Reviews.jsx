// CoworkPage.jsx - Copy & Paste Ready! 
import { useState } from 'react';
import styles from '../styles/Reviews.module.css';

const reviews = Array.from({ length: 50 }, (_, i) => ({
  text: `Excellent coworking experience! Great ambiance, reliable WiFi, helpful staff, and perfect location. Highly recommend for freelancers and startups. Rating: 5⭐ Review #${i + 1}`,
  author: `User ${i + 1}`
}));

const faqs = Array.from({ length: 50 }, (_, i) => ({
  question: `FAQ Question ${i + 1}: What are the ${['office hours', 'parking facilities', 'WiFi speed', 'meeting room booking process', 'flexible membership plans', 'kitchen amenities', 'printer access', 'guest policy', 'security measures', 'event space availability'][i % 10]} like?`,
  answer: `Detailed answer for question ${i + 1}: We provide 24/7 access for premium members, high-speed 1Gbps WiFi, complimentary coffee/tea, modern meeting rooms bookable via app, flexible daily/monthly plans starting at ₹500/day, biometric security, ample parking, and more to enhance your productivity.`
}));

function CoworkPage() {
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className={styles.page}>
      {/* Animated Gradient Background */}
      <div className={styles.gradientBg}>
        <div className={styles.gradientLayer1}></div>
        <div className={styles.gradientLayer2}></div>
        <div className={styles.gradientLayer3}></div>
      </div>

      {/* Purpose Section */}
      <section className={styles.purposeSection}>
        <div className={styles.purposeContent}>
          <h1 className={styles.purposeTitle}>Welcome to WorkHub Coworking</h1>
          <p className={styles.purposeText}>
            Your premier destination for collaborative workspaces in Hyderabad. 
            Join a vibrant community of innovators, enjoy world-class amenities.
          </p>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className={styles.mainContainer}>
        {/* Left: Reviews */}
        <div className={styles.leftColumn}>
          <h2 className={styles.columnTitle}>Customer Reviews</h2>
          <div className={styles.reviewsContainer}>
            {reviews.map((review, index) => (
              <div key={index} className={styles.reviewCard}>
                <p>"{review.text}"</p>
                <span className={styles.author}>- {review.author}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: FAQs */}
        <div className={styles.rightColumn}>
          <h2 className={styles.columnTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqsContainer}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button 
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`${styles.icon} ${openFaqs[index] ? styles.minus : styles.plus}`}></span>
                  {faq.question}
                </button>
                <div className={`${styles.faqAnswer} ${openFaqs[index] ? styles.open : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoworkPage;

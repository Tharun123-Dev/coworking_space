import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/SpecialContact.module.css";

function SpecialContact() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Please fill required fields ❌");
      return;
    }
    console.log(id);
    try {
      setLoading(true);

      await axiosInstance.post("leads/special/add/", {
        category: id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        message: form.message
      });

      alert("Request Sent Successfully ✅");

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: ""
      });

      navigate("/my-orders");
    } catch (error) {
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.specialPage}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      <div className={styles.wrapper}>
        <div className={styles.leftPanel}>
          <span className={styles.tag}>Special Workspace Request</span>

          <h1>Tell us what kind of workspace you need</h1>

          <p className={styles.description}>
            Share your requirement and our team will connect with you for a
            custom workspace solution based on your business needs, location,
            and preferred setup.
          </p>

          <div className={styles.highlightList}>
            <div className={styles.highlightCard}>
              <span>01</span>
              <div>
                <h3>Custom Requirement</h3>
                <p>Submit unique workspace needs beyond regular booking options.</p>
              </div>
            </div>

            <div className={styles.highlightCard}>
              <span>02</span>
              <div>
                <h3>Quick Response</h3>
                <p>Our team reviews your request and responds as early as possible.</p>
              </div>
            </div>

            <div className={styles.highlightCard}>
              <span>03</span>
              <div>
                <h3>Business Friendly</h3>
                <p>Suitable for teams, companies, and customized office setups.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Request Form</h2>
            <p>Fill in the details below to submit your special request.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="company">Company Name or self</label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="Enter company name or self"
              value={form.company}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe your workspace requirement..."
              value={form.message}
              onChange={handleChange}
              className={styles.textarea}
              rows="5"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Special Request"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SpecialContact;
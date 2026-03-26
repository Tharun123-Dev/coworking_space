import { useParams } from "react-router-dom";
import { useState } from "react";
import "../Styles/Payment.css";

function Payment() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvv: ""
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.card) {
      alert("Please fill all details");
      return;
    }

    // Simulate payment success
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="success-container">
        <h2>🎉 Payment Successful!</h2>
        <p>Your booking has been confirmed.</p>
        <p>Workspace ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="payment-container">

      <div className="payment-card">

        <h2 className="title">Payment Details 💳</h2>
        <p className="subtitle">Complete your booking securely</p>

        <form onSubmit={handlePayment}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
          />

          <input
            type="text"
            name="card"
            placeholder="Card Number"
            maxLength="16"
            onChange={handleChange}
          />

          <div className="row">
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              onChange={handleChange}
            />
            <input
              type="password"
              name="cvv"
              placeholder="CVV"
              maxLength="3"
              onChange={handleChange}
            />
          </div>

          <button className="pay-btn">Pay Now</button>

        </form>

      </div>

    </div>
  );
}

export default Payment;
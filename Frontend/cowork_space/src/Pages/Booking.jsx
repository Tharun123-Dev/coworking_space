import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import styles from "../Styles/Booking.module.css";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function Booking() {

const [phone, setPhone] = useState("");
const [otp, setOtp] = useState("");
const [confirmObj, setConfirmObj] = useState(null);
const [verified, setVerified] = useState(false);
const sendOtp = async () => {
  if (phone.length !== 10) {
    alert("Enter valid mobile number");
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: "invisible" }
  );

  const appVerifier = window.recaptchaVerifier;

  try {
    const confirmation = await signInWithPhoneNumber(
      auth,
      "+91" + phone,
      appVerifier
    );

    setConfirmObj(confirmation);
    alert("OTP sent to " + phone);

  } catch (error) {
    alert("OTP send failed");
    console.log(error);
  }
};

const verifyOtp = async () => {
  try {
    await confirmObj.confirm(otp);
    setVerified(true);
    alert("Mobile verified");
  } catch {
    alert("Invalid OTP");
  }
};


  const location = useLocation();
  const data = location.state;
  const isMultiple = data?.items ? true : false;

  const [form, setForm] = useState({
    date: "",
    duration: 1
  });

  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentType, setPaymentType] = useState("");

  // PRICE CALCULATION
  const totalPrice = isMultiple
    ? data.items.reduce((acc, item) => acc + (item.price * item.duration), 0)
    : data.price * form.duration;

  const handlePayment = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDone(true);
    alert("Payment Successful ✅");
  };

  const handleSubmit = async () => {

    if (!paymentDone) {
      alert("Please pay before booking");
      return;
    }

    if (!form.date) {
      alert("Select date");
      return;
    }

    try {
      if (isMultiple) {

        for (let item of data.items) {
          await axiosInstance.post("cart/create/", {
            workspace_id: item.workspace_id,
            cart_item_id: item.id,
            date: form.date,
            duration: item.duration
          });
        }

        alert("All Bookings Successful 🎉");

      } else {

        await axiosInstance.post("cart/create/", {
          workspace_id: data.workspace_id,
          cart_item_id: data.id,
          date: form.date,
          duration: form.duration
        });

        alert("Booking Successful 🎉");
      }

      window.location.href = "/";

    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className={styles.container}>

      <Reveal>
        <h2>Book Workspace</h2>

        {isMultiple ? (
          <h3>{data.items.length} Items Selected</h3>
        ) : (
          <>
            <h3>{data.workspace}</h3>
            <p>{data.location}</p>
          </>
        )}
      </Reveal>

      <input
        type="date"
        className={styles.input}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      {!isMultiple && (
        <input
          type="number"
          placeholder="Duration (days)"
          className={styles.input}
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />
      )}

{/* PRICE */}
<div className={styles.priceBox}>
  <h3>Total Amount</h3>
  <h2>₹ {totalPrice}</h2>
</div>

{/* MOBILE OTP */}
<div>
  <h3>Mobile Verification</h3>

  <input
    type="tel"
    placeholder="Enter mobile"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />

  <button onClick={sendOtp}>
    Send OTP
  </button>

  <input
    placeholder="Enter OTP"
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
  />

  <button onClick={verifyOtp}>
    Verify OTP
  </button>

  {verified && <p>✔ Verified</p>}

  <div id="recaptcha-container"></div>
</div>

<button onClick={handleSubmit} className={styles.bookBtn}>
  Confirm Booking
</button>

      {/* PAY BUTTON */}
      {!paymentDone && (
        <button onClick={handlePayment} className={styles.payBtn}>
          Pay Now
        </button>
      )}

      {paymentDone && (
        <div className={styles.success}>
          Payment Completed ✓
        </div>
      )}

      {/* PAYMENT OPTIONS */}
      {showPayment && !paymentDone && (
        <div className={styles.paymentBox}>

          <h3>Select Payment</h3>

          <div className={styles.paymentBtns}>
            <button onClick={() => setPaymentType("upi")}>
              UPI
            </button>

            <button onClick={() => setPaymentType("card")}>
              Card
            </button>
          </div>

          {paymentType === "upi" && (
            <div className={styles.form}>
              <input placeholder="UPI ID" />
              <button onClick={handlePaymentSuccess}>
                Pay ₹{totalPrice}
              </button>
            </div>
          )}

          {paymentType === "card" && (
            <div className={styles.form}>
              <input placeholder="Card Number" />
              <input placeholder="MM/YY" />
              <input placeholder="CVV" />
              <button onClick={handlePaymentSuccess}>
                Pay ₹{totalPrice}
              </button>
            </div>
          )}

        </div>
      )}

      <button onClick={handleSubmit} className={styles.bookBtn}>
        Confirm Booking
      </button>

    </div>
  );
}

export default Booking;
import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import styles from "../Styles/Booking.module.css";

function Booking() {

  const location = useLocation();
  const data = location.state;
  const isMultiple = data?.items ? true : false;

  const [form, setForm] = useState({
    date: "",
    duration: 1
  });

  const [paymentDone, setPaymentDone] = useState(false);

  // PRICE CALCULATION
  const totalPrice = isMultiple
    ? data.items.reduce((acc, item) => acc + (item.price * item.duration), 0)
    : data.price * form.duration;


  // RAZORPAY PAYMENT
const handlePayment = async () => {
  try {

    const res = await axiosInstance.post(
      "payment/create/",
      { amount: totalPrice }
    );

    const order = res.data;

    console.log("KEY", import.meta.env.VITE_RAZORPAY_KEY);
    console.log("ORDER", order);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Workspace Booking",
      description: "Workspace Payment",
      order_id: order.id,

      handler: function (response) {
        console.log("SUCCESS", response);
        setPaymentDone(true);
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.log(error);
    alert("Payment Failed");
  }
};


  const handleSubmit = async () => {

    if (!paymentDone) {
      alert("Please complete payment first");
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

      <div className={styles.priceBox}>
        <h3>Total Amount</h3>
        <h2>₹ {totalPrice}</h2>
      </div>

      {!paymentDone && (
        <button onClick={handlePayment} className={styles.payBtn}>
          Pay ₹{totalPrice}
        </button>
      )}

      {paymentDone && (
        <div className={styles.success}>
          Payment Completed ✓
        </div>
      )}

      <button onClick={handleSubmit} className={styles.bookBtn}>
        Confirm Booking
      </button>

    </div>
  );
}

export default Booking;
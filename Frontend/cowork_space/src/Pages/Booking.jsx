import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import styles from "../Styles/Booking.module.css";

function Booking() {
  const location = useLocation();
  const data = location.state;

  const today = new Date().toISOString().split("T")[0];

  // ✅ SLOT DATA
  const slotId = data?.slot_id;
  const bookingDate = data?.date;

  const [paymentDone, setPaymentDone] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [autoConfirming, setAutoConfirming] = useState(false);

  // ✅ PRICE DIRECT FROM SLOT
  const totalPrice = Number(data?.price || 0);

  // ✅ PAYMENT HANDLER
const handlePayment = async () => {
  if (!slotId) {
    alert("Invalid slot");
    return;
  }

  try {
    setLoadingPayment(true);

    // 🔹 Create Razorpay order
    const res = await axiosInstance.post("payment/create/", {
      amount: totalPrice,
    });

    const order = res.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Workspace Booking",
      description: "Slot Booking",
      order_id: order.id,

      // ✅ ONLY NETBANKING
      method: {
        netbanking: true,
        card: false,
        upi: false,
        wallet: false,
        emi: false,
        paylater: false,
      },

      config: {
        display: {
          blocks: {
            banks: {
              name: "Pay using Netbanking",
              instruments: [{ method: "netbanking" }],
            },
          },
          sequence: ["block.banks"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },

      theme: {
        color: "#c9a84c",
      },

      // ✅ ONLY HERE BOOKING SHOULD HAPPEN
      handler: async function (response) {
        try {
          // STEP 1: Verify payment
          const verify = await axiosInstance.post(
            "payment/verify/",
            response
          );

          if (verify.data.status === "success") {

            setPaymentDone(true);
            setAutoConfirming(true);

            // STEP 2: Save payment (optional but good)
            await axiosInstance.post("payment/save/", {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              amount: totalPrice,
            });

            // STEP 3: CREATE BOOKING (IMPORTANT)
           await axiosInstance.post("cart/create/", {

  booking_type: "day",

  slot_id: slotId,

  seats: 1,

  payment_id: response.razorpay_payment_id,

});

            alert("Booking Confirmed 🎉");
         

            window.location.href = "/myorders";

          } else {

            alert("Payment verification failed");
          }
        } catch (err) {
          console.log(err);
          alert("Booking failed after payment");
        }
      },

      modal: {
        ondismiss: function () {
          setLoadingPayment(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function () {
      alert("Payment failed. Try again.");
    });

    rzp.open();

  } catch (error) {
    console.log(error);
    alert("Payment Failed");
  } finally {
    setLoadingPayment(false);
  }
};

  return (
    <section className={styles.page}>
      {autoConfirming && (
        <div className={styles.autoConfirmOverlay}>
          <div className={styles.autoConfirmBox}>
            <div className={styles.spinnerRing}></div>
            <p className={styles.autoConfirmText}>Confirming your booking…</p>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <Reveal>
          <div className={styles.headerCard}>
            <span className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Secure Booking
            </span>

            <h2 className={styles.title}>
              Confirm Your <span className={styles.goldText}>Slot</span>
            </h2>

            <div className={styles.workspaceBox}>
              <div>
                <h3>{data.workspace}</h3>
                <p>{data.location}</p>
                <p>Date: {bookingDate}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className={styles.bookingCard}>
          <div className={styles.priceBox}>
            <div className={styles.priceLeft}>
              <p>Total Amount</p>
              <h2>₹{totalPrice}</h2>
            </div>
          </div>

          {!paymentDone ? (
            <button
              onClick={handlePayment}
              className={styles.payBtn}
              disabled={loadingPayment}
            >
              {loadingPayment
                ? "Processing..."
                : `Pay Now ₹${totalPrice}`}
            </button>
          ) : (
            <div className={styles.success}>
              Payment Completed — Booking Confirmed
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Booking;
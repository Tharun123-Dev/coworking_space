import { useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import styles from "../Styles/Booking.module.css";

function Booking() {
  const location = useLocation();
  const data = location.state;
  const isMultiple = data?.items ? true : false;

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const [form, setForm] = useState({
    date: "",
    duration: 1,
  });

  const [paymentDone, setPaymentDone] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = isMultiple
    ? data.items.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.duration),
        0
      )
    : Number(data.price) * Number(form.duration || 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handlePayment = async () => {
    if (!form.date) {
      alert("Please select a booking date first");
      return;
    }

    if (form.date < today) {
      alert("Past dates are not allowed");
      return;
    }

    try {
      setLoadingPayment(true);

      const res = await axiosInstance.post("payment/create/", {
        amount: totalPrice,
      });

      const order = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Workspace Booking",
        description: "Workspace Payment",
        order_id: order.id,
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
          color: "#0f766e",
        },
        handler: async function (response) {
          try {
            const verify = await axiosInstance.post("payment/verify/", response);

            if (verify.data.status === "success") {
              setPaymentDone(true);
              alert("Payment successful");
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            alert("Payment verification error");
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
        alert("Payment failed. Please try again.");
      });

      rzp.open();
      setLoadingPayment(false);
    } catch (error) {
      console.log(error);
      alert("Payment Failed");
      setLoadingPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.date) {
      alert("Please select date");
      return;
    }

    if (form.date < today) {
      alert("Please select today or a future date only");
      return;
    }

    if (!paymentDone) {
      alert("Please complete payment first");
      return;
    }

    try {
      setSubmitting(true);

      if (isMultiple) {
        for (let item of data.items) {
          await axiosInstance.post("cart/create/", {
            workspace_id: item.workspace_id,
            cart_item_id: item.id,
            date: form.date,
            duration: item.duration,
          });
        }

        alert("All Bookings Successful 🎉");
      } else {
        await axiosInstance.post("cart/create/", {
          workspace_id: data.workspace_id,
          cart_item_id: data.id,
          date: form.date,
          duration: Number(form.duration),
        });

        alert("Booking Successful 🎉");
      }

      window.location.href = "/";
    } catch (err) {
      alert("Error while creating booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.bgShapeOne}></div>
      <div className={styles.bgShapeTwo}></div>

      <div className={styles.container}>
        <Reveal>
          <div className={styles.headerCard}>
            <span className={styles.badge}>Secure Booking</span>
            <h2 className={styles.title}>Book Your Workspace</h2>
            <p className={styles.subtitle}>
              Select your booking date, review pricing, and complete payment
              through secure netbanking.
            </p>

            {isMultiple ? (
              <div className={styles.workspaceBox}>
                <h3>{data.items.length} Items Selected</h3>
                <p>Bulk booking ready for confirmation.</p>
              </div>
            ) : (
              <div className={styles.workspaceBox}>
                <h3>{data.workspace}</h3>
                <p>{data.location}</p>
              </div>
            )}
          </div>
        </Reveal>

        <div className={styles.bookingCard}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="date" className={styles.label}>
                Booking Date <span>*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className={styles.input}
                value={form.date}
                min={today}
                onChange={handleChange}
                required
              />
              <small className={styles.helperText}>
                Only today and future dates are allowed.
              </small>
            </div>

            {!isMultiple && (
              <div className={styles.inputGroup}>
                <label htmlFor="duration" className={styles.label}>
                  Duration (days)
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  step="1"
                  className={styles.input}
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className={styles.priceBox}>
            <div>
              <p className={styles.priceLabel}>Total Amount</p>
              <h2 className={styles.price}>₹ {totalPrice}</h2>
            </div>
            <span className={styles.priceTag}>Netbanking Only</span>
          </div>

          {!paymentDone ? (
            <button
              onClick={handlePayment}
              className={styles.payBtn}
              disabled={loadingPayment}
            >
              {loadingPayment ? "Processing..." : `Pay Now ₹${totalPrice}`}
            </button>
          ) : (
            <div className={styles.success}>Payment Completed ✓</div>
          )}

          <button
            onClick={handleSubmit}
            className={styles.bookBtn}
            disabled={submitting}
          >
            {submitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Booking;
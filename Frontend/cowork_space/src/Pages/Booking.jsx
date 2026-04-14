import { useMemo, useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import styles from "../Styles/Booking.module.css";

function Booking() {
  const location = useLocation();
  const data = location.state;
  const isMultiple = data?.items ? true : false;
  
  const today = new Date().toISOString().split("T")[0];
  

  const [form, setForm] = useState({
    date:today,
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

    if (name === "date") {
      if (value < today) {
        alert("Past dates are not allowed. Please select today or a future date.");
        setForm((prev) => ({ ...prev, date: today }));
        return;
      }
    }

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
          color: "#c9a84c",
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
      <div className={styles.particles}>
        {[...Array(18)].map((_, i) => (
          <span key={i} className={styles.particle} style={{ "--i": i }} />
        ))}
      </div>
      <div className={styles.gridLines}></div>

      <div className={styles.container}>
        <Reveal>
          <div className={styles.headerCard}>
            <span className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Secure Booking
            </span>
            <h2 className={styles.title}>
              Book Your <span className={styles.goldText}>Workspace</span>
            </h2>
            <p className={styles.subtitle}>
              Select your booking date, review pricing, and complete payment
              through secure netbanking.
            </p>

            {isMultiple ? (
              <div className={styles.workspaceBox}>
                <div className={styles.workspaceIcon}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3>{data.items.length} Items Selected</h3>
                  <p>Bulk booking ready for confirmation.</p>
                </div>
              </div>
            ) : (
              <div className={styles.workspaceBox}>
                <div className={styles.workspaceIcon}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3>{data.workspace}</h3>
                  <p>{data.location}</p>
                </div>
              </div>
            )}

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>100%</span>
                <span className={styles.statLabel}>Secure</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>24/7</span>
                <span className={styles.statLabel}>Support</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>INR</span>
                <span className={styles.statLabel}>Currency</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className={styles.bookingCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Booking Details</h3>
            <span className={styles.stepBadge}>Step 1 of 2</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="date" className={styles.label}>
                Booking Date <span>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className={styles.input}
                  value={today}
                  readOnly
                  required
                />
              </div>
              <small className={styles.helperText}>
                Only today and future dates are allowed.
              </small>
            </div>

            {!isMultiple && (
              <div className={styles.inputGroup}>
                <label htmlFor="duration" className={styles.label}>
                  Duration (days)
                </label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
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
              </div>
            )}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.priceBox}>
            <div className={styles.priceLeft}>
              <p className={styles.priceLabel}>Total Amount</p>
              <h2 className={styles.price}>
                <span className={styles.priceSymbol}>₹</span>
                {totalPrice.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className={styles.priceRight}>
              <span className={styles.priceTag}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Secured
              </span>
            </div>
          </div>

          {!paymentDone ? (
            <button
              onClick={handlePayment}
              className={styles.payBtn}
              disabled={loadingPayment}
            >
              <span className={styles.payBtnShine}></span>
              <span className={styles.payBtnContent}>
                <span className={styles.payBtnMain}>
                  {loadingPayment ? "Processing..." : `Pay Now ₹${totalPrice.toLocaleString("en-IN")}`}
                </span>
                {!loadingPayment && (
                  <span className={styles.payBtnSub}>Use Netbanking Only</span>
                )}
              </span>
            </button>
          ) : (
            <div className={styles.success}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Payment Completed
            </div>
          )}

          <button
            onClick={handleSubmit}
            className={styles.bookBtn}
            disabled={submitting}
          >
            {submitting ? "Confirming..." : "Confirm Booking"}
            {!submitting && (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Booking;

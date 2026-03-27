import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Cart.module.css";

function Cart() {

  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // FETCH CART
  useEffect(() => {
    axiosInstance.get("cart/view/")
      .then(res => {
        console.log("CART DATA:", res.data);
        setCartItems(res.data);   // ARRAY directly
      })
      .catch(() => {
        alert("Login required");
      });
  }, []);

  //  REMOVE ITEM
  const handleRemove = (id) => {
    axiosInstance.delete(`cart/remove/${id}/`)
      .then(() => {
        alert("Removed");
        setCartItems(cartItems.filter(item => item.id !== id));
      });
  };

  // CHECKOUT SINGLE
  const handleCheckout = (item) => {
    navigate("/booking", { state: item});
  };

  // CHECKOUT ALL
  const handleCheckoutAll = () => {
    navigate("/booking", { state: { items: cartItems } });
  };

  // TOTAL CALCULATION
  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.duration);
  }, 0);

  return (
    <div className={styles.container}>
      <h2>Your Cart</h2>

      {/* IMPORTANT FIX HERE */}
      {cartItems.length > 0 ? (

        <>
          {cartItems.map(item => (
            <div key={item.id} className={styles.card}>

              <img src={item.image} alt="Workspace" className={styles.image} />

              <div className={styles.details}>
                <h3>{item.workspace}</h3> {/*  FIXED */}
                <p>{item.location}</p>
                <p className={styles.price}>₹{item.price}</p>
                <p>Duration: {item.duration}</p>

                <button
                  onClick={() => handleRemove(item.id)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>

                <button
                  className={styles.checkoutBtn}
                  onClick={() => handleCheckout(item)}
                >
                  Checkout →
                </button>

              </div>
            </div>
          ))}

          {/* TOTAL SECTION */}
          <div className={styles.summary}>
            <h2>Total: ₹{totalAmount}</h2>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckoutAll}
            >
              Checkout All →
            </button>
          </div>
        </>

      ) : (
        <div className={styles.empty}>
          <h3>Cart is empty</h3>
        </div>
      )}

    </div>
  );
}

export default Cart;
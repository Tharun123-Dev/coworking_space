import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation } from "react-router-dom";

function Booking() {

  const location = useLocation();
  const workspace = location.state;

  const [form, setForm] = useState({
    date: "",
    duration: 1
  });

  const handleSubmit = () => {
    axiosInstance.post("cart/create/", {
      workspace_id: workspace.id,
      date: form.date,
      duration: form.duration
    })
    .then(() => {
      alert("Booking Successful 🎉");
      const handleSubmit = () => {
  if (!form.date || !form.duration) {
    alert("Please fill all details ❌");
    return;
  }

  axiosInstance.post("cart/create/", {
    workspace_id: item.workspace_id || item.id,
    date: form.date,
    duration: form.duration
  })
  .then(() => {
    alert("Booking Successful 🎉");

    // 👉 Redirect to cart or home
    window.location.href = "/cart";
  })
  .catch(() => {
    alert("Error in booking ❌");
  });
};
    })
    .catch(() => {
      alert("Error in booking ❌");
    });
  };

  return (
    <div style={styles.container}>
      <h2>Book Workspace</h2>

      <h3>{workspace.name}</h3>
      <p>{workspace.location}</p>

     <input 
  type="date"
  style={{ padding: "10px", margin: "10px 0" }}
  onChange={(e) => setForm({...form, date: e.target.value})}
/>

<input 
  type="number"
  placeholder="Duration (days)"
  style={{ padding: "10px", margin: "10px 0" }}
  onChange={(e) => setForm({...form, duration: e.target.value})}
/>

      <button onClick={handleSubmit}>
        Confirm Booking
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px"
  }
};

export default Booking;
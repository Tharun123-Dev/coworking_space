import { useState } from "react";
import axiosInstance from "../Services/Axios";
import { useLocation, useNavigate } from "react-router-dom";
import Reveal from "../Pages/Reveal"


function Booking() {
 

  const location = useLocation();
 

  const data = location.state;
  const isMultiple=data?.items ? true : false;


  const [form, setForm] = useState({
    date: "",
    duration: 1
  });
const handleSubmit = async () => {

  if (!form.date || !form.duration) {
    alert("Fill all details ");
    return;
  }

  try {
    if (isMultiple) {
      //  LOOP FOR MULTIPLE ITEMS
      for (let item of data.items) {
        await axiosInstance.post("cart/create/", {
          workspace_id: item.workspace_id,
          date: form.date,
          duration: item.duration
        });
      }
      await axiosInstance.delete("cart/clear/");


      alert("All Bookings Successful ");

    } else {
      // SINGLE BOOKING
      await axiosInstance.post("cart/create/", {
        workspace_id: data.workspace_id,
        date: form.date,
        duration: form.duration
      });

      alert("Booking Successful 🎉");
    }

    //  Redirect
    window.location.href = "/";

  } catch (err) {
    console.log(err.response?.data);
    alert("Error ");
  }
};

  return (

    
    <div style={styles.container}>
      <Reveal>
      <h2>Book Workspace</h2>

      {isMultiple ? (
  <h3>{data.items.length} Items Selected</h3>
) : (
  <h3>{data.workspace}</h3>
)}
      {!isMultiple && (
        <p>{data.location}</p>
      )}
      </Reveal>

      <input 
        type="date"
        style={styles.input}
        onChange={(e) => setForm({...form, date: e.target.value})}
      />

      <input 
        type="number"
        placeholder="Duration (days)"
        style={styles.input}
        value={form.duration}
        onChange={(e) => setForm({...form, duration: e.target.value})}
      />

      <button onClick={handleSubmit} style={styles.btn}>
        Confirm Booking
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center"
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    width: "250px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  },
  btn: {
    padding: "10px 20px",
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer"
  }
};

export default Booking;
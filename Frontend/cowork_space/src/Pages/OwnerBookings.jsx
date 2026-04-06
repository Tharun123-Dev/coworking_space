import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axiosInstance.get("cart/owner/bookings/")
      .then(res => setBookings(res.data))
      .catch(err => console.log(err));
  };

  const confirmBooking = (id) => {
    axiosInstance.put(`cart/booking-confirm/${id}/`)
      .then(() => {
        alert("Booking Confirmed ✅");
        fetchBookings();
      });
  };

  const cancelBooking = (id) => {
    axiosInstance.put(`cart/booking-cancel/${id}/`)
      .then(() => {
        alert("Booking Cancelled ❌");
        fetchBookings();
      });
  };

  return (
    <div style={{padding:"40px"}}>
      <h2>Booking Requests</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>User</th>
            <th>Workspace</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((item) => (
            <tr key={item.id}>
              <td>{item.user}</td>
              <td>{item.workspace}</td>
              <td>{item.date}</td>
              <td>{item.status}</td>

              <td>
                {item.status === "Pending" && (
                  <>
                    <button onClick={() => confirmBooking(item.id)}>
                      Confirm
                    </button>

                    <button
                      onClick={() => cancelBooking(item.id)}
                      style={{marginLeft:"10px"}}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {item.status === "Confirmed" && "✅ Confirmed"}
                {item.status === "Cancelled" && "❌ Cancelled"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OwnerBookings;
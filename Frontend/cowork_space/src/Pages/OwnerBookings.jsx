import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);

    axiosInstance.get("cart/owner/bookings/")
      .then(res => setBookings(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
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
    <div style={{ padding: "40px" }}>
      <h2>Booking Requests</h2>

      {loading && <p>Loading bookings...</p>}

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>User</th>
            <th>Workspace</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No bookings found
              </td>
            </tr>
          )}

          {bookings.map((item) => (
            <tr key={item.id}>
              <td>{item.user}</td>
              <td>{item.workspace}</td>
              <td>{item.date}</td>
              <td>{item.duration}</td>
              <td>₹{item.total_price}</td>
              <td>
                {item.status === "pending" && "⏳ Pending"}
                {item.status === "confirmed" && "✅ Confirmed"}
                {item.status === "cancelled" && "❌ Cancelled"}
              </td>

              <td>
                {item.status === "pending" && (
                  <>
                    <button onClick={() => confirmBooking(item.id)}>
                      Confirm
                    </button>

                    <button
                      onClick={() => cancelBooking(item.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {item.status === "confirmed" && "✅ Confirmed"}
                {item.status === "cancelled" && "❌ Cancelled"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OwnerBookings;
import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [special, setSpecial] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingSpecial, setLoadingSpecial] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchSpecial();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axiosInstance
      .get("cart/myorders/")
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  const fetchSpecial = () => {
    setLoadingSpecial(true);
    axiosInstance
      .get("leads/special/user/")
      .then((res) => setSpecial(res.data || []))
      .finally(() => setLoadingSpecial(false));
  };

  const getStatusClass = (status) => {
    if (status === "Pending" || status === "pending") return "pending";
    if (status === "Confirmed" || status === "confirmed") return "confirmed";
    if (status === "Contacted" || status === "contacted") return "contacted";
    if (status === "Cancelled" || status === "cancelled") return "cancelled";
    return "pending";
  };

  return (
    <section className="myorders-page">
      <div className="myorders">
        <div className="page-header">
          <p className="page-badge">My Dashboard</p>
          <h2>My Orders</h2>
          <p className="page-subtext">
            Track your workspace bookings and special workspace requests in one place.
          </p>
        </div>

        {/* Workspace Bookings */}
        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Workspace Bookings</h3>
            <span className="count-badge">{orders.length}</span>
          </div>

          {loading ? (
            <p className="loading">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h4>No workspace bookings yet</h4>
              <p>Your confirmed and pending workspace bookings will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((item) => (
                    <tr key={item.id}>
                      <td>{item.workspace}</td>
                      <td>{item.location}</td>
                      <td>{item.date}</td>
                      <td>{item.duration} hrs</td>
                      <td>₹{item.price}</td>
                      <td>
                        <span className={`status ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div className="orders-section">
          <div className="section-header">
            <h3 className="section-title">Special Workspace Requests</h3>
            <span className="count-badge">{special.length}</span>
          </div>

          {loadingSpecial ? (
            <p className="loading">Loading requests...</p>
          ) : special.length === 0 ? (
            <div className="empty-state">
              <h4>No special requests yet</h4>
              <p>Your submitted special workspace requests will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Company</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {special.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.company || "-"}</td>
                      <td className="message-cell">{item.message || "-"}</td>
                      <td>
                        <span className={`status ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MyOrders;
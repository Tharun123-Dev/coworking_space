import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminBookings.css";

function AdminBookings() {

  const [bookings,setBookings] = useState([])
  const [loading,setLoading] = useState(false)
  const [search,setSearch] = useState("")
  const [filter,setFilter] = useState("All")

  useEffect(()=>{
    fetchBookings()
  },[])

  const fetchBookings = () =>{
    setLoading(true)
    axiosInstance.get("cart/admin/bookings/")
    .then(res=>setBookings(res.data))
    .finally(()=>setLoading(false))
  }

  const filteredBookings = bookings.filter(item => {
    const matchesSearch =
      item.user?.toLowerCase().includes(search.toLowerCase()) ||
      item.workspace?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === "All" || item.status === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="admin-bookings">

      <div className="header">
        <h2>Admin Booking Tracking</h2>

        <button onClick={fetchBookings} className="refresh">
          Refresh
        </button>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search user / workspace / location..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading bookings...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Workspace</th>
                <th>Location</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map(item=>(
                <tr key={item.id}>
                  <td>{item.user}</td>
                  <td>{item.workspace}</td>
                  <td>{item.location}</td>
                  <td>{item.date}</td>
                  <td>{item.duration} hrs</td>
                  <td>₹{item.total_price}</td>

                  <td>
                    <span className={`status ${item.status}`}>
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
  )
}

export default AdminBookings;
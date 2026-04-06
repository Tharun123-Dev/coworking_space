import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/MyOrders.css";

function MyOrders() {

const [orders,setOrders] = useState([])
const [loading,setLoading] = useState(false)

useEffect(()=>{
fetchOrders()
},[])

const fetchOrders = ()=>{
setLoading(true)
axiosInstance.get("cart/myorders/")
.then(res=>setOrders(res.data))
.finally(()=>setLoading(false))
}

return (
<div className="myorders">

<h2>My Orders</h2>

{loading ? (
<p className="loading">Loading orders...</p>
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
{orders.map(item=>(
<tr key={item.id}>

<td>{item.workspace}</td>
<td>{item.location}</td>
<td>{item.date}</td>
<td>{item.duration} hrs</td>
<td>₹{item.price}</td>

<td>

{item.status === "Pending" &&
<span className="status pending">Pending</span>
}

{item.status === "Confirmed" &&
<span className="status confirmed">Confirmed</span>
}

{item.status === "Cancelled" &&
<span className="status cancelled">Cancelled</span>
}

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

export default MyOrders;
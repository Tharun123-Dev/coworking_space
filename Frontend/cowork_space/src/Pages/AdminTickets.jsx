import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminTickets.css";

function AdminTickets() {

const [tickets,setTickets] = useState([])

const fetchTickets = ()=>{
axiosInstance.get("leads/tickets/admin/")
.then(res=>setTickets(res.data))
}

useEffect(()=>{
fetchTickets()
},[])

const updateTicket = (id,status,note)=>{

axiosInstance.put(`leads/tickets/update/${id}/`,{
status:status,
admin_note:note
})
.then(()=>fetchTickets())

}

return (

<div className="adminTickets">

<h2>Support Tickets</h2>

<div className="table-wrapper">

<table>

<thead>
<tr>
<th>User</th>
<th>Phone</th>
<th>Workspace</th>
<th>Location</th>
<th>Booking Status</th>
<th>Issue</th>
<th>Priority</th>
<th>Ticket Status</th>
<th>Admin Note</th>
<th>Update</th>
</tr>
</thead>

<tbody>

{tickets.map(t=>(
<tr key={t.id}>

<td>{t.username}</td>

<td>{t.phone}</td>

<td>{t.workspace || t.special_category}</td>

<td>{t.location || "-"}</td>

<td>{t.booking_status || "-"}</td>

<td>{t.issue_type}</td>

<td>{t.priority}</td>

<td>{t.status}</td>

<td>
<input
defaultValue={t.admin_note}
onChange={(e)=>t.note = e.target.value}
/>
</td>

<td>
<select
defaultValue={t.status}
onChange={(e)=>updateTicket(t.id,e.target.value,t.note)}
>

<option value="open">Open</option>
<option value="pending">Pending</option>
<option value="resolved">Resolved</option>
<option value="closed">Closed</option>

</select>
</td>

</tr>
))}

</tbody>
</table>

</div>

</div>

)

}

export default AdminTickets
import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function AdminBusinessEnterprise(){

const [leads,setLeads] = useState([])

useEffect(()=>{
fetchLeads()
},[])

const fetchLeads = ()=>{
axiosInstance.get("leads/business/admin/")
.then(res=>setLeads(res.data))
}

const updateStatus = (id,status)=>{

axiosInstance.put(`leads/business/status/${id}/`,{
status:status
}).then(()=>{
fetchLeads()
})

}

return(
<div style={{padding:"40px"}}>

<h2>Business Enterprise Leads</h2>

<table border="1" cellPadding="10" style={{width:"100%"}}>

<thead>
<tr>
<th>Location</th>
<th>Company</th>
<th>Contact</th>
<th>Phone</th>
<th>Email</th>
<th>Team</th>
<th>Budget</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{leads.map(item=>(
<tr key={item.id}>

<td>{item.location}</td>

<td>{item.company}</td>

<td>{item.contact}</td>

<td>
<a href={`tel:${item.phone}`}>
📞 {item.phone}
</a>
</td>

<td>
<a href={`mailto:${item.email}`}>
📧 Email
</a>
</td>

<td>{item.team}</td>

<td>{item.budget}</td>

<td>

<select
value={item.status}
onChange={(e)=>updateStatus(item.id,e.target.value)}
>

<option value="pending">Pending</option>
<option value="contacted">Contacted</option>
<option value="closed">Closed</option>

</select>

</td>

<td>

<a href={`tel:${item.phone}`}>
<button>Call</button>
</a>

<a href={`mailto:${item.email}`}>
<button>Email</button>
</a>

</td>

</tr>
))}

</tbody>

</table>

</div>
)
}

export default AdminBusinessEnterprise
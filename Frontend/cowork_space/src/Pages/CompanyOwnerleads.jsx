import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function OwnerCompanyLeads(){

const [leads,setLeads] = useState([])

useEffect(()=>{
fetchLeads()
},[])

const fetchLeads = ()=>{
axiosInstance.get("leads/company/owner/")
.then(res=>setLeads(res.data))
}

const updateStatus = (id,status)=>{

axiosInstance.put(`leads/company/status/${id}/`,{
status:status
}).then(()=>{
fetchLeads()
})

}

return(
<div style={{padding:"40px"}}>

<h2>Company Leads</h2>

<table border="1" cellPadding="10">

<thead>
<tr>
<th>Team</th>
<th>Name</th>
<th>Phone</th>
<th>Email</th>
<th>Company</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{leads.map(item=>(
<tr key={item.id}>

<td>{item.team_size}</td>
<td>{item.name}</td>
<td>
<a href={`tel:${item.phone}`}>📞 {item.phone}</a>
</td>
<td>
<a href={`mailto:${item.email}`}>📧</a>
</td>
<td>{item.company}</td>
<td>{item.status}</td>

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

</tr>
))}

</tbody>

</table>

</div>
)
}

export default OwnerCompanyLeads
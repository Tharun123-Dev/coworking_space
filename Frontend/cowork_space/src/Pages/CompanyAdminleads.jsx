import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function AdminCompanyLeads() {

const [leads, setLeads] = useState([])
const [owners, setOwners] = useState([])

useEffect(() => {
fetchLeads()
fetchOwners()
}, [])

const fetchLeads = () => {
axiosInstance.get("leads/company/admin/")
.then(res => setLeads(res.data))
}

const fetchOwners = () => {
axiosInstance.get("owners/")
.then(res => setOwners(res.data))
}

const assignOwner = (id, owner) => {

axiosInstance.put(`leads/company/assign/${id}/`, {
owner: owner
}).then(() => {
fetchLeads()
})

}

return (
<div style={{ padding: "40px" }}>

<h2>Company Leads - Admin</h2>

<table border="1" cellPadding="10">

<thead>
<tr>
<th>Team</th>
<th>Name</th>
<th>Contact</th>
<th>Company</th>
<th>Owner</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{leads.map(item => (
<tr key={item.id}>

<td>{item.team_size}</td>

<td>{item.name}</td>

<td>
<a href={`tel:${item.phone}`}>📞</a>
&nbsp;
<a href={`mailto:${item.email}`}>📧</a>
</td>

<td>{item.company}</td>

<td>

{/* if owner assigned show name */}
{item.owner ? (
<span style={{
padding:"6px 10px",
background:"#e6f4ea",
borderRadius:"6px",
fontWeight:"600"
}}>
{item.owner_name}
</span>
) : (

<select
onChange={(e)=>assignOwner(item.id, e.target.value)}
>

<option value="">Assign Owner</option>

{owners.map(o => (
<option key={o.id} value={o.id}>
{o.username}
</option>
))}

</select>

)}

</td>

<td>{item.status}</td>

</tr>
))}

</tbody>

</table>

</div>
)
}

export default AdminCompanyLeads
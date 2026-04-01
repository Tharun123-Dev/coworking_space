import React, { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "./AdminLeadss.css"

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);

  // FETCH LEADS
const fetchLeads = async () => {
    try {
        const res = await axiosInstance.get("/leads/leadss/");
        if (res.data.length > leads.length) {
            alert("🔔 New Lead Received!");
        }
        setLeads(res.data);
    } catch (error) {
        console.log(error);
    }
};

  useEffect(() => {
    fetchLeads();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`leads/leadss/${id}/`, { status });
      fetchLeads(); // refresh data
    } catch (error) {
      console.log(error);
    }
  };

return (
  <div className="admin-container">

    <h2 className="admin-title">Leads Dashboard</h2>

    <div className="table-wrapper">
      <table className="leads-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Workspace</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.phone}</td>
              <td>{lead.workspace_type}</td>
              

              <td>
                <select
                  className="status-dropdown"
                  value={lead.status}
                  onChange={(e) =>
                    updateStatus(lead.id, e.target.value)
                  }
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Interested</option>
                  <option>Converted</option>
                </select>
              </td>
<td>
  <div className="action-buttons">

    {/* CALL */}
    <a href={`tel:${lead.phone}`} className="call-btn">
      📞 Call
    </a>

    {/* EMAIL */}
  <a
  href={`https://mail.google.com/mail/?view=cm&to=${lead.email}`}
  target="_blank"
  rel="noopener noreferrer"
  className="email-btn"
>
  📧 Email
</a>

  </div>
</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </div>
);
};

export default AdminLeads;
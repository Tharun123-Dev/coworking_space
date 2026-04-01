

import React, { useEffect, useState } from "react";
import "./AdminEnterprise.css";

function AdminDashboardEnterprise() {
  const [leads, setLeads] = useState([]);

  // 🔹 Fetch Leads
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/enterprise-leads/")
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch((err) => console.log(err));
  }, []);

  // 🔹 Update Status
  const updateStatus = (id, status) => {
    fetch(`http://127.0.0.1:8000/api/enterprise-leads/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === id ? { ...lead, status } : lead
          )
        );
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="admin-container">
      <h1>Enterprise Leads Dashboard</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Workspace</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.phone}</td>
              <td>{lead.email}</td>
              <td>{lead.workspace_type}</td>

              <td>
                <select
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboardEnterprise;
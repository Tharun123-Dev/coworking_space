import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";

function AdminLeads() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const res = await axiosInstance.get("leads/all/");
      setLeads(res.data);
    } catch (err) {
      alert("Only admin can view leads ");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>📩 Leads (User Requests)</h2>

      {leads.length === 0 ? (
        <p>No leads yet</p>
      ) : (
        leads.map((lead) => (
          <div key={lead.id} style={styles.card}>
            <h3>{lead.name}</h3>
            <p>📧 {lead.email}</p>
            <p>📱 {lead.phone}</p>
            <p>📍 {lead.city}</p>
            <p>💬 {lead.message}</p>
            <small>🕒 {lead.created_at}</small>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "10px",
    background: "#f9f9f9"
  }
};

export default AdminLeads;
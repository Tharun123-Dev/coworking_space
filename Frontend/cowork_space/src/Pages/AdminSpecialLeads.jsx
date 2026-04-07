import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/AdminSpecialLeads.css";

function AdminSpecialLeads() {
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [search, statusFilter, ownerFilter, leads]);

  const fetchLeads = () => {
    setLoading(true);
    axiosInstance.get("leads/special/admin/")
      .then(res => {
        setLeads(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  };

  const filterLeads = () => {
    let data = leads;

    if (search) {
      data = data.filter(item =>
        item.user?.toLowerCase().includes(search.toLowerCase()) ||
        item.company?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      data = data.filter(item => item.status === statusFilter);
    }

    if (ownerFilter) {
      data = data.filter(item => item.owner === ownerFilter);
    }

    setFiltered(data);
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "status pending";
    if (status === "Contacted") return "status contacted";
    if (status === "Converted") return "status converted";
    return "status";
  };

  const uniqueOwners = [...new Set(leads.map(i => i.owner))];

  return (
    <div className="admin-leads-container">

      <div className="header">
        <h2>Admin Special Leads</h2>
        <button className="refresh-btn" onClick={fetchLeads}>
          Refresh
        </button>
      </div>

      <div className="filters">

        <input
          type="text"
          placeholder="Search user, company, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        >
          <option value="">All Owners</option>
          {uniqueOwners.map(owner => (
            <option key={owner}>{owner}</option>
          ))}
        </select>

      </div>

      <div className="table-wrapper">

        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No leads found</div>
        ) : (

          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>

                  <td>{item.user}</td>
                  <td>{item.owner}</td>
                  <td>{item.category}</td>
                  <td>{item.company}</td>

                  <td className="contact-icons">
                    <a href={`tel:${item.phone}`}>📞</a>
                    <a href={`mailto:${item.email}`}>📧</a>
                  </td>

                  <td>
                    <span className={getStatusClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        )}
      </div>

    </div>
  );
}

export default AdminSpecialLeads;
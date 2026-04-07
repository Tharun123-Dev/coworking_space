import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerLeads.module.css";

function OwnerLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axiosInstance.get("leads/special/owner/");
      setLeads(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      // optimistic UI update
      setLeads(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status } : item
        )
      );

      await axiosInstance.put(`leads/special/update/${id}/`, {
        status: status
      });

      // optional refresh
      fetchLeads(true);

    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "pending") return styles.pending;
    if (status === "contacted") return styles.contacted;
    if (status === "confirmed") return styles.confirmed;
    return styles.cancelled;
  };

  return (
    <section className={styles.ownerLeadsPage}>
      <div className={styles.header}>
        <div>
          <p className={styles.badge}>Owner Panel</p>
          <h2>Owner Leads</h2>
          <p className={styles.subText}>
            Manage special workspace leads, contact users quickly, and update request status.
          </p>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={() => fetchLeads(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className={styles.stateBox}>
          <p>Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className={styles.stateBox}>
          <h3>No leads found</h3>
          <p>Special leads will appear here once users submit requests.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.leadsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>

                  <td>
                    <div className={styles.contactBox}>
                      <a href={`tel:${item.phone}`} className={styles.contactLink}>
                        📞 {item.phone}
                      </a>

                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className={styles.iconOnly}
                        >
                          📧
                        </a>
                      )}

                      {item.phone && (
                        <a
                          href={`https://wa.me/${item.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconOnly}
                        >
                          💬
                        </a>
                      )}
                    </div>
                  </td>

                  <td>{item.company || "-"}</td>
                  <td>{item.category || "-"}</td>

                  <td className={styles.messageCell}>
                    {item.message || "No message"}
                  </td>

                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                      {item.status || "pending"}
                    </span>
                  </td>

                  <td>
                    <select
                      className={styles.statusSelect}
                      value={item.status || "pending"}
                      disabled={updatingId === item.id}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OwnerLeads;
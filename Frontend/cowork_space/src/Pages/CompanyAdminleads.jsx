import React, { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/AdminCompanyLeads.module.css";

function AdminCompanyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("leads/company/admin/");
      setLeads(res.data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`leads/company/status/${id}/`, { status });
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === id ? { ...lead, status } : lead
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Status update failed");
    }
  };

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <header className={styles.mainHeader}>
          <div className={styles.pageHeading}>
            <span className={styles.headIcon}>📊</span>
            <div>
              <h1>Company Leads (Admin)</h1>
              <p>View all leads with owner and location details</p>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.stateBox}>
                <p className={styles.loadingText}>Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className={styles.stateBox}>
                <p className={styles.emptyTitle}>No leads found</p>
                <span className={styles.emptySubtext}>
                  There are currently no company leads available.
                </span>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Team</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td data-label="Name">
                          <strong className={styles.leadName}>
                            {lead.name || "-"}
                          </strong>
                        </td>

                        <td data-label="Company">{lead.company || "-"}</td>

                        <td data-label="Team">{lead.team_size || "-"}</td>

                        <td data-label="Phone">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className={styles.phoneLink}
                            >
                              📞 {lead.phone}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td data-label="Email">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className={styles.emailLink}
                            >
                              📧 {lead.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td data-label="Location">
                          <span className={styles.locationBadge}>
                            {lead.location || "No Location"}
                          </span>
                        </td>

                        <td data-label="Owner">
                          {lead.owner_name ? (
                            <span className={styles.ownerAssigned}>
                              {lead.owner_name}
                            </span>
                          ) : (
                            <span className={styles.ownerUnassigned}>
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td data-label="Status">
                          <select
                            value={lead.status || "pending"}
                            onChange={(e) =>
                              updateStatus(lead.id, e.target.value)
                            }
                            className={styles.statusSelect}
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
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminCompanyLeads;
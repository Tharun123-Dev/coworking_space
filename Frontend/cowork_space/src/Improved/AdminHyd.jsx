import React, { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "./AdminHyd.module.css";

export default function AdminDashboards() {
  const [stats, setStats] = useState({
    workspaces: 0,
    users: 0,
    leads: 0,
    bookings: 0,
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [wsRes, leadsRes] = await Promise.all([
        axiosInstance.get("workspaces/"),
        axiosInstance.get("enterprise-leads/"),
      ]);

      setStats({
        workspaces: wsRes.data?.length || 0,
        users: 120,
        leads: leadsRes.data?.length || 0,
        bookings: 45,
      });

      setLeads(leadsRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const cleanPhone = (phone = "") => phone.replace(/\s+/g, "");

  const createMailto = (lead) => {
    const subject = encodeURIComponent("Regarding your workspace inquiry");
    const body = encodeURIComponent(
      `Hello ${lead.name || "there"},\n\nThank you for your interest in ${lead.workspace_type || "our workspace"}.\n\nRegards,\nCoWork Team`
    );
    return `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const createWhatsAppLink = (lead) => {
    const message = encodeURIComponent(
      `Hello ${lead.name || ""}, thank you for your interest in ${lead.workspace_type || "our workspace"}.`
    );
    return `https://wa.me/${cleanPhone(lead.phone || "")}?text=${message}`;
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <div>
            <p className={styles.eyebrow}>Admin Panel</p>
            <h1 className={styles.pageTitle}>Admin Dashboard</h1>
            <p className={styles.pageSubtext}>
              Manage premium workspace leads, monitor activity, and contact prospects quickly.
            </p>
          </div>

          <button className={styles.refreshBtn} onClick={fetchDashboardData}>
            Refresh Data
          </button>
        </div>

        <div className={styles.statsGrid}>
          <Card title="Workspaces" value={stats.workspaces} icon="🏢" />
          <Card title="Users" value={stats.users} icon="👤" />
          <Card title="Leads" value={stats.leads} icon="📩" />
          <Card title="Bookings" value={stats.bookings} icon="📅" />
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Enterprise Data</p>
              <h2 className={styles.sectionTitle}>Enterprise Leads</h2>
            </div>
            <div className={styles.leadCountBadge}>{leads.length} Total Leads</div>
          </div>

          {loading ? (
            <div className={styles.loaderWrap}>
              <div className={styles.loader}></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No leads found</h3>
              <p>New enterprise inquiries will appear here when users submit requests.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.leadsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lead</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Workspace</th>
                    <th>Company Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id || index}>
                      <td data-label="#">{index + 1}</td>

                      <td data-label="Lead">
                        <div className={styles.leadCell}>
                          <div className={styles.leadAvatar}>
                            {getInitials(lead.name)}
                          </div>
                          <div className={styles.leadInfo}>
                            <span className={styles.leadName}>{lead.name || "-"}</span>
                            <span className={styles.leadMeta}>Hyderabad Spaces Enquiry</span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Phone">{lead.phone || "-"}</td>

                      <td data-label="Email" className={styles.emailCell}>
                        {lead.email || "-"}
                      </td>

                      <td data-label="Workspace">
                        <span className={styles.workspaceBadge}>
                          {lead.workspace_type || "-"}
                        </span>
                      </td>

                      <td data-label="Company Size">
                        <span className={styles.companyBadge}>
                          {lead.company_size || "-"}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className={styles.actionGroup}>
                          {lead.phone ? (
                            <a
                              href={`tel:${cleanPhone(lead.phone)}`}
                              className={`${styles.actionBtn} ${styles.callBtn}`}
                            >
                              Call
                            </a>
                          ) : (
                            <span className={`${styles.actionBtn} ${styles.disabledBtn}`}>
                              Call
                            </span>
                          )}

                          {lead.email ? (
                            <a
                              href={createMailto(lead)}
                              className={`${styles.actionBtn} ${styles.emailBtn}`}
                            >
                              Email
                            </a>
                          ) : (
                            <span className={`${styles.actionBtn} ${styles.disabledBtn}`}>
                              Email
                            </span>
                          )}

                          {lead.phone ? (
                            <a
                              href={createWhatsAppLink(lead)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.actionBtn} ${styles.whatsappBtn}`}
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <span className={`${styles.actionBtn} ${styles.disabledBtn}`}>
                              WhatsApp
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <div className={styles.statIcon}>{icon}</div>
        <span className={styles.statLabel}>{title}</span>
      </div>
      <h2 className={styles.statValue}>{value}</h2>
    </div>
  );
}
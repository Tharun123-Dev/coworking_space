import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";

function OwnerCompanyLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("leads/company/owner/");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Company leads fetch error:", err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axiosInstance.put(`leads/company/status/${id}/`, { status });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status } : lead
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const NAV_ITEMS = [
    { key: "overview", icon: "⊞", label: "Overview", route: "/owner-dashboard" },
    { key: "workspaces", icon: "🏢", label: "Workspaces", route: "/owner-dashboard" },
    { key: "slots", icon: "⏰", label: "Slot Management", route: "/owner-dashboard" },
    { key: "monthlySlots", icon: "📅", label: "Monthly Slots", route: "/owner-dashboard" },
    { key: "bookings", icon: "📋", label: "My Bookings", route: "/owner-bookings" },
    { key: "ownerLeads", icon: "📌", label: "Manager Leads", route: "/owner-leads" },
    { key: "companyLeads", icon: "🏷️", label: "Company Leads", route: "/company-leads" },
    { key: "suggestedWorkspaces", icon: "🧭", label: "Suggested Workspaces", route: "/owner-dashboard" },
  ];

  const handleNav = (item) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  const stats = useMemo(() => {
    return {
      total: leads.length,
      pending: leads.filter((l) => l.status === "pending").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      closed: leads.filter((l) => l.status === "closed").length,
    };
  }, [leads]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "contacted":
        return styles.statusContacted;
      case "closed":
        return styles.statusClosed;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {sidebarCollapsed ? "M" : "Manager Panel"}
          </div>

          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            type="button"
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.navItem} ${
                item.key === "companyLeads" ? styles.navActive : ""
              }`}
              onClick={() => handleNav(item)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarStats}>
              <div>
                <strong>{stats.total}</strong>
                <span>Leads</span>
              </div>
              <div>
                <strong>{stats.pending}</strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>{stats.contacted}</strong>
                <span>Contacted</span>
              </div>
              <div>
                <strong>{stats.closed}</strong>
                <span>Closed</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className={styles.main}>
        <header className={styles.mainHeader}>
          <div className={styles.pageHeading}>
            <span className={styles.headIcon}>🏷️</span>
            <div>
              <h1>Company Leads</h1>
              <p>Manage company inquiries with location details</p>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.empty}>
                <div className={styles.loader}></div>
                <p>Loading leads...</p>
              </div>
            ) : leads.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Team Size</th>
                      <th>Location</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Company</th>
                  
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((item) => (
                    <tr key={item.id}>
                      <td>{item.team_size || "-"}</td>

                      <td>
                        <strong>{item.name || "-"}</strong>
                      </td>

                      <td>
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone}`}
                            className={styles.phoneLink}
                          >
                            📞 {item.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        {item.email ? (
                          <a
                            href={`mailto:${item.email}`}
                            className={styles.emailLink}
                          >
                            📧 {item.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>{item.company || "-"}</td>

                      <td>
                        <span className={styles.locationBadge}>
                          {item.location || "No Location"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.statusPill} ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </td>

                      <td>
                        <select
                          value={item.status || "pending"}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                          className={styles.statusSelect}
                          disabled={updatingId === item.id}
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
            ) : (
              <div className={styles.empty}>
                <div>📭</div>
                <p>No company leads yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerCompanyLeads;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Services/Axios";
import styles from "../Styles/OwnerDashboard.module.css";

function OwnerCompanyLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = () => {
    axiosInstance
      .get("leads/company/owner/")
      .then((res) => setLeads(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Company leads fetch error:", err));
  };

  const updateStatus = (id, status) => {
    axiosInstance
      .put(`leads/company/status/${id}/`, { status })
      .then(() => fetchLeads())
      .catch((err) => {
        console.error("Status update error:", err);
        alert("Status update failed");
      });
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

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {sidebarCollapsed ? "M" : "Manager Panel"}
          </div>

          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${
                item.key === "companyLeads" ? styles.navActive : ""
              }`}
              onClick={() => handleNav(item)}
              title={item.label}
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
                <strong>{leads.length}</strong>
                <span>Leads</span>
              </div>
              <div>
                <strong>
                  {leads.filter((item) => item.status === "pending").length}
                </strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>
                  {leads.filter((item) => item.status === "contacted").length}
                </strong>
                <span>Contacted</span>
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
              <p>Manage company inquiries and update their status</p>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team Size</th>
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
                    <td>{item.team_size}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <a href={`tel:${item.phone}`} className={styles.phoneLink}>
                        📞 {item.phone}
                      </a>
                    </td>
                    <td>
                      <a href={`mailto:${item.email}`} className={styles.emailLink}>
                        📧 {item.email}
                      </a>
                    </td>
                    <td>{item.company}</td>
                    <td>
                      <span className={styles.statusPill}>{item.status}</span>
                    </td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
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

            {leads.length === 0 && (
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
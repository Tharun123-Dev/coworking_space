import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";
import styles from "./AdminEnterprise.module.css";

function CustomisationAdminDashboard() {
  const [customisationLeads, setCustomisationLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchCustomisationLeads = () => {
    axiosInstance
      .get("leads/modern-leads/admin/")
      .then((res) => {
        setCustomisationLeads(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Customisation leads error:", err);
      });
  };

  useEffect(() => {
    fetchCustomisationLeads();
  }, []);

  /* ── Stat Counts ── */
  const stats = useMemo(() => {
    const total = customisationLeads.length;
    const newLeads = customisationLeads.filter(
      (l) => (l.status || "").toLowerCase() === "new"
    ).length;
    const contacted = customisationLeads.filter(
      (l) => (l.status || "").toLowerCase() === "contacted"
    ).length;
    const closed = customisationLeads.filter(
      (l) => (l.status || "").toLowerCase() === "closed"
    ).length;
    return { total, new: newLeads, contacted, closed };
  }, [customisationLeads]);

  /* ── Filter Options ── */
  const ownerOptions = useMemo(() => {
    const names = [
      ...new Set(customisationLeads.map((l) => l.owner_name).filter(Boolean)),
    ].sort();
    return ["All", ...names];
  }, [customisationLeads]);

  const locationOptions = useMemo(() => {
    const locs = [
      ...new Set(
        customisationLeads.map((l) => l.preferred_location).filter(Boolean)
      ),
    ].sort();
    return ["All", ...locs];
  }, [customisationLeads]);

  const statusOptions = useMemo(() => {
    const statuses = [
      ...new Set(customisationLeads.map((l) => l.status).filter(Boolean)),
    ].sort();
    return ["All", ...statuses];
  }, [customisationLeads]);

  /* ── Filtered Leads ── */
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customisationLeads.filter((item) => {
      const matchesSearch =
        !q ||
        [
          item.name,
          item.email,
          item.phone,
          item.city,
          item.company,
          item.owner_name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesOwner =
        selectedOwner === "All" || item.owner_name === selectedOwner;
      const matchesLocation =
        selectedLocation === "All" ||
        item.preferred_location === selectedLocation;
      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;
      return matchesSearch && matchesOwner && matchesLocation && matchesStatus;
    });
  }, [
    customisationLeads,
    searchQuery,
    selectedOwner,
    selectedLocation,
    selectedStatus,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedOwner !== "All" ||
    selectedLocation !== "All" ||
    selectedStatus !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedOwner("All");
    setSelectedLocation("All");
    setSelectedStatus("All");
  };

  const getStatusClass = (status = "") => {
    const s = status.toLowerCase();
    if (s === "new") return styles.pillNew;
    if (s === "contacted") return styles.pillContacted;
    if (s === "closed") return styles.pillClosed;
    return styles.pillDefault;
  };

  return (
    <div className={styles.sectionBody}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>🎨</div>
          <div>
            <h2 className={styles.headerTitle}>Customisation Leads</h2>
            <p className={styles.headerSub}>
              Admin tracking all custom workspace enquiry leads
            </p>
          </div>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={fetchCustomisationLeads}
          title="Refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <span className={styles.statIcon}>✦</span>
          <span className={styles.statNumber}>{stats.total}</span>
          <span className={styles.statLabel}>Total Leads</span>
        </div>
        <div className={`${styles.statCard} ${styles.statNew}`}>
          <span className={styles.statIcon}>✦</span>
          <span className={styles.statNumber}>{stats.new}</span>
          <span className={styles.statLabel}>New</span>
        </div>
        <div className={`${styles.statCard} ${styles.statContacted}`}>
          <span className={styles.statIcon}>◉</span>
          <span className={styles.statNumber}>{stats.contacted}</span>
          <span className={styles.statLabel}>Contacted</span>
        </div>
        <div className={`${styles.statCard} ${styles.statClosed}`}>
          <span className={styles.statIcon}>✓</span>
          <span className={styles.statNumber}>{stats.closed}</span>
          <span className={styles.statLabel}>Closed</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search name, email, phone, company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearchQuery("")}
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.selectLabel}>Owner</label>
          <select
            className={styles.filterSelect}
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
          >
            {ownerOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.selectLabel}>Location</label>
          <select
            className={styles.filterSelect}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locationOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrap}>
          <label className={styles.selectLabel}>Status</label>
          <select
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className={styles.clearAllBtn} onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* ── Result Count ── */}
      <p className={styles.resultCount}>
        Showing <strong>{filteredLeads.length}</strong> of{" "}
        <strong>{customisationLeads.length}</strong> leads
      </p>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company</th>
              <th>Owner</th>
              <th>City</th>
              <th>Preferred Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((item, index) => (
              <tr key={item.id}>
                <td className={styles.indexCell}>{index + 1}</td>
                <td>
                  <strong className={styles.leadName}>{item.name}</strong>
                </td>
                <td>
                  <a href={`tel:${item.phone}`} className={styles.phoneLink}>
                    {item.phone}
                  </a>
                </td>
                <td>
                  <a
                    href={`mailto:${item.email}`}
                    className={styles.emailLink}
                  >
                    {item.email}
                  </a>
                </td>
                <td>{item.company}</td>
                <td>{item.owner_name}</td>
                <td>{item.city}</td>
                <td>
                  <span className={styles.locationPill}>
                    {item.preferred_location}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✦</span>
            <p className={styles.emptyTitle}>No leads found</p>
            <p className={styles.emptySub}>
              {hasActiveFilters
                ? "Try adjusting your search or filter"
                : "No customisation leads yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomisationAdminDashboard;

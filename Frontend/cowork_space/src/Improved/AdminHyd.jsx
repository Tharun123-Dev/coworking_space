import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";
import styles from "../Improved/AdminHyd.module.css";

function HyderabadAdminDashboard() {
  const [hyderabadLeads, setHyderabadLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const fetchHyderabadLeads = () => {
    axiosInstance
      .get("hyderabad/admin/")
      .then((res) => {
        setHyderabadLeads(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Hyderabad leads error:", err);
      });
  };

  useEffect(() => {
    fetchHyderabadLeads();
  }, []);

  /* ── Derived filter options ── */
  const ownerOptions = useMemo(() => {
    const names = [...new Set(hyderabadLeads.map((l) => l.owner_name).filter(Boolean))].sort();
    return ["All", ...names];
  }, [hyderabadLeads]);

  const locationOptions = useMemo(() => {
    const locs = [...new Set(hyderabadLeads.map((l) => l.preferred_location).filter(Boolean))].sort();
    return ["All", ...locs];
  }, [hyderabadLeads]);

  /* ── Filtered leads ── */
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return hyderabadLeads.filter((item) => {
      const matchesSearch =
        !q ||
        [item.name, item.email, item.phone, item.city, item.company_size, item.workspace_type, item.status]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesOwner = selectedOwner === "All" || item.owner_name === selectedOwner;
      const matchesLocation = selectedLocation === "All" || item.preferred_location === selectedLocation;
      return matchesSearch && matchesOwner && matchesLocation;
    });
  }, [hyderabadLeads, searchQuery, selectedOwner, selectedLocation]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedOwner("All");
    setSelectedLocation("All");
  };

  const hasActiveFilters = searchQuery || selectedOwner !== "All" || selectedLocation !== "All";

  return (
    <div className={styles.sectionBody}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h2>📍 Hyderabad Leads</h2>
        <p>Admin tracking Hyderabad location leads</p>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className={styles.filterBar}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, phone, city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery("")} title="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Owner Filter */}
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

        {/* Preferred Location Filter */}
        <div className={styles.selectWrap}>
          <label className={styles.selectLabel}>Preferred Location</label>
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

        {/* Clear All */}
        {hasActiveFilters && (
          <button className={styles.clearAllBtn} onClick={clearFilters}>
            Clear All
          </button>
        )}

        {/* Result count badge */}
        <span className={styles.resultCount}>
          {filteredLeads.length} / {hyderabadLeads.length} leads
        </span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Owner</th>
              <th>City</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Workspace</th>
              <th>Company Size</th>
              <th>Preferred Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.owner_name}</td>
                <td>{item.city}</td>
                <td>{item.name}</td>
                <td>
                  <a href={`tel:${item.phone}`} className={styles.phoneLink}>
                    {item.phone}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${item.email}`} className={styles.emailLink}>
                    {item.email}
                  </a>
                </td>
                <td>
                  <span className={styles.statusPill}>{item.workspace_type}</span>
                </td>
                <td>{item.company_size}</td>
                <td>
                  <span className={styles.statusPill}>{item.preferred_location}</span>
                </td>
                <td>
                  <span className={styles.statusPill}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className={styles.empty}>
            {hasActiveFilters ? "No leads match your filters." : "No Hyderabad Leads"}
          </div>
        )}
      </div>
    </div>
  );
}

export default HyderabadAdminDashboard;

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../Services/Axios";
import styles from "./AdminLeadss.module.css";

const LOCATIONS = ["Hitech City", "Madhapur", "Gachibowli", "Kondapur"];

const EMPTY_FORM = {
  area: "",
  building: "",
  type: "",
  original_price: "",
  offer_price: "",
  seats: "",
  floor: "",
  image: "",
};

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={styles.statCard} style={{ borderTop: `3px solid ${accent}` }}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function AdminOfferWorkspace() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  /* filters */
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("area");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchOffers = () => {
    setLoading(true);
    axiosInstance
      .get("workspaces/offers/admin/")
      .then((res) => setOffers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOffers(); }, []);

  const set = (key) => (e) => setFormData((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!formData.area || !formData.building || !formData.type) {
      alert("Please fill Location, Building and Type.");
      return;
    }
    const url = editId
      ? `workspaces/offers/update/${editId}/`
      : "workspaces/offers/create/";
    const method = editId ? "put" : "post";
    axiosInstance[method](url, formData)
      .then(() => { fetchOffers(); resetForm(); })
      .catch(console.error);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditId(null);
    setFormOpen(false);
  };

  const handleEdit = (item) => {
    setFormData({
      area: item.area || "",
      building: item.building || "",
      type: item.type || "",
      original_price: item.original_price || "",
      offer_price: item.offer_price || "",
      seats: item.seats || "",
      floor: item.floor || "",
      image: item.image || "",
    });
    setEditId(item.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this workspace offer?")) return;
    axiosInstance
      .delete(`workspaces/offers/delete/${id}/`)
      .then(fetchOffers)
      .catch(console.error);
  };

  const handleApprove = (id) => {
    axiosInstance
      .put(`workspaces/offers/approve/${id}/`)
      .then(fetchOffers)
      .catch(console.error);
  };

  /* ── derived data ── */
  const stats = useMemo(() => ({
    total: offers.length,
    approved: offers.filter((o) => o.is_approved).length,
    pending: offers.filter((o) => !o.is_approved).length,
    locations: new Set(offers.map((o) => o.area).filter(Boolean)).size,
  }), [offers]);

  const filtered = useMemo(() => {
    let data = offers.filter((o) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        (o.building || "").toLowerCase().includes(q) ||
        (o.area || "").toLowerCase().includes(q) ||
        (o.type || "").toLowerCase().includes(q) ||
        (o.owner_name || "").toLowerCase().includes(q);
      const matchLoc = locationFilter === "all" || o.area === locationFilter;
      const matchSt =
        statusFilter === "all" ||
        (statusFilter === "approved" ? o.is_approved : !o.is_approved);
      return matchQ && matchLoc && matchSt;
    });

    data = [...data].sort((a, b) => {
      let va = (a[sortField] ?? "").toString().toLowerCase();
      let vb = (b[sortField] ?? "").toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [offers, search, locationFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => (
    <span className={styles.sortIcon}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "⇅"}
    </span>
  );

  const discount = (orig, offer) => {
    if (!orig || !offer) return null;
    const pct = Math.round(((orig - offer) / orig) * 100);
    return pct > 0 ? `${pct}% off` : null;
  };

  return (
    <div className={styles.shell}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <span className={styles.headerIcon}>🔥</span>
          </div>
          <div>
            <h1 className={styles.pageTitle}>Offer Workspaces</h1>
            <p className={styles.pageSubtitle}>Admin · Manage workspace offers</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={fetchOffers}>↻ Refresh</button>
          <button
            className={styles.btnGold}
            onClick={() => { setFormOpen((v) => !v); if (editId) resetForm(); }}
          >
            {formOpen ? "✕ Close Form" : "+ Add Workspace"}
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <StatCard icon="🏢" label="Total Offers"    value={stats.total}     accent="#D4A017" />
        <StatCard icon="✅" label="Approved"         value={stats.approved}  accent="#1E8449" />
        <StatCard icon="🕐" label="Pending Approval" value={stats.pending}   accent="#D4A017" />
        <StatCard icon="📍" label="Locations"        value={stats.locations} accent="#1A6FA8" />
      </div>

      {/* ── Add / Edit Form ── */}
      {formOpen && (
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                {editId ? "✏️ Edit Workspace Offer" : "➕ Add Workspace Offer"}
              </h2>
              {editId && (
                <span className={styles.editingBadge}>Editing ID #{editId}</span>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Location <span className={styles.req}>*</span></label>
                <select className={styles.input} value={formData.area} onChange={set("area")}>
                  <option value="">Select Location</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Building <span className={styles.req}>*</span></label>
                <input className={styles.input} value={formData.building} onChange={set("building")} placeholder="e.g. Cyber Towers" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Workspace Type <span className={styles.req}>*</span></label>
                <input className={styles.input} value={formData.type} onChange={set("type")} placeholder="e.g. Private Office" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Original Price (₹)</label>
                <input className={styles.input} type="number" value={formData.original_price} onChange={set("original_price")} placeholder="0" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Offer Price (₹)</label>
                <input className={styles.input} type="number" value={formData.offer_price} onChange={set("offer_price")} placeholder="0" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Seats</label>
                <input className={styles.input} type="number" value={formData.seats} onChange={set("seats")} placeholder="0" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Floor</label>
                <input className={styles.input} value={formData.floor} onChange={set("floor")} placeholder="e.g. 4th Floor" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Image URL</label>
                <input className={styles.input} value={formData.image} onChange={set("image")} placeholder="https://..." />
              </div>
            </div>

            {/* Price preview */}
            {formData.original_price && formData.offer_price && (
              <div className={styles.pricePreview}>
                <span className={styles.previewOrig}>₹{Number(formData.original_price).toLocaleString()}</span>
                <span className={styles.previewArrow}>→</span>
                <span className={styles.previewOffer}>₹{Number(formData.offer_price).toLocaleString()}</span>
                {discount(formData.original_price, formData.offer_price) && (
                  <span className={styles.discountBadge}>
                    {discount(formData.original_price, formData.offer_price)}
                  </span>
                )}
              </div>
            )}

            <div className={styles.btnRow}>
              <button className={styles.btnGold} onClick={handleSubmit}>
                {editId ? "💾 Update Workspace" : "➕ Add Workspace"}
              </button>
              <button className={styles.btnOutline} onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className={styles.filtersPanel}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search building, type, owner, location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => { setSearch(""); setPage(1); }}>✕</button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* ── Results bar ── */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} offers
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <p className={styles.stateText}>Loading offers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.stateBox}>
          <span className={styles.emptyIcon}>🏢</span>
          <p className={styles.stateTitle}>No offers found</p>
          <p className={styles.stateText}>Try adjusting your filters or add a new workspace.</p>
          <button className={styles.btnGold} onClick={() => { setSearch(""); setLocationFilter("all"); setStatusFilter("all"); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  {[
                    { key: "owner_name",      label: "Owner"    },
                    { key: "area",            label: "Location" },
                    { key: "building",        label: "Building" },
                    { key: "type",            label: "Type"     },
                    { key: "original_price",  label: "Original" },
                    { key: "offer_price",     label: "Offer"    },
                    { key: "seats",           label: "Seats"    },
                    { key: "floor",           label: "Floor"    },
                    { key: "is_approved",     label: "Status"   },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={styles.sortable}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label} <SortIcon field={col.key} />
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((item, index) => {
                  const disc = discount(item.original_price, item.offer_price);
                  return (
                    <tr key={item.id} className={styles.row}>
                      <td data-label="#">
                        <span className={styles.rowNum}>{(page - 1) * PAGE_SIZE + index + 1}</span>
                      </td>

                      <td data-label="Owner">
                        <div className={styles.ownerCell}>
                          <span className={styles.avatar}>
                            {(item.owner_name || "?")[0].toUpperCase()}
                          </span>
                          <span className={styles.ownerName}>{item.owner_name || "—"}</span>
                        </div>
                      </td>

                     <td data-label="Type">
  <div className={styles.workspaceInfo}>
    <span className={styles.cityText}>
      {item.area || "No City"}
    </span>

    <span className={styles.separator}>
      |
    </span>

 <span className={styles.locationText}>
  {item.workspace_location ||
    item.location ||
    "Hitech City Street 1"}
</span>

    <span className={styles.separator}>
      |
    </span>

    <span className={styles.typePill}>
      {item.type || "—"}
    </span>
  </div>
</td>

                      <td data-label="Building">
                        <strong className={styles.buildingName}>{item.building || "—"}</strong>
                      </td>

                      <td data-label="Type">
                        <span className={styles.typePill}>{item.type || "—"}</span>
                      </td>

                      <td data-label="Original">
                        <span className={styles.origPrice}>₹{Number(item.original_price || 0).toLocaleString()}</span>
                      </td>

                      <td data-label="Offer">
                        <div className={styles.offerCell}>
                          <span className={styles.offerPrice}>₹{Number(item.offer_price || 0).toLocaleString()}</span>
                          {disc && <span className={styles.discTag}>{disc}</span>}
                        </div>
                      </td>

                      <td data-label="Seats">
                        <span className={styles.seatsBadge}>👥 {item.seats || "—"}</span>
                      </td>

                      <td data-label="Floor">
                        <span className={styles.floorText}>{item.floor || "—"}</span>
                      </td>

                      <td data-label="Status">
                        {item.is_approved ? (
                          <span className={styles.approvedBadge}>✔ Approved</span>
                        ) : (
                          <span className={styles.pendingBadge}>⏳ Pending</span>
                        )}
                      </td>

                      <td data-label="Actions">
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => handleEdit(item)}>✏ Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>🗑 Delete</button>
                          {!item.is_approved && (
                            <button className={styles.approveBtn} onClick={() => handleApprove(item.id)}>✔ Approve</button>
                          )}
                          <button
                            className={styles.leadsBtn}
                            onClick={() => window.open(`/admin-offer-leads/${item.id}`, "_blank")}
                          >
                            👁 Leads
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                className={p === page ? styles.pageBtnActive : styles.pageBtn}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}

export default AdminOfferWorkspace;

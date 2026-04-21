import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import "../Styles/RecentActivity.css";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = () => {
    axiosInstance
      .get("workspaces/recent-activities/")
      .then((res) => setActivities(res.data || []))
      .catch(() => console.log("Error loading activities"));
  };

  // ================= ROLE STYLE =================
  const getRoleClass = (role) => {
    if (role === "Admin") return "admin";
    if (role === "Owner") return "owner";
    return "user";
  };

  // ================= ACTION STYLE =================
  const getActionClass = (action) => {
    if (!action) return "info";
    const a = action.toLowerCase();
    if (a === "create") return "create";
    if (a === "update") return "update";
    if (a === "delete") return "delete";
    return "info";
  };

  // ================= ICON =================
  const getIcon = (model) => {
    if (model === "Booking") return "📦";
    if (model === "Ticket") return "🎫";
    if (model === "Workspace") return "🏢";
    if (model === "Lead") return "📋";
    if (model === "Category") return "🗂️";
    return "⚡";
  };

  // ================= FORMAT TIME =================
  const formatTime = (time) => {
    if (!time) return "-";
    const date = new Date(time);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const timeAgo = (time) => {
    if (!time) return "-";
    const now = new Date();
    const past = new Date(time);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ================= EDIT =================
  const startEdit = (activity) => {
    setEditId(activity.id);
    setEditMessage(activity.message || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditMessage("");
  };

  const saveEdit = (id) => {
    axiosInstance
      .patch(`workspaces/recent-activities/update/${id}/`, {
        message: editMessage,
      })
      .then(() => {
        setEditId(null);
        setEditMessage("");
        fetchActivities();
      })
      .catch(() => alert("Edit failed"));
  };

  // ================= DELETE =================
  const deleteActivity = (id) => {
    if (!window.confirm("Delete this activity?")) return;
    axiosInstance
      .delete(`workspaces/recent-activities/delete/${id}/`)
      .then(() => fetchActivities())
      .catch(() => alert("Delete failed"));
  };

  const clearAll = () => {
    if (!window.confirm("Clear all activities?")) return;
    axiosInstance
      .delete("workspaces/recent-activities/clear/")
      .then(() => fetchActivities())
      .catch(() => alert("Error clearing activities"));
  };

  return (
    <div className="activity-container">
      <div className="activity-shell">

        {/* ================= HEADER ================= */}
        <div className="activity-header">
          <div className="activity-header-left">
            <p className="activity-eyebrow">Live System Feed</p>
            <h2>Recent Activity</h2>
            <p className="activity-subtitle">
              Track actions from users, owners, and admins with edit, delete,
              and clear-all management controls.
            </p>
          </div>

          {/* stat card only — no clear-all button here */}
          <div className="activity-header-right">
            <div className="activity-stat-card">
              <strong>{activities.length}</strong>
              <span>Total Logs</span>
            </div>
          </div>
        </div>

        {/* ================= EMPTY ================= */}
        {activities.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">🕘</div>
            <h4>No activity yet</h4>
            <p>Recent system actions will appear here once activity starts.</p>
          </div>
        ) : (

          // ================= LIST =================
          <div className="activity-list">
            {activities.map((a, index) => (
              <div className="activity-card" key={a.id}>

                {/* LEFT TIMELINE */}
                <div className="activity-left">
                  <div className="activity-timeline">
                    <div className={`activity-icon ${getActionClass(a.action)}`}>
                      {getIcon(a.model_name)}
                    </div>
                    {index !== activities.length - 1 && (
                      <div className="activity-line" />
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="activity-content">

                  {/* BADGES */}
                  <div className="activity-top-row">
                    <div className="activity-badges">
                      <div className="activity-model-tag">
                        {a.model_name || "Activity"}
                      </div>
                      <div className={`activity-action-tag ${getActionClass(a.action)}`}>
                        {a.action || "INFO"}
                      </div>
                      <div className={`role-badge ${getRoleClass(a.role)}`}>
                        {a.role || "User"}
                      </div>
                    </div>
                  </div>

                  {/* EDIT MODE */}
                  {editId === a.id ? (
                    <div className="activity-edit-box">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                      />
                      <div className="activity-edit-actions">
                        <button className="save-btn" onClick={() => saveEdit(a.id)}>
                          Save
                        </button>
                        <button className="cancel-btn" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="activity-message">
                        <strong>{a.user}</strong> {a.message}
                      </div>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {formatTime(a.time)} • {timeAgo(a.time)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="activity-actions">
                  <button className="edit-btn" onClick={() => startEdit(a)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => deleteActivity(a.id)}>
                    🗑️
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FIXED CLEAR ALL BUTTON ================= */}
      {activities.length > 0 && (
        <div className="clear-all-fixed">
          <button className="clear-btn" onClick={clearAll}>
            🗑 Clear All Logs
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentActivity;

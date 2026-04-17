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

  const getRoleClass = (role) => {
    if (role === "Admin") return "admin";
    if (role === "Owner") return "owner";
    return "user";
  };

  const getActionClass = (action) => {
    if (!action) return "info";
    const a = action.toLowerCase();
    if (a === "create") return "create";
    if (a === "update") return "update";
    if (a === "delete") return "delete";
    return "info";
  };

  const getIcon = (model) => {
    if (model === "Booking") return "📦";
    if (model === "Ticket") return "🎫";
    if (model === "Workspace") return "🏢";
    if (model === "Lead") return "📋";
    if (model === "Category") return "🗂️";
    return "⚡";
  };

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
        <div className="activity-header">
          <div className="activity-header-left">
            <p className="activity-eyebrow">Live System Feed</p>
            <h2>Recent Activity</h2>
            <p className="activity-subtitle">
              Track actions from users, owners, and admins with edit, delete,
              and clear-all management controls.
            </p>
          </div>

          <div className="activity-header-right">
            <div className="activity-stat-card">
              <strong>{activities.length}</strong>
              <span>Total Logs</span>
            </div>

            <button className="clear-btn" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">🕘</div>
            <h4>No activity yet</h4>
            <p>Recent system actions will appear here once activity starts.</p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((a, index) => (
              <div className="activity-card" key={a.id}>
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

                <div className="activity-content">
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

                  {editId === a.id ? (
                    <div className="activity-edit-box">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        placeholder="Edit activity message"
                      />
                      <div className="activity-edit-actions">
                        <button
                          className="save-btn"
                          onClick={() => saveEdit(a.id)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={cancelEdit}
                        >
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
                        <span className="activity-time">{a.time}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="activity-actions">
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(a)}
                    title="Edit activity"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteActivity(a.id)}
                    title="Delete activity"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
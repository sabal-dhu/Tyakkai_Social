"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  // Dummy notifications data
  const dummyNotifications = [
    {
      id: 1,
      type: "post_published",
      message: "Your post on Facebook has been published successfully",
      created_at: "2023-05-18T10:30:00Z",
      is_read: false,
    },
    {
      id: 2,
      type: "engagement_update",
      message: "Your Instagram post received 50+ likes in the last hour",
      created_at: "2023-05-17T15:45:00Z",
      is_read: false,
    },
    {
      id: 3,
      type: "scheduled_reminder",
      message: "You have 3 posts scheduled for tomorrow",
      created_at: "2023-05-17T09:15:00Z",
      is_read: false,
    },
    {
      id: 4,
      type: "platform_connected",
      message: "Twitter account successfully connected",
      created_at: "2023-05-16T14:20:00Z",
      is_read: true,
    },
    {
      id: 5,
      type: "post_failed",
      message: "Failed to publish post on facebook. Please try again.",
      created_at: "2023-05-15T11:10:00Z",
      is_read: true,
    },
    {
      id: 6,
      type: "engagement_update",
      message:
        "Your Facebook post is performing better than 80% of your previous posts",
      created_at: "2023-05-14T13:25:00Z",
      is_read: true,
    },
    {
      id: 7,
      type: "scheduled_reminder",
      message: "Reminder: You have a post scheduled for today at 5:00 PM",
      created_at: "2023-05-13T08:30:00Z",
      is_read: true,
    },
    {
      id: 8,
      type: "post_published",
      message: "Your post on Instagram has been published successfully",
      created_at: "2023-05-12T16:40:00Z",
      is_read: true,
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        let notificationsData = null;
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `http://localhost:8000/api/notifications?filter=${filter}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          notificationsData = response.data;
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!notificationsData) {
          // Filter dummy data based on the selected filter
          if (filter === "unread") {
            notificationsData = dummyNotifications.filter(
              (notification) => !notification.is_read
            );
          } else if (filter === "read") {
            notificationsData = dummyNotifications.filter(
              (notification) => notification.is_read
            );
          } else {
            notificationsData = dummyNotifications;
          }
        }

        setNotifications(notificationsData);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      // Try API call first
      try {
        await axios.put(
          `http://localhost:8000/api/notifications/${id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // Try API call first
      try {
        await axios.put(
          "http://localhost:8000/api/notifications/read-all",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        is_read: true,
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      // Try API call first
      try {
        await axios.delete(`http://localhost:8000/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;

    try {
      const token = localStorage.getItem("access_token");
      // Try API call first
      try {
        await axios.delete(
          "http://localhost:8000/api/notifications/delete-all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "post_published":
        return (
          <div className="bg-success bg-opacity-10 text-success rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        );
      case "engagement_update":
        return (
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </div>
        );
      case "scheduled_reminder":
        return (
          <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        );
      case "platform_connected":
        return (
          <div className="bg-info bg-opacity-10 text-info rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        );
      case "post_failed":
        return (
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Notifications</h2>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={deleteAllNotifications}
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-info">No notifications to display.</div>
      ) : (
        <div className="card">
          <div className="list-group list-group-flush">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`list-group-item d-flex align-items-start p-3 ${
                  !notification.is_read ? "bg-light" : ""
                }`}
              >
                <div className="me-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1 me-3">
                  <p className="mb-1">{notification.message}</p>
                  <small className="text-muted">
                    {formatRelativeTime(notification.created_at)}
                  </small>
                </div>
                <div className="d-flex">
                  {!notification.is_read && (
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

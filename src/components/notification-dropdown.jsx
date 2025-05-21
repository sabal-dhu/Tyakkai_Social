"use client"

import { useState, useEffect, useRef } from "react"
import api from "@/api"
import Link from "next/link"

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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
      message: "Failed to publish post on LinkedIn. Please try again.",
      created_at: "2023-05-15T11:10:00Z",
      is_read: true,
    },
  ]

  useEffect(() => {
    // Function to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        // Try to fetch from API
        let notificationsData = []
        try {
          const token = localStorage.getItem("access_token")
          const response = await api.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          })
          notificationsData = response.data
        } catch (error) {
          console.log("API not available, using dummy data")
          // Use dummy data if API fails
          notificationsData = dummyNotifications
        }

        setNotifications(notificationsData)
        // Count unread notifications
        const unread = notificationsData.filter((notification) => !notification.is_read).length
        setUnreadCount(unread)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token")
      // Try API call first
      try {
        await api.put(
          `/api/notifications/${id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      } catch (error) {
        console.log("API not available, updating local state only")
      }

      // Update local state
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification,
      )
      setNotifications(updatedNotifications)

      // Update unread count
      const unread = updatedNotifications.filter((notification) => !notification.is_read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token")
      // Try API call first
      try {
        await api.put(
          "/api/notifications/read-all",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      } catch (error) {
        console.log("API not available, updating local state only")
      }

      // Update local state
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        is_read: true,
      }))
      setNotifications(updatedNotifications)
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

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
        )
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
        )
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
        )
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
        )
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
        )
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
        )
    }
  }

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="btn btn-light position-relative" type="button" onClick={toggleDropdown} aria-expanded={isOpen}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      <div
        className={`dropdown-menu dropdown-menu-end p-0 ${isOpen ? "show" : ""}`}
        style={{ width: "350px", maxHeight: "400px", overflow: "hidden" }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-link text-decoration-none" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {loading ? (
            <div className="d-flex justify-content-center p-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`d-flex p-3 border-bottom ${!notification.is_read ? "bg-light" : ""}`}
                onClick={() => markAsRead(notification.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="me-3">{getNotificationIcon(notification.type)}</div>
                <div className="flex-grow-1">
                  <p className="mb-1">{notification.message}</p>
                  <small className="text-muted">{formatRelativeTime(notification.created_at)}</small>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2 border-top text-center">
          <Link href="/dashboard/notifications" className="btn btn-link text-decoration-none">
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  )
}

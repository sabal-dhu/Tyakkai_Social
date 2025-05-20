"use client";

import { useState, useEffect, use } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import CreatePostModal from "@/components/create-post-modal";
import NotificationDropdown from "@/components/notification-dropdown";
import api from "@/api";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Get page title based on current path
  const getPageTitle = () => {
    switch (true) {
      case pathname === "/dashboard":
        return "Dashboard";
      case pathname.includes("/dashboard/schedule"):
        return "Schedule Posts";
      case pathname.includes("/dashboard/analytics"):
        return "Analytics";
      case pathname.includes("/dashboard/content"):
        return "Content Calendar";
      case pathname.includes("/dashboard/hashtags"):
        return "Hashtag Suggestions";
      case pathname.includes("/dashboard/notifications"):
        return "Notifications";
      default:
        return "Dashboard";
    }
  };

  useEffect(() => {
    setIsClient(true);

    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get("access_token");

    if (accessToken) {
      // Store the token in localStorage
      localStorage.setItem("access_token", accessToken);

      // Remove the token from the URL to clean up
      const url = new URL(window.location.href);
      url.searchParams.delete("access_token");
      window.history.replaceState({}, document.title, url.toString());
    }

    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        // Try to fetch from API first
        let userData = null;
        try {
          const response = await api.get("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Response:", response);
          userData = response.data;
          console.log("User data:", userData);
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!userData) {
          userData = {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
          };
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch notifications count
    const fetchNotifications = async () => {
      try {
        // Try to fetch from API first
        let count = 0;
        try {
          const response = await api.get("api/notifications/unread/count", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            const data = await response.data;
            count = data.count || 0;
          }
        } catch (error) {
          console.log("API not available, using dummy data");
        }
        setUnreadNotifications(count);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUserData();
    fetchNotifications();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  if (!isClient || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Sidebar */}
        <div
          className="col-auto bg-white border-end"
          style={{ width: "250px" }}
        >
          <div className="d-flex flex-column h-100">
            {/* Sidebar Header */}
            <div
              className="p-3 border-bottom"
              style={{ height: "70px", display: "flex", alignItems: "center" }}
            >
              <div className="d-flex align-items-center justify-content-center w-100 h-100">
                <Image
                  src="/logo-new.png"
                  alt="Tyakkai Social"
                  width={180}
                  height={50}
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                    maxHeight: "160%",
                    maxWidth: "150%",
                  }}
                />
              </div>
            </div>

            {/* Sidebar Menu */}
            <div className="flex-grow-1 overflow-auto py-2">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard") ? "active" : ""
                    }`}
                  >
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
                      className="me-2"
                    >
                      <rect width="7" height="9" x="3" y="3" rx="1" />
                      <rect width="7" height="5" x="14" y="3" rx="1" />
                      <rect width="7" height="9" x="14" y="12" rx="1" />
                      <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/schedule"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard/schedule") ? "active" : ""
                    }`}
                  >
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
                      className="me-2"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    Schedule Posts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/analytics"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard/analytics") ? "active" : ""
                    }`}
                  >
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
                      className="me-2"
                    >
                      <line x1="18" x2="18" y1="20" y2="10" />
                      <line x1="12" x2="12" y1="20" y2="4" />
                      <line x1="6" x2="6" y1="20" y2="14" />
                    </svg>
                    Analytics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/content"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard/content") ? "active" : ""
                    }`}
                  >
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
                      className="me-2"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                      <path d="M8 14h.01" />
                      <path d="M12 14h.01" />
                      <path d="M16 14h.01" />
                      <path d="M8 18h.01" />
                      <path d="M12 18h.01" />
                      <path d="M16 18h.01" />
                    </svg>
                    Content Calendar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/hashtags"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard/hashtags") ? "active" : ""
                    }`}
                  >
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
                      className="me-2"
                    >
                      <line x1="4" x2="20" y1="9" y2="9" />
                      <line x1="4" x2="20" y1="15" y2="15" />
                      <line x1="10" x2="8" y1="3" y2="21" />
                      <line x1="16" x2="14" y1="3" y2="21" />
                    </svg>
                    Hashtag Suggestions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/notifications"
                    className={`nav-link d-flex align-items-center px-3 py-2 ${
                      isActive("/dashboard/notifications") ? "active" : ""
                    }`}
                  >
                    <div className="position-relative me-2">
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
                      {unreadNotifications > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unreadNotifications}
                          <span className="visually-hidden">
                            unread notifications
                          </span>
                        </span>
                      )}
                    </div>
                    Notifications
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-top mt-auto">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: "32px",
                      height: "32px",
                      overflow: "hidden",
                      backgroundImage: user?.profile_picture
                        ? `url(${user.profile_picture})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!user?.profile_picture && (
                      <span className="fw-bold">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="mb-0 small fw-medium">
                      {user?.name || "User Name"}
                    </p>
                    <p
                      className="mb-0 small text-muted"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px", // Adjust the width as needed
                      }}
                    >
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-light"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col overflow-auto h-100">
          {/* Header */}
          <header className="bg-white border-bottom p-3">
            <div className="d-flex align-items-center justify-content-between">
              <h1 className="h4 mb-0 fw-bold">{getPageTitle()}</h1>
              <div className="d-flex align-items-center">
                <NotificationDropdown />
                <button
                  className="btn btn-outline-primary d-flex align-items-center ms-3"
                  onClick={handleCreatePost}
                >
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
                    className="me-2"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                  New Post
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-4">{children}</main>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreatePostModal}
        onHide={() => setShowCreatePostModal(false)}
      />
    </div>
  );
}

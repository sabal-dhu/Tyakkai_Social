"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./dashboard.css";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to close sidebar (for when a link is clicked)
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Hamburger menu button for mobile */}
      <button
        className="hamburger-menu d-md-none"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay d-md-none" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header d-flex d-md-none justify-content-between align-items-center">
          <h2 className="mb-0">Tyakkai Social</h2>
          <button
            className="btn-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          ></button>
        </div>

        <div className="sidebar-brand">
          <Link href="/dashboard" onClick={closeSidebar}>
            <span className="brand-logo">TS</span>
            <span className="brand-name">Tyakkai Social</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                href="/dashboard"
                className={`nav-link ${
                  pathname === "/dashboard" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/schedule"
                className={`nav-link ${
                  pathname === "/dashboard/schedule" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Schedule Posts
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/analytics"
                className={`nav-link ${
                  pathname === "/dashboard/analytics" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Analytics
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/content"
                className={`nav-link ${
                  pathname === "/dashboard/content" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Content Calendar
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/hashtags"
                className={`nav-link ${
                  pathname === "/dashboard/hashtags" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <line x1="4" y1="9" x2="20" y2="9"></line>
                  <line x1="4" y1="15" x2="20" y2="15"></line>
                  <line x1="10" y1="3" x2="8" y2="21"></line>
                  <line x1="16" y1="3" x2="14" y2="21"></line>
                </svg>
                Hashtag Suggestions
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/dashboard/notifications"
                className={`nav-link ${
                  pathname === "/dashboard/notifications" ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="nav-icon"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Notifications
                <span className="badge bg-danger ms-2">3</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">J</div>
            <div className="user-details">
              <div className="user-name">John Doe</div>
              <div className="user-email">john@example.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <div className="container-fluid py-4">{children}</div>
      </main>

      <style jsx global>{`
        /* Dashboard Layout Styles */
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        /* Hamburger Menu */
        .hamburger-menu {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1040;
          background: #fff;
          border: none;
          border-radius: 4px;
          padding: 0.5rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1045;
        }

        /* Sidebar */
        .dashboard-sidebar {
          width: 250px;
          background-color: #f8f9fa;
          border-right: 1px solid #dee2e6;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1050;
          transition: transform 0.3s ease;
        }

        /* Mobile sidebar positioning */
        @media (max-width: 767.98px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }

          .dashboard-sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
        }

        .sidebar-brand {
          padding: 1.5rem 1rem;
          display: flex;
          align-items: center;
        }

        .sidebar-brand a {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #212529;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          background-color: #4a6cf7;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 0.75rem;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: #6c757d;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background-color: rgba(74, 108, 247, 0.05);
          color: #4a6cf7;
        }

        .nav-link.active {
          background-color: rgba(74, 108, 247, 0.1);
          color: #4a6cf7;
          font-weight: 500;
        }

        .nav-icon {
          margin-right: 0.75rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #dee2e6;
        }

        .user-info {
          display: flex;
          align-items: center;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background-color: #6c757d;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 0.75rem;
        }

        .user-name {
          font-weight: 500;
        }

        .user-email {
          font-size: 0.875rem;
          color: #6c757d;
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-left: 0px;
          transition: margin-left 0.3s ease;
        }

        @media (max-width: 767.98px) {
          .dashboard-main {
            margin-left: 0;
            padding-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

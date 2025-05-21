"use client";

import Link from "next/link";
import LoginForm from "@/components/login-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const handleLoginSuccess = () => {
    toast.success("User Authenticated!");
  };
  return (
    <div className="min-vh-100 d-flex flex-column flex-md-row">
      {/* Left side - Image/Branding */}
      <div className="d-none d-md-flex col-md-6 bg-primary text-white align-items-center justify-content-center p-4">
        <div className="max-width-md">
          <h1 className="display-4 fw-bold mb-4">Tyakkai Social</h1>
          <p className="fs-4 mb-5">
            AI-powered social media management for small businesses
          </p>
          <div className="d-flex flex-column gap-4">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle me-3">
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
                  className="feather feather-calendar-clock"
                >
                  <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.5" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                  <circle cx="18" cy="18" r="4" />
                  <path d="M18 16.5V18l1 1" />
                </svg>
              </div>
              <span>Schedule posts across multiple platforms</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle me-3">
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
                  className="feather feather-bar-chart-3"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </div>
              <span>Detailed engagement analytics</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle me-3">
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
                  className="feather feather-hash"
                >
                  <line x1="4" x2="20" y1="9" y2="9" />
                  <line x1="4" x2="20" y1="15" y2="15" />
                  <line x1="10" x2="8" y1="3" y2="21" />
                  <line x1="16" x2="14" y1="3" y2="21" />
                </svg>
              </div>
              <span>AI-powered hashtag suggestions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4 bg-light">
        <div
          className="card border-0 shadow-sm w-100"
          style={{ maxWidth: "450px" }}
        >
          <ToastContainer />
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="h3 fw-bold text-dark">Welcome Back</h2>
              <p className="text-muted">Sign in to manage your social media</p>
            </div>

            <LoginForm onLoginSuccess={handleLoginSuccess} />

            <div className="mt-4 text-center text-muted">
              <p>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary text-decoration-none"
                >
                  Sign up
                </Link>
              </p>
              <Link
                href="/admin/login"
                className="text-decoration-none text-muted"
              >
                <small>Admin Login →</small>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

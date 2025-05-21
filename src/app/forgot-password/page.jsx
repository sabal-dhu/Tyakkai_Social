import ForgotPasswordForm from "@/components/forgot-password-form"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-vh-100 d-flex flex-column flex-md-row">
      {/* Left side - Image/Branding */}
      <div className="d-none d-md-flex col-md-6 bg-primary text-white align-items-center justify-content-center p-4">
        <div className="max-width-md">
          <h1 className="display-4 fw-bold mb-4">Tyakkai Social</h1>
          <p className="fs-4 mb-5">AI-powered social media management for small businesses</p>
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
                  className="feather feather-lock"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span>Secure password recovery</span>
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
                  className="feather feather-shield"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <span>Protected account access</span>
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
                  className="feather feather-mail"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <span>Email verification system</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4 bg-light">
        <div className="card border-0 shadow-sm w-100" style={{ maxWidth: "450px" }}>
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <span className="fs-4 fw-bold">TS</span>
              </div>
              <h2 className="h3 fw-bold text-dark">Forgot Password</h2>
              <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <ForgotPasswordForm />

            <div className="mt-4 text-center text-muted">
              <p>
                Remember your password?{" "}
                <Link href="/" className="text-primary text-decoration-none">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

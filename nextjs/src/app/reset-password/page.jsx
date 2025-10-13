import ResetPasswordForm from "@/components/reset-password-form";
import Link from "next/link";

export default function ResetPasswordPage({ searchParams }) {
  const token = searchParams.token;

  // If no token is provided, show an error
  if (!token) {
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
                    className="feather feather-alert-triangle"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <span>Invalid or expired reset link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Error Message */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4 bg-light">
          <div
            className="card border-0 shadow-sm w-100"
            style={{ maxWidth: "450px" }}
          >
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                  style={{ width: "60px", height: "60px" }}
                >
                  <span className="fs-4 fw-bold">TS</span>
                </div>
                <h2 className="h3 fw-bold text-dark">Invalid Reset Link</h2>
                <p className="text-muted">
                  The password reset link is invalid or has expired.
                </p>
              </div>

              <div className="d-grid gap-2">
                <Link href="/forgot-password" className="btn btn-primary py-2">
                  Request New Reset Link
                </Link>
                <Link href="/" className="btn btn-outline-secondary py-2">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (

      <ResetPasswordForm token={token} />
   
  );
}

"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: 400 }}>
          <h2 className="h4 mb-3 text-center">Invalid Reset Link</h2>
          <p className="text-muted text-center">
            The password reset link is invalid or has expired.
          </p>
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
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-md-row">
      {/* Left side - Branding */}
      <div className="d-none d-md-flex col-md-6 bg-primary text-white align-items-center justify-content-center p-4">
        <div className="max-width-md">
          <h1 className="display-4 fw-bold mb-4">Tyakkai Social</h1>
          <p className="fs-4 mb-5">
            AI-powered social media management for small businesses
          </p>
        </div>
      </div>
      {/* Right side - Reset Password Form */}
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
              <h2 className="h3 fw-bold text-dark">Reset Password</h2>
              <p className="text-muted">
                Create a new password for your account.
              </p>
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && (
              <div className="alert alert-success py-2">{success}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

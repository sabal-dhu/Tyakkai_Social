"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Real API call to your FastAPI backend
      const response = await api.post("/admin/login", {
        email,
        password,
      });
      console.log("response data",response.data);
      if (response.data.access_token && response.data.role === "admin") {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user_role", response.data.role);
        localStorage.setItem("user_email", email);

        router.push("/admin");
      } else {
        setError("Invalid admin credentials. Please try again.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to login. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="mb-3">
            <label htmlFor="adminEmail" className="form-label">
              Admin Email
            </label>
            <input
              id="adminEmail"
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="adminPassword" className="form-label">
              Password
            </label>
            <input
              id="adminPassword"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing in...
              </>
            ) : (
              "Sign in as Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

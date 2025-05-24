"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import api from "@/api";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    company_name: "",
  });
  const [platforms, setPlatforms] = useState({
    facebook: { connected: false, username: "", token: null },
    instagram: { connected: false, username: "", token: null },
    twitter: { connected: false, username: "", token: null },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        let userData = null;
        let platformsData = null;

        try {
          // API call to fetch user profile data
          const response = await api.get("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Response:", response);
          userData = response.data;
          console.log("User data:", userData);
          // API call to fetch connected platforms
          // const platformsResponse = await fetch("http://localhost:8000/api/users/me/platforms", {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // })
          // if (platformsResponse.ok) {
          //   platformsData = await platformsResponse.json()
          // }
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!userData) {
          userData = {
            name: "John Doe",
            email: "john@example.com",
            company_name: "Acme Inc",
          };
        }

        if (!platformsData) {
          platformsData = {
            facebook: {
              connected: true,
              username: "johndoe",
              token: "dummy-token-fb",
            },
            instagram: { connected: false, username: "", token: null },
            twitter: {
              connected: true,
              username: "johndoe_twitter",
              token: "dummy-token-tw",
            },
          };
        }

        setUser(userData);
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // API call to update user profile
      // const response = await fetch("http://localhost:8000/api/users/me", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      //   },
      //   body: JSON.stringify(user),
      // })

      // if (!response.ok) {
      //   throw new Error("Failed to update profile")
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPlatform = async (platform) => {
    try {
      setError("");

      // In a real implementation, this would redirect to OAuth flow
      // For demo purposes, we'll simulate the connection process

      // 1. Redirect to platform OAuth
      // window.location.href = `http://localhost:8000/api/auth/${platform}/connect`

      // 2. For demo, simulate successful connection
      const newPlatforms = { ...platforms };
      newPlatforms[platform] = {
        connected: true,
        username:
          platform === "facebook"
            ? "new_fb_user"
            : platform === "instagram"
            ? "new_ig_user"
            : "new_tw_user",
        token: `dummy-token-${platform}-${Date.now()}`,
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPlatforms(newPlatforms);
      setSuccess(`Connected to ${platform} successfully!`);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      setError(`Failed to connect to ${platform}. Please try again.`);
    }
  };

  const handleDisconnectPlatform = async (platform) => {
    try {
      setError("");

      // API call to disconnect platform
      // const response = await fetch(`http://localhost:8000/api/users/me/platforms/${platform}`, {
      //   method: "DELETE",
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      //   },
      // })

      // if (!response.ok) {
      //   throw new Error(`Failed to disconnect from ${platform}`)
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newPlatforms = { ...platforms };
      newPlatforms[platform] = { connected: false, username: "", token: null };

      setPlatforms(newPlatforms);
      setSuccess(`Disconnected from ${platform} successfully!`);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      setError(`Failed to disconnect from ${platform}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-fluid p-0">
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {success && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            {success}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess("")}
            ></button>
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Profile Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSaveProfile}>
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="full_name"
                      name="full_name"
                      value={user.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="company_name" className="form-label">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="company_name"
                      name="company_name"
                      value={user.company_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* 
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="3"
                    value={user.bio}
                    onChange={handleInputChange}
                  ></textarea>
                </div> */}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Connected Platforms</h5>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {/* Facebook */}
                  <div className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="#1877F2"
                            stroke="none"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-0">Facebook</h6>
                          {platforms.facebook.connected ? (
                            <small className="text-muted">
                              Connected as @{platforms.facebook.username}
                            </small>
                          ) : (
                            <small className="text-muted">Not connected</small>
                          )}
                        </div>
                      </div>
                      {platforms.facebook.connected ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDisconnectPlatform("facebook")}
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleConnectPlatform("facebook")}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="url(#instagram-gradient)"
                            stroke="none"
                          >
                            <defs>
                              <linearGradient
                                id="instagram-gradient"
                                x1="0%"
                                y1="100%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#FFDC80" />
                                <stop offset="10%" stopColor="#FCAF45" />
                                <stop offset="50%" stopColor="#E1306C" />
                                <stop offset="100%" stopColor="#5851DB" />
                              </linearGradient>
                            </defs>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-0">Instagram</h6>
                          {platforms.instagram.connected ? (
                            <small className="text-muted">
                              Connected as @{platforms.instagram.username}
                            </small>
                          ) : (
                            <small className="text-muted">Not connected</small>
                          )}
                        </div>
                      </div>
                      {platforms.instagram.connected ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDisconnectPlatform("instagram")}
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleConnectPlatform("instagram")}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="#1DA1F2"
                            stroke="none"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-0">Twitter</h6>
                          {platforms.twitter.connected ? (
                            <small className="text-muted">
                              Connected as @{platforms.twitter.username}
                            </small>
                          ) : (
                            <small className="text-muted">Not connected</small>
                          )}
                        </div>
                      </div>
                      {platforms.twitter.connected ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDisconnectPlatform("twitter")}
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleConnectPlatform("twitter")}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Account Security</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

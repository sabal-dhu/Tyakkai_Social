"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import axios from "axios"

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalFollowers: "0",
    followerGrowth: "0%",
    engagementRate: "0%",
    engagementGrowth: "0%",
    totalPosts: "0",
    newPosts: "0",
    scheduledPosts: "0",
    nextPostTime: "No posts scheduled",
  })

  const [platforms, setPlatforms] = useState([])
  const [upcomingPosts, setUpcomingPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPlatformOptions, setShowPlatformOptions] = useState(false)

  // Dummy data
  const dummyStats = {
    totalFollowers: "17K",
    followerGrowth: "12%",
    engagementRate: "4.2%",
    engagementGrowth: "0.8%",
    totalPosts: "237",
    newPosts: "24",
    scheduledPosts: "12",
    nextPostTime: "3 hours",
  }

  const dummyPlatforms = [
    {
      id: 1,
      name: "Facebook",
      connected: true,
      followers: "5.2K",
      engagement: "3.8%",
      posts: 42,
      icon: "facebook",
    },
    {
      id: 2,
      name: "Instagram",
      connected: true,
      followers: "8.7K",
      engagement: "5.2%",
      posts: 67,
      icon: "instagram",
    },
    {
      id: 3,
      name: "Twitter",
      connected: true,
      followers: "3.1K",
      engagement: "2.7%",
      posts: 128,
      icon: "twitter",
    },
  ]

  const dummyUpcomingPosts = [
    {
      id: 1,
      platform: "Instagram",
      date: "Today, 3:00 PM",
      content: "New product launch! Check out our latest social media management features...",
      media: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Product+Launch",
        },
      ],
    },
    {
      id: 2,
      platform: "Facebook",
      date: "Tomorrow, 10:00 AM",
      content: "Tips for small businesses to improve their social media presence...",
      media: [],
    },
    {
      id: 3,
      platform: "Twitter",
      date: "May 20, 2:30 PM",
      content: "Join our webinar on effective hashtag strategies for small businesses...",
      media: [],
    },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")
        if (!token) return

        // Try to fetch from API first
        let statsData = null
        let platformsData = null
        let postsData = null

        try {
          // Fetch dashboard stats
          const statsResponse = await axios.get("http://localhost:8000/api/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          })
          statsData = statsResponse.data

          // Fetch connected platforms
          const platformsResponse = await axios.get("http://localhost:8000/api/platforms", {
            headers: { Authorization: `Bearer ${token}` },
          })
          platformsData = platformsResponse.data

          // Fetch upcoming posts
          const postsResponse = await axios.get("http://localhost:8000/api/posts/upcoming", {
            headers: { Authorization: `Bearer ${token}` },
          })
          postsData = postsResponse.data
        } catch (err) {
          console.log("API not available, using dummy data")
        }

        // Update state with fetched data or fallback to dummy data
        setStats(statsData || dummyStats)
        setPlatforms(platformsData || dummyPlatforms)
        setUpcomingPosts(postsData || dummyUpcomingPosts)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleEditPost = async (postId) => {
    // Implement edit post functionality
    console.log("Edit post:", postId)
  }

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("access_token")

      // Try API call first
      try {
        await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.log("API not available, updating local state only")
      }

      // Remove the deleted post from the list
      setUpcomingPosts(upcomingPosts.filter((post) => post.id !== postId))
    } catch (err) {
      console.error("Error deleting post:", err)
      alert("Failed to delete post. Please try again.")
    }
  }

  // Function to render platform icon
  const renderPlatformIcon = (platform) => {
    switch (platform.name.toLowerCase()) {
      case "facebook":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4267B2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      case "instagram":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="url(#instagram-gradient)"
          >
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="50%" stopColor="#F56040" />
                <stop offset="100%" stopColor="#833AB4" />
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      case "twitter":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  const handleConnectPlatform = () => {
    // In a real implementation, this would open a modal or redirect to a connection page
    // For now, we'll just show an alert
    alert("This would open a platform connection interface. Feature coming soon!")

    // You could also implement a modal here or redirect to a dedicated page
    // Example: router.push("/dashboard/connect-platform");
  }

  const handleConnectSpecificPlatform = (platform) => {
    // In a real implementation, this would initiate the OAuth flow for the specific platform
    // For now, we'll just show an alert
    alert(`Connecting to ${platform}. This would initiate the OAuth flow in a real implementation.`)

    // You could also implement a redirect to a platform-specific connection page
    // Example: router.push(`/dashboard/connect-platform/${platform}`);
  }

  return (
    <div>
      <h2 className="h4 mb-4">Overview</h2>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Total Followers</h6>
              <h2 className="card-title h1 mb-2">{stats.totalFollowers}</h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
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
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {stats.followerGrowth} from last month
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Engagement Rate</h6>
              <h2 className="card-title h1 mb-2">{stats.engagementRate}</h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
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
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {stats.engagementGrowth} from last month
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Total Posts</h6>
              <h2 className="card-title h1 mb-2">{stats.totalPosts}</h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
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
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {stats.newPosts} new this month
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Scheduled Posts</h6>
              <h2 className="card-title h1 mb-2">{stats.scheduledPosts}</h2>
              <p className="card-text text-muted mb-0">Next post in {stats.nextPostTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <h3 className="h5 mb-4">Connected Platforms</h3>
      <div className="row g-4 mb-5">
        {platforms.map((platform) => (
          <div className="col-md-4" key={platform.id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-2">{renderPlatformIcon(platform)}</div>
                    <h5 className="card-title mb-0">{platform.name}</h5>
                  </div>
                  <span className="badge bg-success">Connected</span>
                </div>
                <div className="row text-center g-0">
                  <div className="col-4">
                    <p className="text-muted small mb-1">Followers</p>
                    <p className="fw-bold mb-0">{platform.followers}</p>
                  </div>
                  <div className="col-4">
                    <p className="text-muted small mb-1">Engagement</p>
                    <p className="fw-bold mb-0">{platform.engagement}</p>
                  </div>
                  <div className="col-4">
                    <p className="text-muted small mb-1">Posts</p>
                    <p className="fw-bold mb-0">{platform.posts}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Connect New Platform Section - Horizontal */}
        <div className="col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Connect New Platform</h5>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowPlatformOptions(!showPlatformOptions)}
                >
                  {showPlatformOptions ? "Hide Options" : "Connect Platform"}
                </button>
              </div>

              {showPlatformOptions && (
                <div className="platform-options">
                  <div className="row g-3">
                    {/* Facebook Card */}
                    <div className="col-md-4">
                      <div className="card h-100 platform-card facebook-card">
                        <div className="card-body text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="#4267B2"
                            className="mb-3"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <h5 className="mb-1">Facebook</h5>
                          <p className="text-muted mb-3">Connect your Facebook page</p>
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => handleConnectSpecificPlatform("facebook")}
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instagram Card */}
                    <div className="col-md-4">
                      <div className="card h-100 platform-card instagram-card">
                        <div className="card-body text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="url(#instagram-gradient-connect)"
                            className="mb-3"
                          >
                            <defs>
                              <linearGradient id="instagram-gradient-connect" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FFDC80" />
                                <stop offset="50%" stopColor="#F56040" />
                                <stop offset="100%" stopColor="#833AB4" />
                              </linearGradient>
                            </defs>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <h5 className="mb-1">Instagram</h5>
                          <p className="text-muted mb-3">Connect your Instagram account</p>
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => handleConnectSpecificPlatform("instagram")}
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Twitter Card */}
                    <div className="col-md-4">
                      <div className="card h-100 platform-card twitter-card">
                        <div className="card-body text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="#1DA1F2"
                            className="mb-3"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          <h5 className="mb-1">Twitter</h5>
                          <p className="text-muted mb-3">Connect your Twitter account</p>
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => handleConnectSpecificPlatform("twitter")}
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Posts */}
      <h3 className="h5 mb-4">Upcoming Posts</h3>
      <div className="mb-4">
        {upcomingPosts.length > 0 ? (
          upcomingPosts.map((post) => (
            <div className="card mb-3" key={post.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <span
                        className="badge me-2"
                        style={{
                          backgroundColor:
                            post.platform === "Instagram"
                              ? "#8a3ab9"
                              : post.platform === "Facebook"
                                ? "#4267B2"
                                : "#1DA1F2",
                        }}
                      >
                        {post.platform}
                      </span>
                      <span className="text-muted small">{post.date}</span>
                    </div>
                    <p className="mb-0">{post.content}</p>

                    {/* Display media if available */}
                    {post.media && post.media.length > 0 && (
                      <div className="mt-2">
                        {post.media.map((media, index) => (
                          <div key={index} className="mt-2">
                            {media.type === "image" ? (
                              <img
                                src={media.url || "https://via.placeholder.com/300x200?text=Image"}
                                alt="Post media"
                                className="img-fluid rounded"
                                style={{ maxHeight: "200px" }}
                              />
                            ) : media.type === "video" ? (
                              <video
                                src={media.url}
                                controls
                                className="img-fluid rounded"
                                style={{ maxHeight: "200px" }}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="d-flex">
                    <button className="btn btn-sm btn-light me-2" onClick={() => handleEditPost(post.id)}>
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
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeletePost(post.id)}>
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
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-info">No upcoming posts scheduled. Create a new post to get started!</div>
        )}

        <div className="text-center">
          <Link href="/dashboard/schedule" className="btn btn-outline-secondary">
            View All Scheduled Posts
          </Link>
        </div>
      </div>
      <style jsx global>{`
        .border-dashed {
          border-style: dashed;
          border-width: 2px;
          border-color: #dee2e6;
        }

        .platform-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #dee2e6;
        }

        .platform-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
        }

        .facebook-card:hover {
          border-color: #4267B2;
        }

        .instagram-card:hover {
          border-color: #E1306C;
        }

        .twitter-card:hover {
          border-color: #1DA1F2;
        }

        .platform-options {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive styles for platform cards */
        @media (max-width: 575.98px) {
          .platform-icon {
            margin-bottom: 1rem;
          }
          
          .platform-info {
            text-align: center;
            margin-bottom: 1rem;
          }
          
          .card-body .btn {
            width: 100%;
          }
        }
        
        /* Utility classes for responsive widths */
        @media (min-width: 576px) {
          .w-sm-auto {
            width: auto !important;
          }
        }
      `}</style>
    </div>
  )
}

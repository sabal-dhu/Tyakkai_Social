"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import CreatePostModal from "@/components/create-post-modal"
import api from "@/api"

export default function SchedulePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [editingPost, setEditingPost] = useState(null)

  useEffect(() => {
    fetchScheduledPosts()
  }, [filter, platformFilter])

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("Access token missing. Please login again.")
      }

      let url = "/api/posts/scheduled"
      const params = new URLSearchParams()

      if (filter !== "all") params.append("status", filter)
      if (platformFilter !== "all") params.append("platform", platformFilter)
      if (params.toString()) url += `?${params.toString()}`

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPosts(response.data)
    } catch (err) {
      console.error("Error fetching scheduled posts:", err)
      setError("Failed to load scheduled posts.")
      setPosts([]) // fallback or dummy data can be used here
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return
    try {
      const token = localStorage.getItem("access_token")
      await api.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPosts(posts.filter((p) => p.id !== postId))
    } catch (err) {
      alert("Failed to delete post.")
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook": return "#4267B2"
      case "instagram": return "#8a3ab9"
      case "twitter": return "#1DA1F2"
      case "linkedin": return "#0077b5"
      default: return "#6c757d"
    }
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled": return "bg-warning"
      case "published": return "bg-success"
      case "failed": return "bg-danger"
      case "draft": return "bg-secondary"
      default: return "bg-info"
    }
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Scheduled Posts</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Post
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body row g-3">
          <div className="col-md-6">
            <label>Status</label>
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Platform</label>
            <select className="form-select" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="all">All Platforms</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center my-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info">No posts found. Create one!</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Content</th>
                <th>Platforms</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Campaign</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {post.content}
                      {post.media_count > 0 && (
                        <span className="badge bg-light text-dark ms-2">
                          📷 {post.media_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {post.platforms.map((p) => (
                      <span key={p} className="badge me-1" style={{ backgroundColor: getPlatformColor(p) }}>
                        {p}
                      </span>
                    ))}
                  </td>
                  <td>{formatDate(post.scheduled_datetime)}</td>
                  <td>
                    <span className={`badge ${getStatusClass(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.campaign || "—"}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => {
                        setEditingPost(post)
                        setShowCreateModal(true)
                      }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <CreatePostModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          setEditingPost(null)
        }}
        editPost={editingPost}
      />
    </DashboardLayout>
  )
}

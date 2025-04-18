"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";
import CreatePostModal from "@/components/create-post-modal";

export default function SchedulePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [editingPost, setEditingPost] = useState(null);

  // Dummy data for scheduled posts
  const dummyPosts = [
    {
      id: 1,
      content: "Check out our new product line! #newproduct #launch",
      platforms: ["Instagram"],
      scheduled_datetime: "2023-05-15T14:30:00Z",
      status: "scheduled",
      campaign: "Product Launch",
      media_count: 1,
      media: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=New+Product",
        },
      ],
    },
    {
      id: 2,
      content:
        "We're excited to announce our summer sale! 30% off all products.",
      platforms: ["Facebook", "Twitter"],
      scheduled_datetime: "2023-05-18T10:15:00Z",
      status: "scheduled",
      campaign: "Summer Sale",
      media_count: 0,
      media: [],
    },
    {
      id: 3,
      content:
        "Join our webinar on social media strategies for small businesses. Register now!",
      platforms: ["Twitter", "facebook"],
      scheduled_datetime: "2023-05-20T16:45:00Z",
      status: "scheduled",
      campaign: "Webinar",
      media_count: 0,
      media: [],
    },
    {
      id: 4,
      content: "Happy Monday! Start your week with our productivity tips.",
      platforms: ["Instagram", "Facebook"],
      scheduled_datetime: "2023-05-22T09:00:00Z",
      status: "scheduled",
      campaign: "Tips & Tricks",
      media_count: 1,
      media: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Productivity+Tips",
        },
      ],
    },
    {
      id: 5,
      content:
        "Customer spotlight: See how @acmecorp increased their sales by 50% using our platform.",
      platforms: ["Twitter", "facebook"],
      scheduled_datetime: "2023-05-25T13:30:00Z",
      status: "scheduled",
      campaign: "Customer Stories",
      media_count: 0,
      media: [],
    },
    {
      id: 6,
      content:
        "Weekend special: Get a free consultation when you sign up this weekend!",
      platforms: ["Instagram", "Facebook"],
      scheduled_datetime: "2023-05-27T11:00:00Z",
      status: "published",
      campaign: "Weekend Promo",
      media_count: 0,
      media: [],
    },
    {
      id: 7,
      content: "How to optimize your social media strategy in 5 simple steps.",
      platforms: ["facebook", "Twitter"],
      scheduled_datetime: "2023-05-29T15:00:00Z",
      status: "draft",
      campaign: "Tips & Tricks",
      media_count: 0,
      media: [],
    },
    {
      id: 8,
      content:
        "Last day to take advantage of our summer sale! 30% off ends today.",
      platforms: ["Facebook", "Instagram", "Twitter"],
      scheduled_datetime: "2023-05-31T09:00:00Z",
      status: "failed",
      campaign: "Summer Sale",
      media_count: 0,
      media: [],
    },
  ];

  useEffect(() => {
    fetchScheduledPosts();
  }, [filter, platformFilter]);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Build query parameters based on filters
      let url = "http://localhost:8000/api/posts/scheduled";
      const params = new URLSearchParams();

      if (filter !== "all") {
        params.append("status", filter);
      }

      if (platformFilter !== "all") {
        params.append("platform", platformFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Try to fetch from API first
      let postsData = null;
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        postsData = response.data;
      } catch (err) {
        console.log("API not available, using dummy data");
      }

      // If API call failed, use dummy data
      if (!postsData) {
        // Filter dummy data based on selected filters
        postsData = dummyPosts.filter((post) => {
          // Filter by status
          if (filter !== "all" && post.status !== filter) {
            return false;
          }

          // Filter by platform
          if (
            platformFilter !== "all" &&
            !post.platforms.includes(platformFilter)
          ) {
            return false;
          }

          return true;
        });
      }

      setPosts(postsData);
    } catch (err) {
      console.error("Error fetching scheduled posts:", err);
      setError("Failed to load scheduled posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("access_token");

      // Try API call first
      try {
        await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Remove the deleted post from the list
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get platform badge color
  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return "#4267B2";
      case "instagram":
        return "#8a3ab9";
      case "twitter":
        return "#1DA1F2";
      case "facebook":
        return "#0077B5";
      default:
        return "#6c757d";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-warning";
      case "published":
        return "bg-success";
      case "failed":
        return "bg-danger";
      case "draft":
        return "bg-secondary";
      default:
        return "bg-info";
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Scheduled Posts</h2>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowCreateModal(true)}
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
          Create New Post
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="statusFilter" className="form-label">
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="platformFilter" className="form-label">
                Platform
              </label>
              <select
                id="platformFilter"
                className="form-select"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="all">All Platforms</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="facebook">facebook</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info">
          No posts found. Create a new post to get started!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Content</th>
                <th>Platform</th>
                <th>Schedule Date</th>
                <th>Status</th>
                <th>Campaign</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div
                      style={{
                        maxWidth: "300px",
                        maxHeight: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {post.content}

                      {/* Show media count if available */}
                      {post.media_count > 0 && (
                        <span className="badge bg-light text-dark ms-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="me-1"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          {post.media_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="badge me-1"
                        style={{ backgroundColor: getPlatformColor(platform) }}
                      >
                        {platform}
                      </span>
                    ))}
                  </td>
                  <td>{formatDate(post.scheduled_datetime)}</td>
                  <td>
                    <span className={`badge ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>
                    {post.campaign ? (
                      <span className="badge bg-info">{post.campaign}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditPost(post)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setEditingPost(null);
        }}
        editPost={editingPost}
      />
    </DashboardLayout>
  );
}

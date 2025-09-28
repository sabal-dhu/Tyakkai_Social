"use client";

import { useState, useEffect } from "react";
import api from "@/api";

export default function CreatePostModal({
  show,
  onHide,
  editPost = null,
  onSuccess = null,
}) {
  const [formData, setFormData] = useState({
    content: "",
    url: "",
    platforms: [],
    scheduledDate: "",
    scheduledTime: "",
    campaign: "",
  });

  const [postImmediately, setPostImmediately] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [campaigns, setCampaigns] = useState([]);

  const dummyCampaigns = [
    { id: 1, name: "Product Launch" },
    { id: 2, name: "Summer Sale" },
    { id: 3, name: "Webinar" },
    { id: 4, name: "Tips & Tricks" },
    { id: 5, name: "Customer Stories" },
    { id: 6, name: "Weekend Promo" },
  ];

  const availablePlatforms = [
    { id: "facebook", name: "Facebook" },
    { id: "instagram", name: "Instagram" },
    { id: "twitter", name: "Twitter" },
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("access_token");
        let campaignsData = null;
        try {
          const response = await api.get("/api/campaigns", {
            headers: { Authorization: `Bearer ${token}` },
          });
          campaignsData = response.data;
        } catch {
          campaignsData = dummyCampaigns;
        }
        setCampaigns(campaignsData);
      } catch (err) {
        setCampaigns(dummyCampaigns);
      }
    };

    fetchCampaigns();

    if (editPost) {
      const postDate = editPost.scheduled_datetime
        ? new Date(editPost.scheduled_datetime)
        : new Date();
      setFormData({
        content: editPost.content || "",
        url: editPost.url || "",
        platforms: editPost.platforms || [],
        scheduledDate: postDate.toISOString().split("T")[0],
        scheduledTime: postDate.toTimeString().slice(0, 5),
        campaign: editPost.campaign || "",
      });
      setPostImmediately(false);
    } else {
      resetForm();
    }
  }, [editPost, show]);

  const resetForm = () => {
    const now = new Date();
    setFormData({
      content: "",
      url: "",
      platforms: [],
      scheduledDate: now.toISOString().split("T")[0],
      scheduledTime: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
      campaign: "",
    });
    setPostImmediately(false);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "platforms") {
      const updatedPlatforms = [...formData.platforms];
      if (checked) {
        updatedPlatforms.push(value);
      } else {
        const index = updatedPlatforms.indexOf(value);
        if (index !== -1) {
          updatedPlatforms.splice(index, 1);
        }
      }
      setFormData({ ...formData, platforms: updatedPlatforms });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validate content
    if (formData.content.trim() === "") {
      setError("Post content is required");
      setIsSubmitting(false);
      return;
    }

    // Validate platforms
    if (formData.platforms.length === 0) {
      setError("Please select at least one platform");
      setIsSubmitting(false);
      return;
    }

    // Validate scheduling
    if (
      !postImmediately &&
      (!formData.scheduledDate || !formData.scheduledTime)
    ) {
      setError("Please set a date and time for your post");
      setIsSubmitting(false);
      return;
    }

    // Validate photo URL (optional, but if provided, must be a valid image URL)
    if (formData.url) {
      // Simple regex for image URLs (jpg, jpeg, png, gif, webp)
      const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!imageUrlPattern.test(formData.url.trim())) {
        setError("Please enter a valid image URL (jpg, jpeg, png, gif, webp).");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("content", formData.content);
      fd.append("url", formData.url);
      fd.append("campaign", formData.campaign);

      formData.platforms.forEach((platform) =>
        fd.append("platforms", platform)
      );

      // If postImmediately is true, send scheduled_datetime as null
      fd.append(
        "scheduled_datetime",
        postImmediately
          ? ""
          : `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      let response;
      if (editPost) {
        response = await api.put(`/api/posts/${editPost.id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Post updated successfully!");
      } else {
        response = await api.post("/api/posts", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess(
          postImmediately ? "Post published!" : "Post scheduled successfully!"
        );
      }

      resetForm();
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 1500);
    } catch (err) {
      let msg = "Failed to schedule post. Please try again.";
      console.error(err);
      if (err.response?.data?.detail) {
        msg =
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editPost ? "Edit Post" : "Create New Post"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              disabled={isSubmitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Post Content */}
              <div className="mb-3">
                <label htmlFor="content" className="form-label">
                  Post Content
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="4"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="What would you like to share?"
                  required
                ></textarea>
              </div>
              {/* Photo URL */}
              <div className="mb-3">
                <label htmlFor="url" className="form-label">
                  Photo URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/photo.jpg"
                />
                <small className="text-muted">
                  Paste the direct link to your photo.
                </small>
              </div>
              {/* Platform Selection */}
              <div className="mb-3">
                <label className="form-label d-block">Platforms</label>
                <div className="d-flex flex-wrap gap-3">
                  {availablePlatforms.map((platform) => (
                    <div key={platform.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`platform-${platform.id}`}
                        name="platforms"
                        value={platform.id}
                        checked={formData.platforms.includes(platform.id)}
                        onChange={handleInputChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`platform-${platform.id}`}
                      >
                        {platform.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Campaign Selection */}
              <div className="mb-3">
                <label htmlFor="campaign" className="form-label">
                  Campaign (Optional)
                </label>
                <select
                  className="form-select"
                  id="campaign"
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleInputChange}
                >
                  <option value="">No Campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.name}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Post Immediately Toggle */}
              <div className="mb-3 form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="postImmediately"
                  checked={postImmediately}
                  onChange={() => setPostImmediately(!postImmediately)}
                  disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="postImmediately">
                  Post Immediately
                </label>
              </div>
              {/* Scheduling */}
              {!postImmediately && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="scheduledDate" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="scheduledTime" className="form-label">
                      Time
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="scheduledTime"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {editPost
                    ? "Updating..."
                    : postImmediately
                    ? "Posting..."
                    : "Scheduling..."}
                </>
              ) : editPost ? (
                "Update Post"
              ) : postImmediately ? (
                "Post Now"
              ) : (
                "Schedule Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

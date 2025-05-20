"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/api";

export default function CreatePostModal({
  show,
  onHide,
  editPost = null,
  onSuccess = null,
}) {
  const [formData, setFormData] = useState({
    content: "",
    platforms: [],
    scheduledDate: "",
    scheduledTime: "",
    isRecurring: false,
    recurringType: "weekly",
    recurringDays: [],
    recurringEndDate: "",
    campaign: "",
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [campaigns, setCampaigns] = useState([]);

  const fileInputRef = useRef(null);

  // Dummy campaigns data
  const dummyCampaigns = [
    { id: 1, name: "Product Launch" },
    { id: 2, name: "Summer Sale" },
    { id: 3, name: "Webinar" },
    { id: 4, name: "Tips & Tricks" },
    { id: 5, name: "Customer Stories" },
    { id: 6, name: "Weekend Promo" },
  ];

  // Available platforms
  const availablePlatforms = [
    { id: "facebook", name: "Facebook" },
    { id: "instagram", name: "Instagram" },
    { id: "twitter", name: "Twitter" },
  ];

  // Days of the week for recurring posts
  const daysOfWeek = [
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
    { id: "sunday", name: "Sunday" },
  ];

  useEffect(() => {
    // Fetch campaigns
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // Try API call first
        let campaignsData = null;
        try {
          const response = await api.get("/api/campaigns", {
            headers: { Authorization: `Bearer ${token}` },
          });
          campaignsData = response.data;
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!campaignsData) {
          campaignsData = dummyCampaigns;
        }

        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      }
    };

    fetchCampaigns();

    // Check if there's a prefilled date in localStorage
    const prefilledDate = localStorage.getItem("prefilledScheduledDate");

    // If editing a post, populate the form
    if (editPost) {
      const postDate = new Date(editPost.scheduled_datetime);

      setFormData({
        content: editPost.content || "",
        platforms: editPost.platforms || [],
        scheduledDate: postDate.toISOString().split("T")[0],
        scheduledTime: postDate.toTimeString().slice(0, 5),
        isRecurring: editPost.is_recurring || false,
        recurringType: editPost.recurring_type || "weekly",
        recurringDays: editPost.recurring_days || [],
        recurringEndDate: editPost.recurring_end_date || "",
        campaign: editPost.campaign || "",
      });

      // Set media previews if available
      if (editPost.media && editPost.media.length > 0) {
        const previews = editPost.media.map((media) => ({
          url: media.url,
          type: media.type,
          name: media.url.split("/").pop() || "media-file",
        }));
        setMediaPreview(previews);
      }
    } else if (prefilledDate) {
      // If there's a prefilled date, use it
      const date = new Date(prefilledDate);

      setFormData({
        ...formData,
        scheduledDate: date.toISOString().split("T")[0],
        scheduledTime: `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`,
      });

      // Clear the localStorage item
      localStorage.removeItem("prefilledScheduledDate");
    } else {
      // Reset form for new post
      resetForm();
    }
  }, [editPost, show]);

  const resetForm = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get current time in HH:MM format
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    setFormData({
      content: "",
      platforms: [],
      scheduledDate: today,
      scheduledTime: currentTime,
      isRecurring: false,
      recurringType: "weekly",
      recurringDays: [],
      recurringEndDate: "",
      campaign: "",
    });
    setMediaFiles([]);
    setMediaPreview([]);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "platforms") {
      // Handle platform selection (multiple checkboxes)
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
    } else if (type === "checkbox" && name === "recurringDays") {
      // Handle recurring days selection (multiple checkboxes)
      const updatedDays = [...formData.recurringDays];
      if (checked) {
        updatedDays.push(value);
      } else {
        const index = updatedDays.indexOf(value);
        if (index !== -1) {
          updatedDays.splice(index, 1);
        }
      }
      setFormData({ ...formData, recurringDays: updatedDays });
    } else if (name === "isRecurring") {
      // Handle recurring toggle
      setFormData({ ...formData, [name]: checked });
    } else {
      // Handle other inputs
      setFormData({ ...formData, [name]: value });
    }
    console.log("FormData:", formData);
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 files
    if (mediaFiles.length + files.length > 5) {
      setError("You can upload a maximum of 5 files");
      return;
    }

    // Create previews for the files
    const newMediaFiles = [...mediaFiles, ...files];
    setMediaFiles(newMediaFiles);

    const newPreviews = [...mediaPreview];

    files.forEach((file) => {
      const fileType = file.type.split("/")[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        newPreviews.push({
          url: e.target.result,
          type: fileType,
          name: file.name,
        });
        setMediaPreview([...newPreviews]);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...mediaPreview];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setMediaFiles(updatedFiles);
    setMediaPreview(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validate form
    if (formData.content.trim() === "") {
      setError("Post content is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.platforms.length === 0) {
      setError("Please select at least one platform");
      setIsSubmitting(false);
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError("Please set a date and time for your post");
      setIsSubmitting(false);
      return;
    }

    // Additional validation for recurring posts
    if (formData.isRecurring) {
      if (formData.recurringDays.length === 0) {
        setError("Please select at least one day for recurring posts");
        setIsSubmitting(false);
        return;
      }

      if (!formData.recurringEndDate) {
        setError("Please set an end date for recurring posts");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("access_token");

      // Create FormData object for file upload
      const postData = new FormData();
      console.log("FormData:", formData);
      postData.append("content", formData.content);
      formData.platforms.forEach((platform) => {
        postData.append("platforms", platform);
      });

      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );
      postData.append("scheduled_datetime", scheduledDateTime.toISOString());

      // Add campaign if selected
      if (formData.campaign) {
        postData.append("campaign", formData.campaign);
      }

      // Add recurring data if enabled
      postData.append("is_recurring", formData.isRecurring);
      if (formData.isRecurring) {
        postData.append("recurring_type", formData.recurringType);
        formData.recurringDays.forEach((day) => {
          postData.append("recurring_days", day);
        });
        postData.append("recurring_end_date", formData.recurringEndDate);
      }

      // Append media files
      mediaFiles.forEach((file) => {
        postData.append("media", file);
      });
      console.log(postData.forEach((value, key) => console.log(key, value)));

      // Send request to API
      let response;
      if (editPost) {
        // Update existing post
        response = await api.put(`/api/posts/${editPost.id}`, postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Post updated successfully!");
      } else {
        // Create new post
        response = await api.post("/api/posts", postData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Post scheduled successfully!");
      }

      // Reset form after successful submission
      resetForm();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 2000);
    } catch (err) {
      let msg = "Failed to schedule post. Please try again.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          // FastAPI validation errors
          msg = err.response.data.detail.map(
            (e) => `${e.loc?.join(".")}: ${e.msg}`
          ).join(" | ");
        } else if (typeof err.response.data.detail === "object") {
          msg = err.response.data.detail.msg || JSON.stringify(err.response.data.detail);
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set min date for date inputs to today
  const today = new Date().toISOString().split("T")[0];

  // If modal is not shown, don't render anything
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
                {typeof error === "string"
                  ? error
                  : Array.isArray(error)
                    ? error.map((err, idx) => (
                        <div key={idx}>
                          {err.msg || JSON.stringify(err)}
                        </div>
                      ))
                    : error.msg || JSON.stringify(error)}
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

              {/* Media Upload */}
              <div className="mb-3">
                <label className="form-label d-block">
                  Media (Images & Videos)
                </label>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => fileInputRef.current.click()}
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
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <line x1="16" x2="22" y1="5" y2="5" />
                    <line x1="19" x2="19" y1="2" y2="8" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  Add Media
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                />
                <small className="text-muted d-block mt-1">
                  You can upload up to 5 images or videos (max 10MB each)
                </small>

                {/* Media Preview */}
                {mediaPreview.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex flex-wrap gap-2">
                      {mediaPreview.map((media, index) => (
                        <div
                          key={index}
                          className="position-relative"
                          style={{ width: "120px" }}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url || "/placeholder.svg"}
                              alt={`Preview ${index}`}
                              className="img-thumbnail"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="img-thumbnail"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeMedia(index)}
                          >
                            ×
                          </button>
                          <small
                            className="d-block text-truncate"
                            style={{ width: "120px" }}
                          >
                            {media.name}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              {/* Scheduling */}
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

              {/* Recurring Posts */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="isRecurring">
                    Make this a recurring post
                  </label>
                </div>
              </div>

              {/* Recurring Options (conditional) */}
              {formData.isRecurring && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3">Recurring Options</h6>

                    <div className="mb-3">
                      <label htmlFor="recurringType" className="form-label">
                        Frequency
                      </label>
                      <select
                        className="form-select"
                        id="recurringType"
                        name="recurringType"
                        value={formData.recurringType}
                        onChange={handleInputChange}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {formData.recurringType === "weekly" && (
                      <div className="mb-3">
                        <label className="form-label d-block">
                          Days of Week
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <div key={day.id} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`day-${day.id}`}
                                name="recurringDays"
                                value={day.id}
                                checked={formData.recurringDays.includes(
                                  day.id
                                )}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`day-${day.id}`}
                              >
                                {day.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="recurringEndDate" className="form-label">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="recurringEndDate"
                        name="recurringEndDate"
                        value={formData.recurringEndDate}
                        onChange={handleInputChange}
                        min={formData.scheduledDate || today}
                      />
                    </div>
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
                  {editPost ? "Updating..." : "Scheduling..."}
                </>
              ) : editPost ? (
                "Update Post"
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

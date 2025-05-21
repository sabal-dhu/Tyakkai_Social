"use client"

import { useState } from "react"
import { formatDate } from "@/utils/date-utils"

export default function PostDetailsModal({ show, onHide, post, onEdit, onDelete, platforms, campaigns }) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!show || !post) return null

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true)
      try {
        await onDelete(post.id)
      } catch (error) {
        console.error("Error deleting post:", error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getPlatformColor = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId)
    return platform ? platform.color : "#6c757d"
  }

  const getCampaignColor = (campaignName) => {
    const campaign = campaigns.find((c) => c.name === campaignName)
    return campaign ? campaign.color : "#6c757d"
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Post Details</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-bold">Content</label>
              <p className="border rounded p-3 bg-light">{post.content}</p>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Scheduled Date</label>
                <p>{formatDate(post.scheduled_datetime)}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Status</label>
                <p>
                  <span
                    className={`badge bg-${post.status === "scheduled" ? "warning" : post.status === "published" ? "success" : post.status === "failed" ? "danger" : "secondary"}`}
                  >
                    {post.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Platforms</label>
                <div>
                  {post.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="badge me-1 mb-1"
                      style={{ backgroundColor: getPlatformColor(platform) }}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Campaign</label>
                <p>
                  {post.campaign ? (
                    <span className="badge" style={{ backgroundColor: getCampaignColor(post.campaign) }}>
                      {post.campaign}
                    </span>
                  ) : (
                    <span className="text-muted">No campaign</span>
                  )}
                </p>
              </div>
            </div>

            {post.media && post.media.length > 0 && (
              <div className="mb-3">
                <label className="form-label fw-bold">Media</label>
                <div className="d-flex flex-wrap gap-2">
                  {post.media.map((media, index) => (
                    <div key={index}>
                      {media.type === "image" ? (
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt="Post media"
                          className="img-thumbnail"
                          style={{ maxHeight: "100px" }}
                        />
                      ) : (
                        <video src={media.url} controls className="img-thumbnail" style={{ maxHeight: "100px" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.is_recurring && (
              <div className="mb-3">
                <label className="form-label fw-bold">Recurring Details</label>
                <div className="border rounded p-3 bg-light">
                  <p className="mb-1">
                    <strong>Type:</strong> {post.recurring_type}
                  </p>
                  {post.recurring_days && post.recurring_days.length > 0 && (
                    <p className="mb-1">
                      <strong>Days:</strong> {post.recurring_days.join(", ")}
                    </p>
                  )}
                  {post.recurring_end_date && (
                    <p className="mb-0">
                      <strong>End Date:</strong> {new Date(post.recurring_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onEdit(post)}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

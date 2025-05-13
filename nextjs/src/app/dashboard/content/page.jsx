"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import DashboardLayout from "@/components/dashboard-layout"
import CreatePostModal from "@/components/create-post-modal"
import PostDetailsModal from "@/components/post-details-modal"
import { formatTime, isToday, isSameDay } from "@/utils/date-utils"
import api from "@/api"

export default function ContentCalendarPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("month") // month, week, day
  const [draggedPost, setDraggedPost] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [hoveredDate, setHoveredDate] = useState(null)
  const [hoveredHour, setHoveredHour] = useState(null)
  const dragRef = useRef(null)
  const calendarRef = useRef(null)

  // Dummy data for platforms
  const dummyPlatforms = [
    { id: "facebook", name: "Facebook", color: "#4267B2" },
    { id: "instagram", name: "Instagram", color: "#E1306C" },
    { id: "twitter", name: "Twitter", color: "#1DA1F2" }
  ]

  // Dummy data for campaigns
  const dummyCampaigns = [
    { id: 1, name: "Product Launch", color: "#4361ee" },
    { id: 2, name: "Summer Sale", color: "#f72585" },
    { id: 3, name: "Webinar", color: "#4cc9f0" },
    { id: 4, name: "Tips & Tricks", color: "#4d908e" },
    { id: 5, name: "Customer Stories", color: "#f8961e" },
    { id: 6, name: "Weekend Promo", color: "#9d4edd" },
  ]

  // Dummy data for content calendar
  const dummyPosts = [
    {
      id: 1,
      content: "Check out our new product line! #newproduct #launch",
      platforms: ["instagram"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 14, 30).toISOString(),
      status: "scheduled",
      campaign: "Product Launch",
      media: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=New+Product",
        },
      ],
    },
    {
      id: 2,
      content: "We're excited to announce our summer sale! 30% off all products.",
      platforms: ["facebook", "twitter"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18, 10, 15).toISOString(),
      status: "scheduled",
      campaign: "Summer Sale",
      media: [],
    },
    {
      id: 3,
      content: "Join our webinar on social media strategies for small businesses. Register now!",
      platforms: ["twitter", "linkedin"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 16, 45).toISOString(),
      status: "scheduled",
      campaign: "Webinar",
      media: [],
    },
    {
      id: 4,
      content: "Happy Monday! Start your week with our productivity tips.",
      platforms: ["instagram", "facebook"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22, 9, 0).toISOString(),
      status: "scheduled",
      campaign: "Tips & Tricks",
      media: [
        {
          type: "image",
          url: "https://via.placeholder.com/300x200?text=Productivity+Tips",
        },
      ],
    },
    {
      id: 5,
      content: "Customer spotlight: See how @acmecorp increased their sales by 50% using our platform.",
      platforms: ["twitter", "linkedin"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 13, 30).toISOString(),
      status: "scheduled",
      campaign: "Customer Stories",
      media: [],
    },
    {
      id: 6,
      content: "Weekend special: Get a free consultation when you sign up this weekend!",
      platforms: ["instagram", "facebook"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 27, 11, 0).toISOString(),
      status: "scheduled",
      campaign: "Weekend Promo",
      media: [],
    },
    {
      id: 7,
      content: "How to optimize your social media strategy in 5 simple steps.",
      platforms: ["linkedin", "twitter"],
      scheduled_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 29, 15, 0).toISOString(),
      status: "scheduled",
      campaign: "Tips & Tricks",
      media: [],
    },
    {
      id: 8,
      content: "Last day to take advantage of our summer sale! 30% off ends today.",
      platforms: ["facebook", "instagram", "twitter"],
      scheduled_datetime: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        9,
        0,
      ).toISOString(),
      status: "scheduled",
      campaign: "Summer Sale",
      media: [],
    },
    {
      id: 9,
      content: "Check out our latest blog post on content marketing strategies.",
      platforms: ["linkedin", "twitter"],
      scheduled_datetime: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1,
        11,
        30,
      ).toISOString(),
      status: "scheduled",
      campaign: "Tips & Tricks",
      media: [],
    },
    {
      id: 10,
      content: "Join us for a live Q&A session with our CEO tomorrow at 3 PM EST.",
      platforms: ["instagram", "facebook", "youtube"],
      scheduled_datetime: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 2,
        15,
        0,
      ).toISOString(),
      status: "scheduled",
      campaign: "Webinar",
      media: [],
    },
  ]

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate, view])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      // Format date for API
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      // Try to fetch from API first
      let postsData = null
      let campaignsData = null
      let platformsData = null

      try {
        const token = localStorage.getItem("access_token")

        // API call for posts
        const postsResponse = await api.get(
          `/api/posts/calendar?year=${year}&month=${month}&view=${view}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        postsData = postsResponse.data

        // API call for campaigns
        const campaignsResponse = await api.get("/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        })
        campaignsData = campaignsResponse.data

        // API call for platforms
        const platformsResponse = await api.get("/api/platforms/available", {
          headers: { Authorization: `Bearer ${token}` },
        })
        platformsData = platformsResponse.data
      } catch (error) {
        console.log("API not available, using dummy data")
      }

      // If API calls failed, use dummy data
      if (!postsData) {
        postsData = dummyPosts
      }
      if (!campaignsData) {
        campaignsData = dummyCampaigns
      }
      if (!platformsData) {
        platformsData = dummyPlatforms
      }

      setPosts(postsData)
      setCampaigns(campaignsData)
      setPlatforms(platformsData)
    } catch (err) {
      console.error("Error fetching calendar data:", err)
      setError("Failed to load calendar data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handlePrevPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (view === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 1)
      setCurrentDate(newDate)
    }
  }

  const handleNextPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (view === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 1)
      setCurrentDate(newDate)
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView) => {
    setView(newView)
  }

  const handleCreatePost = (date, hour) => {
    // If date and hour are provided, pre-fill the scheduled date and time
    if (date) {
      const scheduledDate = new Date(date)
      if (hour !== undefined) {
        scheduledDate.setHours(hour, 0, 0, 0)
      }
      // Store the date in localStorage to be picked up by the CreatePostModal
      localStorage.setItem("prefilledScheduledDate", scheduledDate.toISOString())
    }
    setShowCreateModal(true)
  }

  const handlePostClick = (post) => {
    setSelectedPost(post)
    setShowDetailsModal(true)
  }

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const token = localStorage.getItem("access_token")

      // API call to delete post
      try {
        await api.delete(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.log("API not available, updating local state only")
      }

      // Update local state
      setPosts(posts.filter((post) => post.id !== postId))

      // Close the details modal if open
      if (showDetailsModal && selectedPost && selectedPost.id === postId) {
        setShowDetailsModal(false)
        setSelectedPost(null)
      }
    } catch (err) {
      console.error("Error deleting post:", err)
      alert("Failed to delete post. Please try again.")
    }
  }

  const handleEditPost = (post) => {
    setSelectedPost(post)
    setShowCreateModal(true)
  }

  // Drag and drop functionality
  const handleDragStart = (e, post) => {
    setDraggedPost(post)
    setDraggedElement(e.currentTarget)

    // Add dragging class to the element
    e.currentTarget.classList.add("dragging")

    // Set the drag image
    if (e.dataTransfer) {
      // Create a custom drag image
      const dragImage = document.createElement("div")
      dragImage.classList.add("post-drag-preview")
      dragImage.innerHTML = `
        <div style="padding: 8px; background-color: ${getCampaignColor(post.campaign)}; 
                    color: white; border-radius: 4px; width: 150px; 
                    border-left: 3px solid ${getPlatformColor(post.platforms[0])};">
          ${post.content.substring(0, 20)}${post.content.length > 20 ? "..." : ""}
        </div>
      `
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 75, 20)

      // Store reference to remove later
      dragRef.current = dragImage
    }
  }

  const handleDragEnd = (e) => {
    // Remove the dragging class
    if (draggedElement) {
      draggedElement.classList.remove("dragging")
      setDraggedElement(null)
    }

    // Remove the drag image
    if (dragRef.current) {
      document.body.removeChild(dragRef.current)
      dragRef.current = null
    }

    setDraggedPost(null)
    setHoveredDate(null)
    setHoveredHour(null)
  }

  const handleDragOver = (e, date, hour) => {
    e.preventDefault()

    // Add visual feedback for the drop target
    e.currentTarget.classList.add("drag-over")

    // Update the hovered date and hour
    setHoveredDate(date)
    if (hour !== undefined) {
      setHoveredHour(hour)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove("drag-over")
  }

  const handleDrop = async (e, date, hour) => {
    e.preventDefault()
    e.currentTarget.classList.remove("drag-over")

    if (!draggedPost || !date) return

    // Create a new date with the same time or specified hour
    const oldDate = new Date(draggedPost.scheduled_datetime)
    const newDate = new Date(date)

    if (hour !== undefined) {
      // If hour is specified, use it
      newDate.setHours(hour, 0, 0, 0)
    } else {
      // Otherwise keep the original time
      newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds())
    }

    // Update the post with the new date
    const updatedPost = {
      ...draggedPost,
      scheduled_datetime: newDate.toISOString(),
    }

    try {
      const token = localStorage.getItem("access_token")

      // API call to update post
      try {
        await api.put(`/api/posts/${draggedPost.id}`, updatedPost, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.log("API not available, updating local state only")
      }

      // Update local state
      setPosts(posts.map((post) => (post.id === draggedPost.id ? updatedPost : post)))
    } catch (err) {
      console.error("Error updating post:", err)
      alert("Failed to reschedule post. Please try again.")
    }
  }

  // Helper functions
  const getPlatformColor = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId)
    return platform ? platform.color : "#6c757d"
  }

  const getCampaignColor = (campaignName) => {
    const campaign = campaigns.find((c) => c.name === campaignName)
    return campaign ? campaign.color : "#6c757d"
  }

  // Calendar generation functions
  const generateMonthCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Generate array of calendar days
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null })
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ day, date })
    }

    return days
  }

  const generateWeekCalendar = () => {
    const currentDay = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - currentDay) // Start from Sunday

    const days = []

    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push({
        day: date.getDate(),
        date: date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      })
    }

    return days
  }

  const getPostsForDate = (date) => {
    if (!date) return []

    return posts.filter((post) => {
      const postDate = new Date(post.scheduled_datetime)
      return isSameDay(postDate, date)
    })
  }

  const getPostsForHour = (date, hour) => {
    if (!date) return []

    return posts.filter((post) => {
      const postDate = new Date(post.scheduled_datetime)
      return isSameDay(postDate, date) && postDate.getHours() === hour
    })
  }

  // Generate hours for day/week view
  const generateHours = () => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }
    return hours
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="content-calendar">
        {/* Calendar Header */}
        <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handlePrevPeriod}>
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="btn btn-sm btn-outline-secondary me-3" onClick={handleNextPeriod}>
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <h2 className="h4 mb-0">
              {view === "month" && currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              {view === "week" &&
                `Week of ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              {view === "day" &&
                currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </h2>
          </div>

          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-primary me-3" onClick={handleToday}>
              Today
            </button>
            <div className="btn-group me-3">
              <button
                className={`btn btn-sm ${view === "month" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleViewChange("month")}
              >
                Month
              </button>
              <button
                className={`btn btn-sm ${view === "week" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleViewChange("week")}
              >
                Week
              </button>
              <button
                className={`btn btn-sm ${view === "day" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleViewChange("day")}
              >
                Day
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => handleCreatePost()}>
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
              Create Post
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="calendar-legend card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="mb-2">Platforms</h6>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="d-flex align-items-center">
                      <div
                        className="me-2 rounded"
                        style={{ width: "16px", height: "16px", backgroundColor: platform.color }}
                      ></div>
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="mb-2">Campaigns</h6>
                <div className="d-flex flex-wrap gap-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="d-flex align-items-center">
                      <div
                        className="me-2 rounded"
                        style={{ width: "16px", height: "16px", backgroundColor: campaign.color }}
                      ></div>
                      <span>{campaign.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="calendar-container card" ref={calendarRef}>
          <div className="card-body p-0">
            {/* Month View */}
            {view === "month" && (
              <div className="month-view">
                <div className="calendar-grid">
                  {/* Day headers */}
                  <div className="calendar-days-header">
                    <div className="calendar-day-header">Sun</div>
                    <div className="calendar-day-header">Mon</div>
                    <div className="calendar-day-header">Tue</div>
                    <div className="calendar-day-header">Wed</div>
                    <div className="calendar-day-header">Thu</div>
                    <div className="calendar-day-header">Fri</div>
                    <div className="calendar-day-header">Sat</div>
                  </div>

                  {/* Calendar cells */}
                  <div className="calendar-grid-body">
                    {generateMonthCalendar().map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-cell ${day.date ? (isToday(day.date) ? "today" : "") : "empty-cell"}`}
                        onDragOver={day.date ? (e) => handleDragOver(e, day.date) : null}
                        onDragLeave={day.date ? handleDragLeave : null}
                        onDrop={day.date ? (e) => handleDrop(e, day.date) : null}
                        onClick={day.date ? () => handleCreatePost(day.date) : null}
                      >
                        {day.day && (
                          <>
                            <div className="calendar-date">
                              <span className={isToday(day.date) ? "today-circle" : ""}>{day.day}</span>
                            </div>
                            <div className="calendar-cell-content">
                              {getPostsForDate(day.date).map((post) => (
                                <div
                                  key={post.id}
                                  className="calendar-post"
                                  style={{
                                    backgroundColor: getCampaignColor(post.campaign),
                                    borderLeft: `3px solid ${getPlatformColor(post.platforms[0])}`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePostClick(post)
                                  }}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, post)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="calendar-post-time">{formatTime(post.scheduled_datetime)}</div>
                                  <div className="calendar-post-title">
                                    {post.content.length > 30 ? `${post.content.substring(0, 30)}...` : post.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Week View */}
            {view === "week" && (
              <div className="week-view">
                <div className="week-header">
                  <div className="week-header-time"></div>
                  {generateWeekCalendar().map((day, index) => (
                    <div key={index} className={`week-header-day ${isToday(day.date) ? "today" : ""}`}>
                      <div className="week-day-name">{day.dayName}</div>
                      <div className={`week-day-number ${isToday(day.date) ? "today-circle" : ""}`}>{day.day}</div>
                    </div>
                  ))}
                </div>

                <div className="week-body">
                  {generateHours().map((hour) => (
                    <div key={hour} className="week-row">
                      <div className="week-hour">
                        {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                      </div>

                      {generateWeekCalendar().map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`week-cell ${isToday(day.date) ? "today" : ""}`}
                          onDragOver={(e) => handleDragOver(e, day.date, hour)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day.date, hour)}
                          onClick={() => handleCreatePost(day.date, hour)}
                        >
                          {getPostsForHour(day.date, hour).map((post) => (
                            <div
                              key={post.id}
                              className="week-post"
                              style={{
                                backgroundColor: getCampaignColor(post.campaign),
                                borderLeft: `3px solid ${getPlatformColor(post.platforms[0])}`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePostClick(post)
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, post)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="week-post-title">
                                {post.content.length > 20 ? `${post.content.substring(0, 20)}...` : post.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day View */}
            {view === "day" && (
              <div className="day-view">
                <div className="day-header">
                  <div className="day-header-date">
                    <h5 className={`mb-0 ${isToday(currentDate) ? "text-primary" : ""}`}>
                      {currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h5>
                  </div>
                </div>

                <div className="day-body">
                  {generateHours().map((hour) => (
                    <div key={hour} className="day-row">
                      <div className="day-hour">
                        {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                      </div>

                      <div
                        className="day-cell"
                        onDragOver={(e) => handleDragOver(e, currentDate, hour)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, currentDate, hour)}
                        onClick={() => handleCreatePost(currentDate, hour)}
                      >
                        {getPostsForHour(currentDate, hour).map((post) => (
                          <div
                            key={post.id}
                            className="day-post"
                            style={{
                              backgroundColor: getCampaignColor(post.campaign),
                              borderLeft: `3px solid ${getPlatformColor(post.platforms[0])}`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostClick(post)
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, post)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="day-post-platforms">
                              {post.platforms.map((platform) => (
                                <span
                                  key={platform}
                                  className="day-post-platform"
                                  style={{ backgroundColor: getPlatformColor(platform) }}
                                ></span>
                              ))}
                            </div>
                            <div className="day-post-title">{post.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          show={showCreateModal}
          onHide={() => {
            setShowCreateModal(false)
            setSelectedPost(null)
            // Clear the prefilled date from localStorage
            localStorage.removeItem("prefilledScheduledDate")
          }}
          editPost={selectedPost}
          onSuccess={fetchCalendarData}
        />

        {/* Post Details Modal */}
        {selectedPost && (
          <PostDetailsModal
            show={showDetailsModal}
            onHide={() => {
              setShowDetailsModal(false)
              setSelectedPost(null)
            }}
            post={selectedPost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            platforms={platforms}
            campaigns={campaigns}
          />
        )}

        {/* Custom CSS for calendar */}
        <style jsx global>{`
          /* Calendar Styles */
          .content-calendar {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          /* Month View */
          .calendar-grid {
            display: flex;
            flex-direction: column;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .calendar-days-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            background-color: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .calendar-day-header {
            padding: 10px;
            text-align: center;
            font-weight: 500;
            color: #495057;
          }
          
          .calendar-grid-body {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            /* Change this to fixed height rows */
            grid-auto-rows: 150px;
          }
          
          .calendar-cell {
            border-right: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            padding: 8px;
            /* Remove min-height and set fixed height */
            height: 150px;
            width: 100%;
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s;
            overflow: hidden;
          }
          
          /* Fix for the calendar post display issue in bottom left corner */
          .calendar-cell-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
            max-height: calc(100% - 30px);
            /* Add position relative to contain the posts properly */
            position: relative;
            z-index: 1;
          }
          
          .calendar-post {
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            color: white;
            cursor: pointer;
            transition: transform 0.2s;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            /* Add position relative to ensure proper stacking */
            position: relative;
          }
          
          .calendar-post:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .calendar-post-time {
            font-size: 0.7rem;
            opacity: 0.9;
          }
          
          .calendar-post-title {
            font-weight: 500;
          }
          
          /* Week View */
          .week-view {
            display: flex;
            flex-direction: column;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .week-header {
            display: grid;
            grid-template-columns: 60px repeat(7, 1fr);
            background-color: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .week-header-time {
            border-right: 1px solid #e0e0e0;
          }
          
          .week-header-day {
            padding: 10px;
            text-align: center;
            border-right: 1px solid #e0e0e0;
          }
          
          .week-header-day.today {
            background-color: rgba(0, 123, 255, 0.05);
          }
          
          .week-day-name {
            font-weight: 500;
            color: #495057;
          }
          
          .week-day-number {
            font-size: 1.2rem;
            font-weight: 500;
            margin-top: 4px;
          }
          
          .week-body {
            display: flex;
            flex-direction: column;
          }
          
          .week-row {
            display: grid;
            grid-template-columns: 60px repeat(7, 1fr);
            min-height: 60px;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .week-hour {
            padding: 8px;
            text-align: right;
            color: #6c757d;
            font-size: 0.8rem;
            border-right: 1px solid #e0e0e0;
            background-color: #f8f9fa;
          }
          
          .week-cell {
            border-right: 1px solid #e0e0e0;
            padding: 4px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .week-cell:hover {
            background-color: rgba(0, 123, 255, 0.05);
          }
          
          .week-cell.today {
            background-color: rgba(0, 123, 255, 0.05);
          }
          
          .week-post {
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            color: white;
            margin-bottom: 2px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          
          .week-post:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          /* Day View */
          .day-view {
            display: flex;
            flex-direction: column;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .day-header {
            padding: 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            text-align: center;
          }
          
          .day-body {
            display: flex;
            flex-direction: column;
          }
          
          .day-row {
            display: grid;
            grid-template-columns: 60px 1fr;
            min-height: 60px;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .day-hour {
            padding: 8px;
            text-align: right;
            color: #6c757d;
            font-size: 0.8rem;
            border-right: 1px solid #e0e0e0;
            background-color: #f8f9fa;
          }
          
          .day-cell {
            padding: 4px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .day-cell:hover {
            background-color: rgba(0, 123, 255, 0.05);
          }
          
          .day-post {
            padding: 8px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            color: white;
            margin-bottom: 4px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          
          .day-post:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .day-post-platforms {
            display: flex;
            gap: 4px;
            margin-bottom: 4px;
          }
          
          .day-post-platform {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          
          /* Drag and Drop */
          .dragging {
            opacity: 0.5;
          }
          
          .drag-over {
            background-color: rgba(0, 123, 255, 0.1);
            box-shadow: inset 0 0 0 2px #007bff;
          }
          
          .post-drag-preview {
            position: absolute;
            z-index: 9999;
            pointer-events: none;
            opacity: 0.8;
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}

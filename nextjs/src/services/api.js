import axios from "axios"

const API_URL = "http://localhost:8000/api"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
})

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Dashboard API
export const fetchDashboardStats = () => api.get("/dashboard/stats")
export const fetchConnectedPlatforms = () => api.get("/platforms")
export const fetchUpcomingPosts = () => api.get("/posts/upcoming")

// Posts API
export const fetchScheduledPosts = (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== "all") {
    params.append("status", filters.status)
  }

  if (filters.platform && filters.platform !== "all") {
    params.append("platform", filters.platform)
  }

  const queryString = params.toString() ? `?${params.toString()}` : ""
  return api.get(`/posts/scheduled${queryString}`)
}

export const createPost = (postData) => {
  return api.post("/posts", postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const updatePost = (postId, postData) => {
  return api.put(`/posts/${postId}`, postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deletePost = (postId) => api.delete(`/posts/${postId}`)

// User API
export const fetchUserProfile = () => api.get("/users/me")
export const updateUserProfile = (userData) => api.put("/users/me", userData)

// Platform connection API
export const connectPlatform = (platform, authData) => api.post(`/platforms/connect/${platform}`, authData)
export const disconnectPlatform = (platformId) => api.delete(`/platforms/${platformId}`)

export default api

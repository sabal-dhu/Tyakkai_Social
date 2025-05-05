"use client"

// contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      // Simulate fetching user data from token
      // Replace with actual API call if needed
      setCurrentUser({ email: "user@example.com" }) // Example user
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate login process
    // Replace with actual API call
    localStorage.setItem("access_token", "dummy_token")
    setCurrentUser({ email: email })
  }

  const logout = async () => {
    // Simulate logout process
    // Replace with actual API call
    localStorage.removeItem("access_token")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    setSuccessMessage("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const userData = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
      }

      // Replace with your actual API endpoint
      const response = await axios.post("http://localhost:8000/api/register", userData)

      setSuccessMessage("Registration successful! Redirecting to login...")

      // Clear form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        agreeTerms: false,
      })

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Registration error:", err)
      if (err.response && err.response.data && err.response.data.detail) {
        setServerError(err.response.data.detail)
      } else {
        setServerError("Registration failed. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation">
      {serverError && (
        <div className="alert alert-danger" role="alert">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="fullName" className="form-label">
          Full Name
        </label>
        <input
          type="text"
          className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          required
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="companyName" className="form-label">
          Company Name
        </label>
        <input
          type="text"
          className={`form-control ${errors.companyName ? "is-invalid" : ""}`}
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Your Company"
          required
        />
        {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        <div className="form-text">Password must be at least 8 characters long</div>
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
      </div>

      <button type="submit" className="btn btn-primary w-100 py-2 mt-3" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  )
}

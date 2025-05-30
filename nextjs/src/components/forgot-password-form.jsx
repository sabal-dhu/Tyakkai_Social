"use client"

import { useState } from "react"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // In a real implementation, you would call your API endpoint
      // const response = await axios.post("/api/forgot-password", { email })

      // Simulating API call for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success message
      setMessage({
        type: "success",
        text: "Password reset link has been sent to your email address.",
      })

      // Clear the form
      setEmail("")
    } catch (err) {
      console.error("Forgot password error:", err)
      setMessage({
        type: "danger",
        text: "There was an error processing your request. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({
        type: "danger",
        text: "Passwords do not match.",
      })
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setMessage({
        type: "danger",
        text: "Password must be at least 8 characters long.",
      })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // In a real implementation, you would call your API endpoint
      // const response = await axios.post("/api/reset-password", {
      //   token,
      //   password
      // })

      // Simulating API call for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success message
      setMessage({
        type: "success",
        text: "Your password has been reset successfully.",
      })

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Reset password error:", err)
      setMessage({
        type: "danger",
        text: "There was an error resetting your password. The link may have expired.",
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
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <div className="form-text">Password must be at least 8 characters long.</div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </>
  )
}

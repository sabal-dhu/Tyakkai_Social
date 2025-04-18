// Format date to display in a readable format
export function formatDate(dateString) {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

// Format time from datetime string
export function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Check if a date is today
export function isToday(date) {
  if (!date) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Check if two dates are the same day
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

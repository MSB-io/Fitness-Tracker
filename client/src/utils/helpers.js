// Format date to readable string
export const formatDate = (date, options = {}) => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  })
}

// Format time
export const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Calculate BMI
export const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null
  const heightM = heightCm / 100
  const bmi = weight / (heightM * heightM)
  return bmi.toFixed(1)
}

// Get BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return ""
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal"
  if (bmi < 30) return "Overweight"
  return "Obese"
}

// Calculate daily calorie needs (Mifflin-St Jeor Equation)
export const calculateDailyCalories = (weight, height, age, gender, activityLevel) => {
  if (!weight || !height || !age || !gender) return null

  // BMR calculation
  let bmr
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }

  // Activity multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0"
  return num.toLocaleString()
}

// Calculate percentage
export const calculatePercentage = (current, target) => {
  if (!target) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return formatDate(date)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

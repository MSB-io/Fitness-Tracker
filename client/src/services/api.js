import axios from "axios" // HTTP client

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
// runs before each request is sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fittrack_token") // Get token from localStorage
    if (token) // If token exists, add it to Authorization header
      {
      config.headers.Authorization = `Bearer ${token}` // Bearer token format
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
// runs after each response is received
api.interceptors.response.use(
  (response) => response, // Just return response if successful
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fittrack_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios"
import { getAccessToken, logout } from "@/utils/auth"
import { handleApiError } from "@/utils/api-errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
const REQUEST_TIMEOUT = 10000 // 10 seconds

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
})

// Request Interceptor: Automatically attach the JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Centralized error handling and token expiration management
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Wrap the raw backend response in a `data` object to match ApiResponse interface
    return { data: response.data } as any
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("=== AXIOS ERROR TRACE ===")
      console.error("Code:", error.code)
      console.error("Message:", error.message)
      console.error("Name:", error.name)
      console.error("Stack:", error.stack)
      if (error.response) {
        console.error("Response Status:", error.response.status)
        console.error("Response Headers:", error.response.headers)
        console.error("Response Data:", error.response.data)
      } else if (error.request) {
        console.error("No Response Received. Request Object Exists.")
      }
      console.error("=========================")
    } else {
      console.error("Non-Axios Error:", error)
    }

    // If the server returns 401 Unauthorized, automatically log out
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logout("/login?expired=true")
    }
    
    // Transform and throw a standardized ApiError
    return handleApiError(error)
  }
)

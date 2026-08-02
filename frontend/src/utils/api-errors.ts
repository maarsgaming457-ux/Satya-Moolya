import { AxiosError } from "axios"

export interface ApiErrorResponse {
  message: string
  code?: string
  details?: unknown
}

export class ApiError extends Error {
  public statusCode: number
  public code?: string
  public details?: unknown

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Centralized error handler that transforms Axios errors into standardized ApiError objects.
 */
export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status || 500
    const data = error.response?.data as ApiErrorResponse & { detail?: any } | undefined

    let message = data?.message || error.message || "An unexpected network error occurred."
    let details = data?.details

    if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail
      } else if (typeof data.detail === 'object') {
        details = data.detail
      }
    }

    const code = data?.code

    // Special handling for specific status codes can be added here
    switch (statusCode) {
      case 400:
        throw new ApiError(message || "Bad Request", 400, code, details)
      case 401:
        throw new ApiError(message || "Unauthorized", 401, code, details)
      case 403:
        throw new ApiError(message || "Forbidden", 403, code, details)
      case 404:
        throw new ApiError(message || "Not Found", 404, code, details)
      case 409:
        throw new ApiError(message || "Conflict", 409, code, details)
      case 422:
        throw new ApiError(message || "Unprocessable Entity", 422, code, details)
      case 500:
      default:
        throw new ApiError(message || "Internal Server Error", statusCode, code, details)
    }
  }

  // Handle non-Axios errors (e.g., standard JS Errors)
  if (error instanceof Error) {
    throw new ApiError(error.message, 500)
  }

  throw new ApiError("An unknown error occurred.", 500)
}

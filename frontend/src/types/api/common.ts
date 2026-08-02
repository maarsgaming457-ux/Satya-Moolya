export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  message?: string
  data?: T
}

export interface DateAudit {
  createdAt: string
  updatedAt: string
}

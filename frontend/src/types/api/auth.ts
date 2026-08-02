export interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  role: "Buyer" | "Seller" | "Both"
  isEmailVerified: boolean
  isPhoneVerified: boolean
  avatarUrl?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export interface LoginPayload {
  email: string
  password?: string
  provider?: "google" | "apple"
  providerToken?: string
}

export interface RegisterPayload {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: "Buyer" | "Seller" | "Both"
}

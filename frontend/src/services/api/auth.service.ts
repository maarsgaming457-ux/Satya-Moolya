import { apiClient } from "@/lib/api-client"
import { AuthResponse, LoginPayload, RegisterPayload, UserDTO } from "@/types/api/auth"
import { ApiResponse } from "@/types/api/common"

export const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    console.log("REQUEST URL:", "/auth/login")
    console.log("REQUEST BODY:", payload)
    
    try {
      const res: any = await apiClient.post("/auth/login", payload)
      console.log("FULL AXIOS RESPONSE:", res)
      console.log("STATUS:", res.status)
      console.log("DATA:", res.data)
      
      return {
        data: {
          accessToken: res.data.access_token,
          refreshToken: "",
          user: {
            id: res.data.user.id,
            email: res.data.user.email,
            firstName: res.data.user.full_name.split(" ")[0] || "",
            lastName: res.data.user.full_name.split(" ").slice(1).join(" ") || "",
            role: res.data.user.role === "buyer" ? "Buyer" : (res.data.user.role === "seller" ? "Seller" : "Both"),
            isEmailVerified: res.data.user.is_verified,
            isPhoneVerified: false,
            createdAt: res.data.user.created_at
          }
        }
      }
    } catch (error: any) {
      console.error(error)
      console.log("error.code =", error.code)
      console.log("error.message =", error.message)
      console.log("error.response =", error.response)
      console.log("error.response.status =", error.response?.status)
      console.log("error.response.data =", error.response?.data)
      console.log("error.request =", error.request)
      console.log(error.stack)
      throw error
    }
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const backendPayload = {
      email: payload.email,
      password: payload.password,
      full_name: `${payload.firstName} ${payload.lastName}`.trim(),
      role: payload.role.toLowerCase()
    }
    const res: any = await apiClient.post("/auth/register", backendPayload)
    return {
      data: {
        accessToken: "",
        refreshToken: "",
        user: {
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.full_name.split(" ")[0] || "",
          lastName: res.data.full_name.split(" ").slice(1).join(" ") || "",
          role: res.data.role === "buyer" ? "Buyer" : (res.data.role === "seller" ? "Seller" : "Both"),
          isEmailVerified: res.data.is_verified,
          isPhoneVerified: false,
          createdAt: res.data.created_at
        }
      }
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<UserDTO>> => {
    const res: any = await apiClient.get("/auth/me")
    return {
      data: {
        id: res.data.id,
        email: res.data.email,
        firstName: res.data.full_name.split(" ")[0] || "",
        lastName: res.data.full_name.split(" ").slice(1).join(" ") || "",
        role: res.data.role === "buyer" ? "Buyer" : (res.data.role === "seller" ? "Seller" : "Both"),
        isEmailVerified: res.data.is_verified,
        isPhoneVerified: false,
        createdAt: res.data.created_at
      }
    }
  },

  logout: async (): Promise<ApiResponse<{message: string}>> => {
    const res: any = await apiClient.post("/auth/logout")
    return { data: { message: res.data.message } }
  }
}

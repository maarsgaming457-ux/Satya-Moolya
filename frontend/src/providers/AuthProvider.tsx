"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/services/api/auth.service"
import { getAccessToken, removeAccessToken, saveAccessToken } from "@/utils/auth"
import { UserDTO } from "@/types/api/auth"

interface AuthContextType {
  user: UserDTO | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/buyer/dashboard", "/seller/dashboard"]
// Routes that are strictly for guests
const guestRoutes = ["/login", "/register", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken()
      if (token) {
        try {
          const response = await authService.getCurrentUser()
          if (response.data) {
            setUser(response.data)
          } else {
            removeAccessToken()
          }
        } catch (error) {
          removeAccessToken()
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isAuthenticated = !!user
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    const isGuestRoute = guestRoutes.some(route => pathname === route || pathname?.startsWith(`${route}/`))

    if (isProtectedRoute && !isAuthenticated) {
      router.replace("/login")
    } else if (isGuestRoute && isAuthenticated) {
      router.replace("/buyer/dashboard")
    }
  }, [user, isLoading, pathname, router])

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout API failed", error)
    } finally {
      removeAccessToken()
      setUser(null)
      router.push("/login")
    }
  }

  const login = async (token: string) => {
    saveAccessToken(token)
    try {
      const response = await authService.getCurrentUser()
      if (response.data) {
        setUser(response.data)
        router.push("/buyer/dashboard")
      } else {
        removeAccessToken()
      }
    } catch (error) {
      removeAccessToken()
      throw error
    }
  }

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

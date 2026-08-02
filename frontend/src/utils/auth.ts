const TOKEN_KEY = "sm_access_token"

/**
 * Saves the JWT access token to local storage.
 */
export const saveAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Retrieves the JWT access token from local storage.
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Removes the JWT access token from local storage.
 */
export const removeAccessToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Checks if the user is currently authenticated based on token presence.
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

/**
 * Logs the user out by clearing the token and optionally redirecting.
 */
export const logout = (redirectTo: string = "/login"): void => {
  removeAccessToken()
  if (typeof window !== "undefined") {
    window.location.href = redirectTo
  }
}

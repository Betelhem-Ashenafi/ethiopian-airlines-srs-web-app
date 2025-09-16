"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/data"
import { ReactNode } from "react"
import { logout as serverLogout } from "@/lib/auth"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (userData: Omit<User, "password">) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: {children :ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Fetch user profile from backend to restore session
    async function restoreUser() {
      setIsLoading(true)
      try {
        const { fetchUserProfile } = await import("@/lib/auth")
        const profile = await fetchUserProfile()
        if (profile) {
          setUser(profile)
        } else {
          setUser(null)
        }
      } catch (e) {
        setUser(null)
      }
      setIsLoading(false)
    }
    restoreUser()
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      // Allow unauthenticated access to /login, /, and /forgot-password
      if (!user && pathname !== "/login" && pathname !== "/" && pathname !== "/forgot-password") {
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/" || pathname === "/forgot-password")) {
        // If logged in, redirect from login/cover/forgot-password
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const handleLogin = (userData: Omit<User, "password">) => {
    setUser(userData)
    localStorage.setItem("currentUser", JSON.stringify(userData))
    // Set session expiry to 2 minutes from now
    const expiry = Date.now() + 2 * 60 * 1000
    localStorage.setItem("sessionExpiry", expiry.toString())
    router.push("/dashboard")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await serverLogout() // Call simulated server logout
    setUser(null)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("sessionExpiry")
    setIsLoading(false)
    router.push("/login")
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, isAuthenticated, isLoading }}>
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

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
    // Check for a persistent session and session expiry
    const storedUser = localStorage.getItem("currentUser")
    const expiry = localStorage.getItem("sessionExpiry")
    const now = Date.now()
    if (storedUser && expiry) {
      if (now < Number(expiry)) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Failed to parse stored user:", e)
          localStorage.removeItem("currentUser")
          localStorage.removeItem("sessionExpiry")
        }
      } else {
        // Session expired
        localStorage.removeItem("currentUser")
        localStorage.removeItem("sessionExpiry")
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      if (!user && pathname !== "/login" && pathname !== "/") {
        // Allow access to "/" (cover page)
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/")) {
        // If logged in, redirect from login/cover
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

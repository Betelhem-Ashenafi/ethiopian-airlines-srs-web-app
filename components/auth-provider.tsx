"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/data"
import { logout as serverLogout } from "@/lib/auth"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (userData: Omit<User, "password">) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(() => {
    try {
      if (typeof window === "undefined") return null
      const raw = localStorage.getItem("currentUser")
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  function normalizeRole(r: any): "System Admin" | "Department Admin" | "Employee" {
    try {
      const s = String(r || "")
      const lower = s.toLowerCase()
      if (lower === "sysadmin" || lower === "sys_admin" || lower === "sys-admin") return "System Admin"
      if (lower === "deptadmin" || lower === "dept_admin" || lower === "dept-admin" || lower === "departmentadmin")
        return "Department Admin"
      if (lower === "employee") return "Employee"
      if (lower.includes("sys")) return "System Admin"
      if (lower.includes("dept")) return "Department Admin"
      if (lower.includes("employee")) return "Employee"
      if (s.trim()) return (s.charAt(0).toUpperCase() + s.slice(1)) as any
    } catch {}
    return "Employee"
  }

  useEffect(() => {
    async function restoreUser() {
      setIsLoading(true)
      try {
        const { fetchUserProfile } = await import("@/lib/auth")
        const profile = await fetchUserProfile()

        let cached: any = null
        try {
          const raw = localStorage.getItem("currentUser")
          if (raw) cached = JSON.parse(raw)
        } catch {}

        if (profile) {
          const normalized = {
            ...cached,
            ...profile,
            role: normalizeRole(profile.role || cached?.role),
            email: profile.email || cached?.email || "",
            department: profile.department || cached?.department || "",
            departmentId: profile.departmentId || cached?.departmentId || "",
            fullName: profile.fullName || cached?.fullName || "",
            employeeID:
              profile.employeeID ||
              cached?.employeeID ||
              cached?.EmployeeID ||
              profile.id ||
              cached?.id ||
              "",
          }

          setUser(normalized)
          localStorage.setItem("currentUser", JSON.stringify(normalized))
        } else {
          setUser(cached)
        }
      } catch (error: any) {
        if (error.message.includes("Unauthorized")) {
          console.log("Session expired or invalid. Logging out.")
          setUser(null)
          localStorage.removeItem("currentUser")
          localStorage.removeItem("sessionExpiry")
        } else {
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }
    restoreUser()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage =
        pathname === "/login" ||
        pathname === "/forgot-password" ||
        pathname === "/resend-code-reset-password" ||
        pathname?.startsWith("/reset-password")
      const isPublicLanding = pathname === "/"

      if (!user && !isPublicLanding && !isAuthPage) {
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router])

  const handleLogin = (userData: Omit<User, "password">) => {
    const normalized = {
      ...userData,
      role: normalizeRole((userData as any).role),
      email: (userData as any).email || "",
      department: (userData as any).department || "",
      departmentId: (userData as any).departmentId || "",
      fullName: (userData as any).fullName || (userData as any).name || "",
      employeeID:
        (userData as any).employeeID ||
        (userData as any).EmployeeID ||
        (userData as any).id ||
        "",
    }

    setUser(normalized)
    localStorage.setItem("currentUser", JSON.stringify(normalized))

    const expiry = Date.now() + 20 * 60 * 1000
    localStorage.setItem("sessionExpiry", expiry.toString())

    router.push("/dashboard")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await serverLogout()
    } catch (error) {
      console.error("Server logout failed, clearing client session anyway.", error)
    } finally {
      setUser(null)
      localStorage.removeItem("currentUser")
      localStorage.removeItem("sessionExpiry")
      setIsLoading(false)
      router.push("/login")
    }
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

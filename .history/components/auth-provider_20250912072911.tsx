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

        // load cached user
        let cached: any = null
        try {
          const raw = localStorage.getItem("currentUser")
          if (raw) cached = JSON.parse(raw)
        } catch {}

        if (profile) {
          const merged = {
            ...cached,
            ...profile,
          }

          // normalize role (prefer backend role, fallback to cached)
          merged.role = normalizeRole(profile.role || cached?.role)

          // ✅ ensure email (prefer cached over backend!)
          merged.email = cached?.email || profile.email || ""

          // normalize fullName + employeeID
          const normalized = {
            ...merged,
            fullName: merged.fullName || merged.name || "",
            employeeID: merged.employeeID || merged.EmployeeID || merged.id || "",
            // Normalize department from common backend keys so Dept Admin filtering works
            department:
              merged.department ||
              merged.departmentName ||
              merged.Department ||
              merged.dept ||
              merged.departmentId ||
              undefined,
          }

          setUser(normalized)
          localStorage.setItem("currentUser", JSON.stringify(normalized))
        } else {
          setUser(cached)
        }
      } catch {
        setUser(null)
        localStorage.removeItem("currentUser")
      }
      setIsLoading(false)
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
      // ✅ logged-in users stay on the same page when refreshing
    }
  }, [user, isLoading, pathname, router])

  const handleLogin = (userData: Omit<User, "password">) => {
    ;(userData as any).role = normalizeRole((userData as any).role)

    // ✅ keep email from login
    userData = {
      ...userData,
      email: (userData as any).email || "",
    }

  // Normalize department field from common shapes
  ;(userData as any).department = (userData as any).department || (userData as any).departmentName || (userData as any).Department || (userData as any).dept || (userData as any).departmentId || undefined

    setUser(userData)
    localStorage.setItem("currentUser", JSON.stringify(userData))

    // optional: session expiry
    const expiry = Date.now() + 20 * 60 * 1000
    localStorage.setItem("sessionExpiry", expiry.toString())

    router.push("/dashboard")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await serverLogout()
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

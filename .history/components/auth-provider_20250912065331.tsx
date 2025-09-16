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
  const [user, setUser] = useState<Omit<User, "password"> | null>(() => {
    // Read cached user synchronously so a refresh doesn't flash an unauthenticated state
    try {
      if (typeof window === 'undefined') return null
      const raw = localStorage.getItem('currentUser')
  if (!raw) return null
  try { console.debug('[auth] init cached currentUser:', raw) } catch (e) {}
  return JSON.parse(raw)
    } catch (e) {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Small helper to normalize backend role codes to display labels
  function normalizeRole(r: any): "System Admin" | "Department Admin" | "Employee" {
    try {
  const s = String(r || '')
  const lower = s.toLowerCase()
  // explicit known codes
  if (lower === 'sysadmin' || lower === 'sys_admin' || lower === 'sys-admin') return 'System Admin'
  if (lower === 'deptadmin' || lower === 'dept_admin' || lower === 'dept-admin' || lower === 'departmentadmin') return 'Department Admin'
  if (lower === 'employee') return 'Employee'
  // fallbacks for partial matches
  if (lower.includes('sys')) return 'System Admin'
  if (lower.includes('dept')) return 'Department Admin'
  if (lower.includes('employee')) return 'Employee'
  // Preserve unknown role text as a readable label
  if (s.trim()) return (s.charAt(0).toUpperCase() + s.slice(1)) as any
    } catch (e) {
      // ignore
    }
    return 'Employee'
  }

  useEffect(() => {
    // Always fetch user profile from backend to store current user data
    async function restoreUser() {
      setIsLoading(true)
      // Debug: log cached user at restore start
      try {
        if (typeof window !== 'undefined') {
          const c = localStorage.getItem('currentUser')
          console.debug('[auth] restore - cached currentUser:', c)
        }
      } catch (e) {}
      try {
        const { fetchUserProfile } = await import("@/lib/auth")
        const profile = await fetchUserProfile()
        console.debug('[auth] fetched profile from /api/auth/my-profile:', profile)
        if (profile) {
          // normalize and persist
          try {
            const beforeRole = (profile as any).role
            ;(profile as any).role = normalizeRole((profile as any).role)
            console.debug('[auth] role before/after normalize:', beforeRole, '=>', (profile as any).role)
            const normalized = {
              ...(profile as any),
              fullName: (profile as any).fullName || (profile as any).name || '',
              employeeID: (profile as any).employeeID || (profile as any).EmployeeID || (profile as any).id || '',
            }
            setUser(normalized)
            localStorage.setItem("currentUser", JSON.stringify(normalized))
          } catch (e) {
            setUser(profile)
            try { localStorage.setItem("currentUser", JSON.stringify(profile)) } catch (e) {}
          }
        } else {
          // Backend returned null — preserve any cached profile so UI doesn't lose state on refresh
          try {
            const cached = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
            console.debug('[auth] fetched profile is null, cached:', cached)
            if (cached) {
              try { setUser(JSON.parse(cached)) } catch (e) { setUser(null) }
            } else {
              setUser(null)
              try { localStorage.removeItem('currentUser') } catch (e) {}
            }
          } catch (e) {
            setUser(null)
          }
        }
      } catch (e) {
        setUser(null)
        localStorage.removeItem("currentUser")
      }
      setIsLoading(false)
    }
    restoreUser()
  }, [])

  // Read any 'fromLaunch' session flag which indicates the tab was opened via the Launch Portal
  // We store this so that a refresh on /login in that tab doesn't immediately redirect to dashboard.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const v = sessionStorage.getItem('fromLaunch')
        if (v === '1') {
          // Keep the flag set until it's consumed in the redirect logic below.
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      // Distinguish between the public landing page ("/") and auth pages.
      // We want unauthenticated users to be able to view the landing page,
      // but authenticated users should be redirected away FROM auth pages (like /login).
      const isAuthPage = pathname === "/login" || pathname === "/forgot-password" || pathname === "/resend-code-reset-password" || pathname?.startsWith('/reset-password')
      const isPublicLanding = pathname === "/"

      // If a user is not logged in and they're trying to access a non-public page, send them to /login
      if (!user && !isPublicLanding && !isAuthPage) {
        router.push("/login")
      } else if (user && isAuthPage) {
        // If logged in and on an auth page, normally redirect to dashboard.
        // Exception: if the page is /login and the query param from=launch is present,
        // allow showing the login page (user intentionally clicked Launch Portal).
        try {
          // Check a sessionStorage flag set by the Launch button. If present, consume it
          // and do not redirect away from /login for this tab (including refresh).
          let isLaunch = false
          try {
            const v = typeof window !== 'undefined' ? sessionStorage.getItem('fromLaunch') : null
            if (v === '1' && pathname === '/login') {
              isLaunch = true
              // Consume the flag so it doesn't affect other tabs or future navigations
              try { sessionStorage.removeItem('fromLaunch') } catch (e) {}
            }
          } catch (e) {
            // ignore
          }

          // Detect a browser refresh/navigation type; on reload we avoid forcing a redirect
          let isReload = false
          if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
            try {
              const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation')
              const navType = navEntries && navEntries[0] && (navEntries[0] as any).type
              isReload = navType === 'reload'
            } catch (e) {
              // old browsers fallback
              // @ts-ignore
              isReload = (performance as any)?.navigation?.type === 1
            }
          }

          if (!isLaunch && !isReload) {
            router.push('/dashboard')
          }
          // If isLaunch OR isReload, we intentionally do not redirect so the auth page stays visible.
        } catch (e) {
          // Fallback to default behavior
          router.push('/dashboard')
        }
      }
    }
  }, [user, isLoading, pathname, router])

  const handleLogin = (userData: Omit<User, "password">) => {
    try { console.debug('[auth] login userData before normalize:', userData) } catch (e) {}
    try {
      ;(userData as any).role = normalizeRole((userData as any).role)
      try { console.debug('[auth] login userData after normalize:', userData) } catch (e) {}
    } catch (e) {}
    setUser(userData)
    localStorage.setItem("currentUser", JSON.stringify(userData))
    // Set session expiry to 20 minutes from now
    const expiry = Date.now() + 20 * 60 * 1000
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

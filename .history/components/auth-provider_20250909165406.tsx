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
    // Always fetch user profile from backend to store current user data
    async function restoreUser() {
      setIsLoading(true)
      try {
        const { fetchUserProfile } = await import("@/lib/auth")
        const profile = await fetchUserProfile()
        if (profile) {
          setUser(profile)
          localStorage.setItem("currentUser", JSON.stringify(profile))
        } else {
          setUser(null)
          localStorage.removeItem("currentUser")
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
          const search = typeof window !== 'undefined' ? window.location.search : ''
          const params = new URLSearchParams(search)
          const from = params.get('from')
          const isLaunch = from === 'launch' && pathname === '/login'

          // Detect a browser refresh/navigation type; on reload we avoid forcing a redirect
          // so that users who refresh the login page don't get immediately sent to /dashboard.
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

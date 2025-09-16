"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { navItems } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider" // Use the auth hook

export default function SidebarNav() {
  const searchParams = useSearchParams()
    const currentTab = searchParams?.get("tab") || "dashboard"
  const { user } = useAuth() // Get the current user from auth context

  if (!user) return null // Don't render nav if no user (should be redirected by AuthProvider)

  // Normalize role for flexible matching
  const normalizedRole = (user.role || "").toLowerCase().replace(" ", "");
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    // Support both 'System Admin'/'sysAdmin' and 'Department Admin'/'deptAdmin'
    return item.roles.some(
      (role) => {
        const r = role.toLowerCase().replace(" ", "");
        return r === normalizedRole ||
          (r === "systemadmin" && normalizedRole === "sysadmin") ||
          (r === "departmentadmin" && normalizedRole === "deptadmin");
      }
    );
  });

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {filteredNavItems.map(
        (
          item, // Use filteredNavItems
        ) => (
          <Link
            key={item.href}
            // Explicitly set tab=dashboard for the dashboard link for consistent URL handling
            href={item.href === "/dashboard" ? "/dashboard?tab=dashboard" : item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              currentTab === item.href.split("tab=")[1] || (item.href === "/dashboard" && currentTab === "dashboard")
                ? "bg-et-gold text-et-green hover:text-et-green" // Active link: gold background, green text
                : "text-gray-200 hover:text-et-gold", // Default link: light gray text, gold on hover
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ),
      )}
    </nav>
  )
}

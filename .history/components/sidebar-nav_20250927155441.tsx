"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { navItems } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

export default function SidebarNav() {
  const searchParams = useSearchParams()
  const currentTab = searchParams?.get("tab") || "dashboard"
  const { user } = useAuth()

  if (!user) return null

  const normalizedRole = (user.role || "").toLowerCase().replace(" ", "")
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((role) => {
      const r = role.toLowerCase().replace(" ", "")
      return (
        r === normalizedRole ||
        (r === "systemadmin" && normalizedRole === "sysadmin") ||
        (r === "departmentadmin" && normalizedRole === "deptadmin")
      )
    })
  })

  return (
    <aside
      className="
        w-64 shrink-0 border-r border-et-gold
        bg-et-green text-white
        md:sticky md:top-0 md:h-[100dvh]  /* full height sidebar column */
        min-h-screen flex flex-col        /* stretch to page height; nav scrolls */
        dark:bg-neutral-900 dark:text-neutral-100 dark:border-et-gold
      "
    >
      {/* Brand bar */}
      <div className="flex h-14 items-center border-b border-et-gold px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg text-et-gold">Ethiopian Airlines</span>
        </Link>
      </div>
      {/* Scrollable nav area; green background continues to page end */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
           {filteredNavItems.map((item) => {
             const isActive =
               currentTab === item.href.split('tab=')[1] ||
               (item.href === '/dashboard' && currentTab === 'dashboard')
             return (
               <Link
                 key={item.href}
                 href={item.href === "/dashboard" ? "/dashboard?tab=dashboard" : item.href}
                 className={cn(
                   "group flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                   // light mode on green
                   "text-white/95 hover:text-yellow-100 hover:bg-white/10",
                   isActive ? "bg-white/10 text-yellow-100 border border-et-gold" : "border border-transparent",
                   // dark overrides
                   "dark:text-neutral-100 dark:hover:bg-neutral-700/60",
                   isActive && "dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40"
                 )}
               >
                 <item.icon
                   className={cn(
                     "h-4 w-4",
                     isActive
                       ? "text-et-gold dark:text-yellow-300"
                       : "text-white/80 group-hover:text-et-gold dark:text-neutral-300 dark:group-hover:text-yellow-300"
                   )}
                 />
                 {item.title}
               </Link>
             )
           })}
         </nav>
       </div>
     </aside>
  )
}

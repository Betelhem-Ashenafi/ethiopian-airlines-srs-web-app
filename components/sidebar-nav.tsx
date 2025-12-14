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
        w-64 shrink-0 border-r border-et-gold/30
        bg-gradient-to-b from-et-green via-et-green to-et-green-dark text-white
        md:sticky md:top-0 md:h-[100dvh]
        min-h-screen flex flex-col shadow-xl
        dark:bg-gradient-to-b dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 dark:text-neutral-100 dark:border-et-gold/40
      "
    >
      {/* Brand bar */}
      <div className="flex h-16 items-center border-b border-et-gold/30 px-4 lg:h-[70px] lg:px-6 bg-et-green-dark/30 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold group">
          <span className="text-xl bg-gradient-to-r from-et-gold to-et-gold-light bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            Ethiopian Airlines
          </span>
        </Link>
      </div>
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <nav className="grid items-start gap-2 text-sm font-medium">
           {filteredNavItems.map((item) => {
             const isActive =
               currentTab === item.href.split('tab=')[1] ||
               (item.href === '/dashboard' && currentTab === 'dashboard')
             return (
               <Link
                 key={item.href}
                 href={item.href === "/dashboard" ? "/dashboard?tab=dashboard" : item.href}
                 className={cn(
                   "group flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 relative",
                   // light mode
                   "text-white/90 hover:text-white hover:bg-white/15",
                   isActive 
                     ? "bg-gradient-to-r from-et-gold/20 to-et-gold/10 text-et-gold border-l-4 border-et-gold shadow-lg backdrop-blur-sm" 
                     : "border-l-4 border-transparent hover:border-et-gold/50 hover:shadow-md",
                   // dark overrides
                   "dark:text-neutral-200 dark:hover:bg-neutral-800/60",
                   isActive && "dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-400"
                 )}
               >
                 <item.icon
                   className={cn(
                     "h-5 w-5 transition-transform duration-300",
                     isActive
                       ? "text-et-gold dark:text-yellow-300 scale-110"
                       : "text-white/70 group-hover:text-et-gold group-hover:scale-110 dark:text-neutral-400 dark:group-hover:text-yellow-300"
                   )}
                 />
                 <span className={cn(
                   "font-medium",
                   isActive && "font-semibold"
                 )}>
                   {item.title}
                 </span>
                 {isActive && (
                   <div className="absolute right-2 w-2 h-2 bg-et-gold rounded-full animate-pulse"></div>
                 )}
               </Link>
             )
           })}
         </nav>
       </div>
     </aside>
  )
}

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
        w-64 shrink-0 border-r-2 border-[#FFC107]/40
        bg-gradient-to-b from-[#517842] via-[#517842] to-[#3d5a32] text-white
        md:sticky md:top-0 md:h-[100dvh]
        min-h-screen flex flex-col shadow-xl
        dark:bg-gradient-to-b dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 dark:text-neutral-100 dark:border-[#FFC107]/50
      "
    >
      {/* Brand bar - elegant and visible */}
      <div className="flex h-16 items-center border-b-2 border-[#FFC107]/40 px-4 lg:h-[70px] lg:px-6 bg-[#3d5a32]/50 backdrop-blur-md shadow-inner">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold group w-full">
          <div className="w-1 h-8 bg-[#FFC107] rounded-full shadow-lg"></div>
          <span className="text-lg md:text-xl text-[#FFC107] drop-shadow-lg group-hover:scale-105 transition-transform duration-300 font-semibold">
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
                   // light mode - ensure text is always visible
                   "text-white hover:text-[#FFC107] hover:bg-white/20",
                   isActive 
                     ? "bg-gradient-to-r from-[#FFC107]/30 to-[#FFC107]/15 text-[#FFC107] border-l-4 border-[#FFC107] shadow-lg backdrop-blur-sm font-semibold" 
                     : "border-l-4 border-transparent hover:border-[#FFC107]/60 hover:shadow-md",
                   // dark overrides
                   "dark:text-neutral-100 dark:hover:bg-neutral-800/60 dark:hover:text-yellow-300",
                   isActive && "dark:bg-yellow-500/25 dark:text-yellow-300 dark:border-yellow-400"
                 )}
               >
                 <item.icon
                   className={cn(
                     "h-5 w-5 transition-transform duration-300",
                     isActive
                       ? "text-[#FFC107] dark:text-yellow-300 scale-110"
                       : "text-white group-hover:text-[#FFC107] group-hover:scale-110 dark:text-neutral-200 dark:group-hover:text-yellow-300"
                   )}
                 />
                 <span className={cn(
                   "font-medium",
                   isActive && "font-semibold"
                 )}>
                   {item.title}
                 </span>
                 {isActive && (
                   <div className="absolute right-2 w-2 h-2 bg-[#FFC107] rounded-full animate-pulse shadow-lg"></div>
                 )}
               </Link>
             )
           })}
         </nav>
       </div>
     </aside>
  )
}

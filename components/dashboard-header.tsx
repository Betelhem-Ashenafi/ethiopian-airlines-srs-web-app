"use client"
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Moon, Sun } from "lucide-react" // Import Moon and Sun icons
import { useTheme } from "next-themes" // Import useTheme hook
import { Bell } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme() // Use the theme hook

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b-2 border-[#FFC107]/40 bg-gradient-to-r from-[#517842] via-[#517842] to-[#3d5a32] px-4 backdrop-blur-md shadow-xl lg:h-[70px] lg:px-8 dark:bg-gradient-to-r dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 dark:border-[#FFC107]/50">
      <div className="flex-1 flex items-center gap-3">
        <div className="w-1 h-8 bg-[#FFC107] rounded-full shadow-lg"></div>
        <h1 className="text-xl font-bold md:text-2xl text-[#FFC107] drop-shadow-lg">
          Defect Management Portal
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-[#FFC107]/90 hover:bg-[#FFC107] text-[#517842] h-10 w-10 transition-all duration-300 hover:scale-110 shadow-md"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full bg-[#FFC107]/90 hover:bg-[#FFC107] text-[#517842] h-10 w-10 p-0 transition-all duration-300 hover:scale-110 shadow-md"
            >
              <Avatar className="h-10 w-10 border-2 border-[#FFD54F]">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback className="bg-[#517842] text-[#FFC107] font-semibold">
                  {user && user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-[#FFC107]/20 shadow-xl">
            <DropdownMenuLabel className="font-semibold">
              {user.fullName}
              <br />
              <span className="font-normal text-muted-foreground text-sm">{user.role}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-[#FFC107]/10 focus:bg-[#FFC107]/10">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

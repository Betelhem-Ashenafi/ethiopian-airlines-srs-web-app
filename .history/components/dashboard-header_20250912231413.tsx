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
    <header className="flex h-14 items-center gap-4 border-b border-et-gold/50 bg-et-green px-4 lg:h-[60px] lg:px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl text-et-gold">Defect Management Portal</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="rounded-full bg-et-gold text-et-green hover:bg-yellow-400" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-semibold mb-2">Notifications</h3>
            <ul className="space-y-2">
              {/* Example notifications with links */}
              <li>
                <a href="/dashboard?tab=reports&id=ET-2025-08-12-TEST1" className="text-et-green hover:underline font-medium">
                  New report submitted: Test Report Today
                </a>
                <div className="text-xs text-muted-foreground">Click to view details</div>
              </li>
              <li>
                <a href="/dashboard?tab=reports&id=ET-2025-08-10-TEST2" className="text-et-green hover:underline font-medium">
                  Status updated: Test Report 2 Days Ago
                </a>
                <div className="text-xs text-muted-foreground">Click to view details</div>
              </li>
              {/* Add more notifications as needed */}
            </ul>
          </PopoverContent>
        </Popover>
        {/* Dark Mode Toggle Button */}
        <Button
          className="rounded-full bg-et-gold text-et-green hover:bg-yellow-400"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            npm install --save-dev @testing-library/jest-dom            npm install --save-dev @testing-library/jest-dom            <Button
              className="rounded-full bg-et-gold text-et-green hover:bg-yellow-400"
            >
             <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback>
                  {user && user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user.fullName}
              <br />
              <span className="font-normal text-muted-foreground text-sm">{user.role}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

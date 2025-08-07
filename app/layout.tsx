import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Ensure this import is correct
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ethiopian Airlines Defect Management Portal",
  description: "Employee Defect & Issue Reporting System for Ethiopian Airlines",
  generator: "fiya ",
}

export default function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

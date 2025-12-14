"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import type { User } from "@/lib/data" 

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return; // Prevent double submit
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("password", password);

      const result = await login(formData);// login 

      if (result.success && result.user) {
        authLogin(result.user);//user login
      } else {
        setError(result.error || "An unexpected error occurred.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center gradient-et p-4 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-et-green via-et-green-dark to-et-green"></div>
      
      {/* Modern pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M50 50c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm10 0c0-8.284-6.716-15-15-15s-15 6.716-15 15 6.716 15 15 15 15-6.716 15-15zM16 16v4h-4v-4h4zm48 0v4h-4v-4h4zM16 64v4h-4v-4h4zm48 0v4h-4v-4h4zM28 28v4h-4v-4h4zm24 0v4h-4v-4h4zM28 52v4h-4v-4h4zm24 0v4h-4v-4h4zM40 20c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 48c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-20-28c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm40 0c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
      ></div>

      {/* Floating orbs for depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-et-gold rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-et-gold-light rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl text-gray-800 shadow-2xl border-0 animate-scale-in">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-8">
          <div className="p-3 bg-et-green/10 rounded-full">
            <Image
              src="/ethiopian-airlines-logo.png"
              alt="Ethiopian Airlines Logo"
              width={100}
              height={100}
              className="drop-shadow-lg"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-et-green mb-2">Sign In</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Access the Ethiopian Airlines Defect Management Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="employeeId" className="text-sm font-semibold text-gray-700">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="EMP-001"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-et-green focus:ring-2 focus:ring-et-green/20 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 border-2 border-gray-200 focus:border-et-green focus:ring-2 focus:ring-et-green/20 transition-all"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-et-gold hover:bg-et-gold-light text-et-green font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="text-center text-sm mt-6 space-y-2">
            <Link href="/forgot-password" className="block text-et-green hover:text-et-green-dark font-medium transition-colors">
              Forgot your password?
            </Link>
            <Link href="/resend-code-reset-password" className="block text-et-green hover:text-et-green-dark font-medium transition-colors">
              Reset with code
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import type React from "react"

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
    <div className="flex min-h-screen items-center justify-center bg-et-green p-4">
      
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM2 6v4H0V6h4V4H0V0h6v6H2zm34 0v4h-2V6h4V4h-4V0h6v6h-2zM2 34v4H0v-4h4v-2H0V30h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 30v4H0v-4h4v-2H0V26h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 60v-4H0v4h4v2H0V56h6v6H2zM2 30v4H0v-4h4v-2H0V26h6v6H2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <Card className="relative z-10 w-full max-w-sm bg-white text-gray-800">
        <CardHeader className="flex flex-col items-center text-center">
          <Image
            src="/ethiopian-airlines-logo.png"
            alt="Ethiopian Airlines Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <CardTitle className="text-2xl text-et-green">Sign In</CardTitle>
          <CardDescription className="text-gray-600">
            Access the Ethiopian Airlines Defect Management Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Role dropdown removed. Only ID and password required. */}
            <div className="grid gap-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="EMP-001"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-et-gold hover:bg-yellow-400 text-et-green" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm">
              
            </div>
          </form>
          <div className="text-center text-sm mt-2">
            <div className="flex flex-col gap-1">
              <Link href="/forgot-password" className="underline text-et-green hover:text-green-700">Forgot your password?</Link>
              <Link href="/resend-code-reset-password" className="underline text-et-green hover:text-green-700">Reset with code</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to send reset link')
      setSuccess(true)
    } catch (err) {
      // show same success UI to avoid leaking whether email exists
      setSuccess(true)
    }
    // Do NOT redirect to login. User stays here and sees success message.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-et-green p-4">
      {/* Subtle background pattern for visual interest, matching the login page */}
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
          <CardTitle className="text-2xl text-et-green">Forgot Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <p className="text-green-600 text-center">Reset link sent! Check your email.</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-et-gold hover:bg-yellow-400 text-et-green">
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>
        <div className="text-center text-sm mt-2">
          <Link href="/login" className="underline text-et-green hover:text-green-700">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}

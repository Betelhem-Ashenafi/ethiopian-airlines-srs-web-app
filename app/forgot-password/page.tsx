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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 overflow-hidden">
      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23517842' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM2 6v4H0V6h4V4H0V0h6v6H2zm34 0v4h-2V6h4V4h-4V0h6v6h-2zM2 34v4H0v-4h4v-2H0V30h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 30v4H0v-4h4v-2H0V26h6v6H2zm34 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 60v-4H0v4h4v2H0V56h6v6H2zM2 30v4H0v-4h4v-2H0V26h6v6H2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Subtle accent gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC107]/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#517842]/5 rounded-full mix-blend-multiply filter blur-3xl"></div>

      <Card className="relative z-10 w-full max-w-md bg-white text-gray-800 shadow-2xl border border-gray-100 animate-scale-in">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-8">
          <div className="p-3 bg-gradient-to-br from-[#517842]/10 to-[#FFC107]/10 rounded-full ring-4 ring-[#517842]/10">
            <Image
              src="/ethiopian-airlines-logo.png"
              alt="Ethiopian Airlines Logo"
              width={100}
              height={100}
              className="drop-shadow-lg"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#517842] to-[#3d5a32] bg-clip-text text-transparent mb-2">Forgot Password</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter your email to receive a password reset link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-600 font-medium">Reset link sent! Check your email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-[#517842] focus:ring-2 focus:ring-[#517842]/20 transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FFC107] hover:bg-[#FFD54F] text-[#517842] font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Send Reset Link
              </Button>
            </form>
          )}
          <div className="text-center text-sm mt-6 space-y-2">
            <Link href="/resend-code-reset-password" className="block text-[#517842] hover:text-[#3d5a32] font-medium transition-colors">
              I have a code to reset my password
            </Link>
            <Link href="/login" className="block text-[#517842] hover:text-[#3d5a32] font-medium transition-colors">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

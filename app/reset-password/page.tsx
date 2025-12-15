"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const params = useSearchParams()
  const router = useRouter()
  const tokenParam = params?.get('token') ?? ''

  // if token query param exists, use it as code; otherwise allow user input
  const codeToSend = tokenParam || code

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) return setMessage('Passwords do not match')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToSend, newPassword }),
      })
      if (!res.ok) throw new Error('Reset failed')
      setMessage('Password reset. Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setMessage(err?.message || 'Reset failed')
    }
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#517842] to-[#3d5a32] bg-clip-text text-transparent mb-2">Reset Password</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter a new password to complete reset
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {!tokenParam && (
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-sm font-semibold text-gray-700">Reset Code</Label>
                <Input 
                  id="code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  required
                  className="h-12 border-2 border-gray-200 focus:border-[#517842] focus:ring-2 focus:ring-[#517842]/20 transition-all"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="new" className="text-sm font-semibold text-gray-700">New Password</Label>
              <Input 
                id="new" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required
                className="h-12 border-2 border-gray-200 focus:border-[#517842] focus:ring-2 focus:ring-[#517842]/20 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
              <Input 
                id="confirm" 
                type="password" 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                required
                className="h-12 border-2 border-gray-200 focus:border-[#517842] focus:ring-2 focus:ring-[#517842]/20 transition-all"
              />
            </div>
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('success') || message.includes('Redirecting') ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {message}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#FFC107] hover:bg-[#FFD54F] text-[#517842] font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

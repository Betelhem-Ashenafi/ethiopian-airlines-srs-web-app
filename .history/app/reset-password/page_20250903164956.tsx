"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const params = useSearchParams()
  const router = useRouter()
  const token = params?.get('token') ?? ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) return setMessage('Passwords do not match')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      if (!res.ok) throw new Error('Reset failed')
      setMessage('Password reset. Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setMessage(err?.message || 'Reset failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-et-green p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter a new password to complete reset.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit">Reset password</Button>
            {message && <div className="text-sm mt-2">{message}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

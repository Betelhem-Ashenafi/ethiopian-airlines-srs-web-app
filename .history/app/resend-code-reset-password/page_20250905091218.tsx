"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function ResendCodeResetPasswordPage() {
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return setMessage('Please enter the code')
    if (newPassword !== confirm) return setMessage('Passwords do not match')
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword }),
      })
      if (!res.ok) throw new Error('Reset failed')
      setMessage('Password reset. Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setMessage(err?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-et-green p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password with Code</CardTitle>
          <CardDescription>Enter the code you received and your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="code">Resend Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</Button>
            {message && <div className="text-sm mt-2">{message}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

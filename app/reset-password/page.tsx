"use client"

import React, { useState } from "react"
import { resetPassword } from "@/lib/auth"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()
  const router = useRouter()

  // if token query param exists, use it as code; otherwise allow user input
  const tokenParam = params?.get('token') ?? ''
  const codeToSend = tokenParam || code

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!codeToSend || !newPassword || !confirmNewPassword) {
      setError("Fill all fields")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      console.log("reset payload to send:", { code: codeToSend, newPassword, confirmNewPassword })
      await resetPassword({ code: codeToSend, newPassword, confirmNewPassword })
      setSuccess("Password reset successful. Please log in.")
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      console.error("reset failed:", err)
      setError(err?.message || "Reset failed")
    } finally {
      setLoading(false)
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
            {!tokenParam && (
              <div>
                <Label htmlFor="code">Reset code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Reset password"}
            </Button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && <div className="text-sm mt-2 text-green-600">{success}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

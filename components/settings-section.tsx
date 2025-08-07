"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"

export default function SettingsSection() {
  const { user } = useAuth()
  const isEmployee = user?.role === "Employee"

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue={user?.fullName || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" defaultValue={user?.employeeId || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue={user?.role || ""} disabled />
          </div>
          {user?.role === "Department Admin" && user.department && (
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" defaultValue={user.department} disabled />
            </div>
          )}
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="password">Change Password</Label>
            <Input id="password" type="password" placeholder="Enter new password" disabled={isEmployee} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" disabled={isEmployee} />
          </div>
          <Button className="w-fit bg-et-gold text-et-green hover:bg-yellow-400" disabled={isEmployee}>
            Update Profile
          </Button>
          {isEmployee && (
            <p className="text-sm text-muted-foreground mt-2">
              As an Employee, you can view your profile details but cannot change them. Please contact your System Admin
              for any updates.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { updatePassword } from "@/lib/updatePassword"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function SettingsSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { user } = useAuth();

  // Password validation function
  function validatePassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (/\s/.test(password)) return "Password must not contain spaces.";
    return null;
  }

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter your current password and new password.");
      return;
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    setPasswordLoading(true)
    try {
      // updatePassword will throw on non-OK responses
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false)
    }
  };
  const isEmployee = user?.role === "Employee"
  const isSystemAdmin = ["System Admin", "sysAdmin"].includes(user?.role ?? "")

  // Departments are loaded from backend via API
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [locations, setLocations] = useState([
    "Bole International Airport - Terminal 2, Gate 12",
    "Bole International Airport - Runway 07R",
    "Head Office - HR Department",
    "Test Location",
  ])
  // From / no-reply email state (system setting)
  const [fromEmail, setFromEmail] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('fromEmail') ?? '' : '')
  const [fromSaving, setFromSaving] = useState(false)
  const [fromMessage, setFromMessage] = useState<string | null>(null)

  const handleSaveFromEmail = async () => {
    setFromMessage(null)
    if (!fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      setFromMessage('Please enter a valid email')
      return
    }
    setFromSaving(true)
    try {
      const res = await fetch('/api/settings/from-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromEmail }),
      })
      if (!res.ok) {
        // fallback to localStorage
        localStorage.setItem('fromEmail', fromEmail)
        setFromMessage('Saved locally (backend unavailable)')
      } else {
        localStorage.setItem('fromEmail', fromEmail)
        setFromMessage('Saved')
      }
    } catch (err: any) {
      localStorage.setItem('fromEmail', fromEmail)
      setFromMessage('Saved locally (error contacting backend)')
    } finally {
      setFromSaving(false)
      setTimeout(() => setFromMessage(null), 2500)
    }
  }
  const [newDepartment, setNewDepartment] = useState("")
  const [newLocation, setNewLocation] = useState("")

  // Add, update, delete handlers
  // CRUD handlers using the backend API
  const loadDepartments = async () => {
    try {
      const res = await fetch('/api/department')
      if (!res.ok) throw new Error('Failed to load departments')
      const data = await res.json()
      // Expecting an array of { id, name } or similar; normalize
      const list = Array.isArray(data) ? data : (data?.data || [])
      setDepartments(list.map((d: any) => ({ id: String(d.id ?? d.departmentID ?? d.DepartmentID ?? d.id), name: d.name ?? d.Name ?? d.departmentName ?? d.DepartmentName ?? d.name ?? '' })))
    } catch (e) {
      // fallback: keep empty list
      setDepartments([])
    }
  }

  const handleAddDepartment = async () => {
    if (!newDepartment) return
    try {
      const res = await fetch('/api/department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDepartment }),
      })
      if (!res.ok) throw new Error('Create failed')
      const created = await res.json()
      // backend may return created object
      const item = { id: String(created.id ?? created.departmentID ?? created.id), name: created.name ?? created.Name ?? newDepartment }
      setDepartments(prev => [...prev, item])
      setNewDepartment('')
    } catch (e: any) {
      // optimistic local add on failure
      setDepartments(prev => [...prev, { id: String(Date.now()), name: newDepartment }])
      setNewDepartment('')
    }
  }

  const handleDeleteDepartment = async (deptId: string) => {
    try {
      const res = await fetch(`/api/department/${deptId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDepartments(prev => prev.filter(d => d.id !== deptId))
    } catch (e) {
      // fallback: remove locally
      setDepartments(prev => prev.filter(d => d.id !== deptId))
    }
  }

  const handleUpdateDepartment = async (deptId: string, updatedName: string) => {
    try {
      const res = await fetch(`/api/department/${deptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedName }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, name: updated.name ?? updated.Name ?? updatedName } : d))
    } catch (e) {
      // fallback local update
      setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, name: updatedName } : d))
    }
  }

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation])
      setNewLocation("")
    }
  }
  const handleDeleteLocation = (loc: string) => {
    setLocations(locations.filter((l) => l !== loc))
  }
  const handleUpdateLocation = (oldLoc: string, updated: string) => {
    setLocations(locations.map((l) => (l === oldLoc ? updated : l)))
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          {isSystemAdmin && <TabsTrigger value="system">System Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
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
                <Label htmlFor="employeeID">Employee ID</Label>
                <Input id="employeeID" defaultValue={user?.employeeID || ""} disabled />
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
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isEmployee}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isEmployee}
                />
              </div>
              <Button
                className="w-fit bg-et-gold text-et-green hover:bg-yellow-400"
                disabled={isEmployee || passwordLoading}
                onClick={handlePasswordChange}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
              {passwordError && (
                <p className="text-sm text-red-500 mt-2">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-500 mt-2">{passwordSuccess}</p>
              )}
              {isEmployee && (
                <p className="text-sm text-muted-foreground mt-2">
                  As an Employee, you can view your profile details but cannot change them. Please contact your System Admin for any updates.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {isSystemAdmin && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage departments and locations for your organization.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Departments Management */}
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg mb-4 text-et-green flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-et-green mr-2"></span>
                      Departments
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        placeholder="Add new department"
                        className="w-full"
                      />
                      <Button onClick={handleAddDepartment} className="bg-et-green text-white">Add</Button>
                    </div>
                    <ul className="space-y-2">
                      {departments.map((dept) => (
                        <li key={dept.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                          <Input
                            defaultValue={dept.name}
                            onBlur={(e) => handleUpdateDepartment(dept.id, e.target.value)}
                            className="w-full"
                          />
                          <Button variant="destructive" onClick={() => handleDeleteDepartment(dept.id)} size="sm">Delete</Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Locations Management */}
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg mb-4 text-et-green flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-et-gold mr-2"></span>
                      Locations
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Add new location"
                        className="w-full"
                      />
                      <Button onClick={handleAddLocation} className="bg-et-green text-white">Add</Button>
                    </div>
                    <ul className="space-y-2">
                      {locations.map((loc) => (
                        <li key={loc} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                          <Input
                            defaultValue={loc}
                            onBlur={(e) => handleUpdateLocation(loc, e.target.value)}
                            className="w-full"
                          />
                          <Button variant="destructive" onClick={() => handleDeleteLocation(loc)} size="sm">Delete</Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* From / No-reply email setting */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200 w-full">
                  <h3 className="font-semibold text-lg mb-4 text-et-green">Default From (No-reply) Email</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set the default sender email used for automated messages (forgot/reset emails, notifications).</p>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="fromEmail"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="no-reply@yourdomain.com"
                      className="flex-1"
                    />
                    <Button onClick={handleSaveFromEmail} disabled={fromSaving}>
                      {fromSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  {fromMessage && <div className="text-sm mt-2">{fromMessage}</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

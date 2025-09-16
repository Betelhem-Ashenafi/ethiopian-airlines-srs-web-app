"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { updatePassword } from "@/lib/updatePassword"
import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [departments, setDepartments] = useState<{ id: string; rawId?: number; name: string; description?: string; departmentEmail?: string; contactNumber?: string; isActive?: boolean; createdAt?: string; updatedAt?: string }[]>([])
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
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("")
  const [newDepartmentEmail, setNewDepartmentEmail] = useState("")
  const [newDepartmentContact, setNewDepartmentContact] = useState("")
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
      setDepartments(list.map((d: any) => ({
        id: String(d.departmentID ?? d.DepartmentID ?? d.id ?? d.departmentId ?? ''),
        name: d.departmentName ?? d.DepartmentName ?? d.name ?? d.Name ?? '',
        description: d.description ?? d.Description ?? '',
        departmentEmail: d.departmentEmail ?? d.DepartmentEmail ?? d.departmentEmail ?? '',
        contactNumber: d.contactNumber ?? d.ContactNumber ?? '',
        isActive: d.isActive ?? d.IsActive ?? false,
      })))
    } catch (e) {
      // fallback: keep empty list
      setDepartments([])
    }
  }

  useEffect(() => {
    if (isSystemAdmin) loadDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSystemAdmin])

  const handleAddDepartment = async () => {
    if (!newDepartmentName) return
    const payload = {
      departmentName: newDepartmentName,
      description: newDepartmentDescription || undefined,
      departmentEmail: newDepartmentEmail || undefined,
      contactNumber: newDepartmentContact || undefined,
    }
    try {
      const res = await fetch('/api/department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Create failed')
      const created = await res.json()
      // backend may return created object or { data: created }
      const obj = created?.data ?? created
      const item = {
        id: String(obj.departmentID ?? obj.id ?? Date.now()),
        name: obj.departmentName ?? newDepartmentName,
        description: obj.description ?? payload.description,
        departmentEmail: obj.departmentEmail ?? payload.departmentEmail,
        contactNumber: obj.contactNumber ?? payload.contactNumber,
      }
      setDepartments(prev => [...prev, item])
      setNewDepartmentName('')
      setNewDepartmentDescription('')
      setNewDepartmentEmail('')
      setNewDepartmentContact('')
  // no-op
    } catch (e: any) {
      // optimistic local add on failure
  setDepartments(prev => [...prev, { id: String(Date.now()), name: newDepartmentName, description: newDepartmentDescription, departmentEmail: newDepartmentEmail, contactNumber: newDepartmentContact }])
  setNewDepartmentName('')
  setNewDepartmentDescription('')
  setNewDepartmentEmail('')
  setNewDepartmentContact('')
    }
  }

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm('Delete this department? This action cannot be undone.')) return
    // If id looks like a temp local id (non-numeric), just remove locally
    if (isNaN(Number(deptId))) {
      setDepartments(prev => prev.filter(d => d.id !== deptId))
      return
    }
    try {
      const res = await fetch(`/api/department/${deptId}`, { method: 'DELETE' })
      const text = await res.text()
      if (!res.ok) {
        // surface backend message
        throw new Error(`Delete failed: ${res.status} ${text}`)
      }
      setDepartments(prev => prev.filter(d => d.id !== deptId))
    } catch (e: any) {
      // fallback: remove locally but show error
      setDepartments(prev => prev.filter(d => d.id !== deptId))
      alert('Delete failed: ' + (e?.message ?? String(e)))
    }
  }

  // Modal state for department editing
  const [editDeptId, setEditDeptId] = useState<string | null>(null)
  const [editDeptFields, setEditDeptFields] = useState<{ name: string; description: string; departmentEmail: string; contactNumber: string; isActive: boolean }>({ name: '', description: '', departmentEmail: '', contactNumber: '', isActive: false })
  const [editDeptServerId, setEditDeptServerId] = useState<number | null>(null)
  const [savingDept, setSavingDept] = useState(false)
  const [deptError, setDeptError] = useState<string | null>(null)
  const [isEditingDept, setIsEditingDept] = useState(false)

  const openEditDept = (dept: any, viewOnly: boolean = false) => {
  setEditDeptId(dept.id)
  // prefer numeric server id if available to use in PUT path
  setEditDeptServerId(dept.rawId ?? (isNaN(Number(dept.id)) ? null : Number(dept.id)))
    setEditDeptFields({
      name: dept.name || '',
      description: dept.description || '',
      departmentEmail: dept.departmentEmail || '',
      contactNumber: dept.contactNumber || '',
      isActive: !!dept.isActive
    })
    setDeptError(null)
    setIsEditingDept(!viewOnly)
  }

  const closeEditDept = () => {
    setEditDeptId(null)
    setEditDeptFields({ name: '', description: '', departmentEmail: '', contactNumber: '', isActive: false })
    setDeptError(null)
    setIsEditingDept(false)
  }

  const handleUpdateDepartmentModal = async () => {
    if (!editDeptId) return
    setSavingDept(true)
    setDeptError(null)
    try {
      const merged = {
        departmentID: isNaN(Number(editDeptId)) ? undefined : Number(editDeptId),
        departmentName: editDeptFields.name,
        description: editDeptFields.description,
        departmentEmail: editDeptFields.departmentEmail,
        contactNumber: editDeptFields.contactNumber,
        isActive: editDeptFields.isActive,
      }
      // If this is a temp/local id (non-numeric), POST to create instead of PUT which would 404
      if (isNaN(Number(editDeptId))) {
        const res = await fetch(`/api/department`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departmentName: merged.departmentName,
            description: merged.description,
            departmentEmail: merged.departmentEmail,
            contactNumber: merged.contactNumber,
            isActive: merged.isActive,
          }),
        })
        const text = await res.text()
        if (!res.ok) throw new Error(`Create failed: ${res.status} ${text}`)
        let obj: any = null
        try { obj = JSON.parse(text) } catch { obj = null }
        const payload = obj?.data ?? obj
        // replace temp id item with server-returned object when possible
        setDepartments(prev => prev.map(d => d.id === editDeptId ? {
          ...d,
          id: String(payload?.departmentID ?? payload?.id ?? d.id),
          name: payload?.departmentName ?? merged.departmentName ?? d.name,
          description: payload?.description ?? merged.description ?? d.description,
          departmentEmail: payload?.departmentEmail ?? merged.departmentEmail ?? d.departmentEmail,
          contactNumber: payload?.contactNumber ?? merged.contactNumber ?? d.contactNumber,
          isActive: payload?.isActive ?? merged.isActive ?? d.isActive,
        } : d))
        closeEditDept()
        return
      }

      const res = await fetch(`/api/department/${editDeptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      })
      const text = await res.text()
      if (!res.ok) {
        throw new Error(`Update failed: ${res.status} ${text}`)
      }
      // try parse JSON response, fallback to merged payload
      let obj: any = merged
      try { obj = JSON.parse(text) } catch { obj = merged }
      const payload = obj?.data ?? obj
      setDepartments(prev => prev.map(d => d.id === editDeptId ? {
        ...d,
        name: payload?.departmentName ?? merged.departmentName ?? d.name,
        description: payload?.description ?? merged.description ?? d.description,
        departmentEmail: payload?.departmentEmail ?? merged.departmentEmail ?? d.departmentEmail,
        contactNumber: payload?.contactNumber ?? merged.contactNumber ?? d.contactNumber,
        isActive: payload?.isActive ?? merged.isActive ?? d.isActive,
      } : d))
      closeEditDept()
    } catch (e: any) {
      setDeptError(e?.message || 'Update failed')
      alert('Update failed: ' + (e?.message ?? String(e)))
    } finally {
      setSavingDept(false)
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
                    <div className="mb-4">
                      <div className="grid gap-2">
                        <Input
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          placeholder="Department name"
                          className="w-full h-10 text-sm px-3"
                        />
                        <Input
                          value={newDepartmentDescription}
                          onChange={(e) => setNewDepartmentDescription(e.target.value)}
                          placeholder="Description"
                          className="w-full h-10 text-sm px-3"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          value={newDepartmentEmail}
                          onChange={(e) => setNewDepartmentEmail(e.target.value)}
                          placeholder="Contact email"
                          className="min-w-0 flex-1 h-10 text-sm px-3"
                        />
                        <Input
                          value={newDepartmentContact}
                          onChange={(e) => setNewDepartmentContact(e.target.value)}
                          placeholder="Contact number"
                          className="min-w-0 w-48 h-10 text-sm px-3"
                        />
                        <div className="ml-auto">
                          <Button onClick={handleAddDepartment} className="bg-et-green text-white h-10">Add</Button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex flex-col gap-2">
                          {departments.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-md p-4 border border-gray-100 flex items-center justify-between">
                              <div className="font-semibold">{dept.name}</div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEditDept(dept, true)}>Details</Button>
                                <Button variant="destructive" onClick={() => handleDeleteDepartment(dept.id)} size="sm">Delete</Button>
                              </div>
                            </div>
                          ))}
                          {/* Department Edit Modal */}
                          <Dialog open={!!editDeptId} onOpenChange={closeEditDept}>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Department</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-3">
                                <div>
                                  <Label>Name</Label>
                                  <Input value={editDeptFields.name} disabled={!isEditingDept} onChange={e => setEditDeptFields(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Input value={editDeptFields.description} disabled={!isEditingDept} onChange={e => setEditDeptFields(f => ({ ...f, description: e.target.value }))} />
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <Input value={editDeptFields.departmentEmail} disabled={!isEditingDept} onChange={e => setEditDeptFields(f => ({ ...f, departmentEmail: e.target.value }))} />
                                </div>
                                <div>
                                  <Label>Contact</Label>
                                  <Input value={editDeptFields.contactNumber} disabled={!isEditingDept} onChange={e => setEditDeptFields(f => ({ ...f, contactNumber: e.target.value }))} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={!!editDeptFields.isActive} disabled={!isEditingDept} onChange={e => setEditDeptFields(f => ({ ...f, isActive: e.target.checked }))} />
                                  <span>Active</span>
                                </div>
                                {deptError && <div className="text-red-500 text-sm mt-1">{deptError}</div>}
                                <div className="flex gap-2 justify-end mt-2">
                                  {isEditingDept ? (
                                    <>
                                      <Button onClick={handleUpdateDepartmentModal} disabled={savingDept} className="bg-et-green text-white">{savingDept ? 'Saving...' : 'Save'}</Button>
                                      <Button variant="ghost" onClick={() => { if (editDeptId) openEditDept(departments.find(d=>d.id===editDeptId)!, true); else closeEditDept() }}>Cancel</Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button onClick={() => setIsEditingDept(true)}>Edit</Button>
                                      <Button variant="ghost" onClick={closeEditDept}>Close</Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                      </div>
                    </div>
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

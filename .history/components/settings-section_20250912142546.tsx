"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { updatePassword } from "@/lib/updatePassword"
import { loadDepartmentsHelper, addDepartment, deleteDepartment, updateDepartment } from "@/lib/departments"
import { loadLocationsHelper } from "@/lib/locations"
import { addLocation, deleteLocation, editLocation } from "@/lib/locations-crud"
import type { Location } from "@/lib/locations"
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
  const fromEmail = user?.email || '';

  // Departments are loaded from backend via API
  const [departments, setDepartments] = useState<{ id: string; rawId?: number; name: string; description?: string; departmentEmail?: string; contactNumber?: string; isActive?: boolean; createdAt?: string; updatedAt?: string }[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  // Load locations using client helper
  const loadLocations = async () => {
    const list = await loadLocationsHelper();
    setLocations(list);
  }
  // From / no-reply email always uses logged-in user's email
  
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("")
  const [newDepartmentEmail, setNewDepartmentEmail] = useState("")
  const [newDepartmentContact, setNewDepartmentContact] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [savingLocation, setSavingLocation] = useState(false)

  // Add, update, delete handlers
  // Load departments using client helper
  const loadDepartments = async () => {
    const list = await loadDepartmentsHelper();
    setDepartments(list);
  }

  useEffect(() => {
    if (isSystemAdmin) {
      loadDepartments();
      loadLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSystemAdmin])

  const handleAddDepartment = async () => {
    if (!newDepartmentName) return
    const payload = {
      DepartmentName: newDepartmentName,
      Description: newDepartmentDescription || undefined,
      DepartmentEmail: newDepartmentEmail || undefined,
      ContactNumber: newDepartmentContact || undefined,
    }
    try {
      const item = await addDepartment(payload)
      setDepartments(prev => [...prev, item])
      setNewDepartmentName('')
      setNewDepartmentDescription('')
      setNewDepartmentEmail('')
      setNewDepartmentContact('')
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
    // find department in local list to prefer server numeric id (rawId)
    const dept = departments.find(d => d.id === deptId)
    const serverId = dept?.rawId ?? (isNaN(Number(deptId)) ? undefined : Number(deptId))

    // If we don't have a numeric id (temp/local item), remove locally only
    if (!serverId) {
      setDepartments(prev => prev.filter(d => d.id !== deptId))
      return
    }

    try {
      await deleteDepartment(serverId)
      setDepartments(prev => prev.filter(d => d.id !== deptId && d.rawId !== serverId))
    } catch (e: any) {
      // fallback: remove locally but show error
      setDepartments(prev => prev.filter(d => d.id !== deptId))
      alert('Delete failed: ' + (e?.message ?? String(e)))
    }
  }

  // activation is now managed via the edit modal or backend processes; toggle function removed

  // Modal state for department editing
  const [editDeptId, setEditDeptId] = useState<string | null>(null)
  const [editDeptFields, setEditDeptFields] = useState<{ name: string; description: string; departmentEmail: string; contactNumber: string; isActive: boolean }>({ name: '', description: '', departmentEmail: '', contactNumber: '', isActive: false })
  const [editDeptServerId, setEditDeptServerId] = useState<number | null>(null)
  const [savingDept, setSavingDept] = useState(false)
  const [deptError, setDeptError] = useState<string | null>(null)
  const [isEditingDept, setIsEditingDept] = useState(false)

  // Location detail modal state
  const [editLocId, setEditLocId] = useState<number | null>(null)
  const [editLocFields, setEditLocFields] = useState<Location | null>(null)
  const [isEditingLoc, setIsEditingLoc] = useState(false)

  const openEditLoc = (loc: Location, viewOnly: boolean = false) => {
    setEditLocId(loc.locationID)
    setEditLocFields({ ...loc })
    setIsEditingLoc(!viewOnly)
  }

  const closeEditLoc = () => {
    setEditLocId(null)
    setEditLocFields(null)
    setIsEditingLoc(false)
  }

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
        DepartmentID: isNaN(Number(editDeptId)) ? undefined : Number(editDeptId),
        DepartmentName: editDeptFields.name,
        Description: editDeptFields.description,
        DepartmentEmail: editDeptFields.departmentEmail,
        ContactNumber: editDeptFields.contactNumber,
        IsActive: editDeptFields.isActive,
      }
      // If this is a temp/local id (non-numeric), POST to create instead of PUT which would 404
      if (isNaN(Number(editDeptId))) {
  const res = await fetch(`/api/department`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            DepartmentName: merged.DepartmentName,
            Description: merged.Description,
            DepartmentEmail: merged.DepartmentEmail,
            ContactNumber: merged.ContactNumber,
            IsActive: merged.IsActive,
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
          id: String(payload?.DepartmentID ?? payload?.departmentID ?? payload?.id ?? d.id),
          name: payload?.DepartmentName ?? payload?.departmentName ?? merged.DepartmentName ?? d.name,
          description: payload?.Description ?? payload?.description ?? merged.Description ?? d.description,
          departmentEmail: payload?.DepartmentEmail ?? payload?.departmentEmail ?? merged.DepartmentEmail ?? d.departmentEmail,
          contactNumber: payload?.ContactNumber ?? payload?.contactNumber ?? merged.ContactNumber ?? d.contactNumber,
          isActive: payload?.IsActive ?? payload?.isActive ?? merged.IsActive ?? d.isActive,
        } : d))
        closeEditDept()
        return
      }
      const updated = await updateDepartment({
        DepartmentID: editDeptServerId ?? (isNaN(Number(editDeptId)) ? undefined : Number(editDeptId)),
        DepartmentName: merged.DepartmentName,
        Description: merged.Description,
        DepartmentEmail: merged.DepartmentEmail,
        ContactNumber: merged.ContactNumber,
        IsActive: merged.IsActive,
      })

      const payload = updated ?? merged

      setDepartments(prev => prev.map(d => d.id === editDeptId ? ({
        ...d,
        id: String(payload?.DepartmentID ?? payload?.departmentID ?? payload?.id ?? d.id),
        rawId: payload?.DepartmentID ?? payload?.departmentID ?? payload?.id ?? d.rawId,
        name: payload?.DepartmentName ?? payload?.departmentName ?? merged.DepartmentName ?? d.name,
        description: payload?.Description ?? payload?.description ?? merged.Description ?? d.description,
        departmentEmail: payload?.DepartmentEmail ?? payload?.departmentEmail ?? merged.DepartmentEmail ?? d.departmentEmail,
        contactNumber: payload?.ContactNumber ?? payload?.contactNumber ?? merged.ContactNumber ?? d.contactNumber,
        isActive: payload?.IsActive ?? payload?.isActive ?? merged.IsActive ?? d.isActive,
      }) : d))
      closeEditDept()
    } catch (e: any) {
      setDeptError(e?.message || 'Update failed')
      alert('Update failed: ' + (e?.message ?? String(e)))
    } finally {
      setSavingDept(false)
    }
  }

  // Location CRUD handlers (backend)
  const handleAddLocation = async () => {
    setLocationError(null)
    if (!newLocation) return
    setSavingLocation(true)
    try {
      const payload = { locationName: newLocation, isActive: true }
      const item = await addLocation(payload)
      setLocations(prev => [...prev, item])
      setNewLocation("")
    } catch (e: any) {
      setLocationError(e?.message || "Failed to add location")
    } finally {
      setSavingLocation(false)
    }
  }

  const handleDeleteLocation = async (locId: number) => {
    if (!confirm('Delete this location? This action cannot be undone.')) return
    setLocationError(null)
    try {
      await deleteLocation(locId)
      setLocations(prev => prev.filter(l => l.locationID !== locId))
    } catch (e: any) {
      setLocationError(e?.message || "Failed to delete location")
    }
  }

  const handleUpdateLocation = async (locId: number, updated: string) => {
    setLocationError(null)
    setSavingLocation(true)
    try {
      const loc = locations.find(l => l.locationID === locId)
      if (!loc) return
      const payload = { ...loc, locationName: updated }
      const item = await editLocation(locId, payload)
      setLocations(prev => prev.map(l => l.locationID === locId ? item : l))
    } catch (e: any) {
      setLocationError(e?.message || "Failed to update location")
    } finally {
      setSavingLocation(false)
    }
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          {isSystemAdmin && <TabsTrigger value="department">Department</TabsTrigger>}
          {isSystemAdmin && <TabsTrigger value="location">Location</TabsTrigger>}
        </TabsList>

        {/* User Profile Section */}
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

        {/* Department Section */}
        {isSystemAdmin && (
          <TabsContent value="department">
            <Card>
              <CardHeader>
                <CardTitle>Department Management</CardTitle>
                <CardDescription>Manage departments for your organization.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">
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
                                {/* Toggle removed: activation is now managed server-side or via edit modal */}
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
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Location Section */}
        {isSystemAdmin && (
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location Management</CardTitle>
                <CardDescription>Manage locations for your organization.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="font-semibold text-lg mb-4 text-et-green flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-et-gold mr-2"></span>
                    Locations
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Location name"
                      className="min-w-0 flex-1 h-10 text-sm px-3"
                    />
                    <Button onClick={handleAddLocation} className="bg-et-green text-white h-10">Add</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex flex-col gap-2">
                      {locations.map((loc) => (
                        <div key={loc.locationID} className="bg-white rounded-md p-4 border border-gray-100 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{loc.locationName}</div>
                            <div className="text-xs text-gray-500">ID: {loc.locationID}</div>
                            <div className="text-xs text-gray-500">Active: {loc.isActive ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditLoc(loc, true)}>Details</Button>
                            <Input
                              defaultValue={loc.locationName}
                              onBlur={(e) => handleUpdateLocation(loc.locationID, e.target.value)}
                              className="w-40"
                              disabled={savingLocation}
                            />
                            <Button variant="destructive" onClick={() => handleDeleteLocation(loc.locationID)} size="sm" disabled={savingLocation}>Delete</Button>
                  {locationError && <div className="text-red-500 text-sm mt-2">{locationError}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {/* Location Details Modal */}
        <Dialog open={!!editLocId} onOpenChange={closeEditLoc}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Location Details</DialogTitle>
            </DialogHeader>
            {editLocFields && (
              <div className="grid gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={editLocFields.locationName} disabled />
                </div>
                <div>
                  <Label>ID</Label>
                  <Input value={String(editLocFields.locationID)} disabled />
                </div>
                <div>
                  <Label>Active</Label>
                  <Input value={editLocFields.isActive ? 'Yes' : 'No'} disabled />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <Button variant="ghost" onClick={closeEditLoc}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type User } from "@/lib/data"
import { registerUser, fetchUsers as fetchUsersHelper, updateUser } from "@/lib/auth"
import { fetchDepartmentsDropdown } from "@/lib/dropdowns"
import { Badge } from "@/components/ui/badge"

export default function UserManagementSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  interface NewUserDraft extends Partial<User> { departmentId?: number }
  const [newUserData, setNewUserData] = useState<NewUserDraft>({});
  const [userList, setUserList] = useState<User[]>([]);
  const [deptOptions, setDeptOptions] = useState<{id:string,name:string}[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadError, setLoadError] = useState<string|undefined>()

  // Fetch users from backend
  async function loadUsers() {
    setLoadingUsers(true)
    setLoadError(undefined)
    try {
      const result = await fetchUsersHelper()
      if (!result.success) throw new Error(result.error || 'Failed to load users')
      const raw = result.users || []
      // Normalize fields to match User shape
  const mapped: User[] = raw.map((u:any) => ({
        id: u.id || u.userId || u.UserID || u.EmployeeID || u.employeeID || u.employeeId || crypto.randomUUID(),
        employeeID: u.employeeID || u.EmployeeID || u.employeeId || u.id || '',
        fullName: u.fullName || u.FullName || u.name || '',
        email: u.email || u.Email || '',
        role: u.role || u.Role || 'Employee',
        status: u.status || u.Status || 'Active',
        department: u.departmentName || u.DepartmentName || u.department || '',
        password: '' // never expose
      }))
      setUserList(mapped)
    } catch (e:any) {
      setUserList([])
      setLoadError(e.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch users on mount
  React.useEffect(() => {
    loadUsers();
    fetchDepartmentsDropdown().then(setDeptOptions).catch(()=>{})
  }, []);

  const filteredUsers = userList.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.employeeID.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });
  const handleCreateUser = () => {
    setEditingUser(null)
    setNewUserData({})
    setIsUserFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUserData(user)
    setIsUserFormOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      console.log(`Deleting user: ${userId}`)
      // In a real app, send delete request to backend
      alert(`User ${userId} deleted (demo action)`)
    }
  }

  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        const result = await updateUser(editingUser.id, {
          fullName: newUserData.fullName!,
            email: newUserData.email!,
            role: newUserData.role!,
            isActive: (newUserData.status || 'Active') === 'Active'
        })
        if (!result.success) {
          alert(result.error || 'Update failed')
        } else {
          alert('User updated')
          // Optimistically update table without full reload
          setUserList(prev => prev.map(u => u.id === editingUser.id ? {
            ...u,
            fullName: newUserData.fullName || u.fullName,
            email: newUserData.email || u.email,
            role: newUserData.role || u.role,
            status: (newUserData.status || 'Active')
          } : u))
          // Optionally refresh in background for consistency (silent)
          loadUsers().catch(()=>{})
        }
      } catch (e:any) {
        alert(e.message)
      }
    } else {
      // Create user via registerUser helper
      try {
        const draft = newUserData as NewUserDraft
        if (!draft.departmentId && draft.department) {
          // attempt to resolve department text -> id
          const found = deptOptions.find(d => d.name.toLowerCase() === draft.department!.toLowerCase())
          if (found) draft.departmentId = Number(found.id)
        }
        const result = await registerUser({
          employeeID: draft.employeeID!,
          fullName: draft.fullName!,
          email: draft.email!,
          role: draft.role!,
          password: draft.password!,
          departmentId: Number(draft.departmentId ?? 0),
        });
        if (!result.success) {
          alert(result.error || 'Registration failed')
        } else {
          alert('User registered')
          await loadUsers();
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
    setIsUserFormOpen(false);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateUser}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

  <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
      <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.employeeID}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "outline"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                        aria-label={`Edit ${user.fullName}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Make changes to the user profile here." : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employeeID" className="text-right">
                Employee ID
              </Label>
              <Input
                id="employeeID"
                value={newUserData.employeeID || ""}
                onChange={(e) => setNewUserData({ ...newUserData, employeeID: e.target.value })}
                className="col-span-3"
                disabled={!!editingUser} // don't allow changing employee ID during edit
              />
            </div>
            {!editingUser && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password || ""}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={newUserData.fullName || ""}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email || ""}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUserData.role || ""}
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value as User["role"] })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Department Admin">Department Admin</SelectItem>
                  <SelectItem value="System Admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <Select
                value={(newUserData.status || 'Active') === 'Active' ? 'true' : 'false'}
                onValueChange={(v) => setNewUserData({ ...newUserData, status: v === 'true' ? 'Active' : 'Inactive' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUserData.role === "Department Admin" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Select
                  value={String((newUserData as NewUserDraft).departmentId ?? '')}
                  onValueChange={(val) => {
                    const dept = deptOptions.find(d => d.id === val)
                    setNewUserData({ ...(newUserData as NewUserDraft), departmentId: Number(val), department: dept?.name })
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {deptOptions.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>{editingUser ? "Save Changes" : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

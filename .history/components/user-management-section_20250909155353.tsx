"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, PlusCircle, Edit } from "lucide-react"
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
// Use unified auth helpers (includes role mapping & departmentId handling)
import { registerUser, updateUser, fetchUsers as fetchUsersHelper } from '@/lib/auth'
import { fetchDepartmentsDropdown } from '@/lib/dropdowns'
import { Badge } from "@/components/ui/badge"

export default function UserManagementSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  interface NewUserDraft extends Partial<User> { departmentId?: number }
  const [newUserData, setNewUserData] = useState<NewUserDraft>({});
  const [userList, setUserList] = useState<User[]>([]);
  const [deptOptions, setDeptOptions] = useState<{id:string,name:string}[]>([])

  // Fetch users from backend
  async function fetchUsers() {
    try {
      const res = await fetchUsersHelper()
      if (res.success) {
        const list = res.users || []
        const mapped = list.map((u:any) => ({
          id: u.id || u.userId || u.UserID || u.EmployeeID || crypto.randomUUID(),
          employeeID: u.employeeID || u.EmployeeID || u.employeeId || u.id || '',
          fullName: u.fullName || u.FullName || u.name || '',
          email: u.email || u.Email || '',
          role: u.role || u.Role || 'Employee',
          status: (u.isActive === false || u.status === 'Inactive') ? 'Inactive' : 'Active',
          department: u.departmentName || u.DepartmentName || u.department || '',
          password: ''
        }))
        setUserList(mapped as User[])
      } else setUserList([])
    } catch { setUserList([]) }
  }

  // Fetch users on mount
  React.useEffect(() => {
    fetchUsers();
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

  // Delete removed per requirement

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
          // Optimistic update
          setUserList(prev => prev.map(u => u.id === editingUser.id ? { ...u, fullName: newUserData.fullName!, email: newUserData.email!, role: newUserData.role!, status: (newUserData.status || 'Active') } : u))
          // Refresh silently
          fetchUsers()
        }
      } catch (e:any) {
        alert(e.message)
      }
    } else {
      // Create user via registerUser helper
      try {
        // Basic validation for required fields
        const missing: string[] = []
        if (!newUserData.employeeID) missing.push('employeeID')
        if (!newUserData.fullName) missing.push('fullName')
        if (!newUserData.email) missing.push('email')
        if (!newUserData.role) missing.push('role')
        if (!newUserData.password) missing.push('password')
        // Resolve departmentId: if user selected Department Admin ensure chosen; otherwise choose first available
        if (deptOptions.length && !newUserData.departmentId) {
          const fallback = deptOptions[0]
          if (fallback) newUserData.departmentId = Number(fallback.id)
        }
        if (newUserData.role === 'Department Admin' && !newUserData.departmentId) missing.push('departmentId')
        if (missing.length) {
          alert('Missing required: ' + missing.join(', '))
          return
        }
        const result = await registerUser({
          employeeID: newUserData.employeeID!,
          fullName: newUserData.fullName!,
          email: newUserData.email!,
          role: newUserData.role!,
          password: newUserData.password!,
          departmentId: Number(newUserData.departmentId || 0)
        })
        if (!result.success) {
          alert(result.error || 'Registration failed')
        } else {
          alert('User registered')
          await fetchUsers()
        }
      } catch (err:any) {
        alert(err.message)
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
              <Label htmlFor="status" className="text-right">Active</Label>
              <Select
                value={(newUserData.status || 'Active') === 'Active' ? 'Active' : 'Inactive'}
                onValueChange={(v)=> setNewUserData({ ...newUserData, status: v as 'Active' | 'Inactive' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deptOptions.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Select
                  value={String(newUserData.departmentId ?? '')}
                  onValueChange={(val) => {
                    const found = deptOptions.find(d => d.id === val)
                    setNewUserData({ ...newUserData, departmentId: Number(val), department: found?.name })
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

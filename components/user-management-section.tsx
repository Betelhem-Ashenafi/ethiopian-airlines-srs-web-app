





























































































































"use client"

import { useState } from "react"
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
import { type User, users } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

export default function UserManagementSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUserData, setNewUserData] = useState<Partial<User>>({})

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.employeeId.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  })

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

  const handleSaveUser = () => {
    if (editingUser) {
      console.log("Updating user:", newUserData)
      // In a real app, send update request to backend
      alert(`User ${newUserData.fullName} updated (demo action)`)
    } else {
      console.log("Creating new user:", newUserData)
      // In a real app, send create request to backend
      alert(`New user ${newUserData.fullName} created (demo action)`)
    }
    setIsUserFormOpen(false)
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
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.employeeId}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        aria-label={`Delete ${user.fullName}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
              <Label htmlFor="employeeId" className="text-right">
                Employee ID
              </Label>
              <Input
                id="employeeId"
                value={newUserData.employeeId || ""}
                onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })}
                className="col-span-3"
              />
            </div>
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
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newUserData.status || "Active"}
                onValueChange={(value) => setNewUserData({ ...newUserData, status: value as User["status"] })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUserData.role === "Department Admin" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  value={newUserData.department || ""}
                  onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., IT Support, Facility Maintenance"
                />
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

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function SettingsSection() {
  const { user } = useAuth()
  const isEmployee = user?.role === "Employee"
  const isSystemAdmin = ["System Admin", "sysAdmin"].includes(user?.role ?? "")

  // Simulated state for locations and departments (replace with API in real app)
  const [departments, setDepartments] = useState([
    "IT Support",
    "Facility Maintenance",
    "Electrical Maintenance",
    "HR",
  ])
  const [locations, setLocations] = useState([
    "Bole International Airport - Terminal 2, Gate 12",
    "Bole International Airport - Runway 07R",
    "Head Office - HR Department",
    "Test Location",
  ])
  const [newDepartment, setNewDepartment] = useState("")
  const [newLocation, setNewLocation] = useState("")

  // Add, update, delete handlers
  const handleAddDepartment = () => {
    if (newDepartment && !departments.includes(newDepartment)) {
      setDepartments([...departments, newDepartment])
      setNewDepartment("")
    }
  }
  const handleDeleteDepartment = (dept: string) => {
    setDepartments(departments.filter((d) => d !== dept))
  }
  const handleUpdateDepartment = (oldDept: string, updated: string) => {
    setDepartments(departments.map((d) => (d === oldDept ? updated : d)))
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
                        <li key={dept} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                          <Input
                            defaultValue={dept}
                            onBlur={(e) => handleUpdateDepartment(dept, e.target.value)}
                            className="w-full"
                          />
                          <Button variant="destructive" onClick={() => handleDeleteDepartment(dept)} size="sm">Delete</Button>
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
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

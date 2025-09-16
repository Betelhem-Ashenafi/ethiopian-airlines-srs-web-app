"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Report } from "@/lib/data"
import { useAuth } from "@/components/auth-provider" // Import useAuth

interface ReportDetailDialogProps {
  report: Report
  isOpen: boolean
  onClose: () => void
}

export default function ReportDetailDialog({ report, isOpen, onClose }: ReportDetailDialogProps) {
  const { user } = useAuth() // Get the current user
  const isEmployee = user?.role === "Employee" // Check if the user is an Employee

  const [currentStatus, setCurrentStatus] = useState<"Open" | "In Progress" | "Resolved" | "Reject" | "On Hold">(report.status as "Open" | "In Progress" | "Resolved" | "Reject" | "On Hold")
  const [currentDepartment, setCurrentDepartment] = useState(report.aiDepartment)
  const [currentSeverity, setCurrentSeverity] = useState(report.aiSeverity)
  // Hardcoded dropdown options
  const departmentOptions = [
    "Facility Maintenance", "IT Support", "Plumbing", "Safety", "Other"
  ];
  const statusOptions = [
    "Open", "In Progress", "Resolved", "Reject", "On Hold"
  ];
  const severityOptions = [
    "Low", "Moderate", "High", "Critical"
  ];
  const [currentAssignedTo, setCurrentAssignedTo] = useState(report.assignedTo || "")
  const [newComment, setNewComment] = useState("")

  // Placeholder for available users/teams for assignment
  const availableAssignees = ["Maintenance Team Alpha", "IT Team Beta", "Plumbing Team", "Safety Team", "Unassigned"]

  const handleSave = () => {
    // In a real app, you would send these updates to your backend
    console.log("Saving updates for report:", report.id)
    console.log("New Status:", currentStatus)
    console.log("New Department:", currentDepartment)
    console.log("New Severity:", currentSeverity)
    console.log("New Assigned To:", currentAssignedTo)
    if (newComment) {
      console.log("New Comment:", newComment)
      // Add comment to report.comments array and update state/backend
    }
    onClose() // Close the dialog after saving
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details: {report.title}</DialogTitle>
          <DialogDescription>
            Report ID: {report.id} | Submitted by {report.submittedBy} on {new Date(report.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isEmployee && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">View Only</p>
              <p>As an Employee, you can view report details but cannot make changes.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Image
                src={report.imageUrl || "/placeholder.svg"}
                alt="Report Image"
                width={500}
                height={300}
                className="rounded-md object-cover w-full h-auto max-h-[200px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <p className="text-sm text-muted-foreground">{report.selectedLocation}</p>
              <p className="text-xs text-muted-foreground">GPS: {report.gpsCoordinates}</p>
            </div>
            <div className="space-y-2">
              <Label>Current Status</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => setCurrentStatus(value as "Open" | "In Progress" | "Resolved" | "Reject" | "On Hold")}
                  disabled={isEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>

          <Separator />

          {/* Only show AI Assigned Department and Severity for System Admin */}
          {(user?.role === "System Admin") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>AI Assigned Department</Label>
                <Select value={currentDepartment} onValueChange={setCurrentDepartment} disabled={isEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Override AI classification if needed.</p>
              </div>
              <div className="space-y-2">
                <Label>AI Assigned Severity</Label>
                <Select
                  value={currentSeverity}
                  onValueChange={(value) => setCurrentSeverity(value as "Low" | "Moderate" | "High" | "Critical")}
                  disabled={isEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Override AI classification if needed.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Assigned To</Label>
            {user?.role === "System Admin" ? (
              <Select value={currentAssignedTo} onValueChange={setCurrentAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to team/user" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">{report.assignedTo || "it support"}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Internal Notes & Comments</Label>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {report.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No internal comments yet.</p>
              ) : (
                report.comments.map((comment, index) => (
                  <div key={index} className="bg-muted p-2 rounded-md text-sm">
                    <p className="font-medium">
                      {comment.author}{" "}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </p>
                    <p>{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            <Textarea
              placeholder="Add a new internal comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mt-2"
              disabled={isEmployee}
            />
            {/* ...existing code... */}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={isEmployee}>
            Save Changes
          </Button>
          <Button
            onClick={() => {
              if (newComment.trim()) {
                setNewComment("");
                alert("Comment sent!");
              }
            }}
            disabled={isEmployee || !newComment.trim()}
          >
                <Select
                  value={currentSeverity}
                  onValueChange={(value) => setCurrentSeverity(value as "Low" | "Moderate" | "High" | "Critical")}
                  disabled={isEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((sev) => (
                      <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

interface ReportDetailDialogProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailDialog({ report, isOpen, onClose }: ReportDetailDialogProps) {
  const [currentStatus, setCurrentStatus] = useState(report.status || "Open");
  const [currentDepartment, setCurrentDepartment] = useState(report.aiDepartment || "");
  const [currentSeverity, setCurrentSeverity] = useState(report.aiSeverity || "Low");
  const [currentAssignedTo, setCurrentAssignedTo] = useState(report.assignedTo || "");
  const [newComment, setNewComment] = useState("");
  const isEmployee = false; // Replace with actual logic if needed
  const departmentOptions = ["Facility Maintenance", "IT Support", "Plumbing", "Safety", "Other"];
  const statusOptions = ["Open", "In Progress", "Resolved", "Reject", "On Hold"];
  const severityOptions = ["Low", "Moderate", "High", "Critical"];
  const availableAssignees = ["Maintenance Team Alpha", "IT Team Beta", "Plumbing Team", "Safety Team", "Unassigned"];

  const handleSave = () => {
    // In a real app, you would send these updates to your backend
    console.log("Saving updates for report:", report.id);
    console.log("New Status:", currentStatus);
    console.log("New Department:", currentDepartment);
    console.log("New Severity:", currentSeverity);
    console.log("New Assigned To:", currentAssignedTo);
    if (newComment) {
      console.log("New Comment:", newComment);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {/* ...rest of your dialog JSX here... */}
      </DialogContent>
    </Dialog>
  );
}


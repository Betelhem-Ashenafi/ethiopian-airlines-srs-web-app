"use client"

import { useState, useEffect } from "react"
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
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [fetched, setFetched] = useState<Partial<Report> | null>(null)
  const isEmployee = false; // Replace with actual logic if needed
  const departmentOptions = ["Facility Maintenance", "IT Support", "Plumbing", "Safety", "Other"];
  const statusOptions = ["Open", "In Progress", "Resolved", "Reject", "On Hold"];
  const severityOptions = ["Low", "Moderate", "High", "Critical"];
  const availableAssignees = ["Maintenance Team Alpha", "IT Team Beta", "Plumbing Team", "Safety Team", "Unassigned"];

  const handleSave = () => {
    // In a real app, you would send these updates to your backend
    console.log("Saving updates for report:", report.id)
    console.log("New Status:", currentStatus)
    console.log("New Department:", currentDepartment)
    console.log("New Severity:", currentSeverity)
    console.log("New Assigned To:", currentAssignedTo)
    if (newComment) console.log("New Comment:", newComment)
  };

  // Fetch latest details when dialog opens or report id changes
  useEffect(() => {
    let mounted = true
    async function loadDetails() {
      if (!isOpen || !report?.id) return
      setLoadingDetails(true)
      setDetailsError(null)
      try {
        const res = await fetch(`/api/reports/reports/Details/${report.id}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const json = await res.json()
        const data = json?.data || json?.Data || json
        if (!mounted) return
        // Map backend swagger fields to our Report shape
        const mapped: Partial<Report> = {
          id: data.reportID ?? data.ReportID ?? report.id,
          title: data.title ?? data.Title ?? report.title,
          description: data.description ?? data.Description ?? report.description,
          imageUrl: data.imagePath ?? data.ImagePath ?? report.imageUrl,
          gpsCoordinates: (data.latitude != null && data.longitude != null) ? `${data.latitude},${data.longitude}` : report.gpsCoordinates,
          locationName: data.locationName ?? data.LocationName ?? report.locationName,
          timestamp: data.timestamp ?? data.Timestamp ?? report.timestamp,
          submittedByName: data.submittedByName ?? data.SubmittedByName ?? report.submittedByName,
          aiDepartment: data.department ?? data.Department ?? report.aiDepartment,
          departmentName: data.department ?? data.Department ?? report.departmentName,
          aiSeverity: data.severity ?? data.Severity ?? report.aiSeverity,
          severityName: data.severity ?? data.Severity ?? report.severityName,
          status: data.status ?? data.Status ?? report.status,
          statusName: data.status ?? data.Status ?? report.statusName,
          syncStatus: data.syncStatus ?? data.SyncStatus ?? report.syncStatus,
        }
        setFetched(mapped)
  // initialize current form values from mapped data
  setCurrentStatus((mapped.status ?? mapped.statusName ?? currentStatus) as any)
  setCurrentDepartment((mapped.aiDepartment ?? mapped.departmentName ?? currentDepartment) as any)
  setCurrentSeverity(((mapped.aiSeverity ?? mapped.severityName) as any) ?? currentSeverity)
      } catch (e: any) {
        if (!mounted) return
        setDetailsError(e?.message ?? 'Failed to load details')
      } finally {
        if (mounted) setLoadingDetails(false)
      }
    }
    loadDetails()
    return () => { mounted = false }
  }, [isOpen, report?.id])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {/* ...rest of your dialog JSX here... */}
      </DialogContent>
    </Dialog>
  );
}


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
  // Local detailed state loaded from backend details endpoint
  const [detailed, setDetailed] = useState<null | {
    reportID: string
    title: string
    description: string
    submittedByName?: string
    imagePath?: string
    latitude?: number
    longitude?: number
    locationName?: string
    status?: string
    syncStatus?: string
    department?: string
    severity?: string
    timestamp?: string
  }>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentStatus, setCurrentStatus] = useState<string>(report.status || report.statusName || "Open");
  const [currentDepartment, setCurrentDepartment] = useState<string>(report.aiDepartment || report.departmentName || "");
  const [currentSeverity, setCurrentSeverity] = useState<string>(report.aiSeverity || report.severityName || "Low");
  const [newComment, setNewComment] = useState("");

  // Basic dropdown options (could be replaced by API-driven lists)
  const departmentOptions = ["Facility Maintenance", "IT Support", "Plumbing", "Safety", "Other"];
  const statusOptions = ["Open", "In Progress", "Resolved", "Reject", "On Hold", "Closed"];
  const severityOptions = ["Low", "Moderate", "High", "Critical"];

  useEffect(() => {
    // Reset when dialog closes
    if (!isOpen) {
      setDetailed(null)
      setError(null)
      setLoading(false)
      setNewComment("")
      setCurrentStatus(report.status || report.statusName || "Open")
      setCurrentDepartment(report.aiDepartment || report.departmentName || "")
      setCurrentSeverity(report.aiSeverity || report.severityName || "Low")
      return
    }

    // Fetch detailed report from backend when opening
    let aborted = false
    async function loadDetails() {
      if (!report?.id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/reports/reports/Details/${report.id}`, { credentials: 'include' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load report details: ${res.status}`)
        }
        const json = await res.json()
        // swagger sample returns { message: "Report retrieved successfully", data: { ... } }
        const data = json.data ?? json.Data ?? json
        if (!aborted) {
          setDetailed(data)
          // prefer detailed values when available
          setCurrentStatus(data.status ?? currentStatus)
          setCurrentDepartment((data.department as string) ?? currentDepartment)
          setCurrentSeverity((data.severity as string) ?? currentSeverity)
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? String(e))
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    loadDetails()
    return () => { aborted = true }
  }, [isOpen, report])

  const handleSave = () => {
    // In a real app, send updates to backend (PATCH/PUT). For now just log and close.
    console.log("Saving updates for report:", report.id)
    console.log("New Status:", currentStatus)
    console.log("New Department:", currentDepartment)
    console.log("New Severity:", currentSeverity)
    if (newComment) console.log("New Comment:", newComment)
    // Optionally close dialog after save
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detailed?.title ?? report.title ?? "Report Details"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {detailed?.submittedByName ?? report.submittedByName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-6">Loading report details...</div>
        ) : error ? (
          <div className="p-6 text-red-500">Error loading details: {error}</div>
        ) : (
          <div className="p-4 grid gap-4">
            { (detailed?.imagePath ?? report.imageUrl) && (
              <div className="w-full h-48 relative rounded overflow-hidden">
                <Image src={(detailed?.imagePath ?? report.imageUrl) as string} alt="report image" fill style={{ objectFit: 'cover' }} />
              </div>
            ) }

            <div>
              <Label>Title</Label>
              <div className="text-lg font-medium">{detailed?.title ?? report.title}</div>
            </div>

            <div>
              <Label>Description</Label>
              <div className="whitespace-pre-wrap">{detailed?.description ?? report.description}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={currentStatus} onValueChange={(v) => setCurrentStatus(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={currentDepartment} onValueChange={(v) => setCurrentDepartment(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={currentSeverity} onValueChange={(v) => setCurrentSeverity(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {severityOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <div>{detailed?.locationName ?? report.locationName}</div>
            </div>

            <div>
              <Label>Coordinates</Label>
              <div>{(detailed?.latitude ?? undefined) !== undefined ? `${detailed?.latitude}, ${detailed?.longitude}` : report.gpsCoordinates}</div>
            </div>

            <div>
              <Label>Timestamp</Label>
              <div>{new Date(detailed?.timestamp ?? report.timestamp).toLocaleString()}</div>
            </div>

            <Separator />

            <div>
              <Label>Add comment</Label>
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Close</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


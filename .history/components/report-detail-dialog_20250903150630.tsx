"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Label } from "@/components/ui/label"
import { fetchStatusDropdown, fetchDepartmentsDropdown, fetchSeveritiesDropdown } from '@/lib/dropdowns'
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
  const [imageError, setImageError] = useState(false)
  const isEmployee = false; // Replace with actual logic if needed
  const { user } = useAuth()
  const normalizedRole = (user?.role ?? "").toLowerCase().replace(" ", "")
  const isSystemAdmin = normalizedRole === "systemadmin" || normalizedRole === "sysadmin"
  const [statusDropdown, setStatusDropdown] = useState<{id:string,name:string}[]>([])
  const [departmentDropdown, setDepartmentDropdown] = useState<{id:string,name:string}[]>([])
  const [severityDropdown, setSeverityDropdown] = useState<{id:string,name:string}[]>([])
  const isDepartmentAdmin = normalizedRole === "departmentadmin" || normalizedRole === "deptadmin"
  const departmentOptions = ["Facility Maintenance", "IT Support", "Plumbing", "Safety", "Other"];

  const handleSave = async () => {
    try {
      const payload: any = {
        reportID: report.id,
        statusID: resolveOptionId(currentStatus, statusDropdown),
        statusName: resolveOptionName(currentStatus, statusDropdown) ?? currentStatus,
        departmentID: resolveOptionId(currentDepartment, departmentDropdown),
        departmentName: resolveOptionName(currentDepartment, departmentDropdown) ?? currentDepartment,
        severityID: resolveOptionId(currentSeverity, severityDropdown),
        severityName: resolveOptionName(currentSeverity, severityDropdown) ?? currentSeverity,
        comment: newComment || undefined,
      }
      const res = await fetch('/api/reports/UpdateReport', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `${res.status}`)
      }
      const json = await res.json()
      const updated = json?.data || json || {}
      setFetched(prev => ({ ...prev, ...mapBackendToPartialReport(updated) }))
    } catch (err: any) {
      console.error('Save failed', err)
      setDetailsError(err?.message ?? 'Save failed')
    }
  }

  const handleSend = async () => {
    if (!isSystemAdmin) return setDetailsError('Only System Admin can send reports')
    try {
      const payload = {
        reportID: report.id,
        departmentID: resolveOptionId(currentDepartment, departmentDropdown),
        departmentName: resolveOptionName(currentDepartment, departmentDropdown) ?? currentDepartment,
        comment: newComment || undefined,
      }
      const res = await fetch('/api/reports/SendReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `${res.status}`)
      }
      const json = await res.json()
      setFetched(prev => ({ ...prev, syncStatus: 'Sent' }))
    } catch (err: any) {
      console.error('Send failed', err)
      setDetailsError(err?.message ?? 'Send failed')
    }
  }

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

  // Load dropdown options when dialog opens
  useEffect(() => {
    let mounted = true
    async function loadDropdowns() {
      try {
        const [statuses, depts, sevs] = await Promise.all([
          fetchStatusDropdown().catch(() => []),
          fetchDepartmentsDropdown().catch(() => []),
          fetchSeveritiesDropdown().catch(() => []),
        ])
        if (!mounted) return
        setStatusDropdown(statuses)
        setDepartmentDropdown(depts)
        setSeverityDropdown(sevs)
      } catch (e) {
        // ignore
      }
    }
    if (isOpen) loadDropdowns()
    return () => { mounted = false }
  }, [isOpen])

  // helpers to resolve option id/name
  function resolveOptionId(value: string, options: {id:string,name:string}[]) {
    if (!value) return undefined
    const byId = options.find(o => o.id === value)
    if (byId) return byId.id
    const byName = options.find(o => (o.name ?? '').toLowerCase() === value.toLowerCase())
    if (byName) return byName.id
    return value
  }
  function resolveOptionName(value: string, options: {id:string,name:string}[]) {
    if (!value) return undefined
    const byId = options.find(o => o.id === value)
    if (byId) return byId.name
    const byName = options.find(o => (o.name ?? '').toLowerCase() === value.toLowerCase())
    if (byName) return byName.name
    return value
  }

  function mapBackendToPartialReport(data: any): Partial<Report> {
    if (!data) return {}
    return {
      id: data.reportID ?? data.ReportID,
      title: data.title ?? data.Title,
      description: data.description ?? data.Description,
      imageUrl: data.imagePath ?? data.ImagePath,
      gpsCoordinates: (data.latitude != null && data.longitude != null) ? `${data.latitude},${data.longitude}` : undefined,
      locationName: data.locationName ?? data.LocationName,
      timestamp: data.timestamp ?? data.Timestamp,
      submittedByName: data.submittedByName ?? data.SubmittedByName,
      aiDepartment: data.department ?? data.Department,
      departmentName: data.department ?? data.Department,
      aiSeverity: data.severity ?? data.Severity,
      severityName: data.severity ?? data.Severity,
      status: data.status ?? data.Status,
      statusName: data.status ?? data.Status,
      syncStatus: data.syncStatus ?? data.SyncStatus,
    }
  }
    }
    loadDetails()
    return () => { mounted = false }
  }, [isOpen, report?.id])
  const statusEditable = isSystemAdmin || isDepartmentAdmin
  const deptEditable = isSystemAdmin
  const severityEditable = isSystemAdmin

  // compute image source via proxy when available
  const rawImageUrl = fetched?.imageUrl ?? report.imageUrl
  const proxiedImageSrc = rawImageUrl ? `/api/proxy/image?url=${encodeURIComponent(rawImageUrl)}` : undefined

  // derive friendlier option lists for selects from dropdown data (fallback to defaults)
  const displayStatusOptions = statusDropdown && statusDropdown.length ? statusDropdown.map(s => s.name) : ["Open", "In Progress", "Resolved", "Reject", "On Hold"]
  const displaySeverityOptions = severityDropdown && severityDropdown.length ? severityDropdown.map(s => s.name) : ["Low", "Moderate", "High", "Critical"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fetched?.title ?? report.title}</DialogTitle>
          <DialogDescription>
            Report ID: {fetched?.id ?? report.id} • {new Date(fetched?.timestamp ?? report.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {detailsError && <div className="text-red-500">Error loading details: {detailsError}</div>}
          {loadingDetails && <div>Loading details...</div>}

          <div className="flex gap-4">
            <div className="w-48 h-32 bg-gray-100 rounded overflow-hidden">
              { proxiedImageSrc && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxiedImageSrc}
                  alt="report image"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : imageError ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Image failed to load</div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No image</div>
              ) }
            </div>

            <div className="flex-1">
              <div className="mb-2 text-sm text-muted-foreground">Submitted by: {fetched?.submittedByName ?? report.submittedByName}</div>
              <div className="mb-2 text-sm">Department (AI-assigned): <strong>{fetched?.aiDepartment ?? fetched?.departmentName ?? report.aiDepartment ?? report.departmentName ?? 'Unknown'}</strong></div>
              <div className="mb-2 text-sm">Location: <strong>{fetched?.locationName ?? report.locationName ?? 'Unknown'}</strong></div>
              <div className="mb-2 text-sm">GPS: <strong>{fetched?.gpsCoordinates ?? report.gpsCoordinates ?? 'Unknown'}</strong></div>
              <div className="mb-4 text-sm whitespace-pre-wrap">{fetched?.description ?? report.description ?? 'No description'}</div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Status</Label>
                  <Select value={currentStatus} onValueChange={(v) => setCurrentStatus(v as any)} disabled={!statusEditable}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {displayStatusOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Department</Label>
                  <Select value={currentDepartment} onValueChange={(v) => setCurrentDepartment(v as any)} disabled={!deptEditable}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {/* include AI assigned department option first so it displays */}
                      {currentDepartment && !(departmentDropdown || []).some(dd => dd.name === currentDepartment) ? (
                        <SelectItem key={currentDepartment} value={currentDepartment}>{currentDepartment}</SelectItem>
                      ) : null}
                      {(departmentDropdown && departmentDropdown.length ? departmentDropdown.map(d => d.name) : departmentOptions).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Severity</Label>
                  <Select value={currentSeverity} onValueChange={(v) => setCurrentSeverity(v as any)} disabled={!severityEditable}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentSeverity && !(severityDropdown || []).some(sd => sd.name === currentSeverity) ? (
                        <SelectItem key={currentSeverity} value={currentSeverity}>{currentSeverity}</SelectItem>
                      ) : null}
                      {(severityDropdown && severityDropdown.length ? severityDropdown.map(s => s.name) : severityOptions).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label>New comment</Label>
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dev debug: raw JSON to inspect what we received from the backend */}
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer">Raw fetched data (toggle)</summary>
            <pre className="whitespace-pre-wrap bg-slate-50 p-2 rounded mt-1 text-[11px]">{JSON.stringify(fetched ?? report, null, 2)}</pre>
          </details>

          <div className="text-sm text-muted-foreground">Sync status: <strong>{fetched?.syncStatus ?? report.syncStatus ?? 'Unknown'}</strong></div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


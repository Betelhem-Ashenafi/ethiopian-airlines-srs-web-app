"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Label } from "@/components/ui/label"
import { fetchStatusDropdown, fetchDepartmentsDropdown, fetchSeveritiesDropdown, fetchLocationsDropdown } from '@/lib/dropdowns'
import { fetchReportDetail, postReportAction, fetchReportComments, addReportComment } from '@/lib/reports'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Report } from "@/lib/data"

interface ReportDetailDialogProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (changes: Partial<Report> & { id: string }) => void; // notify parent of field changes
}

export default function ReportDetailDialog({ report, isOpen, onClose, onUpdate }: ReportDetailDialogProps) {
  // Auth / role helpers (simplified; adjust as needed)
  const { user } = useAuth();
  const isSystemAdmin = user?.role === 'System Admin';
  const isDepartmentAdmin = user?.role === 'Department Admin';

  // Core state
  const [fetched, setFetched] = useState<Partial<Report> | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Dropdown data state
  const [statusDropdown, setStatusDropdown] = useState<{id:string,name:string}[]>([]);
  const [departmentDropdown, setDepartmentDropdown] = useState<{id:string,name:string}[]>([]);
  const [severityDropdown, setSeverityDropdown] = useState<{id:string,name:string}[]>([]);
  const [locationDropdown, setLocationDropdown] = useState<{id:string,name:string}[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Editable form fields (initialize from report)
  const [currentDepartment, setCurrentDepartment] = useState(report.aiDepartment || report.departmentName || '');
  const [currentSeverity, setCurrentSeverity] = useState(report.aiSeverity || report.severityName || 'Low');
  const [currentStatus, setCurrentStatus] = useState(report.status || report.statusName || 'Open');
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(report.comments || []);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [imageError, setImageError] = useState(false);
  const editingDepartment = false; // not used currently

  // Save changes (fields + comment)
  async function handleSave() {
    setSubmitting(true);
    setSaveMessage(null);
    try {
      await postReportAction(report.id, 'save', {
        department: currentDepartment,
        severity: currentSeverity,
        status: currentStatus,
      });
      const appliedChanges = {
        id: report.id,
        status: currentStatus,
        statusName: currentStatus,
        aiSeverity: currentSeverity as any,
        severityName: currentSeverity,
        aiDepartment: currentDepartment,
        departmentName: currentDepartment,
      } as Partial<Report> & { id: string };
      if (newComment.trim()) {
        try {
          const added = await addReportComment(report.id, newComment.trim(), user?.fullName || 'You')
          setComments(prev => [...prev, added.comment])
          setNewComment("")
        } catch (e) {
          // fallback optimistic add
          setComments(prev => [...prev, { author: user?.fullName || 'You', timestamp: new Date().toISOString(), text: newComment.trim() }])
          setNewComment("")
        }
      }
      setDetailsError(null);
      setSaveMessage('Saved');
      setHasSaved(true);
      setDirty(false);
      onUpdate?.(appliedChanges);
    } catch (e: any) {
      setDetailsError(e?.message ?? 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Save then send
  async function handleSend() {
    if (dirty || !hasSaved) {
      // ensure latest values persisted (handleSave will call onUpdate)
      await handleSave();
    }
    setSubmitting(true);
    try {
      await postReportAction(report.id, 'send', { department: currentDepartment });
      // final update ping (in case send changes status on backend; we mirror current values)
      onUpdate?.({
        id: report.id,
        status: currentStatus,
        statusName: currentStatus,
        aiSeverity: currentSeverity as any,
        severityName: currentSeverity,
        aiDepartment: currentDepartment,
        departmentName: currentDepartment,
      });
      setDetailsError(null);
      onClose();
    } catch (e: any) {
      setDetailsError(e?.message ?? 'Send failed');
    } finally {
      setSubmitting(false);
    }
  }

  // (department detail removed; settings managed in System Settings)
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

  // Load locations separately (may be optional in backend)
  useEffect(() => {
    let mounted = true
    async function loadLocations() {
      setLoadingLocations(true)
      try {
        const list = await fetchLocationsDropdown().catch(() => [])
        if (!mounted) return
        setLocationDropdown(list)
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoadingLocations(false)
      }
    }
    if (isOpen) loadLocations()
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
  // (clean end of helpers)
  
  // default fallback options for severity if dropdown not available
  const severityOptions = ["Low", "Moderate", "High", "Critical"];
  const baseDepartmentOptions = [
    'IT Support',
    'Facility Maintenance',
    'Electrical Maintenance',
    'Security',
    'Operations'
  ];
  // Determine list for dropdown: if Department Admin restrict to only their department
  const resolvedAllDeptNames = (departmentDropdown && departmentDropdown.length
    ? departmentDropdown.map(d => d.name)
    : baseDepartmentOptions);
  const departmentList = isDepartmentAdmin && user?.department
    ? [user.department]
    : resolvedAllDeptNames;

  // Force currentDepartment to user's department if they are Department Admin
  useEffect(() => {
    if (isDepartmentAdmin && user?.department && currentDepartment !== user.department) {
      setCurrentDepartment(user.department as any)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDepartmentAdmin, user?.department]);

  // Allow all roles to edit dropdowns (previously restricted to admins)
  const statusEditable = true
  const deptEditable = true
  const severityEditable = true

  // compute image source via proxy when available; robustly normalize URLs to avoid '//' issues
  // Note: if backend returns a relative path ("/images/..") we assume the image host is reachable
  // at https://172.20.97.149:7022 (internal image server). This is an inferred default and can
  // be adjusted if your environment uses a different image host.
  let rawImageUrl = fetched?.imageUrl ?? report.imageUrl
  if (rawImageUrl) {
    try {
      let tmp = rawImageUrl
      // protocol-relative (//host/...) -> assume https
      if (tmp.startsWith('//')) tmp = 'https:' + tmp
      // relative path (/images/...) -> prefix with internal image host (assumption)
      if (tmp.startsWith('/')) tmp = 'https://172.20.97.149:7022' + tmp
      const u = new URL(tmp)
      // collapse duplicate slashes in pathname (e.g. //images -> /images)
      u.pathname = u.pathname.replace(/\/{2,}/g, '/')
      rawImageUrl = u.toString()
    } catch (e) {
      // fallback: remove accidental duplicate slashes after the host portion
      rawImageUrl = rawImageUrl.replace(/([^:]\/)(\/)+/g, '$1')
    }
  }
  const proxiedImageSrc = rawImageUrl ? `/api/proxy/image?url=${encodeURIComponent(rawImageUrl)}` : undefined

  // derive friendlier option lists for selects from dropdown data (fallback to defaults)
  const displayStatusOptions = statusDropdown && statusDropdown.length ? statusDropdown.map(s => s.name) : ["Open", "In Progress", "Resolved", "Reject", "On Hold"]
  const displaySeverityOptions = severityDropdown && severityDropdown.length ? severityDropdown.map(s => s.name) : ["Low", "Moderate", "High", "Critical"]
  useEffect(() => {
    setHasSaved(false);
    setDirty(true);
    setSaveMessage(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDepartment, currentSeverity, currentStatus]);

  useEffect(() => {
    if (newComment.trim().length > 0) {
      setHasSaved(false);
      setDirty(true);
      setSaveMessage(null);
    }
  }, [newComment]);

  // Load comments when dialog opens
  useEffect(() => {
    let mounted = true
    async function loadComments() {
      if (!isOpen) return
      try {
        const data = await fetchReportComments(report.id)
        if (!mounted) return
        setComments(data.comments || [])
      } catch (e) {
        // ignore
      }
    }
    loadComments()
    return () => { mounted = false }
  }, [isOpen, report.id])

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
                {/* Department Details removed - managed in System Settings */}
                <div className="mb-2 text-sm">
                  Location: {
                    (locationDropdown && locationDropdown.length) ? (
                      <span>
                        <Select value={fetched?.locationName ?? report.locationName ?? ""} onValueChange={() => { /* read-only select for display */ }}>
                          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {locationDropdown.map(l => (
                              <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </span>
                    ) : (
                      <strong>{fetched?.locationName ?? report.locationName ?? 'Unknown'}</strong>
                    )
                  }
                </div>
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
                        {departmentList.map(d => (
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
                        {(severityDropdown && severityDropdown.length ? severityDropdown.map(s => s.name) : severityOptions).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator />





            <div className="space-y-2">
              <Label htmlFor="internalComment">Internal Comment</Label>
              <Textarea
                id="internalComment"
                placeholder="Add internal comment then click Save"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              {saveMessage && !detailsError && <div className="text-xs text-green-600">{saveMessage}</div>}
              {comments.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2 space-y-2 bg-muted/30 text-xs">
                  {comments.map((c, i) => (
                    <div key={i} className="leading-snug">
                      <span className="font-semibold">{c.author}</span> • {new Date(c.timestamp).toLocaleString()}<br />
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground">Save before Send. Unsaved changes disable Send.</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>Close</Button>
              <Button
                variant="secondary"
                onClick={handleSend}
                disabled={submitting || (dirty && !hasSaved)}
                aria-disabled={submitting || (dirty && !hasSaved)}
              >
                {submitting ? 'Working...' : (dirty && !hasSaved ? 'Save first to Send' : 'Send report')}
              </Button>
              <Button onClick={handleSave} disabled={submitting || !dirty}>
                {submitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}


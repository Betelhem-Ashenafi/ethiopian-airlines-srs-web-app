"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchReports, fetchReportDetail, postReportAction } from "@/lib/reports";
import type { Report } from "@/lib/data";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchStatusDropdown, fetchDepartmentsDropdown, fetchSeveritiesDropdown, fetchLocationsDropdown } from "@/lib/dropdowns";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const isSystemAdmin = user?.role === 'System Admin';
  const isDepartmentAdmin = user?.role === 'Department Admin';

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusDropdown, setStatusDropdown] = useState<{id:string,name:string}[]>([]);
  const [departmentDropdown, setDepartmentDropdown] = useState<{id:string,name:string}[]>([]);
  const [severityDropdown, setSeverityDropdown] = useState<{id:string,name:string}[]>([]);
  const [locationDropdown, setLocationDropdown] = useState<{id:string,name:string}[]>([]);

  const [currentDepartment, setCurrentDepartment] = useState("");
  const [currentSeverity, setCurrentSeverity] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Report["comments"]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      try {
        // fetch single report detail (fallback to list if needed)
        const raw = await fetchReportDetail(id).catch(async () => {
          const list = await fetchReports();
          return list.find(r => r.id === id) as any;
        });
        if (!raw) throw new Error("Report not found");
        setReport(raw as Report);
        setCurrentDepartment((raw.departmentName || raw.aiDepartment) ?? "");
        setCurrentSeverity((raw.severityName || raw.aiSeverity) ?? "Low");
        setCurrentStatus((raw.statusName || raw.status) ?? "Open");
        setComments(raw.comments || []);
      } catch (e:any) {
        setError(e.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function loadDropdowns() {
      try {
        const [statuses, depts, sevs, locs] = await Promise.all([
          fetchStatusDropdown().catch(() => []),
          fetchDepartmentsDropdown().catch(() => []),
          fetchSeveritiesDropdown().catch(() => []),
          fetchLocationsDropdown().catch(() => []),
        ]);
        if (!mounted) return;
        setStatusDropdown(statuses);
        setDepartmentDropdown(depts);
        setSeverityDropdown(sevs);
        setLocationDropdown(locs);
      } catch {}
    }
    loadDropdowns();
    return () => { mounted = false };
  }, []);

  async function handleSave() {
    if (!report) return;
    setSubmitting(true);
    setSaveMessage(null);
    try {
      await postReportAction(report.id, 'save', { department: currentDepartment, severity: currentSeverity, status: currentStatus, comment: newComment || undefined });
      if (newComment.trim()) {
        setComments(prev => [...prev, { author: user?.fullName || 'You', timestamp: new Date().toISOString(), text: newComment.trim() }]);
        setNewComment("");
      }
      setSaveMessage('Saved');
    } catch (e:any) {
      setError(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSend() {
    if (!report) return;
    setSubmitting(true);
    setSaveMessage(null);
    try {
      await postReportAction(report.id, 'save', { department: currentDepartment, severity: currentSeverity, status: currentStatus, comment: newComment || undefined });
      if (newComment.trim()) {
        setComments(prev => [...prev, { author: user?.fullName || 'You', timestamp: new Date().toISOString(), text: newComment.trim() }]);
        setNewComment("");
      }
      await postReportAction(report.id, 'send', {});
      router.back();
    } catch (e:any) {
      setError(e.message || 'Send failed');
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!report) return <div className="p-4">Not found</div>;

  const statusEditable = isSystemAdmin || isDepartmentAdmin;
  const deptEditable = isSystemAdmin;
  const severityEditable = isSystemAdmin;

  const displayStatusOptions = statusDropdown.length ? statusDropdown.map(s => s.name) : ["Open","In Progress","Resolved","Reject","On Hold"];
  const displaySeverityOptions = severityDropdown.length ? severityDropdown.map(s => s.name) : ["Low","Moderate","High","Critical"];
  const departmentOptions = departmentDropdown.length ? departmentDropdown.map(d => d.name) : ["IT Support","Facility Maintenance","Electrical Maintenance","Security","Operations"]; 

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Report {report.id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          {isSystemAdmin && <Button variant="secondary" onClick={handleSend} disabled={submitting}>{submitting ? 'Sending...' : 'Send'}</Button>}
          <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
      {saveMessage && <div className="text-green-600 text-sm">{saveMessage}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h2 className="font-medium mb-1">Title</h2>
            <p>{report.title}</p>
          </div>
          <div>
            <h2 className="font-medium mb-1">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{report.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={currentStatus} onValueChange={v => setCurrentStatus(v)} disabled={!statusEditable}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {displayStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={currentDepartment} onValueChange={v => setCurrentDepartment(v)} disabled={!deptEditable}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={currentSeverity} onValueChange={v => setCurrentSeverity(v)} disabled={!severityEditable}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {displaySeverityOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="comment">Internal Comment</Label>
            <Textarea id="comment" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add internal comment then Save" />
            {comments.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded p-2 text-xs space-y-2 bg-muted/30">
                {comments.map((c,i) => (
                  <div key={i} className="leading-snug">
                    <span className="font-semibold">{c.author}</span> • {new Date(c.timestamp).toLocaleString()}<br />
                    {c.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium mb-1">Metadata</h2>
            <p className="text-xs text-muted-foreground">Submitted: {new Date(report.timestamp).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Submitted By: {report.submittedByName || report.submittedBy}</p>
            <p className="text-xs text-muted-foreground">Location: {report.locationName || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">GPS: {report.gpsCoordinates}</p>
          </div>
          <div>
            <h2 className="font-medium mb-1">Location (read-only)</h2>
            {locationDropdown.length ? (
              <Select value={report.locationName || ''} onValueChange={() => {}} disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {locationDropdown.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm">{report.locationName || 'Unknown'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

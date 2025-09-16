import type { Report } from "./data";

// Post an action (save, send, comment) to a report detail
export async function postReportAction(id: string, action: string, fields: { department?: string; severity?: string; status?: string; comment?: string }) {
	const res = await fetch(`/api/reports/detail/${id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ action, ...fields })
	});
	if (!res.ok) throw new Error("Failed to post report action");
	return await res.json();
}
// Fetch a single report detail by ID (includes comments/meta from proxy+cache)
export async function fetchReportDetail(id: string) {
	const res = await fetch(`/api/reports/detail/${id}`, {
		credentials: "include"
	});
	if (!res.ok) throw new Error("Failed to fetch report detail");
	const data = await res.json();
	// unify shape: ensure comments array present
	if (!Array.isArray(data.comments)) data.comments = [];
	return data;
}
// Toggle report active status
/*export async function toggleReportActive(id: string, isActive: boolean): Promise<{ success: boolean }> {
	const res = await fetch("/api/reports/active", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id, isActive }),
		credentials: "include"
	});
	if (!res.ok) return { success: false };
	return { success: true };
}
import { type Report } from "./data"*/

// Fetch severities from backend and return a map of ID to name

export async function fetchSeverities(): Promise<{ [id: string]: string }> {
		const res = await fetch("/api/severity", { credentials: "include" });
		if (!res.ok) throw new Error("Failed to fetch severities");
		const response = await res.json();
		const severities: { [id: string]: string } = {};
		(response.Data || []).forEach((s: any) => {
			severities[s.SeverityID] = s.SeverityName;
		});
		return severities;
}

// Fetch reports from backend via Next.js rewrite

export async function fetchReports(departmentName?: string): Promise<Report[]> {
 	// Allow optionally requesting reports scoped to a department (backend may use auth too)
 	let url = "/api/reports/GetAllReports";
 	if (departmentName) url += `?departmentName=${encodeURIComponent(departmentName)}`;
 	const res = await fetch(url, {
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to fetch reports");
	const backendData = await res.json();

	// If backendData is an array, use it. If it's an object, use backendData.reports or backendData.data
	// Backend returns an object { Message, Count, Data }
	const backendReports = Array.isArray(backendData)
		? backendData
		: backendData.Data || backendData.data || backendData.reports || [];

	return backendReports.map((r: any) => {
		// Handle both flat PascalCase fields and nested objects returned by different endpoints
		const statusName = r.StatusName ?? r.statusName ?? r.Status?.StatusName ?? r.status?.StatusName ?? r.status?.statusName ?? "";
		const severityName = r.SeverityName ?? r.severityName ?? r.Severity?.SeverityName ?? r.severity?.SeverityName ?? r.severity?.severityName ?? "";
		const deptName = r.DepartmentName ?? r.departmentName ?? r.Department?.DepartmentName ?? r.department?.DepartmentName ?? r.department?.departmentName ?? "";
		const locationName = r.LocationName ?? r.locationName ?? r.Location?.LocationName ?? r.location?.LocationName ?? r.location?.locationName ?? "";

		// Map numeric lat/long if present
		const lat = r.Latitude ?? r.latitude ?? r.latitudeDeg ?? r.lat;
		const lon = r.Longitude ?? r.longitude ?? r.longitudeDeg ?? r.lon;

		return {
			id: (r.ReportID ?? r.reportID ?? r.id)?.toString?.() ?? "",
			title: r.Title ?? r.title ?? "",
			description: r.Description ?? r.description ?? "",
			imageUrl: r.ImagePath ?? r.imagePath ?? r.ImageUrl ?? r.imageUrl ?? "",
			gpsCoordinates: lat != null && lon != null ? `${lat},${lon}` : `${r.gpsCoordinates ?? ""}`,
			locationName: locationName || (r.locationName ?? ""),
			timestamp: r.Timestamp ?? r.timestamp ?? r.timeStamp ?? new Date().toISOString(),
			submittedBy: (r.SubmittedBy ?? r.submittedBy ?? r.submittedById ?? r.submittedByUser)?.toString?.() ?? "",
			submittedByName: r.SubmittedByName ?? r.submittedByName ?? r.submittedByFullName ?? "",
			departmentName: deptName,
			aiDepartment: deptName,
			aiSeverity: (severityName as any) || "Low",
			severityName: severityName,
			status: (statusName as any) || "Open",
			statusName: statusName,
			statusId: (r.StatusID ?? r.statusID ?? r.Status?.StatusID ?? r.status?.StatusID ?? r.Status?.Id ?? r.status?.Id)?.toString?.() ?? "",
			severityId: (r.SeverityID ?? r.severityID ?? r.Severity?.SeverityID ?? r.severity?.SeverityID ?? r.Severity?.Id ?? r.severity?.Id)?.toString?.() ?? "",
			departmentId: (r.DepartmentID ?? r.departmentID ?? r.Department?.DepartmentID ?? r.department?.DepartmentID ?? r.Department?.Id ?? r.department?.Id)?.toString?.() ?? "",
			syncStatus: r.syncStatus ?? r.SyncStatus ?? r.syncstatus ?? "",
			assignedTo: r.AssignedTo ?? r.assignedTo ?? undefined,
			comments: Array.isArray(r.comments) ? r.comments : [],
		};
	});
}

// Client helpers for exporting reports
export async function exportReportsPDF(): Promise<Blob> {
	const res = await fetch('/api/reports/export/pdf', { method: 'GET', credentials: 'include' });
	if (!res.ok) throw new Error('Failed to export PDF');
	return await res.blob();
}

export async function exportReportsExcel(): Promise<Blob> {
	const res = await fetch('/api/reports/export/excel', { method: 'GET', credentials: 'include' });
	if (!res.ok) throw new Error('Failed to export Excel');
	return await res.blob();
}

// ...new comment functions...
export async function addReportComment(id: string, text: string, author?: string) {
	const res = await fetch(`/api/Comments`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ reportId: id, text, author }),
		credentials: 'include'
	});
	if (!res.ok) throw new Error('Failed to add comment');
	return res.json();
}

export async function fetchReportComments(id: string) {
	const res = await fetch(`/api/Comments/report/${id}`, { credentials: 'include' });
	let primary: any = { reportId: id, comments: [] }
	if (res.ok) {
		try { primary = await res.json() } catch {}
	}
	// Fallback: legacy meta store on detail endpoint may still hold earlier comments
	if ((!primary.comments || primary.comments.length === 0)) {
		try {
			const legacyRes = await fetch(`/api/reports/detail/${id}`, { credentials: 'include' })
			if (legacyRes.ok) {
				const legacy = await legacyRes.json()
				if (Array.isArray(legacy.comments) && legacy.comments.length) {
					primary.comments = legacy.comments
				}
			}
		} catch { /* ignore */ }
	}
	// Sort by timestamp ascending
	if (Array.isArray(primary.comments)) {
		primary.comments.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
	}
	return primary;
}


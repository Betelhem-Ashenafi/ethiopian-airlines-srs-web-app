import { type Report } from "./data"

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
export async function fetchReports(): Promise<Report[]> {
		const res = await fetch("/api/reports/GetAllReports", {
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
		const departmentName = r.DepartmentName ?? r.departmentName ?? r.Department?.DepartmentName ?? r.department?.DepartmentName ?? r.department?.departmentName ?? "";
		const locationName = r.LocationName ?? r.locationName ?? r.Location?.LocationName ?? r.location?.LocationName ?? r.location?.locationName ?? "";

		return {
			id: r.ReportID ?? r.reportID,
			title: r.Title ?? r.title,
			description: r.Description ?? r.description,
			imageUrl: r.ImagePath ?? r.imagePath,
			gpsCoordinates: `${r.Latitude ?? r.latitude},${r.Longitude ?? r.longitude}`,
			locationName: locationName,
			timestamp: r.Timestamp ?? r.timestamp,
			submittedBy: (r.SubmittedBy ?? r.submittedBy)?.toString() ?? "",
			submittedByName: r.SubmittedByName ?? r.submittedByName ?? "",
			// both raw and name fields for UI
			departmentName: departmentName,
			aiDepartment: departmentName,
			aiSeverity: severityName,
			severityName: severityName,
			status: statusName,
			statusName: statusName,
			// ID fields (stringified) for robust filtering by id
			statusId: (r.StatusID ?? r.statusID ?? r.Status?.StatusID ?? r.status?.StatusID ?? r.Status?.Id ?? r.status?.Id ?? r.Status?.ID ?? r.status?.ID)?.toString?.() ?? "",
			severityId: (r.SeverityID ?? r.severityID ?? r.Severity?.SeverityID ?? r.severity?.SeverityID ?? r.Severity?.Id ?? r.severity?.Id)?.toString?.() ?? "",
			departmentId: (r.DepartmentID ?? r.departmentID ?? r.Department?.DepartmentID ?? r.department?.DepartmentID ?? r.Department?.Id ?? r.department?.Id)?.toString?.() ?? "",
			syncStatus: r.syncStatus ?? "",
			assignedTo: undefined,
			comments: [],
		};
	});
}

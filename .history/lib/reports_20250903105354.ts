import { type Report } from "./data"

// Fetch severities from backend and return a map of ID to name
export async function fetchSeverities(): Promise<{ [id: string]: string }> {
		const res = await fetch("/api/Severity", { credentials: "include" });
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
	// DEBUG: log backend payload shape to help diagnose missing fields in UI
	console.log("DEBUG fetchReports backendData:", backendData);

	// If backendData is an array, use it. If it's an object, use backendData.reports or backendData.data
	// Backend returns an object { Message, Count, Data }
	const backendReports = Array.isArray(backendData)
		? backendData
		: backendData.Data || backendData.data || backendData.reports || [];

	return backendReports.map((r: any) => {
		const statusName = r.StatusName ?? r.status?.StatusName ?? r.status?.statusName ?? "";
		const severityName = r.SeverityName ?? r.severity?.SeverityName ?? r.severity?.severityName ?? "";
		const departmentName = r.DepartmentName ?? r.department?.DepartmentName ?? r.department?.departmentName ?? "";

		return {
			id: r.ReportID ?? r.reportID,
			title: r.Title ?? r.title,
			description: r.Description ?? r.description,
			imageUrl: r.ImagePath ?? r.imagePath,
			gpsCoordinates: `${r.Latitude ?? r.latitude},${r.Longitude ?? r.longitude}`,
			locationName: r.LocationName ?? r.location?.LocationName ?? r.location?.locationName ?? "",
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
			syncStatus: r.syncStatus ?? "",
			assignedTo: undefined,
			comments: [],
		};
	});
}

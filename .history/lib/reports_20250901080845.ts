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
	const res = await fetch("/api/reports/api/reports/data", {
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to fetch reports");
	const backendData = await res.json();

	// If backendData is an array, use it. If it's an object, use backendData.reports or backendData.data
	const backendReports = Array.isArray(backendData)
		? backendData
		: backendData.reports || backendData.data || [];

	return backendReports.map((r: any) => ({
		id: r.reportID,
		title: r.title,
		description: r.description,
		imageUrl: r.imagePath,
		gpsCoordinates: `${r.latitude},${r.longitude}`,
		locationName: r.location?.locationName ?? "",
		timestamp: r.timestamp,
		submittedBy: r.submittedBy?.toString() ?? "",
		submittedByName: r.submittedByName ?? "",
		departmentName: r.department?.departmentName ?? "",
		severityName: r.severity?.severityName ?? "",
		statusName: r.status?.statusName ?? "",
		syncStatus: r.syncStatus ?? "",
		assignedTo: undefined,
		comments: [],
	}));
}

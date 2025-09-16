import { type Report } from "./data"

// Fetch severities from backend and return a map of ID to name
export async function fetchSeverities(): Promise<{ [id: string]: string }> {
	const res = await fetch("/api/Severity", { credentials: "include" });
	if (!res.ok) throw new Error("Failed to fetch severities");
	const data = await res.json();
	const severities: { [id: string]: string } = {};
	(data.data || []).forEach((s: any) => {
		severities[s.severityID] = s.severityName;
	});
	return severities;
}

// Fetch reports from backend via Next.js rewrite
export async function fetchReports(): Promise<Report[]> {
	const res = await fetch("/api/reports", {
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
		selectedLocation: r.locationID?.toString() ?? "",
		timestamp: r.timestamp,
		submittedBy: r.submittedBy?.toString() ?? "",
		deviceInfo: undefined,
		aiDepartment: r.departmentID?.toString() ?? "",
		aiSeverity: r.severityID?.toString() ?? "",
		status: r.statusID?.toString() ?? "",
		assignedTo: undefined,
		comments: [],
	}));
}

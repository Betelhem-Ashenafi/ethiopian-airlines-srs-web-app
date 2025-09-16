import { type Report } from "./data"

// Fetch reports from backend via Next.js rewrite
export async function fetchReports(): Promise<Report[]> {
	const res = await fetch("/api/reports", {
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to fetch reports");
	const backendReports = await res.json();

	// Map backend fields to frontend Report type
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

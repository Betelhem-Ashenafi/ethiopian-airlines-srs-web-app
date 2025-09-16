/import { type Report } from "./data"

export async function fetchReports(): Promise<Report[]> {
	const res = await fetch("https://your-backend-url/api/reports")
	if (!res.ok) throw new Error("Failed to fetch reports")
	return await res.json()
}

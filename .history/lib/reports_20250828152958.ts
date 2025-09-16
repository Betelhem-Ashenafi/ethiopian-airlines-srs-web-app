import { type Report } from "./data"

// Fetch reports from backend via Next.js rewrite
export async function fetchReports(): Promise<Report[]> {
	const res = await fetch("/api/reports", {
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to fetch reports")
	return await res.json();
}

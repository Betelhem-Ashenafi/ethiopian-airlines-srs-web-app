// lib/dropdowns.ts

export async function fetchSeveritiesDropdown() {
  const res = await fetch("/api/Severity", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch severities");
  const response = await res.json();
  // Assuming response.Data is an array of severities
  return (response.Data || []).map((s: any) => ({
    id: s.SeverityID,
    name: s.SeverityName
  }));
}

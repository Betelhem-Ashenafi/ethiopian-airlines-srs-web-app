export async function fetchDepartmentsDropdown() {
  const res = await fetch("/api/Department/active", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch departments");
  const response = await res.json();
  // Use response.data for consistency (backend may use 'data' or 'Data')
  const departments = response.data || response.Data || [];
  return departments.map((d: any) => ({
    id: d.departmentID ?? d.DepartmentID,
    name: d.departmentName ?? d.DepartmentName
  }));
}
export async function fetchStatusDropdown() {
  const res = await fetch("/api/Status", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  const response = await res.json();
  // Use response.data for consistency
  const statuses = response.data || response.Data || [];
  return statuses.map((s: any) => ({
    id: s.statusID ?? s.StatusID,
    name: s.statusName ?? s.StatusName
  }));
}
// lib/dropdowns.ts

export async function fetchSeveritiesDropdown() {
  const res = await fetch("/api/Severity", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch severities");
  const response = await res.json();
  // Use response.data for consistency
  const severities = response.data || response.Data || [];
  return severities.map((s: any) => ({
    id: s.severityID ?? s.SeverityID,
    name: s.severityName ?? s.SeverityName
  }));
}

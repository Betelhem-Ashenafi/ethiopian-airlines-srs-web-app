export async function fetchDepartmentsDropdown() {
  // Try a few possible backend endpoints (active list first, then general)
  const endpoints = ["/api/department/active", "/api/department", "/api/department"];
  let departments: any[] | null = null;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { credentials: "include" });
      if (!res.ok) continue;
      const json = await res.json();
      // backend may return an array directly or an envelope { data|Data }
      const candidate = Array.isArray(json) ? json : json.data || json.Data || json.departments || json.Departments || null;
      // Accept candidate only if it contains items. If endpoint returned an empty array,
      // keep trying fallback endpoints (don't treat empty array as success).
      if (Array.isArray(candidate) && candidate.length > 0) {
        departments = candidate;
        break;
      }
    } catch (e) {
      // try next endpoint
      continue;
    }
  }

  if (!departments) return [];

  return departments.map((d: any) => ({
    id: (d.departmentID ?? d.DepartmentID ?? d.id ?? d.Id ?? d.ID)?.toString?.() ?? "",
    name: d.departmentName ?? d.DepartmentName ?? d.name ?? d.Name ?? ""
  }));
}
export async function fetchStatusDropdown() {
  const res = await fetch("/api/status", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  const response = await res.json();
  // Use response.data for consistency
  const statuses = response.data || response.Data || [];
  return statuses.map((s: any) => ({
  id: (s.statusID ?? s.StatusID ?? s.id ?? s.Id ?? s.ID)?.toString?.() ?? "",
  name: s.statusName ?? s.StatusName
  }));
}
// lib/dropdowns.ts

export async function fetchSeveritiesDropdown() {
  const res = await fetch("/api/severity", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch severities");
  const response = await res.json();
  // Use response.data for consistency
  const severities = response.data || response.Data || [];
  return severities.map((s: any) => ({
  id: (s.severityID ?? s.SeverityID ?? s.id ?? s.Id ?? s.ID)?.toString?.() ?? "",
  name: s.severityName ?? s.SeverityName
  }));
}

export async function fetchLocationsDropdown() {
  // Try a few possible backend endpoints (active list first, then general)
  const endpoints = ["/api/location/active", "/api/location", "/api/Location"];
  let locations: any[] | null = null;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { credentials: "include" });
      if (!res.ok) continue;
      const json = await res.json();
      const candidate = Array.isArray(json) ? json : json.data || json.Data || json.locations || json.Locations || null;
      // Accept candidate only if it contains items. If endpoint returned an empty array,
      // keep trying fallback endpoints (don't treat empty array as success).
      if (Array.isArray(candidate) && candidate.length > 0) {
        locations = candidate;
        break;
      }
    } catch (e) {
      // try next endpoint
      continue;
    }
  }

  if (!locations) return [];

  return locations.map((l: any) => ({
    id: (l.locationID ?? l.LocationID ?? l.id ?? l.Id ?? l.ID)?.toString?.() ?? "",
    name: l.locationName ?? l.LocationName ?? l.name ?? l.Name ?? ""
  }));
}

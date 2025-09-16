export async function fetchDepartmentsDropdown(user?: { department?: string; departmentId?: string | number }): Promise<{ id: string, name: string }[]> {
  const endpoints = ["/api/Department/active", "/api/department/active", "/api/Department", "/api/department"];
  let res: Response | null = null;
  let lastErr: any = null;

  for (const ep of endpoints) {
    try {
      res = await fetch(ep, { credentials: "include" });
      if (res.status === 401) {
        throw new Error("Unauthorized: Please log in to fetch departments.");
      }
      // Accept only successful responses with a body (allow empty array fallback)
      if (res.ok) break;
      // keep trying other endpoints on non-ok
      lastErr = `status ${res.status} from ${ep}`;
    } catch (e) {
      lastErr = e;
      res = null;
    }
  }

  if (!res || !res.ok) {
    console.error("[fetchDepartmentsDropdown] failed to fetch departments:", lastErr);
    return []; // safe fallback for the UI
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    const txt = await res.text().catch(() => "");
    console.error("[fetchDepartmentsDropdown] response parse failed:", txt);
    return [];
  }

  const departmentsRaw = (data?.Data || data?.data || data?.departments || data?.items || []);
  if (!Array.isArray(departmentsRaw)) {
    console.error("[fetchDepartmentsDropdown] unexpected payload shape:", departmentsRaw);
    return [];
  }

  const mapped = departmentsRaw.map((d: any, i: number) => ({
    id: String(d?.DepartmentID ?? d?.id ?? d?.ID ?? d?.Id ?? i ?? ""),
    // prefer DepartmentName then Name-like fields; fallback to a friendly label
    name: String(
      d?.DepartmentName ??
      d?.departmentName ??
      d?.name ??
      d?.Department ??
      d?.department ??
      ""
    ).trim() || `Department ${String(d?.DepartmentID ?? d?.id ?? i ?? "")}`,
  }));

  // prefer filtering by id if provided
  if ((user as any)?.departmentId) {
    const uid = String((user as any).departmentId);
    const found = mapped.filter(m => m.id === uid);
    return found.length ? found : mapped;
  }

  if (user?.department) {
    const norm = (s?: string) => (s || "").trim().toLowerCase();
    const found = mapped.filter(m => norm(m.name) === norm(user.department));
    return found.length ? found : mapped;
  }

  return mapped;
}

export async function fetchStatusDropdown(): Promise<{ id: string, name: string }[]> {
  try {
    const res = await fetch("/api/status", { credentials: "include" });
    if (res.status === 401) throw new Error("Unauthorized: Please log in to fetch statuses.");
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[fetchStatusDropdown] failed", res.status, txt);
      return [];
    }
    const json = await res.json();
    const statuses = json?.data || json?.Data || json || [];
    if (!Array.isArray(statuses)) return [];
    return statuses.map((s: any) => ({
      id: String(s?.statusID ?? s?.StatusID ?? s?.id ?? s?.Id ?? s?.ID ?? ""),
      name: s?.statusName ?? s?.StatusName ?? s?.name ?? String(s),
    }));
  } catch (e) {
    console.error("[fetchStatusDropdown] error", e);
    return [];
  }
}

export async function fetchSeveritiesDropdown(): Promise<{ id: string, name: string }[]> {
  try {
    const res = await fetch("/api/severity", { credentials: "include" });
    if (res.status === 401) throw new Error("Unauthorized: Please log in to fetch severities.");
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[fetchSeveritiesDropdown] failed", res.status, txt);
      return [];
    }
    const json = await res.json();
    const list = json?.data || json?.Data || json || [];
    if (!Array.isArray(list)) return [];
    return list.map((s: any) => ({
      id: String(s?.severityID ?? s?.SeverityID ?? s?.id ?? s?.Id ?? s?.ID ?? ""),
      name: s?.severityName ?? s?.SeverityName ?? s?.name ?? String(s),
    }));
  } catch (e) {
    console.error("[fetchSeveritiesDropdown] error", e);
    return [];
  }
}

export async function fetchLocationsDropdown() {
  // Try a few possible backend endpoints (active list first, then general)
  const endpoints = ["/api/location/active", "/api/location", "/api/Location"];
  let locations: any[] | null = null;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { credentials: "include" });
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) continue;
      const json = await res.json();
      const candidate = Array.isArray(json) ? json : json.data || json.Data || json.locations || json.Locations || null;
      // Accept candidate only if it contains items. If endpoint returned an empty array,
      // keep trying fallback endpoints (don't treat empty array as success).
      if (Array.isArray(candidate) && candidate.length > 0) {
        locations = candidate;
        break;
      }
    } catch (e: any) {
      // If it's an auth error, stop trying other endpoints.
      if (e.message === "Unauthorized") {
        throw new Error("Unauthorized: Please log in to fetch locations.");
      }
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
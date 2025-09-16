// lib/departments.ts
// Client helper to load departments from backend

export async function loadDepartmentsHelper(): Promise<any[]> {
  try {
    const res = await fetch('/api/department');
    if (!res.ok) throw new Error('Failed to load departments');
    const data = await res.json();
    // Expecting an array of { id, name } or similar; normalize
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.map((d: any) => ({
      id: String(d.departmentID ?? d.DepartmentID ?? d.id ?? d.departmentId ?? ''),
      rawId: (d.departmentID ?? d.DepartmentID ?? d.id ?? d.departmentId) ? Number(d.departmentID ?? d.DepartmentID ?? d.id ?? d.departmentId) : undefined,
      name: d.departmentName ?? d.DepartmentName ?? d.name ?? d.Name ?? '',
      description: d.description ?? d.Description ?? '',
      departmentEmail: d.departmentEmail ?? d.DepartmentEmail ?? d.departmentEmail ?? '',
      contactNumber: d.contactNumber ?? d.ContactNumber ?? '',
      isActive: d.isActive ?? d.IsActive ?? false,
    }));
  } catch (e) {
    // fallback: keep empty list
    return [];
  }
}

// lib/departments.ts
// Client helper to load departments from backend

export async function loadDepartmentsHelper(): Promise<any[]> {
  try {
  const res = await fetch('/api/Department');
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

export async function addDepartment(payload: { DepartmentName: string; Description?: string; DepartmentEmail?: string; ContactNumber?: string; IsActive?: boolean }) {
  const res = await fetch('/api/department', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Create failed: ${res.status} ${text}`)
  }
  let obj: any = null
  try { obj = JSON.parse(text) } catch { obj = null }
  const data = obj?.data ?? obj
  return {
    id: String(data?.departmentID ?? data?.id ?? Date.now()),
    rawId: (data?.departmentID ?? data?.id) ? Number(data?.departmentID ?? data?.id) : undefined,
    name: data?.departmentName ?? data?.DepartmentName ?? payload.DepartmentName,
    description: data?.description ?? data?.Description ?? payload.Description ?? '',
    departmentEmail: data?.departmentEmail ?? data?.DepartmentEmail ?? payload.DepartmentEmail ?? '',
    contactNumber: data?.contactNumber ?? data?.ContactNumber ?? payload.ContactNumber ?? '',
    isActive: data?.isActive ?? data?.IsActive ?? true,
  }
}

export async function deleteDepartment(serverId: number) {
  try {
    const res = await fetch(`/api/department/${serverId}`, { method: 'DELETE' })
    const text = await res.text()
    if (res.ok) return true

    // If 404, attempt safer fallback: GET then PUT to deactivate
    if (res.status === 404) {
      try {
        const getRes = await fetch(`/api/department/${serverId}`)
        if (getRes.ok) {
          const getText = await getRes.text()
          let existing: any = null
          try { existing = JSON.parse(getText) } catch { existing = null }
          const data = existing?.data ?? existing
          const payload = {
            DepartmentID: serverId,
            DepartmentName: data?.departmentName ?? data?.DepartmentName ?? data?.name ?? '',
            Description: data?.description ?? data?.Description ?? '',
            DepartmentEmail: data?.departmentEmail ?? data?.DepartmentEmail ?? '',
            ContactNumber: data?.contactNumber ?? data?.ContactNumber ?? '',
            IsActive: false,
          }
          const putRes = await fetch(`/api/department/${serverId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const putText = await putRes.text()
          if (!putRes.ok) throw new Error(`Deactivate failed: ${putRes.status} ${putText}`)
          return true
        }
      } catch (e) {
        // fallthrough to throwing below
      }
    }

    throw new Error(`Delete failed: ${res.status} ${text}`)
  } catch (e) {
    throw e
  }
}

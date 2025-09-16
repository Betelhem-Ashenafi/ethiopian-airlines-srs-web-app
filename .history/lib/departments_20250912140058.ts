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

// Update department with robust fallback: try PUT, on 404 attempt to resolve id by name, then PUT; finally POST create
export async function updateDepartment(payload: { DepartmentID?: number; DepartmentName: string; Description?: string; DepartmentEmail?: string; ContactNumber?: string; IsActive?: boolean }) {
  // If we have an ID, try PUT first
  const tryPut = async (id: number) => {
    const res = await fetch(`/api/department/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, DepartmentID: id }),
    })
    const text = await res.text()
    if (!res.ok) throw { status: res.status, text }
    let obj: any = null
    try { obj = JSON.parse(text) } catch { obj = null }
    return obj?.data ?? obj
  }

  if (payload.DepartmentID && Number.isFinite(payload.DepartmentID)) {
    try {
      return await tryPut(Number(payload.DepartmentID))
    } catch (e: any) {
      if (e?.status !== 404) throw new Error(`Update failed: ${e?.status} ${e?.text ?? String(e)}`)
      // else fallthrough to resolve by name
    }
  }

  // Resolve authoritative id by fetching list and matching by name
  try {
    const listRes = await fetch('/api/department')
    if (listRes.ok) {
      const listData = await listRes.json()
      const listArr = Array.isArray(listData) ? listData : (listData?.data || [])
      const match = listArr.find((d: any) => {
        const name = (d.departmentName ?? d.DepartmentName ?? d.name ?? d.Name ?? '').toString().trim().toLowerCase()
        return name === (payload.DepartmentName ?? '').toString().trim().toLowerCase()
      })
      if (match) {
        const id = Number(match.departmentID ?? match.DepartmentID ?? match.id ?? match.departmentId)
        if (id) return await tryPut(id)
      }
    }
  } catch (_e) {
    // ignore and fall back to create
  }

  // Last resort: create via POST
  const createRes = await fetch('/api/department', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      DepartmentName: payload.DepartmentName,
      Description: payload.Description,
      DepartmentEmail: payload.DepartmentEmail,
      ContactNumber: payload.ContactNumber,
      IsActive: payload.IsActive,
    }),
  })
  const txt = await createRes.text()
  if (!createRes.ok) {
    // If the backend reports a conflict (name already exists), attempt to resolve the existing
    // department by name and perform a PUT to update it instead of creating.
    if (createRes.status === 409) {
      try {
        const listRes = await fetch('/api/department')
        if (listRes.ok) {
          const listData = await listRes.json()
          const listArr = Array.isArray(listData) ? listData : (listData?.data || [])
          const match = listArr.find((d: any) => {
            const name = (d.departmentName ?? d.DepartmentName ?? d.name ?? d.Name ?? '').toString().trim().toLowerCase()
            return name === (payload.DepartmentName ?? '').toString().trim().toLowerCase()
          })
          if (match) {
            const id = Number(match.departmentID ?? match.DepartmentID ?? match.id ?? match.departmentId)
            if (id) return await tryPut(id)
          }
        }
      } catch (_e) {
        // fallthrough to throw original error below
      }
    }
    throw new Error(`Create fallback failed: ${createRes.status} ${txt}`)
  }
  let objC: any = null
  try { objC = JSON.parse(txt) } catch { objC = null }
  return objC?.data ?? objC
}

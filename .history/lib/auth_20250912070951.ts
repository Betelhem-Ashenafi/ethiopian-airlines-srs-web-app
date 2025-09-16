// Fetch user profile from backend
export async function fetchUserProfile(): Promise<Omit<User, "password"> | null> {
  try {
  const response = await fetch("/api/auth/my-profile", {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    // backend may return { user: {...} } or the user object directly
    let raw = (data && data.user) ? data.user : data
    if (!raw) return null
    // normalize common field names to our frontend shape
    const normalized: any = {
      id: raw.id || raw.ID || raw.userId || raw.userID || raw.employeeID || raw.EmployeeID || raw.id,
      employeeID: raw.employeeID || raw.EmployeeID || raw.employeeId || raw.EmployeeId || raw.id || '',
      fullName: raw.fullName || raw.full_name || raw.name || raw.displayName || raw.username || '',
      email: raw.email || raw.Email || raw.userEmail || '',
      role: (raw.role || raw.Role || raw.userRole || '').toString(),
      status: raw.status || raw.Status || 'Active',
      department: raw.department || raw.departmentName || raw.Department || raw.dept || raw.departmentId || undefined,
    }
    // map backend role codes to display labels
    const displayRoleMap: Record<string,string> = {
      'sysAdmin': 'System Admin', 'sys_admin': 'System Admin', 'sys-admin': 'System Admin', 'systemadmin': 'System Admin',
      'deptAdmin': 'Department Admin', 'dept_admin': 'Department Admin', 'dept-admin': 'Department Admin', 'departmentadmin': 'Department Admin',
      'employee': 'Employee'
    }
    const rl = (normalized.role || '').toLowerCase()
    for (const k of Object.keys(displayRoleMap)) {
      if (k.toLowerCase() === rl || rl.includes(k.toLowerCase())) {
        normalized.role = displayRoleMap[k]
        break
      }
    }
    // fallback: title-case whatever role string exists
    if (!normalized.role) {
      const s = (raw.role || raw.Role || '').toString()
      normalized.role = s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Employee'
    }

    return normalized as Omit<User, "password">
  } catch {
    return null;
  }
}
import { type User } from "./data";

export async function login(
  formData: FormData,
): Promise<{ success: boolean; user?: Omit<User, "password">; error?: string }> {
  const employeeId = formData.get("employeeId") as string;
  const password = formData.get("password") as string;

  try {
  const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔑 sends cookies/session
      body: JSON.stringify({ employeeId, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText || "Login failed." };
    }

    const data = await response.json();

    // After successful login, fetch authoritative profile from backend
    const profile = await fetchUserProfile()
    if (!profile) {
      // Return whatever login provided as fallback
      return { success: true, user: data.user || data }
    }
    return { success: true, user: profile }
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error." };
  }
}

export async function logout(): Promise<void> {
  try {
  await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // 🔑 Sends cookies/session
    });
  } catch (err) {
    console.error("Logout failed", err);
  }
}

// Register a new user
export async function registerUser(payload: { employeeID: string; fullName: string; email: string; role: string; password: string; departmentId: number }): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Map UI role labels or aliases to backend accepted codes
    const roleMap: Record<string,string> = {
      'System Admin': 'sysAdmin',
      'sysAdmin': 'sysAdmin',
      'systemadmin': 'sysAdmin',
      'Department Admin': 'deptAdmin',
      'deptAdmin': 'deptAdmin',
      'departmentadmin': 'deptAdmin',
      'Employee': 'employee',
      'employee': 'employee'
    }
    const normalizedRoleKey = (payload.role || '').trim()
    const backendRole = roleMap[normalizedRoleKey] || normalizedRoleKey.toLowerCase()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...payload, role: backendRole })
    })
    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { success: false, error: data?.message || 'Registration failed', data }
    return { success: true, data }
  } catch (e:any) {
    return { success: false, error: e?.message || 'Network error' }
  }
}

// Fetch all users (with departmentName if enriched)
export async function fetchUsers(): Promise<{ success: boolean; users?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/users', { credentials: 'include' })
    if (!res.ok) return { success: false, error: 'Failed to fetch users' }
    const data = await res.json()
    const list = data.Data || data.data || data.users || []
    const displayRoleMap: Record<string,string> = {
      'sysAdmin': 'System Admin',
      'deptAdmin': 'Department Admin',
      'employee': 'Employee'
    }
    list.forEach((u:any) => {
      if (u.role && displayRoleMap[u.role]) u.role = displayRoleMap[u.role]
    })
    return { success: true, users: list }
  } catch (e:any) {
    return { success: false, error: e?.message || 'Network error' }
  }
}

export async function updateUser(id: string, payload: { fullName: string; email: string; role: string; isActive: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Map role to backend code like register
    const roleMap: Record<string,string> = {
      'System Admin': 'sysAdmin', sysAdmin: 'sysAdmin', systemadmin: 'sysAdmin',
      'Department Admin': 'deptAdmin', deptAdmin: 'deptAdmin', departmentadmin: 'deptAdmin',
      Employee: 'employee', employee: 'employee'
    }
    const backendRole = roleMap[payload.role] || payload.role.toLowerCase()
    let res = await fetch(`/api/auth/update-user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...payload, role: backendRole })
    })
    // If first attempt fails with 404 and id looks unlike employeeID (contains hyphen), try employeeID fallback field if available
    let rawText = await res.text()
    if (!res.ok && res.status === 404 && /-/.test(id) && (payload as any).employeeID) {
      const empId = (payload as any).employeeID
      res = await fetch(`/api/auth/update-user/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...payload, role: backendRole })
      })
      rawText = await res.text()
    }
  let body: any
  try { body = JSON.parse(rawText) } catch { body = { raw: rawText } }
  const success = res.ok
  const error = success ? undefined : (body?.message || body?.error || `Update failed (status ${res.status})`)
  return { success, data: { status: res.status, body, sent: { ...payload, role: backendRole } }, error }
  } catch (e:any) {
    return { success: false, error: e?.message || 'Network error' }
  }
}

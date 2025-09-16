// Fetch user profile from backend
export async function fetchUserProfile(): Promise<Omit<User, "password"> | null> {
  try {
  const response = await fetch("/api/auth/my-profile", {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
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

    // normalize backend response into your expected format
    return {
      success: true,
      user: data.user, // make sure your backend returns { user: {...} }
    };
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
    const res = await fetch(`/api/auth/update-user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...payload, role: backendRole })
    })
  const rawText = await res.text()
  let body: any
  try { body = JSON.parse(rawText) } catch { body = { raw: rawText } }
  const success = res.ok
  const error = success ? undefined : (body?.message || body?.error || `Update failed (status ${res.status})`)
  return { success, data: { status: res.status, body, sent: { ...payload, role: backendRole } }, error }
  } catch (e:any) {
    return { success: false, error: e?.message || 'Network error' }
  }
}

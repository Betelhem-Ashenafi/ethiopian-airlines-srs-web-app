import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

// Expected body:
// {
//   "fullName": "string",
//   "email": "user@example.com",
//   "role": "string",
//   "isActive": true
// }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' })
  const { id } = req.query
  const { fullName, email, role, isActive, active, status, employeeID, departmentId } = req.body || {}
  const resolvedActive = typeof isActive === 'boolean' ? isActive : (typeof active === 'boolean' ? active : undefined)
  if (!id || !fullName || !email || !role || (typeof resolvedActive !== 'boolean')) {
    return res.status(400).json({ message: 'Missing required fields' })
  }
  try {
    // Map role to backend expected code
    const roleMap: Record<string,string> = {
      'System Admin': 'sysAdmin', sysAdmin: 'sysAdmin', systemadmin: 'sysAdmin',
      'Department Admin': 'deptAdmin', deptAdmin: 'deptAdmin', departmentadmin: 'deptAdmin',
      Employee: 'employee', employee: 'employee'
    }
    const backendRole = roleMap[role] || String(role).toLowerCase()
  const payload: any = { fullName, email, role: backendRole, isActive: resolvedActive }
  payload.active = resolvedActive
  payload.status = status || (resolvedActive ? 'Active' : 'Inactive')
  if (employeeID) payload.employeeID = employeeID
  if (departmentId != null) payload.departmentId = departmentId
    const backendRes = await fetch(`http://svdcbas02:8212/api/auth/update-user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
      body: JSON.stringify(payload),
      credentials: 'include'
    })
    forwardSetCookieFromResponse(backendRes, res)
    const text = await backendRes.text()
    try {
      const json = JSON.parse(text)
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: json.message || 'Backend update failed', backendStatus: backendRes.status, backendBody: json, sent: payload })
      }
      return res.status(backendRes.status).json(json)
    } catch {
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ message: 'Backend update failed', backendStatus: backendRes.status, backendBody: text, sent: payload })
      }
      return res.status(backendRes.status).send(text)
    }
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Internal server error' })
  }
}

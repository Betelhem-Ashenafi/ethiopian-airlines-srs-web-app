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
    // Try multiple possible backend endpoint patterns
    const endpointVariants = [
      `http://svdcbas02:8212/api/auth/update-user/${id}`,
      `http://svdcbas02:8212/api/auth/updateUser/${id}`,
      `http://svdcbas02:8212/api/auth/users/update/${id}`,
      `http://svdcbas02:8212/api/auth/users/${id}`
    ]
    let lastStatus = 500
    let lastBody: any = null
    for (const url of endpointVariants) {
      try {
        const attempt = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
          body: JSON.stringify(payload),
          credentials: 'include'
        })
        lastStatus = attempt.status
        forwardSetCookieFromResponse(attempt, res)
        const text = await attempt.text()
        try { lastBody = JSON.parse(text) } catch { lastBody = text }
        if (attempt.ok) {
          return res.status(attempt.status).json({ ...((typeof lastBody === 'object') ? lastBody : { body: lastBody }), usedEndpoint: url })
        }
        // Continue trying others if 404/400
        if (![404,400].includes(attempt.status)) {
          // Non-recoverable error, break
          break
        }
      } catch (e:any) {
        lastBody = { error: e?.message || 'Fetch error' }
      }
    }
    return res.status(lastStatus).json({ message: 'Backend update failed', backendStatus: lastStatus, backendBody: lastBody, sent: payload, tried: endpointVariants })
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Internal server error' })
  }
}

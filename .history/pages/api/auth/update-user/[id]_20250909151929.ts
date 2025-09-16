import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

// PUT body: { fullName, email, role, isActive }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const userId = Array.isArray(id) ? id[0] : id
  if (!userId) return res.status(400).json({ message: 'Missing user id' })
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' })

  const { fullName, email, role, isActive } = req.body || {}
  if (!fullName || !email || !role || typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'Missing required fields' })
  }
  // Map friendly role to backend code
  const roleMap: Record<string,string> = {
    'System Admin': 'sysAdmin', sysAdmin: 'sysAdmin', systemadmin: 'sysAdmin',
    'Department Admin': 'deptAdmin', deptAdmin: 'deptAdmin', departmentadmin: 'deptAdmin',
    Employee: 'employee', employee: 'employee'
  }
  const backendRole = roleMap[role] || role.toLowerCase()
  try {
    const backendRes = await fetch(`http://svdcbas02:8212/api/auth/update-user/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
      body: JSON.stringify({ fullName, email, role: backendRole, isActive }),
      credentials: 'include'
    })
    forwardSetCookieFromResponse(backendRes, res)
    const txt = await backendRes.text()
    try { return res.status(backendRes.status).json(JSON.parse(txt)) } catch { return res.status(backendRes.status).send(txt) }
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Internal server error' })
  }
}
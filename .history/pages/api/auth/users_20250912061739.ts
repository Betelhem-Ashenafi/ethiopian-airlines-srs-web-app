import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'
import { fetchDepartmentsDropdown } from '@/lib/dropdowns'

// Proxy to backend then enrich each user with departmentName if possible
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })
  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/users', {
      method: 'GET',
      headers: { ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
      credentials: 'include'
    })
    forwardSetCookieFromResponse(backendRes, res)
    const text = await backendRes.text()
    let payload: any
    try { payload = JSON.parse(text) } catch { payload = text }

    // Attempt enrichment only if payload has Data array
    if (payload && (Array.isArray(payload.Data) || Array.isArray(payload.data) || Array.isArray(payload.users))) {
      const list = payload.Data || payload.data || payload.users
      try {
        const depts = await fetchDepartmentsDropdown()
        const deptMap: Record<string,string> = {}
        depts.forEach(d => { deptMap[String(d.id)] = d.name })
        list.forEach((u: any) => {
          const depId = u.departmentId ?? u.DepartmentId ?? u.DepartmentID
            ?? u.departmentID ?? u.departmentid
          if (depId != null) {
            u.departmentName = u.departmentName || deptMap[String(depId)] || null
          }
        })
      } catch {
        // ignore enrichment errors
      }
      if (!payload.Data && Array.isArray(payload.users)) payload.Data = payload.users
    }
    return res.status(backendRes.status).json(payload)
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Internal server error' })
  }
}

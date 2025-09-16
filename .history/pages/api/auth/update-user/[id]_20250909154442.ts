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
  const { fullName, email, role, isActive } = req.body || {}
  if (!id || !fullName || !email || !role || (typeof isActive !== 'boolean')) {
    return res.status(400).json({ message: 'Missing required fields' })
  }
  try {
    const backendRes = await fetch(`http://svdcbas02:8212/api/auth/update-user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
      body: JSON.stringify({ fullName, email, role, isActive }),
      credentials: 'include'
    })
    forwardSetCookieFromResponse(backendRes, res)
    const text = await backendRes.text()
    try {
      const json = JSON.parse(text)
      return res.status(backendRes.status).json(json)
    } catch {
      return res.status(backendRes.status).send(text)
    }
  } catch (e:any) {
    return res.status(500).json({ message: e?.message || 'Internal server error' })
  }
}

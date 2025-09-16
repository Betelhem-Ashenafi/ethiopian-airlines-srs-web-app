import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

// Expected body:
// {
//  "employeeID": "string",
//  "fullName": "string",
//  "email": "user@example.com",
//  "role": "string",
//  "password": "string",
//  "departmentId": number
// }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' })
  const { employeeID, fullName, email, role, password, departmentId } = req.body || {}
  if (!employeeID || !fullName || !email || !role || !password || (departmentId == null)) {
    return res.status(400).json({ message: 'Missing required fields' })
  }
  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}) },
      body: JSON.stringify({ employeeID, fullName, email, role, password, departmentId }),
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

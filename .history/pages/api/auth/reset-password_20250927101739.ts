import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[debug] /api/auth/reset-password handler invoked, method=', req.method)
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' })
  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
      body: JSON.stringify(req.body),
    })
    forwardSetCookieFromResponse(backendRes, res)
    const data = await backendRes.json()
    return res.status(backendRes.status).json(data)
  } catch (err: any) {
  console.error('[debug] /api/auth/reset-password error', err)
  return res.status(502).json({ message: String(err?.message ?? err) })
  }
}

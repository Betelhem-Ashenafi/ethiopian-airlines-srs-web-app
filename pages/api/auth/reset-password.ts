import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[debug] /api/auth/reset-password handler invoked, method=', req.method)
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' })

  // Log incoming headers & payload for troubleshooting
  try {
    console.log('[debug] incoming headers:', JSON.stringify(req.headers))
  } catch { console.log('[debug] incoming headers (non-serializable)') }
  try {
    console.log('[debug] incoming req.body:', JSON.stringify(req.body))
  } catch (e) {
    console.log('[debug] incoming req.body (non-serializable):', req.body)
  }

  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
      body: JSON.stringify(req.body),
    })

    // read raw text to inspect error details even when non-JSON returned
    const raw = await backendRes.text().catch(() => '')
    let data: any = raw
    try { data = raw ? JSON.parse(raw) : null } catch (e) { /* keep raw text */ }

    console.log('[debug] proxied backend status=', backendRes.status)
    console.log('[debug] proxied backend response raw=', raw)
    console.log('[debug] proxied backend response parsed=', data)

    // forward Set-Cookie if backend set it
    forwardSetCookieFromResponse(backendRes, res)

    // send back exactly what backend returned (JSON if parsed, otherwise raw text)
    if (typeof data === 'object' && data !== null) {
      return res.status(backendRes.status).json(data)
    } else {
      // raw text fallback
      return res.status(backendRes.status).send(raw)
    }
  } catch (err: any) {
    console.error('[debug] /api/auth/reset-password error', err)
    return res.status(502).json({ message: String(err?.message ?? err) })
  }
}

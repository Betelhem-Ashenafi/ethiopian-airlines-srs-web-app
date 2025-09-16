import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      console.log('[api/department] GET')
      const backendRes = await fetch('http://svdcbas02:8212/api/Department', {
        method: 'GET',
        headers: { Cookie: req.headers.cookie ?? '' },
      })
      const text = await backendRes.text()
      console.log('[api/department] backend status=', backendRes.status)
      forwardSetCookieFromResponse(backendRes, res)
      try { return res.status(backendRes.status).json(JSON.parse(text)) } catch { return res.status(backendRes.status).send(text) }
    }

    if (req.method === 'POST') {
      console.log('[api/department] POST body=', JSON.stringify(req.body))
      const backendRes = await fetch('http://svdcbas02:8212/api/Department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
        body: JSON.stringify(req.body),
      })
      const text = await backendRes.text()
      console.log('[api/department] backend status=', backendRes.status, 'response=', text)
      forwardSetCookieFromResponse(backendRes, res)
      try { return res.status(backendRes.status).json(JSON.parse(text)) } catch { return res.status(backendRes.status).send(text) }
    }

    return res.status(405).json({ message: 'Method Not Allowed' })
  } catch (err: any) {
    return res.status(502).json({ message: String(err?.message ?? err) })
  }
}

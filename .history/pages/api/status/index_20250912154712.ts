import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  try {
    console.log('[api/status] Incoming cookie header:', req.headers.cookie);
    const backendRes = await fetch('http://svdcbas02:8212/api/Status', {
      method: 'GET',
      headers: {
        // Forward incoming cookies to backend so session is preserved
        Cookie: req.headers.cookie ?? '',
      },
    })

  // Forward any Set-Cookie header(s) from backend
  forwardSetCookieFromResponse(backendRes, res)

    const text = await backendRes.text()
    console.log('[api/status] Backend status:', backendRes.status);
    if (backendRes.status === 401) {
      console.log('[api/status] Backend 401 body snippet:', text.slice(0,300));
      return res.status(401).json({ message: 'Unauthorized from backend. Are auth cookies forwarded? Backend says 401.', backendSnippet: text.slice(0,300) })
    }
    try {
      const data = JSON.parse(text)
      return res.status(backendRes.status).json(data)
    } catch {
      return res.status(backendRes.status).send(text)
    }
  } catch (error: any) {
    return res.status(500).json({ message: error?.message ?? 'Internal server error' })
  }
}

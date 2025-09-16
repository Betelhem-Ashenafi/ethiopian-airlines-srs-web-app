// Proxy API route for fetching current user profile from the backend
import type { NextApiRequest, NextApiResponse } from "next";
import { forwardSetCookieFromResponse } from '@/lib/proxy'

const BACKEND = 'http://svdcbas02:8212'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const candidates = [
    `${BACKEND}/api/auth/my-profile`,
    `${BACKEND}/api/auth/profile`,
    `${BACKEND}/api/auth/me`,
  ]

  for (const url of candidates) {
    try {
      const backendRes = await fetch(url, {
        method: 'GET',
        headers: {
          ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
        },
        credentials: 'include',
      })

      // forward Set-Cookie if present
      try { forwardSetCookieFromResponse(backendRes, res) } catch (e) {}

      const text = await backendRes.text()
      try {
        const data = JSON.parse(text)
        return res.status(backendRes.status).json(data)
      } catch {
        return res.status(backendRes.status).send(text)
      }
    } catch (err) {
      // try next candidate
      console.debug('[api/auth/my-profile] backend fetch failed for', url, err)
    }
  }

  return res.status(502).json({ error: 'Failed to fetch profile from backend' })
}

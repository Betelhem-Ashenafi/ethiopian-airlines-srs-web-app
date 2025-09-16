import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

const BACKEND = 'http://svdcbas02:8212'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' })

  const body = JSON.stringify(req.body)

  const candidates = [
    `${BACKEND}/api/reports/UpdateReport`,
    `${BACKEND}/api/reports/Update`,
    `${BACKEND}/api/reports`,
  ]

  for (const url of candidates) {
    try {
      const backendRes = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.cookie ?? '',
        },
        body,
      })

      // forward Set-Cookie if present
      forwardSetCookieFromResponse(backendRes, res)

      const text = await backendRes.text()
      // treat 404 as candidate miss and try next
      if (backendRes.status === 404) continue

      try {
        const data = JSON.parse(text)
        return res.status(backendRes.status).json(data)
      } catch {
        return res.status(backendRes.status).send(text)
      }
    } catch (e: any) {
      // try next candidate
      continue
    }
  }

  return res.status(502).json({ message: 'Failed to proxy update to backend' })
}

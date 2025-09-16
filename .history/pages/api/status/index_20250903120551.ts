import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/Status', {
      method: 'GET',
      headers: {
        // Forward incoming cookies to backend so session is preserved
        Cookie: req.headers.cookie ?? '',
      },
    })

    // Forward any Set-Cookie headers from backend to client
    const setCookie = backendRes.headers.get('set-cookie')
    if (setCookie) res.setHeader('Set-Cookie', setCookie)

    const text = await backendRes.text()
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

import type { NextApiRequest, NextApiResponse } from 'next'
import { forwardSetCookieFromResponse } from '@/lib/proxy'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ message: 'missing id' })
  try {
    if (req.method === 'PUT') {
  console.log('[api/department/[id]] PUT id=', id, 'body=', JSON.stringify(req.body))
      const backendRes = await fetch(`http://svdcbas02:8212/api/Department/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
        body: JSON.stringify(req.body),
      })
  const backendText = await backendRes.text()
  console.log('[api/department/[id]] backend status=', backendRes.status, 'response=', backendText)
  forwardSetCookieFromResponse(backendRes, res)
  try { return res.status(backendRes.status).json(JSON.parse(backendText)) } catch { return res.status(backendRes.status).send(backendText) }
    }

    if (req.method === 'DELETE') {
      const backendRes = await fetch(`http://svdcbas02:8212/api/Department/${id}`, {
        method: 'DELETE',
        headers: { Cookie: req.headers.cookie ?? '' },
      })
  forwardSetCookieFromResponse(backendRes, res)
  const text = await backendRes.text()
  console.log('[api/department/[id]] DELETE id=', id, 'backend status=', backendRes.status, 'response=', text)
  try { return res.status(backendRes.status).json(JSON.parse(text)) } catch { return res.status(backendRes.status).send(text) }
    }

    return res.status(405).json({ message: 'Method Not Allowed' })
  } catch (err: any) {
    return res.status(502).json({ message: String(err?.message ?? err) })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'

// Proxy handler that forwards GET/POST for report detail to the backend
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'Missing id' })

  // backend base (matches next.config.mjs rewrites pattern)
  const backendUrl = `http://svdcbas02:8212/api/reports/reports/Details/${encodeURIComponent(id)}`

  try {
    const headers: Record<string, string> = {}
    // forward content-type when present
    if (req.headers['content-type']) headers['content-type'] = String(req.headers['content-type'])
    // forward cookies for authentication/session
    if (req.headers.cookie) headers['cookie'] = String(req.headers.cookie)

    const fetchOptions: any = {
      method: req.method,
      headers,
      // Next fetch doesn't accept Node's IncomingMessage body directly; let body pass through for POST/PUT
    }

    if (req.method && req.method.toUpperCase() !== 'GET' && req.body) {
      // forward JSON body
      fetchOptions.body = JSON.stringify(req.body)
      // ensure we set content-type
      fetchOptions.headers['content-type'] = fetchOptions.headers['content-type'] || 'application/json'
    }

    const upstream = await fetch(backendUrl, fetchOptions)

    // forward status
    res.status(upstream.status)

    // forward Set-Cookie headers if any
    const sc = upstream.headers.get('set-cookie')
    if (sc) {
      res.setHeader('set-cookie', sc)
    }

    // forward content-type
    const contentType = upstream.headers.get('content-type')
    if (contentType) res.setHeader('content-type', contentType)

    const body = await upstream.arrayBuffer()
    const buffer = Buffer.from(body)
    return res.send(buffer)
  } catch (err: any) {
    console.error('reports/detail proxy error', err)
    return res.status(502).json({ error: 'Bad gateway', detail: String(err?.message ?? err) })
  }
}

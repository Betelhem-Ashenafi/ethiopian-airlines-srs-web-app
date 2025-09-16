import type { NextApiRequest, NextApiResponse } from 'next'

// Small safe image proxy. Only allowlist certain hosts to avoid open proxy abuse.
const ALLOWED_HOSTS = ['172.20.97.149', 'svdcbas02']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query
  if (!url || Array.isArray(url)) return res.status(400).json({ message: 'missing url' })
  let decoded: string
  try {
    decoded = decodeURIComponent(url)
  } catch {
    decoded = url
  }

  try {
    const parsed = new URL(decoded)
    const host = parsed.hostname
    // quick allowlist check
    if (!ALLOWED_HOSTS.some(h => host.includes(h))) {
      return res.status(403).json({ message: 'host not allowed' })
    }

    const backendRes = await fetch(decoded, { method: 'GET' })
    if (!backendRes.ok) return res.status(backendRes.status).send('')

    // Forward content-type and other useful headers
    const contentType = backendRes.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    // Stream the response body
    const buffer = Buffer.from(await backendRes.arrayBuffer())
    res.status(200).send(buffer)
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? 'proxy error' })
  }
}

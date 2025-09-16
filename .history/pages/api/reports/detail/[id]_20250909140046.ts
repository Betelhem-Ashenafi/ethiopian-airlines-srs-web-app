import type { NextApiRequest, NextApiResponse } from 'next'

interface StoredComment { author: string; timestamp: string; text: string }
interface ReportMeta { comments: StoredComment[]; department?: string; severity?: string; status?: string }

declare global { // eslint-disable-line no-var
  // eslint-disable-next-line vars-on-top
  var __REPORT_META_STORE__: Map<string, ReportMeta> | undefined
}
const metaStore: Map<string, ReportMeta> = global.__REPORT_META_STORE__ || new Map()
if (!global.__REPORT_META_STORE__) global.__REPORT_META_STORE__ = metaStore

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string }
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const backendUrl = `http://svdcbas02:8212/api/reports/reports/Details/${encodeURIComponent(id)}`

  if (req.method === 'POST') {
    const { action, department, severity, status, comment, author } = req.body || {}
    if (!action) return res.status(400).json({ error: 'Missing action' })
    const meta = metaStore.get(id) || { comments: [] }
    if (action === 'save' || action === 'send') {
      if (department) meta.department = department
      if (severity) meta.severity = severity
      if (status) meta.status = status
    }
    if (comment && String(comment).trim()) {
      meta.comments.push({ author: author || 'User', timestamp: new Date().toISOString(), text: String(comment).trim() })
    }
    metaStore.set(id, meta)
    // We still try to forward to backend for real persistence (ignore failures)
    try {
      await fetch(backendUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
      })
    } catch (e) {
      // swallow backend error for now; comment still stored in-memory
    }
    return res.status(200).json({ success: true, id, ...meta })
  }

  if (req.method === 'GET') {
    try {
      const upstream = await fetch(backendUrl, { method: 'GET' })
      const contentType = upstream.headers.get('content-type') || 'application/json'
      let backendJson: any = {}
      if (contentType.includes('application/json')) {
        backendJson = await upstream.json()
      } else {
        // fallback treat as text
        backendJson = { raw: await upstream.text() }
      }
      const meta = metaStore.get(id) || { comments: [] }
      return res.status(200).json({ ...backendJson, ...meta, id })
    } catch (err: any) {
      const meta = metaStore.get(id) || { comments: [] }
      return res.status(200).json({ id, ...meta, warning: 'Backend unreachable, returning cached meta only' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

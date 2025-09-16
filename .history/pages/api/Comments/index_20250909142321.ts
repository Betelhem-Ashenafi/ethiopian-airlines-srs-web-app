import type { NextApiRequest, NextApiResponse } from 'next'

interface StoredComment { author: string; timestamp: string; text: string }
declare global { // eslint-disable-line no-var
  var __COMMENT_STORE__: Map<string, StoredComment[]> | undefined
}
const store: Map<string, StoredComment[]> = global.__COMMENT_STORE__ || new Map()
if (!global.__COMMENT_STORE__) global.__COMMENT_STORE__ = store

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { reportId, text, author } = req.body || {}
  if (!reportId) return res.status(400).json({ error: 'Missing reportId' })
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'Empty comment' })
  const list = store.get(reportId) || []
  const comment: StoredComment = { author: author || 'User', timestamp: new Date().toISOString(), text: String(text).trim() }
  list.push(comment)
  store.set(reportId, list)
  return res.status(201).json({ success: true, reportId, comment })
}

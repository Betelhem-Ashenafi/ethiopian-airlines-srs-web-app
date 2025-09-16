import type { NextApiRequest, NextApiResponse } from 'next'

interface StoredComment { author: string; timestamp: string; text: string }
declare global { // eslint-disable-line no-var
  var __COMMENT_STORE__: Map<string, StoredComment[]> | undefined
}
const store: Map<string, StoredComment[]> = global.__COMMENT_STORE__ || new Map()
if (!global.__COMMENT_STORE__) global.__COMMENT_STORE__ = store

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { reportId } = req.query
  const id = Array.isArray(reportId) ? reportId[0] : reportId
  if (!id) return res.status(400).json({ error: 'Missing reportId' })
  return res.status(200).json({ reportId: id, comments: store.get(id) || [] })
}

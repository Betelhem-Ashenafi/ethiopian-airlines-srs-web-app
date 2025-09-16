import type { NextApiRequest, NextApiResponse } from 'next'

interface StoredComment { author: string; timestamp: string; text: string }

declare global { // eslint-disable-line no-var
  // eslint-disable-next-line vars-on-top
  var __REPORT_COMMENTS_STORE__: Map<string, StoredComment[]> | undefined
}

const commentStore: Map<string, StoredComment[]> = global.__REPORT_COMMENTS_STORE__ || new Map()
if (!global.__REPORT_COMMENTS_STORE__) global.__REPORT_COMMENTS_STORE__ = commentStore

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const reportId = Array.isArray(id) ? id[0] : id
  if (!reportId) return res.status(400).json({ error: 'Missing report id' })

  if (req.method === 'GET') {
    return res.status(200).json({ id: reportId, comments: commentStore.get(reportId) || [] })
  }

  if (req.method === 'POST') {
    const { text, author } = req.body || {}
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'Empty comment' })
    const list = commentStore.get(reportId) || []
    const newComment: StoredComment = { author: author || 'User', timestamp: new Date().toISOString(), text: String(text).trim() }
    list.push(newComment)
    commentStore.set(reportId, list)
    return res.status(201).json({ id: reportId, comment: newComment })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
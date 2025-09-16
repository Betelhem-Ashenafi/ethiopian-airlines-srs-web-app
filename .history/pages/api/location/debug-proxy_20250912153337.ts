import type { NextApiRequest, NextApiResponse } from 'next'

const CANDIDATES = [
  'http://svdcbas02:8212/api/location/GetLocationsAll',
  'http://svdcbas02:8212/api/location/GetActiveLocations',
  'http://svdcbas02:8212/api/location',
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })
  const results: any[] = []
  for (const url of CANDIDATES) {
    try {
      const backendRes = await fetch(url, { method: 'GET', headers: { ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) } })
      const text = await backendRes.text()
      results.push({ url, status: backendRes.status, headers: Object.fromEntries(backendRes.headers.entries()), body: text })
    } catch (e:any) {
      results.push({ url, error: String(e?.message ?? e) })
    }
  }
  return res.status(200).json({ results })
}

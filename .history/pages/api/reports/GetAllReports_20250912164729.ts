import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardSetCookieFromResponse } from '@/lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/reports/GetAllReports', {
      method: 'GET',
      headers: { ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
      credentials: 'include',
    });
    forwardSetCookieFromResponse(backendRes, res);
    const text = await backendRes.text();
    try {
      const data = JSON.parse(text);
      return res.status(backendRes.status).json(data);
    } catch {
      return res.status(backendRes.status).send(text);
    }
  } catch (error: any) {
    return res.status(502).json({ message: error?.message || 'Internal server error' });
  }
}

// pages/api/location/GetLocationsAll.ts
// Next.js API route for getting all locations

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const backendRes = await fetch('http://svdcbas02:8212/api/location/GetLocationsAll', {
        method: 'GET',
        headers: { ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
      });
      const backendText = await backendRes.text();
      try {
        return res.status(backendRes.status).json(JSON.parse(backendText));
      } catch {
        return res.status(backendRes.status).send(backendText);
      }
    } catch (err: any) {
      return res.status(502).json({ message: String(err?.message ?? err) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

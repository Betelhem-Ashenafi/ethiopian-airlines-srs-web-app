// pages/api/location/index.ts
// Next.js API route for creating a new location

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const backendRes = await fetch('http://svdcbas02:8212/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
        body: JSON.stringify(req.body),
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

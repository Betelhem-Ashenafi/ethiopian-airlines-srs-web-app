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
        // Log backend response for debugging
        console.log('[GetLocationsAll] Backend status:', backendRes.status);
        console.log('[GetLocationsAll] Backend raw response:', backendText);
        try {
          const parsed = JSON.parse(backendText);
          // Log parsed data and array length
          const arr = Array.isArray(parsed) ? parsed : (parsed?.data || []);
          console.log('[GetLocationsAll] Parsed array length:', arr.length);
          return res.status(backendRes.status).json(parsed);
        } catch (e) {
          console.log('[GetLocationsAll] JSON parse error:', e);
          return res.status(backendRes.status).send(backendText);
        }
    } catch (err: any) {
        console.log('[GetLocationsAll] Fetch error:', err);
      return res.status(502).json({ message: String(err?.message ?? err) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// pages/api/location/DeactivateLocation.ts
// Next.js API route for deactivating a location

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ message: 'Missing location id' });
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    const backendRes = await fetch(`http://svdcbas02:8212/api/location/DeactivateLocation/${id}`, {
      method: 'DELETE',
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
}

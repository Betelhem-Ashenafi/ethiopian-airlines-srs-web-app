// pages/api/location/UpdateLocation.ts
// Next.js API route for updating a location

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ message: 'Missing location id' });
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    const backendRes = await fetch(`http://svdcbas02:8212/api/location/UpdateLocation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
      body: JSON.stringify({ ...req.body, id }),
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

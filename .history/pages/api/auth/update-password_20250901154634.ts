import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Forward the request to the real backend
  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/update-password', {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for authentication if needed
        ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}),
      },
      body: JSON.stringify(req.body),
      credentials: 'include',
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Internal server error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';//
import { forwardSetCookieFromResponse } from '@/lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      credentials: 'include',
    });

  // Forward any Set-Cookie header(s) from backend
  forwardSetCookieFromResponse(backendRes, res);

    const text = await backendRes.text();
    try {
      const data = JSON.parse(text);
      return res.status(backendRes.status).json(data);
    } catch {
      return res.status(backendRes.status).send(text);
    }
  } catch (error: any) {
    return res.status(500).json({ message: error?.message || 'Internal server error' });
  }
}

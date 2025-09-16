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
    // Forward any Set-Cookie headers from backend
    const rawHeaders = (backendRes.headers as any).raw?.();
    let setCookies: string[] = [];
    if (rawHeaders && Array.isArray(rawHeaders['set-cookie'])) {
      setCookies = rawHeaders['set-cookie'];
    } else {
      const sc = backendRes.headers.get('set-cookie');
      if (sc) {
        if (!sc.includes('Expires=') && sc.includes(', ')) {
          setCookies = sc.split(', ').map((c) => c.trim()).filter(Boolean);
        } else {
          setCookies = [sc];
        }
      }
    }
    if (setCookies.length > 0) res.setHeader('Set-Cookie', setCookies);

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Internal server error' });
  }
}

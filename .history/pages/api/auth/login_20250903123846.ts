import type { NextApiRequest, NextApiResponse } from 'next';

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

    // Forward Set-Cookie header(s) from backend to client so cookie(s) are set on localhost.
    // Try to read raw headers (Node/undici) which returns an array for 'set-cookie'.
    const rawHeaders = (backendRes.headers as any).raw?.();
    let setCookies: string[] = [];
    if (rawHeaders && Array.isArray(rawHeaders['set-cookie'])) {
      setCookies = rawHeaders['set-cookie'];
    } else {
      const sc = backendRes.headers.get('set-cookie');
      if (sc) {
        // If multiple cookies are concatenated, try a safe split. If the value contains 'Expires=',
        // splitting by comma can break date strings, so keep the entire string as one cookie in that case.
        if (!sc.includes('Expires=') && sc.includes(', ')) {
          setCookies = sc.split(', ').map((c) => c.trim()).filter(Boolean);
        } else {
          setCookies = [sc];
        }
      }
    }

    if (setCookies.length > 0) {
      // Pass cookies as an array so Node will set multiple Set-Cookie headers
      res.setHeader('Set-Cookie', setCookies);
    }

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

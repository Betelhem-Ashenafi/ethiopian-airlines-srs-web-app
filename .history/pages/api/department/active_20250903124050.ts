import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' })

  try {
    const backendRes = await fetch('http://svdcbas02:8212/api/Department/active', {
      method: 'GET',
      headers: {
        Cookie: req.headers.cookie ?? '',
      },
    })

    // Forward any Set-Cookie header(s)
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

    const text = await backendRes.text()
    try {
      const data = JSON.parse(text)
      return res.status(backendRes.status).json(data)
    } catch {
      return res.status(backendRes.status).send(text)
    }
  } catch (error: any) {
    return res.status(500).json({ message: error?.message ?? 'Internal server error' })
  }
}

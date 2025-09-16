import type { NextApiResponse } from 'next'

/**
 * Forward Set-Cookie headers from a backend fetch Response to the Next.js API response.
 * This handles multiple Set-Cookie headers where possible and falls back to a safe single-header split.
 */
export function forwardSetCookieFromResponse(backendRes: Response, res: NextApiResponse) {
  try {
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

    if (setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }
  } catch (e) {
    // Non-fatal: do not crash the API route if header forwarding fails
    // Keep behavior best-effort
    // console.debug('forwardSetCookieFromResponse error', e)
  }
}

// pages/api/location/GetLocationsAll.ts
// Next.js API route for getting all locations

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Try multiple candidate endpoints in case backend offers variants
    const candidates = [
      'http://svdcbas02:8212/api/location/GetLocationsAll',
      'http://svdcbas02:8212/api/location/GetActiveLocations',
      'http://svdcbas02:8212/api/location',
    ];

    const allResults: any[] = [];
    for (const url of candidates) {
      try {
        const backendRes = await fetch(url, {
          method: 'GET',
          headers: { ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}) },
        });
        const backendText = await backendRes.text();
        console.log('[GetLocationsAll] Tried', url, 'status=', backendRes.status);
        // If backend returned HTML, skip
        if (backendText.trim().startsWith('<!DOCTYPE')) {
          console.log('[GetLocationsAll] Skipping HTML response from', url);
          continue;
        }
        let parsed: any;
        try {
          parsed = JSON.parse(backendText);
        } catch (e) {
          // Not JSON, maybe it's direct array or single object string - try to treat as text
          console.log('[GetLocationsAll] JSON parse error for', url, e);
          continue;
        }

        const arr = Array.isArray(parsed) ? parsed : (parsed?.data || []);
        console.log('[GetLocationsAll] Source', url, 'items=', Array.isArray(arr) ? arr.length : 0);
        if (Array.isArray(arr)) allResults.push(...arr);
      } catch (err: any) {
        console.log('[GetLocationsAll] Fetch error for', url, err?.message ?? err);
      }
    }

    // Dedupe by common id/name fields
    const dedupeMap = new Map<string, any>();
    for (const loc of allResults) {
      const idKey = String(loc.locationID ?? loc.LocationID ?? loc.id ?? loc.Id ?? loc.ID ?? loc.locationId ?? '').trim();
      const nameKey = (loc.locationName ?? loc.LocationName ?? loc.name ?? loc.Name ?? '').toString().trim().toLowerCase();
      const key = idKey || nameKey;
      if (!key) continue;
      if (!dedupeMap.has(key)) dedupeMap.set(key, loc);
    }
    const combined = Array.from(dedupeMap.values());
    console.log('[GetLocationsAll] Combined unique count=', combined.length);
    return res.status(200).json(combined);
  }
  res.status(405).json({ message: 'Method Not Allowed' });
}

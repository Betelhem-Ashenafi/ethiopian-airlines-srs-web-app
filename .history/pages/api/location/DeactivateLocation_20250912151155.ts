// pages/api/location/DeactivateLocation.ts
// Next.js API route for deactivating a location

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;
  // If id is missing or array, try to get from body.detail or body.id
  if (!id || Array.isArray(id)) {
    if (req.body) {
      if (req.body.detail && typeof req.body.detail === 'object' && req.body.detail.id) {
        id = req.body.detail.id;
      } else if (req.body.id) {
        id = req.body.id;
      }
      // If still no id, try to match from GET endpoint
      if (!id && req.body.detail) {
        // Try to match by name or id
        const matchKey = req.body.detail.locationName || req.body.detail.LocationName || req.body.detail.name || req.body.detail.Name;
        const matchId = req.body.detail.locationID || req.body.detail.LocationID || req.body.detail.id || req.body.detail.Id || req.body.detail.ID;
        try {
          const locRes = await fetch('http://svdcbas02:8212/api/location/GetLocationsAll', { method: 'GET' });
          const locData = await locRes.json();
          const locations = Array.isArray(locData) ? locData : (locData?.data || []);
          let match = null;
          if (matchId) {
            match = locations.find((loc: any) => {
              return (loc.locationID ?? loc.LocationID ?? loc.id ?? loc.Id ?? loc.ID) == matchId;
            });
          }
          if (!match && matchKey) {
            match = locations.find((loc: any) => {
              const locName = (loc.locationName ?? loc.LocationName ?? loc.name ?? loc.Name ?? '').toString().toLowerCase();
              return locName === matchKey.toString().toLowerCase();
            });
          }
          if (match && (match.locationID || match.LocationID || match.id || match.Id || match.ID)) {
            id = match.locationID || match.LocationID || match.id || match.Id || match.ID;
          }
        } catch (e) {
          // Ignore fetch errors, fallback to missing id
        }
      }
    }
    if (!id) return res.status(400).json({ message: 'Missing location id' });
  }
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

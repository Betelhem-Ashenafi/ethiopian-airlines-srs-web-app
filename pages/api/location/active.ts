import type { NextApiRequest, NextApiResponse } from 'next';

// Simulated activation/deactivation logic for a location
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { locationId, active } = req.body;
  if (!locationId || typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Missing locationId or active status' });
  }

  // TODO: Replace with real DB logic
  // Simulate success
  return res.status(200).json({ success: true, locationId, active });
}

// pages/api/location/GetLocationsAll.ts
// Next.js API route for getting all locations

import type { NextApiRequest, NextApiResponse } from 'next';

const mockLocations = [
  { locationID: 1, locationName: 'Headquarters', isActive: true },
  { locationID: 2, locationName: 'Branch Office', isActive: true },
  { locationID: 3, locationName: 'Remote Site', isActive: false },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Replace mockLocations with your real data source if needed
    res.status(200).json(mockLocations);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

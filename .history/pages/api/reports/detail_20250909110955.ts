// API route to handle report actions (save, send, comment)
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, action, department, severity, status, comment } = req.body;
  if (!id || !action) {
    return res.status(400).json({ error: 'Missing report id or action' });
  }

  // TODO: Add your backend logic here to update the report and/or add comments
  // Example:
  // if (action === 'save') { ... }
  // if (action === 'send') { ... }

  // Simulate success
  return res.status(200).json({ success: true, message: `Action '${action}' performed for report ${id}` });
}

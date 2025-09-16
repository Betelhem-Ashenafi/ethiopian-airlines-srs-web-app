// API route for logging out a user
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Here you would clear the session or token
  // Example: res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/;');

  // Simulate logout success
  return res.status(200).json({ success: true });
}

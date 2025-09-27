// Simple API route to store logs (for demo; use a real DB in production)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // In production, store logs in a database or external service
  // For demo, just print to server console
  const { type, action, message, data, user } = req.body;
  console.log('[LOG]', { type, action, message, data, user, timestamp: new Date().toISOString() });
  res.status(200).json({ success: true });
}

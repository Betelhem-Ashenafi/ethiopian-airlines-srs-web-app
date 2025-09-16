import type { NextApiRequest, NextApiResponse } from 'next';

// Dummy user store for demonstration
const users: any[] = [
  { id: '1', password: 'oldpass' },
  { id: '2', password: 'test123' },
  { id: 'A3', password: 'secure' },
  // ...add more users as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Log the incoming request body for debugging
  console.log('Received body:', req.body);

  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find user by id (case-insensitive)
  const user = users.find(u => (u.id?.toLowerCase() === userId?.toLowerCase()));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check current password
  if (user.password !== currentPassword) {
    return res.status(401).json({ message: 'Current password incorrect' });
  }

  // Update password
  user.password = newPassword;
  console.log(`Password for user ${user.id} updated successfully.`);
  return res.status(200).json({ success: true, message: 'Password updated successfully' });
}

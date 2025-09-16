import type { NextApiRequest, NextApiResponse } from 'next';

// Dummy user store for demonstration
const users: any[] = [
  { id: '1', password: 'oldpass' },
  // ...other users
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = users.find(u => (u.id?.toLowerCase() === userId?.toLowerCase()));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.password !== currentPassword) {
    return res.status(401).json({ message: 'Current password incorrect' });
  }
  user.password = newPassword;
  return res.status(200).json({ success: true, message: 'Password updated successfully' });
}

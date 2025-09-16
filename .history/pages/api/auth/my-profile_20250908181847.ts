// API route for fetching current user profile
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simulate getting user profile from session or database
  // Example: const user = getUserFromSession(req);
  const user = {
    id: "123",
    name: "Demo User",
    email: "demo@example.com",
    // ...other user fields
  };

  return res.status(200).json({ user });
}

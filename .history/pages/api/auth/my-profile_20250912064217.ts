// API route for fetching current user profile
import type { NextApiRequest, NextApiResponse } from "next";

// Dev helper: return a complete demo profile so the client can restore
// a consistent user on refresh. Replace this with a real backend call
// in production.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simulated backend profile — include the fields the app expects
  const user = {
    id: "123",
    employeeID: "EMP-007",
    fullName: "Demo System Admin",
    email: "admin@example.com",
    // Backend may return role codes like 'sysAdmin' or 'deptAdmin'.
    // The client normalizes these to display labels.
    role: "sysAdmin",
    status: "Active",
    department: "IT Support",
  };

  return res.status(200).json({ user });
}

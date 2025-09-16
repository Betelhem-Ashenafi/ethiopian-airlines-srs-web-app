// API route to toggle report active status
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, isActive } = req.body;

  // TODO: Update the report in your database here
  // Example: updateReportStatus(id, isActive);

  // Simulate success
  return res.status(200).json({ success: true });
}

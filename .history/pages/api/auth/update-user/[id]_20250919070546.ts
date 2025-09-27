import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ message: "Method Not Allowed" });

  const { id } = req.query; // must be numeric userID
  if (!id) return res.status(400).json({ message: "Missing user id" });

  try {
    const backend = await fetch(`http://svdcbas02:8212/put/api/auth/update-user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: String(req.headers.cookie) } : {}),
        ...(req.headers.authorization ? { authorization: String(req.headers.authorization) } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await backend.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    return res.status(backend.status).send(text || JSON.stringify({ success: backend.ok }));
  } catch (e: any) {
    return res.status(502).json({ message: e?.message || "Bad Gateway" });
  }
}

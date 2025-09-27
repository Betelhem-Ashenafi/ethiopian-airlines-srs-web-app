import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ message: "Method Not Allowed" });
  const { id } = req.query;

  try {
    const r = await fetch(`http://svdcbas02:8212/api/location/UpdateLocation/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
      },
      body: JSON.stringify(req.body), // expects { locationName: "..." }
    });
    const text = await r.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Internal Server Error" });
  }
}
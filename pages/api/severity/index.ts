import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });
  try {
    const r = await fetch("http://svdcbas02:8212/api/Severity", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
      },
    });
    const text = await r.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Internal Server Error" });
  }
}
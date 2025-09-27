import type { NextApiRequest, NextApiResponse } from "next";
import { Agent, fetch as undiciFetch } from "undici";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!["GET", "POST"].includes(req.method || "")) return res.status(405).json({ message: "Method Not Allowed" });

  const upstream = `http://svdcbas02:8212/api/reports/detail/${id}`;
  try {
    const r = await fetch(upstream, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
        ...(req.headers.authorization ? { authorization: String(req.headers.authorization) } : {}),
      },
      body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
    });
    const text = await r.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Internal Server Error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

async function tryPaths(id: string, cookie?: string) {
  const candidates = [
    `http://svdcbas02:8212/api/location/GetLocation/${id}`,
    `http://svdcbas02:8212/api/Location/GetLocation/${id}`, // casing fallback
    `http://svdcbas02:8212/api/location/${id}`,             // alt route fallback
  ];
  for (const url of candidates) {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
    });
    if (r.ok) return r;
    // keep trying on 404/405; return immediately on other statuses
    if (![404, 405].includes(r.status)) return r;
  }
  // last attempt (returns whatever it got)
  return fetch(candidates[candidates.length - 1], {
    method: "GET",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });
  try {
    const r = await tryPaths(String(req.query.id), req.headers.cookie);
    const text = await r.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Internal Server Error" });
  }
}
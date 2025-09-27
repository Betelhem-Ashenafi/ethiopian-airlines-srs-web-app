import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!["GET", "PUT", "DELETE"].includes(req.method || "")) {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const backendRes = await fetch(`http://svdcbas02:8212/api/Department/${id}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
      },
      body: req.method === "PUT" ? JSON.stringify(req.body) : undefined,
    });
    const text = await backendRes.text();
    res.setHeader("Cache-Control", "no-store");
    res.status(backendRes.status).send(text);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Internal Server Error" });
  }
}

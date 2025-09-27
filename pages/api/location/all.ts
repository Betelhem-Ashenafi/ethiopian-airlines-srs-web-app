import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const backendRes = await fetch("http://svdcbas02:8212/api/location/GetLocationsAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
      },
    });
    const data = await backendRes.text();
    res.status(backendRes.status).send(data);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Internal Server Error" });
  }
}
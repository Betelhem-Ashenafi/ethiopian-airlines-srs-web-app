import type { NextApiRequest, NextApiResponse } from "next"
import { forwardSetCookieFromResponse } from "@/lib/proxy"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = "http://svdcbas02:8212/api/Department"
  const method = req.method ?? "GET"

  if (!["GET", "POST"].includes(method)) {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  try {
    const backendRes = await fetch(backendUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
      },
      body: method === "GET" ? undefined : JSON.stringify(req.body),
    })

    // forward set-cookie if present
    forwardSetCookieFromResponse(backendRes, res)

    const text = await backendRes.text().catch(() => "")
    let data: any = text
    try { data = text ? JSON.parse(text) : null } catch {}

    return res.status(backendRes.status).send(typeof data === "object" && data !== null ? data : text)
  } catch (err: any) {
    console.error("[proxy] /api/Department error", err)
    return res.status(502).json({ message: String(err?.message ?? err) })
  }
}

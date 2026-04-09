// app/api/dashboard/route.ts
// Notice: zero authorization logic here.
// The middleware already ensured only authorized users reach this handler.
// It just reads the forwarded user headers and does its job.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userName = req.headers.get("x-user-name");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json({
    endpoint: "Dashboard",
    data: {
      panels: [
        { id: 1, title: "Request Rate", value: "1,243 req/s" },
        { id: 2, title: "Error Rate", value: "0.12%" },
        { id: 3, title: "P99 Latency", value: "143ms" },
        { id: 4, title: "Active Users", value: "892" },
      ],
    },
    meta: { servedTo: userName, role: userRole },
  });
}

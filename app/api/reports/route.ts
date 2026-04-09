// app/api/reports/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userName = req.headers.get("x-user-name");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json({
    endpoint: "Reports",
    data: {
      reports: [
        { id: "r1", title: "Q1 Performance", status: "ready", rows: 1420 },
        { id: "r2", title: "Monthly Active Users", status: "ready", rows: 892 },
        { id: "r3", title: "Revenue Breakdown", status: "processing", rows: null },
      ],
    },
    meta: { servedTo: userName, role: userRole },
  });
}

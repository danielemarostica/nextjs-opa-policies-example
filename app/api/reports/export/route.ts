// app/api/reports/export/route.ts
// Requires: reports:export action
// OPA policy additionally restricts this to weekdays for non-admins

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userName = req.headers.get("x-user-name");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json({
    endpoint: "Reports Export",
    data: {
      exportId: `exp_${Date.now()}`,
      format: "csv",
      estimatedRows: 14200,
      status: "queued",
      downloadUrl: "/exports/exp_123.csv",
    },
    meta: { servedTo: userName, role: userRole },
  });
}

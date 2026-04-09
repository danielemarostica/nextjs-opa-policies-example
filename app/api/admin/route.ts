// app/api/admin/route.ts
// Requires: admin:read — only admins have this in the OPA policy

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userName = req.headers.get("x-user-name");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json({
    endpoint: "Admin",
    data: {
      users: [
        { id: "u1", name: "Alice", role: "admin", lastLogin: "2026-04-08T10:00:00Z" },
        { id: "u2", name: "Bob", role: "editor", lastLogin: "2026-04-08T09:30:00Z" },
        { id: "u3", name: "Carol", role: "viewer", lastLogin: "2026-04-07T15:00:00Z" },
        { id: "u4", name: "Dave", role: "guest", lastLogin: "2026-04-06T11:00:00Z" },
      ],
      systemHealth: "ok",
    },
    meta: { servedTo: userName, role: userRole },
  });
}

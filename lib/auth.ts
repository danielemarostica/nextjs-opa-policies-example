// lib/auth.ts
// In a real app this would decode a JWT or look up a session.
// Here we simulate it by reading a ?token= query param or x-user-token header.
// The token value maps to a hardcoded user — stand-in for your IdP integration.

export type Role = "admin" | "editor" | "viewer" | "guest";

export interface User {
  id: string;
  name: string;
  role: Role;
  permissions: string[]; // explicit grants on top of role
}

// Simulated user store — replace with real JWT decode / DB lookup
const USERS: Record<string, User> = {
  "token-admin": {
    id: "u1",
    name: "Alice (Admin)",
    role: "admin",
    permissions: [],
  },
  "token-editor": {
    id: "u2",
    name: "Bob (Editor)",
    role: "editor",
    permissions: [],
  },
  "token-viewer": {
    id: "u3",
    name: "Carol (Viewer)",
    role: "viewer",
    permissions: [],
  },
  "token-guest": {
    id: "u4",
    name: "Dave (Guest)",
    role: "guest",
    permissions: [],
  },
  // Viewer with an explicit extra permission grant
  "token-viewer-plus": {
    id: "u5",
    name: "Eve (Viewer + reports:write)",
    role: "viewer",
    permissions: ["reports:export"],
  },
};

export function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  return USERS[token] ?? null;
}

export const ALL_TEST_TOKENS = Object.keys(USERS).map((token) => ({
  token,
  user: USERS[token],
}));

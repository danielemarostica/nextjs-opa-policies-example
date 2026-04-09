// lib/opa.ts
// Thin client for communicating with the OPA REST API.
// OPA exposes: POST /v1/data/{package}/{rule}
// We always call /v1/data/authz/allow

export interface OPAInput {
  user: {
    id: string;
    role: string;
    permissions: string[]; // explicit grants beyond role
  };
  action: string;   // e.g. "dashboard:read"
  resource?: string; // e.g. specific resource id if needed
}

export interface OPAResult {
  allow: boolean;
  deny_reason?: string;
}

const OPA_URL = process.env.OPA_URL ?? "http://localhost:8181";

export async function evaluate(input: OPAInput): Promise<OPAResult> {
  const response = await fetch(`${OPA_URL}/v1/data/authz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
    // In production: set a tight timeout
    signal: AbortSignal.timeout(2000),
  });

  if (!response.ok) {
    // Fail closed: if OPA is unreachable, deny
    console.error(`OPA returned ${response.status}`);
    return { allow: false, deny_reason: "policy engine unavailable" };
  }

  const data = await response.json();

  // OPA returns { result: { allow: bool, deny_reason: string } }
  // If the rule is undefined (no match), result is undefined → deny
  return {
    allow: data.result?.allow ?? false,
    deny_reason: data.result?.deny_reason,
  };
}

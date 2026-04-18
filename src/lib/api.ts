import { getSession } from "@/lib/session";

/** Serialize BigInt fields as strings so JSON.stringify doesn't throw. */
export function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

/** Build a JSON Response, serializing BigInt values as strings. */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, bigintReplacer), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Build a typed error Response. */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * Authenticate an API route and return the userId.
 * Returns a 401 Response when unauthenticated.
 * Never use requireSession() in API routes — it calls redirect() which is only
 * valid in Server Components and Server Actions.
 */
export async function apiUserId(): Promise<string | Response> {
  const session = await getSession();
  if (!session) return errorResponse("Unauthorized", 401);
  return session.user.id;
}

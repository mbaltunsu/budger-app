import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Returns the current session or null if unauthenticated.
 * Safe to call from any Server Component or Server Action.
 */
export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (!result) return null;
  return result;
}

/**
 * Returns the current session or redirects to /login.
 * Call from any protected Server Component or Server Action.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Convenience helper — returns the authenticated userId or throws.
 * MUST only be called after verifying the route is protected.
 */
export async function getUserId(): Promise<string> {
  const session = await requireSession();
  return session.user.id;
}

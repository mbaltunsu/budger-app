export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.BETTER_AUTH_SECRET = !!process.env.BETTER_AUTH_SECRET;
  checks.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "missing";

  try {
    const { auth } = await import("@/lib/auth");
    checks.authLoaded = true;
    checks.authKeys = Object.keys(auth);
  } catch (e) {
    checks.authLoaded = false;
    checks.authError = String(e);
  }

  try {
    const { toNextJsHandler } = await import("better-auth/next-js");
    const { auth } = await import("@/lib/auth");
    const handler = toNextJsHandler(auth);
    checks.handlerKeys = Object.keys(handler);
  } catch (e) {
    checks.handlerError = String(e);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.dbConnected = true;
  } catch (e) {
    checks.dbConnected = false;
    checks.dbError = String(e);
  }

  return Response.json(checks);
}

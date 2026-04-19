import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

async function withErrorLogging(req: Request, fn: (req: Request) => Promise<Response>): Promise<Response> {
  try {
    return await fn(req);
  } catch (err) {
    console.error("[auth] handler crash:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  return withErrorLogging(req, handler.GET);
}

export async function POST(req: Request) {
  return withErrorLogging(req, handler.POST);
}

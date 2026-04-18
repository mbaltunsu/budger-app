"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // No baseURL — Better Auth uses window.location.origin in the browser,
  // which is always same-origin and avoids CORS entirely.
});

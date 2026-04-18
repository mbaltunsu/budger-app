import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // App Router is the default in Next.js 15.
  // outputFileTracingRoot points to the monorepo root to silence the worktree
  // lockfile warning produced by Next.js when running inside a git worktree.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Lint is run as a separate CI step (npm run lint). Skip during next build to
  // avoid the ESLint plugin conflict caused by the parent-directory .eslintrc.json
  // being visible from the git worktree.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

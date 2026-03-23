import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude mongoose and mongodb from server-side bundling.
  // Required for Turbopack on Windows to avoid junction point panics
  // and for webpack to avoid bundling native Node.js modules.
  serverExternalPackages: ["mongoose", "mongodb", "bson", "kerberos"],
};

export default nextConfig;

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://candco.fr",
  "https://www.candco.fr",
];

// In development, also allow localhost
if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://127.0.0.1:3000");
}

/**
 * Validates Origin/Referer header against allowed origins to prevent CSRF.
 * Returns a 403 response if the origin is not allowed, or null if OK.
 */
export function checkCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // At least one must be present for POST requests
  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Requete non autorisee" },
      { status: 403 }
    );
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin || !ALLOWED_ORIGINS.includes(requestOrigin)) {
    return NextResponse.json(
      { error: "Origine non autorisee" },
      { status: 403 }
    );
  }

  return null; // OK
}

/**
 * Extract client IP with basic spoofing protection.
 * Trusts x-forwarded-for only the first IP (closest to client).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take only the first IP (client IP), ignore proxy chain
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

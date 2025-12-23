/**
 * Session Management Utilities (Server-Side Only)
 *
 * Provides secure session management for authentication:
 * - Cookie-based sessions
 * - User ID storage
 * - Session creation/destruction
 * - Authentication helpers
 *
 * TODO: Configure session secret in environment variables
 * TODO: Implement user authentication logic
 */

import { createCookieSessionStorage } from "react-router";

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-me";

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set in production");
}

// Create session storage
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };

/**
 * Get user ID from session
 */
export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  return userId ? Number(userId) : null;
}

/**
 * Require authenticated user (or redirect to login)
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<number> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw new Response("Unauthorized", {
      status: 302,
      headers: {
        Location: `/login?${searchParams}`,
      },
    });
  }
  return userId;
}

/**
 * Create user session
 */
export async function createUserSession(
  userId: number,
  redirectTo: string
): Promise<Response> {
  const session = await getSession();
  session.set("userId", userId);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await commitSession(session),
    },
  });
}

/**
 * Logout user (destroy session)
 */
export async function logout(request: Request): Promise<Response> {
  const session = await getSession(request.headers.get("Cookie"));

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": await destroySession(session),
    },
  });
}

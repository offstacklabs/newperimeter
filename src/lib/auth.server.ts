import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "./db.server";
import { sendEmail } from "./email.server";
import { randomHex } from "./random";

export const authBaseUrl = process.env["BETTER_AUTH_URL"] ?? "http://localhost:8080";
const trustedOriginSet = new Set<string>([
  new URL(authBaseUrl).origin,
  "https://newperimeter.dev",
  "https://www.newperimeter.dev",
]);

if (process.env["NODE_ENV"] !== "production") {
  for (const port of [3000, 5173, 8080]) {
    trustedOriginSet.add(`http://localhost:${port}`);
    trustedOriginSet.add(`http://127.0.0.1:${port}`);
  }
}

const vercelHost = process.env["VERCEL_URL"];
if (vercelHost && /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(vercelHost)) {
  trustedOriginSet.add(`https://${vercelHost}`);
}

const trustedOrigins = [...trustedOriginSet];
const authSecret = process.env["BETTER_AUTH_SECRET"] ??
  (process.env["NODE_ENV"] === "production" ? "" : randomHex(32));
if (!authSecret || authSecret.length < 32) {
  throw new Error("Set BETTER_AUTH_SECRET to a random value with at least 32 characters.");
}

if (process.env["NODE_ENV"] === "production" && !process.env["BETTER_AUTH_URL"]) {
  throw new Error("BETTER_AUTH_URL must be set to the public application URL.");
}

export const auth = betterAuth({
  appName: "New Perimeter",
  baseURL: authBaseUrl,
  trustedOrigins,
  secret: authSecret,
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your New Perimeter account",
        text: `Verify your email address to finish creating your account: ${url}`,
        html: `<p>Verify your email address to finish creating your account.</p><p><a href="${url}">Verify email</a></p>`,
      });
    },
  },
  advanced: {
    database: { generateId: () => globalThis.crypto.randomUUID() },
  },
  plugins: [tanstackStartCookies()],
});

export function isTrustedRequestOrigin(origin: string | null) {
  return origin !== null && trustedOriginSet.has(origin);
}

import { SignJWT, jwtVerify } from "jose";

const PURPOSE = "lead-form";
const TTL = "10m";

function getLeadFormSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CONVEX_BRIDGE_SECRET ||
    "zerobug-dev-lead-form-secret";
  return new TextEncoder().encode(secret);
}

/** Short-lived JWT required by leads:create to stop unsolicited spam bots. */
export async function issueLeadFormToken(): Promise<string> {
  return await new SignJWT({ purpose: PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .setJti(crypto.randomUUID())
    .sign(getLeadFormSecret());
}

export async function verifyLeadFormToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getLeadFormSecret());
    return payload.purpose === PURPOSE;
  } catch {
    return false;
  }
}

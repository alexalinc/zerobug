import { jwtVerify } from "jose";

const PURPOSE = "lead-form";

function getLeadFormSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.CONVEX_BRIDGE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("Form token secret not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function requireLeadFormToken(token: string): Promise<void> {
  if (!token || typeof token !== "string" || token.length > 4096) {
    throw new Error("Formular expirat — reîncarcă pagina");
  }
  try {
    const { payload } = await jwtVerify(token, getLeadFormSecret());
    if (payload.purpose !== PURPOSE) {
      throw new Error("Formular expirat — reîncarcă pagina");
    }
  } catch {
    throw new Error("Formular expirat — reîncarcă pagina");
  }
}

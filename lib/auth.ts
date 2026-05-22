import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-warung-kasir-digital-12345";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Kasir";
  exp: number;
}

export function signJwt(payload: Omit<UserSession, "exp">, expiresInSeconds = 86400): string {
  const exp = Date.now() + expiresInSeconds * 1000;
  const fullPayload: UserSession = { ...payload, exp };

  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyJwt(token: string): UserSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [base64Header, base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${base64Header}.${base64Payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8")) as UserSession;

    // Check expiry timestamp
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

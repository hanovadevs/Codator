import crypto from "crypto";

/**
 * Signs a member payload using HMAC-SHA256.
 */
export function signPassToken(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies a member payload against a signed token using timing-safe comparison.
 */
export function verifyPassToken(payload: string, token: string, secret: string): boolean {
  const expectedToken = signPassToken(payload, secret);
  try {
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expectedToken, "hex");
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

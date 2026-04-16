import type { SessionUser } from "../../shared/contracts";

type SessionPayload = {
  userId: string;
  userLabel: string;
  expiresAt: number;
};

const SESSION_COOKIE_NAME = "modelcut_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const missingPadding = padded.length % 4;
  const normalized =
    missingPadding === 0 ? padded : `${padded}${"=".repeat(4 - missingPadding)}`;
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeBase64Url(value: string): string {
  return bytesToBase64Url(textEncoder.encode(value));
}

function decodeBase64Url(value: string): string {
  return textDecoder.decode(base64UrlToBytes(value));
}

async function importSecret(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importSecret(secret),
    textEncoder.encode(value),
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

function parseCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}

function shouldUseSecureCookie(request: Request): boolean {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  return url.protocol === "https:" || forwardedProto === "https";
}

export async function createSessionCookie(
  request: Request,
  secret: string,
  user: SessionUser,
): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id,
    userLabel: user.label,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const rawPayload = JSON.stringify(payload);
  const encodedPayload = encodeBase64Url(rawPayload);
  const signature = await sign(encodedPayload, secret);

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodedPayload}.${signature}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];

  if (shouldUseSecureCookie(request)) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearSessionCookie(request: Request): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (shouldUseSecureCookie(request)) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export async function readSession(
  request: Request,
  secret: string,
): Promise<SessionUser | null> {
  const cookieValue = parseCookie(request, SESSION_COOKIE_NAME);
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, encodedSignature] = cookieValue.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload, secret);
  if (expectedSignature !== encodedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return {
      id: payload.userId,
      label: payload.userLabel,
    };
  } catch {
    return null;
  }
}

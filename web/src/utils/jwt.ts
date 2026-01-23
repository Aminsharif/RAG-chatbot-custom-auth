export type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[] | string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

export type ParsedToken = {
  raw: string;
  payload: JwtPayload;
  expiresAt: number | null;
};

const decodeBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  return atob(padded);
};

export const parseJwt = (token: string): ParsedToken | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson) as JwtPayload;
    const expiresAt = payload.exp ? payload.exp * 1000 : null;
    return { raw: token, payload, expiresAt };
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string) => {
  const parsed = parseJwt(token);
  return parsed?.expiresAt ?? null;
};

export const isTokenExpired = (token: string, offsetMs = 0) => {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - offsetMs;
};

export const getRefreshDelayMs = (token: string, safetyMs = 60_000) => {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return null;
  const delay = expiresAt - Date.now() - safetyMs;
  if (delay <= 0) return 0;
  return delay;
};

export const extractUserClaims = (token: string) => {
  const parsed = parseJwt(token);
  if (!parsed) return null;
  const { payload } = parsed;
  const rolesValue = payload.roles;
  const roles =
    typeof rolesValue === "string" ? [rolesValue] : rolesValue ?? [];
  return {
    id: payload.sub ?? "",
    email: payload.email ?? "",
    name: payload.name ?? "",
    roles,
    raw: payload,
  };
};


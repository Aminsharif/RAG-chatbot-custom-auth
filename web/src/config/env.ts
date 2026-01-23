export type AppEnv = {
  apiBaseUrl: string;
  authApiBaseUrl: string;
  appBaseUrl: string;
  encryptionKey: string;
};

export const env: AppEnv = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:4000",
  authApiBaseUrl:
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ??
    "/api/v1",
  appBaseUrl:
    process.env.NEXT_PUBLIC_APP_BASE_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"),
  encryptionKey:
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ?? "fallback-encryption-key",
};


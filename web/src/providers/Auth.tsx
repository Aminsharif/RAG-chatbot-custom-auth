"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authTokenStore, AuthTokens, AuthUser } from "@/lib/authTokenStore";
import { extractUserClaims, getRefreshDelayMs } from "@/utils/jwt";
import { secureStorage } from "@/utils/secureStorage";
import { api } from "@/lib/httpClient";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (params: {
    email: string;
    password: string;
    remember?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth:tokens";

let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

const clearRefreshTimeout = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

const scheduleRefresh = (accessToken: string, refresh: () => Promise<void>) => {
  clearRefreshTimeout();
  const delay = getRefreshDelayMs(accessToken, 60_000);
  if (delay == null) return;
  refreshTimeout = setTimeout(() => {
    refresh().catch(() => undefined);
  }, delay);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {
      void 0;
    } finally {
      secureStorage.remove(STORAGE_KEY);
      setTokens(null);
      setUser(null);
      setStatus("unauthenticated");
      authTokenStore.setState({ tokens: null, user: null });
      clearRefreshTimeout();
      setIsLoading(false);
      if (typeof window !== "undefined") {
        document.cookie = "access_token=; Max-Age=0; path=/";
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    const current = authTokenStore.getState().tokens;
    if (!current?.refreshToken) return;
    try {
      const response = await api.post("/auth/refresh", {
        refreshToken: current.refreshToken,
      });
      const data = response.data as {
        accessToken: string;
        refreshToken?: string;
        user: AuthUser;
      };
      const claims = extractUserClaims(data.accessToken);
      if (!claims) return;
      const nextTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? current.refreshToken,
        user: data.user
      };
      const nextUser: AuthUser = {
        id: claims.id,
        email: claims.email,
        name: claims.name,
        roles: claims.roles,
        raw: claims.raw,
      };
      setTokens(nextTokens);
      setUser(nextUser);
      setStatus("authenticated");
      authTokenStore.setState({ tokens: nextTokens, user: nextUser });
      secureStorage.set(STORAGE_KEY, nextTokens);
      scheduleRefresh(nextTokens.accessToken, handleRefresh);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:refresh"));
      }
    } catch {
      await handleLogout();
    }
  }, [handleLogout]);

  const handleLogin = useCallback(
    async (params: { email: string; password: string; remember?: boolean }) => {
      setIsLoading(true);
      try {
        const response = await api.post("/auth/login", params);
        const data = response.data as {
          access_token: string;
          refresh_token: string;
          user: AuthUser;
        };
        // const claims = extractUserClaims(data.access_token);
        // if (!claims) {
        //   throw new Error("Invalid token payload");
        // }
        const authValue: AuthTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user
        };

        setTokens(authValue);
        setUser(authValue.user);
        setStatus("authenticated");
        authTokenStore.setState({ tokens: authValue, user: authValue.user });
        if (params.remember ?? false) {
          secureStorage.set(STORAGE_KEY, authValue);
        } else {
          secureStorage.remove(STORAGE_KEY);
        }
        scheduleRefresh(authValue.accessToken, handleRefresh);
        if (typeof document !== "undefined") {
          document.cookie = "access_token=1; path=/";
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleRefresh],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = secureStorage.get<AuthTokens>(STORAGE_KEY);
    if (stored?.accessToken) {
      const claims = extractUserClaims(stored.accessToken);
      if (claims) {
        const nextUser: AuthUser = {
          id: claims.id,
          email: claims.email,
          name: claims.name,
          roles: claims.roles,
          raw: claims.raw,
        };
        setUser(nextUser);
        setTokens(stored);
        authTokenStore.setState({ tokens: stored, user: nextUser });
        setStatus("authenticated");
        scheduleRefresh(stored.accessToken, handleRefresh);
      } else {
        secureStorage.remove(STORAGE_KEY);
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
    setIsLoading(false);
  }, [handleRefresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const listener = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = secureStorage.get<AuthTokens>(STORAGE_KEY);
      if (!next) {
        setTokens(null);
        setUser(null);
        authTokenStore.setState({ tokens: null, user: null });
        setStatus("unauthenticated");
        clearRefreshTimeout();
        return;
      }
      const claims = extractUserClaims(next.accessToken);
      if (!claims) return;
      const nextUser: AuthUser = {
        id: claims.id,
        email: claims.email,
        name: claims.name,
        roles: claims.roles,
        raw: claims.raw,
      };
      setTokens(next);
      setUser(next.user);
      authTokenStore.setState({ tokens: next, user: nextUser });
      setStatus("authenticated");
      scheduleRefresh(next.accessToken, handleRefresh);
    };
    window.addEventListener("storage", listener);
    const unauthorizedListener = () => {
      setTokens(null);
      setUser(null);
      authTokenStore.setState({ tokens: null, user: null });
      setStatus("unauthenticated");
      clearRefreshTimeout();
    };
    window.addEventListener("auth:unauthorized", unauthorizedListener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("auth:unauthorized", unauthorizedListener);
    };
  }, [handleRefresh]);

  const value: AuthContextValue = useMemo(
    () => ({
      status,
      user,
      tokens,
      isLoading,
      login: handleLogin,
      logout: handleLogout,
      refresh: handleRefresh,
    }),
    [status, user, tokens, isLoading, handleLogin, handleLogout, handleRefresh],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

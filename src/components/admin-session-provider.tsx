"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AdminSessionContextValue = {
  /** undefined = loading, null = missing/unauth, string = JWT */
  token: string | null | undefined;
  refresh: () => Promise<void>;
  clear: () => void;
};

const AdminSessionContext = createContext<AdminSessionContextValue>({
  token: undefined,
  refresh: async () => {},
  clear: () => {},
});

const STORAGE_KEY = "zb_admin_convex_token";

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  const clear = useCallback(() => {
    setToken(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session-token", {
        cache: "no-store",
      });
      if (!res.ok) {
        clear();
        return;
      }
      const data = (await res.json()) as { token?: string };
      const next = typeof data.token === "string" ? data.token : null;
      setToken(next);
      try {
        if (next) sessionStorage.setItem(STORAGE_KEY, next);
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      clear();
    }
  }, [clear]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Cross-tab logout: storage event when another tab clears the key
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue == null) {
        setToken(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AdminSessionContext.Provider value={{ token, refresh, clear }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSessionToken() {
  return useContext(AdminSessionContext).token;
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

/** Skip Convex subscriptions until the admin JWT is available. */
export function withAdminToken<T extends Record<string, unknown>>(
  token: string | null | undefined,
  args: T = {} as T,
): (T & { sessionToken: string }) | "skip" {
  if (!token) return "skip";
  return { ...args, sessionToken: token };
}

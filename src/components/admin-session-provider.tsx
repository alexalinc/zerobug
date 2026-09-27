"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AdminSessionContextValue = {
  /** undefined = loading, null = missing/unauth, string = JWT */
  token: string | null | undefined;
  refresh: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSessionContextValue>({
  token: undefined,
  refresh: async () => {},
});

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  async function refresh() {
    try {
      const res = await fetch("/api/admin/session-token", {
        cache: "no-store",
      });
      if (!res.ok) {
        setToken(null);
        return;
      }
      const data = (await res.json()) as { token?: string };
      setToken(typeof data.token === "string" ? data.token : null);
    } catch {
      setToken(null);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AdminSessionContext.Provider value={{ token, refresh }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSessionToken() {
  return useContext(AdminSessionContext).token;
}

/** Skip Convex subscriptions until the admin JWT is available. */
export function withAdminToken<T extends Record<string, unknown>>(
  token: string | null | undefined,
  args: T = {} as T,
): (T & { sessionToken: string }) | "skip" {
  if (!token) return "skip";
  return { ...args, sessionToken: token };
}

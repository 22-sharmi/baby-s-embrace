import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role } from "@/lib/types";

const STORAGE_KEY = "ll.role";

interface RoleCtx {
  role: Role | null;
  setRole: (r: Role | null) => void;
  ready: boolean;
}

const Ctx = createContext<RoleCtx | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as Role | null;
      if (v) setRoleState(v);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setRole = (r: Role | null) => {
    setRoleState(r);
    try {
      if (r) localStorage.setItem(STORAGE_KEY, r);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return <Ctx.Provider value={{ role, setRole, ready }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

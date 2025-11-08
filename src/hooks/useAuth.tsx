// src/hooks/useAuth.ts

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AppRole =
  | "admin"
  | "col"
  | "ptec_com"
  | "ptec_mb"
  | "ptec_sau"
  | "ptec_rh"
  | "ptec_trp"
  | "ptec_auto"
  | "ptec_blind"
  | "ptec_op"
  | "ptec_armto"
  | "p_distr"
  | "oficina_com"
  | "oficina_auto"
  | "oficina_blind"
  | "oficina_op"
  | "oficina_armto"
  | "cia_sup"
  | "cia_trp"
  | "cia_mnt";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nomeGuerra: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Busca as roles do usuário logado no Supabase
   * e normaliza para lowercase para evitar erros de comparação
   */
  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!error && data) {
      const normalizedRoles = data.map((r: any) =>
        r.role?.toLowerCase().trim() as AppRole
      );
      setRoles(normalizedRoles);
      console.log("📋 Roles carregadas:", normalizedRoles);
    } else {
      console.error("Erro ao buscar roles:", error);
      setRoles([]);
    }
  };

  /**
   * Efeito de autenticação e persistência de sessão
   * Agora garante que o loading só finalize após as roles carregarem
   */
  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setLoading(true); // aguarda carregamento real
        await fetchUserRoles(session.user.id);
      } else {
        setRoles([]);
      }

      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuthChange(session);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleAuthChange(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Autenticação
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, nomeGuerra: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome_guerra: nomeGuerra },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    navigate("/auth");
  };

  /**
   * Verificação de role
   * Aceita tanto role específica quanto admin como super role
   */
  const hasRole = (role: AppRole) => {
    const normalizedRole = role.toLowerCase() as AppRole;
    return roles.includes(normalizedRole) || roles.includes("admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

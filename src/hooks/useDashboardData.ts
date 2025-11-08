import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ModuleData = {
  id: string;
  name: string;
  color: string;
  icon: string;
  data: any[];
  stats: {
    total: number;
    concluidas: number;
    pendentes: number;
  };
};

export const useDashboardData = () => {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = roles.includes("admin") || roles.includes("col");

  // Determinar módulos visíveis
  const getVisibleModules = () => {
    if (isAdmin) {
      return [
        "cia_mnt",
        "cia_rh",
        "cia_sau",
        "cia_trp",
        "cia_sup",
        "col",
      ];
    }

    // Se for 2pel_p, tem acesso a oficina_auto e oficina_blind
    if (roles.includes("2pel_p")) {
      return ["oficina_auto", "oficina_blind"];
    }

    // Usuário específico vê apenas seu módulo
    const userModule = roles.find(
      (r) => r.startsWith("ptec_") || r.startsWith("oficina_") || r.startsWith("cia_") || r === "p_distr",
    );

    return userModule ? [userModule] : [];
  };

  const visibleModules = getVisibleModules();

  // Fetch data para CIA MNT (OS Centralizadas)
  const { data: ciaMntData } = useQuery({
    queryKey: ["cia_mnt_os_centralizadas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cia_mnt_os_centralizadas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_mnt"),
  });

  // Fetch data para CIA modules (ACISO)
  const { data: ciaRhData } = useQuery({
    queryKey: ["cia_rh_aciso"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ptec_rh_aciso")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_rh") || visibleModules.includes("ptec_rh"),
  });

  const { data: ciaSauData } = useQuery({
    queryKey: ["cia_sau_prontuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ptec_sau_prontuarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_sau") || visibleModules.includes("ptec_sau"),
  });

  const { data: ciaSauPmsData } = useQuery({
    queryKey: ["cia_sau_pms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ptec_sau_pms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_sau") || visibleModules.includes("ptec_sau"),
  });

  const { data: ciaTrpData } = useQuery({
    queryKey: ["cia_trp_transportes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cia_sup_pedidos_transporte")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_trp") || visibleModules.includes("ptec_trp"),
  });

  const { data: ciaSupData } = useQuery({
    queryKey: ["col_pedidos_sup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("col_pedidos_sup")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("cia_sup") || visibleModules.includes("col"),
  });

  const { data: pedidosMaterialData } = useQuery({
    queryKey: ["ptec_pedidos_material"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ptec_pedidos_material")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes("p_distr") || isAdmin,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("dashboard_realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        queryClient.invalidateQueries({ queryKey: ["cia_mnt_os_centralizadas"] });
        queryClient.invalidateQueries({ queryKey: ["cia_rh_aciso"] });
        queryClient.invalidateQueries({ queryKey: ["cia_sau_prontuarios"] });
        queryClient.invalidateQueries({ queryKey: ["cia_sau_pms"] });
        queryClient.invalidateQueries({ queryKey: ["cia_trp_transportes"] });
        queryClient.invalidateQueries({ queryKey: ["cia_sup_pedidos_transporte"] });
        queryClient.invalidateQueries({ queryKey: ["col_pedidos_sup"] });
        queryClient.invalidateQueries({ queryKey: ["ptec_pedidos_material"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Processar dados dos módulos
  const processModuleData = (module: string): ModuleData | null => {
    let data: any[] = [];
    let name = "";
    let color = "";
    let icon = "";

    switch (module) {
      case "cia_mnt":
        data = ciaMntData || [];
        name = "Companhia de Manutenção";
        color = "from-slate-600 to-slate-800";
        icon = "🔧";
        break;
      case "cia_rh":
      case "ptec_rh":
        data = ciaRhData || [];
        name = "Recursos Humanos";
        color = "from-purple-500 to-purple-700";
        icon = "👥";
        break;
      case "cia_sau":
      case "ptec_sau":
        data = [...(ciaSauData || []), ...(ciaSauPmsData || [])];
        name = "Saúde";
        color = "from-pink-500 to-pink-700";
        icon = "❤️";
        break;
      case "cia_trp":
      case "ptec_trp":
        data = ciaTrpData || [];
        name = "Transporte";
        color = "from-blue-800 to-blue-900";
        icon = "🚛";
        break;
      case "cia_sup":
      case "col":
        data = ciaSupData || [];
        name = module === "col" ? "COL - Pedidos Sup" : "Suprimentos";
        color = "from-yellow-500 to-yellow-700";
        icon = "🏪";
        break;
      case "p_distr":
        data = pedidosMaterialData || [];
        name = "Posto de Distribuição";
        color = "from-indigo-500 to-indigo-700";
        icon = "📦";
        break;
      default:
        return null;
    }

    const total = data.length;
    const concluidas = data.filter((item: any) => item.situacao === "Concluída" || item.status === "Entregue").length;
    const pendentes = total - concluidas;

    return {
      id: module,
      name,
      color,
      icon,
      data,
      stats: { total, concluidas, pendentes },
    };
  };

  const modulesData = visibleModules.map(processModuleData).filter(Boolean) as ModuleData[];

  return {
    modulesData,
    isAdmin,
    visibleModules,
  };
};

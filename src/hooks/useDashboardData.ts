import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const isAdmin = roles.includes('admin') || roles.includes('col');

  // Determinar módulos visíveis
  const getVisibleModules = () => {
    if (isAdmin) {
      return [
        'ptec_com', 'ptec_auto', 'ptec_blind', 'ptec_op', 'ptec_armto',
        'oficina_com', 'oficina_auto', 'oficina_blind', 'oficina_op', 'oficina_armto',
        'cia_rh', 'cia_sau', 'cia_trp', 'cia_sup', 'col'
      ];
    }

    // Usuário específico vê apenas seu módulo
    const userModule = roles.find(r => 
      r.startsWith('ptec_') || 
      r.startsWith('oficina_') || 
      r.startsWith('cia_') ||
      r === 'p_distr'
    );

    return userModule ? [userModule] : [];
  };

  const visibleModules = getVisibleModules();

  // Fetch data para PTEC modules
  const { data: ptecComData } = useQuery({
    queryKey: ['ptec_com_os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_com_os')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('ptec_com') || visibleModules.includes('oficina_com'),
  });

  const { data: ptecAutoData } = useQuery({
    queryKey: ['ptec_auto_os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_auto_os')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('ptec_auto') || visibleModules.includes('oficina_auto'),
  });

  const { data: ptecBlindData } = useQuery({
    queryKey: ['ptec_blind_os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_blind_os')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('ptec_blind') || visibleModules.includes('oficina_blind'),
  });

  const { data: ptecOpData } = useQuery({
    queryKey: ['ptec_op_os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_op_os')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('ptec_op') || visibleModules.includes('oficina_op'),
  });

  const { data: ptecArmtoData } = useQuery({
    queryKey: ['ptec_armto_os'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_armto_os')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('ptec_armto') || visibleModules.includes('oficina_armto'),
  });

  // Fetch data para CIA modules
  const { data: ciaRhData } = useQuery({
    queryKey: ['cia_rh_ocorrencias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_rh_ocorrencias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('cia_rh') || visibleModules.includes('ptec_rh'),
  });

  const { data: ciaSauData } = useQuery({
    queryKey: ['cia_sau_prontuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_sau_prontuarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('cia_sau') || visibleModules.includes('ptec_sau'),
  });

  const { data: ciaTrpData } = useQuery({
    queryKey: ['cia_trp_transportes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cia_sup_pedidos_transporte')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('cia_trp') || visibleModules.includes('ptec_trp'),
  });

  const { data: ciaSupData } = useQuery({
    queryKey: ['col_pedidos_sup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('col_pedidos_sup')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('cia_sup') || visibleModules.includes('col'),
  });

  const { data: pedidosMaterialData } = useQuery({
    queryKey: ['ptec_pedidos_material'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ptec_pedidos_material')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: visibleModules.includes('p_distr') || isAdmin,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ptec_com_os'] });
        queryClient.invalidateQueries({ queryKey: ['ptec_auto_os'] });
        queryClient.invalidateQueries({ queryKey: ['ptec_blind_os'] });
        queryClient.invalidateQueries({ queryKey: ['ptec_op_os'] });
        queryClient.invalidateQueries({ queryKey: ['ptec_armto_os'] });
        queryClient.invalidateQueries({ queryKey: ['cia_rh_ocorrencias'] });
        queryClient.invalidateQueries({ queryKey: ['cia_sau_prontuarios'] });
        queryClient.invalidateQueries({ queryKey: ['cia_trp_transportes'] });
        queryClient.invalidateQueries({ queryKey: ['cia_sup_pedidos_transporte'] });
        queryClient.invalidateQueries({ queryKey: ['col_pedidos_sup'] });
        queryClient.invalidateQueries({ queryKey: ['ptec_pedidos_material'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Processar dados dos módulos
  const processModuleData = (module: string): ModuleData | null => {
    let data: any[] = [];
    let name = '';
    let color = '';
    let icon = '';

    switch (module) {
      case 'ptec_com':
      case 'oficina_com':
        data = ptecComData || [];
        name = module === 'ptec_com' ? 'PTEC Comunicações' : 'Oficina Comunicações';
        color = 'from-blue-500 to-blue-700';
        icon = '💻';
        break;
      case 'ptec_auto':
      case 'oficina_auto':
        data = ptecAutoData || [];
        name = module === 'ptec_auto' ? 'PTEC Auto' : 'Oficina Auto';
        color = 'from-orange-500 to-orange-700';
        icon = '🚗';
        break;
      case 'ptec_blind':
      case 'oficina_blind':
        data = ptecBlindData || [];
        name = module === 'ptec_blind' ? 'PTEC Blindados' : 'Oficina Blindados';
        color = 'from-gray-500 to-gray-700';
        icon = '🛡️';
        break;
      case 'ptec_op':
      case 'oficina_op':
        data = ptecOpData || [];
        name = module === 'ptec_op' ? 'PTEC Operações' : 'Oficina Operações';
        color = 'from-green-500 to-green-700';
        icon = '⚙️';
        break;
      case 'ptec_armto':
      case 'oficina_armto':
        data = ptecArmtoData || [];
        name = module === 'ptec_armto' ? 'PTEC Armamento' : 'Oficina Armamento';
        color = 'from-red-500 to-red-700';
        icon = '⚔️';
        break;
      case 'cia_rh':
      case 'ptec_rh':
        data = ciaRhData || [];
        name = 'Recursos Humanos';
        color = 'from-purple-500 to-purple-700';
        icon = '👥';
        break;
      case 'cia_sau':
      case 'ptec_sau':
        data = ciaSauData || [];
        name = 'Saúde';
        color = 'from-pink-500 to-pink-700';
        icon = '❤️';
        break;
      case 'cia_trp':
      case 'ptec_trp':
        data = ciaTrpData || [];
        name = 'Transporte';
        color = 'from-blue-800 to-blue-900';
        icon = '🚛';
        break;
      case 'cia_sup':
      case 'col':
        data = ciaSupData || [];
        name = module === 'col' ? 'COL - Pedidos Sup' : 'Suprimentos';
        color = 'from-yellow-500 to-yellow-700';
        icon = '🏪';
        break;
      case 'p_distr':
        data = pedidosMaterialData || [];
        name = 'Posto de Distribuição';
        color = 'from-indigo-500 to-indigo-700';
        icon = '📦';
        break;
      default:
        return null;
    }

    const total = data.length;
    const concluidas = data.filter((item: any) => 
      item.situacao === 'Concluída' || item.status === 'Entregue'
    ).length;
    const pendentes = total - concluidas;

    return {
      id: module,
      name,
      color,
      icon,
      data,
      stats: { total, concluidas, pendentes }
    };
  };

  const modulesData = visibleModules
    .map(processModuleData)
    .filter(Boolean) as ModuleData[];

  return {
    modulesData,
    isAdmin,
    visibleModules,
  };
};

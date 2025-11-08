import { supabase } from "@/integrations/supabase/client";

export const getNextCentralizedOSNumber = async (): Promise<string> => {
  try {
    // @ts-ignore - função RPC será criada pela migração
    const { data, error } = await supabase.rpc('get_next_os_number');
    
    if (error) {
      console.error("Erro ao buscar próximo número de OS:", error);
      // Fallback: buscar manualmente
      return await getFallbackOSNumber();
    }
    
    return (data as unknown as string) || "001";
  } catch (error) {
    console.error("Erro ao chamar função get_next_os_number:", error);
    return await getFallbackOSNumber();
  }
};

const getFallbackOSNumber = async (): Promise<string> => {
  try {
    // Buscar o maior número entre todas as tabelas
    const tables = ['ptec_com_os', 'ptec_auto_os', 'ptec_blind_os', 'ptec_op_os', 'ptec_armto_os'];
    let maxNumber = 0;

    for (const table of tables) {
      try {
        const { data } = await supabase
          .from(table as any)
          .select('numero_os')
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const num = parseInt((data[0] as any).numero_os);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      } catch (err) {
        console.error(`Erro ao buscar de ${table}:`, err);
      }
    }

    return (maxNumber + 1).toString().padStart(3, '0');
  } catch (error) {
    console.error("Erro no fallback de numeração:", error);
    return "001";
  }
};

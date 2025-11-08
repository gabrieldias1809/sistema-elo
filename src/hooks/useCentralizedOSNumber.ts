import { supabase } from "@/integrations/supabase/client";

export const getNextCentralizedOSNumber = async (): Promise<string> => {
  console.log("🔢 Iniciando busca de próximo número de OS");
  try {
    // @ts-ignore - função RPC será criada pela migração
    const { data, error } = await supabase.rpc('get_next_os_number');
    
    if (error) {
      console.error("❌ Erro ao buscar próximo número de OS via RPC:", error);
      console.log("🔄 Usando fallback manual");
      // Fallback: buscar manualmente
      return await getFallbackOSNumber();
    }
    
    console.log("✅ Número de OS obtido via RPC:", data);
    return (data as unknown as string) || "001";
  } catch (error) {
    console.error("❌ Erro ao chamar função get_next_os_number:", error);
    console.log("🔄 Usando fallback manual");
    return await getFallbackOSNumber();
  }
};

const getFallbackOSNumber = async (): Promise<string> => {
  console.log("🔍 Buscando próximo número de OS manualmente");
  try {
    // Buscar o maior número entre todas as tabelas
    const tables = ['ptec_com_os', 'ptec_auto_os', 'ptec_blind_os', 'ptec_op_os', 'ptec_armto_os'];
    let maxNumber = 0;

    for (const table of tables) {
      try {
        console.log(`📊 Consultando tabela: ${table}`);
        const { data, error } = await supabase
          .from(table as any)
          .select('numero_os')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error(`❌ Erro ao consultar ${table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const num = parseInt((data[0] as any).numero_os);
          console.log(`  → Último número encontrado em ${table}: ${(data[0] as any).numero_os} (parsed: ${num})`);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        } else {
          console.log(`  → Nenhum registro em ${table}`);
        }
      } catch (err) {
        console.error(`❌ Exceção ao buscar de ${table}:`, err);
      }
    }

    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    console.log(`✅ Próximo número de OS calculado: ${nextNumber} (máximo encontrado: ${maxNumber})`);
    return nextNumber;
  } catch (error) {
    console.error("❌ Erro fatal no fallback de numeração:", error);
    console.log("⚠️ Retornando número padrão: 001");
    return "001";
  }
};

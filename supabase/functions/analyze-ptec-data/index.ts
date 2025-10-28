import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ptecs, startDate, endDate, userPrompt } = await req.json();
    
    const authHeader = req.headers.get('authorization');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY');

    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      { 
        global: { 
          headers: { Authorization: authHeader! } 
        } 
      }
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching data for ptecs:', ptecs, 'from', startDate, 'to', endDate);

    // Coletar dados de cada Ptec selecionado
    const dataContext: any = {};

    if (ptecs.includes('com')) {
      const { data, error } = await supabaseClient
        .from('ptec_com_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_com = data;
    }

    if (ptecs.includes('mb')) {
      const { data, error } = await supabaseClient
        .from('ptec_mb_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_mb = data;
    }

    if (ptecs.includes('auto')) {
      const { data, error } = await supabaseClient
        .from('ptec_auto_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_auto = data;
    }

    if (ptecs.includes('blind')) {
      const { data, error } = await supabaseClient
        .from('ptec_blind_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_blind = data;
    }

    if (ptecs.includes('op')) {
      const { data, error } = await supabaseClient
        .from('ptec_op_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_op = data;
    }

    if (ptecs.includes('armto')) {
      const { data, error } = await supabaseClient
        .from('ptec_armto_os')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_armto = data;
    }

    if (ptecs.includes('sau')) {
      const { data: pms, error: pmsError } = await supabaseClient
        .from('ptec_sau_pms')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      const { data: prontuarios, error: prontuariosError } = await supabaseClient
        .from('ptec_sau_prontuarios')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (!pmsError && !prontuariosError) {
        dataContext.ptec_sau = { pms, prontuarios };
      }
    }

    if (ptecs.includes('rh')) {
      const { data, error } = await supabaseClient
        .from('ptec_rh_ocorrencias')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_rh = data;
    }

    if (ptecs.includes('trp')) {
      const { data, error } = await supabaseClient
        .from('ptec_trp_transportes')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      if (!error) dataContext.ptec_trp = data;
    }

    // Preparar estatísticas agregadas
    const statistics: any = {};
    
    Object.keys(dataContext).forEach(ptecKey => {
      const ptecData = dataContext[ptecKey];
      
      if (ptecKey === 'ptec_sau') {
        statistics[ptecKey] = {
          total_pms: ptecData.pms?.length || 0,
          total_prontuarios: ptecData.prontuarios?.length || 0,
        };
      } else if (ptecKey === 'ptec_rh') {
        statistics[ptecKey] = {
          total_ocorrencias: ptecData?.length || 0,
          total_corpos: ptecData?.reduce((sum: number, item: any) => sum + (item.quantidade_corpos || 0), 0) || 0,
        };
      } else if (ptecKey === 'ptec_trp') {
        statistics[ptecKey] = {
          total_transportes: ptecData?.length || 0,
          total_km: ptecData?.reduce((sum: number, item: any) => {
            const kmSaida = item.odometro_saida || 0;
            const kmRetorno = item.odometro_retorno || 0;
            return sum + (kmRetorno - kmSaida);
          }, 0) || 0,
        };
      } else {
        // Para Ptecs com OS
        const concluidas = ptecData?.filter((os: any) => os.situacao === 'Concluída').length || 0;
        const total = ptecData?.length || 0;
        
        statistics[ptecKey] = {
          total_os: total,
          os_concluidas: concluidas,
          taxa_conclusao: total > 0 ? ((concluidas / total) * 100).toFixed(1) + '%' : '0%',
          oms_apoiadas: [...new Set(ptecData?.map((os: any) => os.om_apoiada))].length || 0,
        };
      }
    });

    console.log('Statistics prepared:', statistics);

    // Construir prompt estruturado para a IA
    const systemPrompt = `Você é um analista militar especializado em operações logísticas e manutenção de equipamentos militares.
Sua função é analisar dados operacionais dos Pelotões Técnicos (Ptec) e gerar relatórios objetivos e acionáveis.

GLOSSÁRIO:
- Ptec: Pelotão Técnico
- OS: Ordem de Serviço (registro de manutenção)
- OM: Organização Militar
- MEM: Material de Emprego Militar
- Classe III: Combustível
- PM/PMS/PMR: Plano de Movimento
- RH: Recursos Humanos

FORMATO DO RELATÓRIO:
Use Markdown estruturado com:
1. # Resumo Executivo (3-5 pontos principais)
2. ## Análise Detalhada (insights por área)
3. ## Métricas Chave (números e percentuais)
4. ## Tendências Identificadas (padrões nos dados)
5. ## Recomendações Práticas (3-5 ações específicas e mensuráveis)

Seja direto, use dados concretos e evite generalizações.`;

    const dataPrompt = `DADOS OPERACIONAIS (${startDate} até ${endDate}):

ESTATÍSTICAS AGREGADAS:
${JSON.stringify(statistics, null, 2)}

DADOS DETALHADOS:
${JSON.stringify(dataContext, null, 2)}

SOLICITAÇÃO DO USUÁRIO:
${userPrompt}`;

    // Chamar Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dataPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('Erro ao comunicar com o gateway de IA');
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(JSON.stringify({ 
      analysis,
      metadata: {
        ptecs,
        period: { startDate, endDate },
        statistics,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-ptec-data function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar análise'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
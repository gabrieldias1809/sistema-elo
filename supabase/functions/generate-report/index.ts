import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { statistics, userPrompt } = await req.json();
    
    console.log('Generating report with prompt:', userPrompt);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    const dataPrompt = `ESTATÍSTICAS OPERACIONAIS:
${JSON.stringify(statistics, null, 2)}

SOLICITAÇÃO DO USUÁRIO:
${userPrompt}`;

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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Créditos insuficientes. Adicione créditos em Settings -> Workspace -> Usage.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar análise'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

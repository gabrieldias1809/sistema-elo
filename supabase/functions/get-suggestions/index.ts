import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { table, field, limit = 10 } = await req.json();

    if (!table || !field) {
      return new Response(
        JSON.stringify({ error: 'Table and field are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar valores únicos do campo, ordenados por frequência
    const { data, error } = await supabase
      .from(table)
      .select(field)
      .not(field, 'is', null)
      .not(field, 'eq', '');

    if (error) {
      console.error('Error fetching suggestions:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Contar frequência e retornar os mais comuns
    const frequencyMap = new Map<string, number>();
    data.forEach((row: any) => {
      const value = row[field];
      if (value && typeof value === 'string') {
        frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
      }
    });

    const suggestions = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([value]) => value);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
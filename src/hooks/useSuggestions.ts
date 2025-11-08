import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSuggestionsOptions {
  table: string;
  field: string;
  enabled?: boolean;
}

export const useSuggestions = ({ table, field, enabled = true }: UseSuggestionsOptions) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-suggestions', {
          body: { table, field, limit: 10 }
        });

        if (error) {
          console.error('Error fetching suggestions:', error);
          return;
        }

        setSuggestions(data?.suggestions || []);
      } catch (error) {
        console.error('Error in useSuggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [table, field, enabled]);

  return { suggestions, loading };
};
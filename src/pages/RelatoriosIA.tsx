import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Download, Brain } from "lucide-react";

const RelatoriosIA = () => {
  const { hasRole } = useAuth();
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedPtecs, setSelectedPtecs] = useState<string[]>([]);
  const [period, setPeriod] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const ptecOptions = [
    { value: "com", label: "Ptec Com", role: "ptec_com", table: "ptec_com_os" },
    { value: "mb", label: "Ptec MB", role: "ptec_mb", table: "ptec_mb_os" },
    { value: "auto", label: "Ptec Auto", role: "ptec_auto", table: "ptec_auto_os" },
    { value: "blind", label: "Ptec Blind", role: "ptec_blind", table: "ptec_blind_os" },
    { value: "op", label: "Ptec Op", role: "ptec_op", table: "ptec_op_os" },
    { value: "armto", label: "Ptec Armto", role: "ptec_armto", table: "ptec_armto_os" },
    { value: "sau", label: "Cia Sau", role: "ptec_sau", table: "ptec_sau_pms" },
    { value: "rh", label: "Cia RH", role: "ptec_rh", table: "ptec_rh_ocorrencias" },
    { value: "trp", label: "Cia Trp", role: "ptec_trp", table: "ptec_trp_transportes" },
  ];

  const availablePtecs = ptecOptions.filter(
    (ptec) => hasRole("admin") || hasRole("col") || hasRole(ptec.role as any)
  );

  const handlePtecToggle = (ptecValue: string) => {
    setSelectedPtecs((prev) =>
      prev.includes(ptecValue)
        ? prev.filter((p) => p !== ptecValue)
        : [...prev, ptecValue]
    );
  };

  const calculateDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchPtecData = async (ptecValue: string, table: string, startDate: string, endDate: string): Promise<any[] | null> => {
    const { data, error } = await supabase
      .from(table as any)
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) {
      console.error(`Erro ao buscar dados de ${ptecValue}:`, error);
      return null;
    }

    return data || [];
  };

  const calculateStatistics = (ptecValue: string, data: any[]) => {
    if (!data || data.length === 0) return null;

    if (ptecValue === "sau") {
      return {
        total_registros: data.length,
        tipo: "saúde",
      };
    }

    if (ptecValue === "rh") {
      const totalCorpos = data.reduce((sum, item) => sum + (item.quantidade_corpos || 0), 0);
      return {
        total_ocorrencias: data.length,
        total_corpos: totalCorpos,
        tipo: "recursos_humanos",
      };
    }

    if (ptecValue === "trp") {
      const totalKm = data.reduce((sum, item) => {
        const kmSaida = item.odometro_saida || 0;
        const kmRetorno = item.odometro_retorno || 0;
        return sum + (kmRetorno - kmSaida);
      }, 0);
      return {
        total_transportes: data.length,
        total_km: totalKm,
        tipo: "transporte",
      };
    }

    // Para Ptecs com OS
    const concluidas = data.filter((os) => os.situacao === "Concluída").length;
    const total = data.length;
    const omsApoiadas = [...new Set(data.map((os) => os.om_apoiada))].length;

    return {
      total_os: total,
      os_concluidas: concluidas,
      taxa_conclusao: total > 0 ? ((concluidas / total) * 100).toFixed(1) + "%" : "0%",
      oms_apoiadas: omsApoiadas,
      tipo: "manutenção",
    };
  };

  const handleGenerateReport = async () => {
    if (selectedPtecs.length === 0) {
      toast.error("Selecione pelo menos um Ptec para análise");
      return;
    }

    if (!userPrompt.trim()) {
      toast.error("Digite uma pergunta ou solicitação");
      return;
    }

    setIsLoading(true);
    setAnalysis("");

    try {
      const { startDate, endDate } = calculateDateRange();
      const statistics: any = {};

      // Buscar dados de cada Ptec selecionado
      for (const ptecValue of selectedPtecs) {
        const ptecOption = ptecOptions.find((p) => p.value === ptecValue);
        if (!ptecOption) continue;

        const data = await fetchPtecData(ptecValue, ptecOption.table, startDate, endDate);
        if (data) {
          const stats = calculateStatistics(ptecValue, data);
          if (stats) {
            statistics[ptecValue] = {
              ...stats,
              periodo: {
                inicio: startDate,
                fim: endDate,
                dias: parseInt(period),
              },
            };
          }
        }
      }

      // Chamar edge function para gerar análise
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { statistics, userPrompt },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast.error(error.message || "Erro ao gerar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([analysis], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-ia-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório baixado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios com IA</h1>
        <p className="text-muted-foreground">
          Gere análises inteligentes dos dados operacionais usando inteligência artificial
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Configurar Análise
            </CardTitle>
            <CardDescription>
              Selecione os dados e descreva o que você quer analisar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Ptecs */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Módulos para Análise</label>
              <div className="grid grid-cols-2 gap-2">
                {availablePtecs.map((ptec) => (
                  <div key={ptec.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={ptec.value}
                      checked={selectedPtecs.includes(ptec.value)}
                      onCheckedChange={() => handlePtecToggle(ptec.value)}
                    />
                    <label
                      htmlFor={ptec.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {ptec.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt do usuário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sua Pergunta</label>
              <Textarea
                placeholder="Ex: Faça uma análise comparativa do desempenho dos Ptecs selecionados..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={isLoading || selectedPtecs.length === 0 || !userPrompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Análise...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Relatório Gerado</CardTitle>
            <CardDescription>
              Análise inteligente dos dados operacionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analisando dados...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-[600px] overflow-y-auto p-4 bg-muted/50 rounded-lg">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
                <Button onClick={handleDownloadReport} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Brain className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Configure a análise e clique em "Gerar Relatório"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosIA;

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Brain, Download, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RelatoriosIA() {
  const { user, roles } = useAuth();
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedPtecs, setSelectedPtecs] = useState<string[]>([]);
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [metadata, setMetadata] = useState<any>(null);

  const ptecOptions = [
    { id: "com", label: "Ptec Com", role: "ptec_com" as const },
    { id: "mb", label: "Ptec MB", role: "ptec_mb" as const },
    { id: "auto", label: "Ptec Auto", role: "ptec_auto" as const },
    { id: "blind", label: "Ptec Blind", role: "ptec_blind" as const },
    { id: "op", label: "Ptec Op", role: "ptec_op" as const },
    { id: "armto", label: "Ptec Armto", role: "ptec_armto" as const },
    { id: "sau", label: "Ptec Sau", role: "ptec_sau" as const },
    { id: "rh", label: "Ptec RH", role: "ptec_rh" as const },
    { id: "trp", label: "Ptec Trp", role: "ptec_trp" as const },
  ];

  // Filtrar Ptecs disponíveis baseado nas permissões do usuário
  const availablePtecs = ptecOptions.filter(ptec => 
    roles.includes("admin") || roles.includes("col") || roles.includes(ptec.role)
  );

  const handlePtecToggle = (ptecId: string) => {
    setSelectedPtecs(prev => 
      prev.includes(ptecId) 
        ? prev.filter(id => id !== ptecId)
        : [...prev, ptecId]
    );
  };

  const examplePrompts = [
    "Analise as tendências de manutenção e identifique os principais gargalos operacionais",
    "Quais OMs estão demandando mais recursos? Sugira otimizações",
    "Gere um relatório executivo com insights e recomendações para tomada de decisão",
    "Compare a eficiência entre os diferentes Ptecs e identifique best practices",
    "Identifique padrões de falhas em equipamentos e sugira ações preventivas",
  ];

  const handleGenerateReport = async () => {
    if (selectedPtecs.length === 0) {
      toast.error("Selecione pelo menos um Ptec para análise");
      return;
    }
    if (!userPrompt.trim()) {
      toast.error("Descreva o tipo de análise desejada");
      return;
    }

    setIsLoading(true);
    setAnalysis("");
    setMetadata(null);

    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke('analyze-ptec-data', {
        body: {
          ptecs: selectedPtecs,
          startDate,
          endDate,
          userPrompt,
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      setMetadata(data.metadata);
      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Erro ao gerar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Implementação simplificada - converter para PDF seria necessário adicionar biblioteca
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-ia-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório baixado");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Análise com IA</h1>
          <p className="text-muted-foreground">Gere relatórios inteligentes baseados nos dados dos Ptecs</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Painel de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Análise</CardTitle>
            <CardDescription>Selecione os Ptecs e o período para análise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Período */}
            <div className="space-y-2">
              <Label>Período</Label>
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
              <Label>Ptecs para Análise</Label>
              <div className="grid grid-cols-2 gap-3">
                {availablePtecs.map(ptec => (
                  <div key={ptec.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={ptec.id}
                      checked={selectedPtecs.includes(ptec.id)}
                      onCheckedChange={() => handlePtecToggle(ptec.id)}
                    />
                    <label
                      htmlFor={ptec.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {ptec.label}
                    </label>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPtecs(availablePtecs.map(p => p.id))}
                className="mt-2"
              >
                Selecionar Todos
              </Button>
            </div>

            {/* Prompt do Usuário */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Tipo de Análise</Label>
              <Textarea
                id="prompt"
                placeholder="Ex: Analise as tendências de manutenção dos últimos 30 dias e identifique os principais gargalos..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {/* Exemplos de Prompts */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sugestões de análise:</Label>
              <div className="space-y-1">
                {examplePrompts.map((example, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto py-2 px-3 text-left"
                    onClick={() => setUserPrompt(example)}
                  >
                    <Sparkles className="h-3 w-3 mr-2 shrink-0" />
                    <span className="line-clamp-2">{example}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Botão Gerar */}
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Painel de Resultado */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório Gerado</CardTitle>
                <CardDescription>Análise inteligente dos dados selecionados</CardDescription>
              </div>
              {analysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!analysis && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Brain className="h-16 w-16 mb-4 opacity-20" />
                <p>Configure os parâmetros e clique em "Gerar Relatório"</p>
                <p className="text-sm mt-2">A IA analisará os dados e gerará insights acionáveis</p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analisando dados...</p>
                <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
              </div>
            )}

            {analysis && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
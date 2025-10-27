import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { RefreshButton } from "@/components/RefreshButton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const PtecRH = () => {
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nomeGuerraSuggestions, setNomeGuerraSuggestions] = useState<string[]>([]);
  const [graduacaoSuggestions, setGraduacaoSuggestions] = useState<string[]>([]);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
  const [causaSuggestions, setCausaSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome_guerra: "",
    graduacao: "",
    causa_provavel: "",
    data: "",
    hora: "",
    quantidade_corpos: "0",
    local: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const fetchOcorrencias = async () => {
    const { data, error } = await supabase.from("ptec_rh_ocorrencias").select("*").order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setOcorrencias(data || []);

    // Extract unique suggestions
    const uniqueNomes = [...new Set(data?.map((d) => d.nome_guerra).filter(Boolean))];
    const uniqueGraduacoes = [...new Set(data?.map((d) => d.graduacao).filter(Boolean))];
    const uniqueLocais = [...new Set(data?.map((d) => d.local).filter(Boolean))];
    const uniqueCausas = [...new Set(data?.map((d) => d.causa_provavel).filter(Boolean))];

    setNomeGuerraSuggestions(uniqueNomes);
    setGraduacaoSuggestions(uniqueGraduacoes);
    setLocalSuggestions(uniqueLocais);
    setCausaSuggestions(uniqueCausas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_rh_ocorrencias").insert([
      {
        ...formData,
        quantidade_corpos: parseInt(formData.quantidade_corpos),
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar ocorrência");
      return;
    }

    toast.success("Ocorrência criada com sucesso!");
    setOpen(false);
    setFormData({
      nome_guerra: "",
      graduacao: "",
      causa_provavel: "",
      data: "",
      hora: "",
      quantidade_corpos: "0",
      local: "",
      observacoes: "",
    });
    fetchOcorrencias();
  };

  // Dados para gráficos
  const corposPorDia = ocorrencias.reduce((acc: any[], item) => {
    const dataStr = new Date(item.data).toLocaleDateString();
    const existing = acc.find((x) => x.name === dataStr);
    if (existing) {
      existing.value += item.quantidade_corpos || 0;
    } else {
      acc.push({ name: dataStr, value: item.quantidade_corpos || 0 });
    }
    return acc;
  }, []);

  const causasData = ocorrencias.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.causa_provavel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.causa_provavel || "N/A", value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cia RH</h1>
          <p className="text-muted-foreground">Companhia de Recursos Humanos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOcorrencias}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ocorrência Mortuária</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome de Guerra</Label>
                  <AutocompleteInput
                    value={formData.nome_guerra}
                    onChange={(value) => setFormData({ ...formData, nome_guerra: value })}
                    suggestions={nomeGuerraSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Graduação</Label>
                  <AutocompleteInput
                    value={formData.graduacao}
                    onChange={(value) => setFormData({ ...formData, graduacao: value })}
                    suggestions={graduacaoSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Causa Provável</Label>
                  <AutocompleteInput
                    value={formData.causa_provavel}
                    onChange={(value) => setFormData({ ...formData, causa_provavel: value })}
                    suggestions={causaSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data e Hora</Label>
                  <DateTimePicker
                    value={formData.data}
                    onChange={(value) => setFormData({ ...formData, data: value })}
                  />
                </div>
                <div>
                  <Label>Quantidade de Corpos</Label>
                  <Input
                    type="number"
                    value={formData.quantidade_corpos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_corpos: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Local</Label>
                  <AutocompleteInput
                    value={formData.local}
                    onChange={(value) => setFormData({ ...formData, local: value })}
                    suggestions={localSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Criar Ocorrência
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Corpos coletados por dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={corposPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0A7373" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Causas mais recorrentes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={causasData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {causasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ocorrências Mortuárias</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Guerra</TableHead>
                <TableHead>Graduação</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Qnt. Corpos</TableHead>
                <TableHead>Local</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ocorrencias.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nome_guerra}</TableCell>
                  <TableCell>{item.graduacao}</TableCell>
                  <TableCell>{item.causa_provavel}</TableCell>
                  <TableCell>{item.data ? format(new Date(item.data), "dd/MM/yyyy HH:mm") : "-"}</TableCell>
                  <TableCell>{item.hora}</TableCell>
                  <TableCell>{item.quantidade_corpos}</TableCell>
                  <TableCell>{item.local}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <RefreshButton onClick={fetchOcorrencias} isLoading={isRefreshing} />
    </div>
  );
};

export default PtecRH;

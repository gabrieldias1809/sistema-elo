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

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const PtecTrp = () => {
  const [transportes, setTransportes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [placaSuggestions, setPlacaSuggestions] = useState<string[]>([]);
  const [motoristaSuggestions, setMotoristaSuggestions] = useState<string[]>([]);
  const [chefeVtrSuggestions, setChefeVtrSuggestions] = useState<string[]>([]);
  const [destinoSuggestions, setDestinoSuggestions] = useState<string[]>([]);
  const [utilizacaoSuggestions, setUtilizacaoSuggestions] = useState<string[]>([]);
  const [classeSuggestions, setClasseSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    placa_vtr: "",
    data_hora_saida: "",
    odometro_saida: "",
    odometro_retorno: "",
    data_hora_entrada: "",
    destino: "",
    utilizacao: "",
    chefe_vtr: "",
    motorista: "",
    classe_material: "",
    quantidade_transportada: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchTransportes();
  }, []);

  const fetchTransportes = async () => {
    const { data, error } = await supabase
      .from("ptec_trp_transportes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setTransportes(data || []);

    // Extract unique suggestions
    const uniquePlacas = [...new Set(data?.map((d) => d.placa_vtr).filter(Boolean))];
    const uniqueMotoristas = [...new Set(data?.map((d) => d.motorista).filter(Boolean))];
    const uniqueChefes = [...new Set(data?.map((d) => d.chefe_vtr).filter(Boolean))];
    const uniqueDestinos = [...new Set(data?.map((d) => d.destino).filter(Boolean))];
    const uniqueUtilizacoes = [...new Set(data?.map((d) => d.utilizacao).filter(Boolean))];
    const uniqueClasses = [...new Set(data?.map((d) => d.classe_material).filter(Boolean))];

    setPlacaSuggestions(uniquePlacas);
    setMotoristaSuggestions(uniqueMotoristas);
    setChefeVtrSuggestions(uniqueChefes);
    setDestinoSuggestions(uniqueDestinos);
    setUtilizacaoSuggestions(uniqueUtilizacoes);
    setClasseSuggestions(uniqueClasses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_trp_transportes").insert([
      {
        ...formData,
        odometro_saida: formData.odometro_saida ? parseFloat(formData.odometro_saida) : null,
        odometro_retorno: formData.odometro_retorno ? parseFloat(formData.odometro_retorno) : null,
        quantidade_transportada: formData.quantidade_transportada ? parseFloat(formData.quantidade_transportada) : null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar registro");
      return;
    }

    toast.success("Registro criado com sucesso!");
    setOpen(false);
    setFormData({
      placa_vtr: "",
      data_hora_saida: "",
      odometro_saida: "",
      odometro_retorno: "",
      data_hora_entrada: "",
      destino: "",
      utilizacao: "",
      chefe_vtr: "",
      motorista: "",
      classe_material: "",
      quantidade_transportada: "",
      observacoes: "",
    });
    fetchTransportes();
  };

  // Dados para gráficos
  const destinosData = transportes.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.destino);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.destino || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const materiaisData = transportes.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.classe_material);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.classe_material || "N/A", value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cia TRP</h1>
          <p className="text-muted-foreground">Companhia de Transporte / Suprimento</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransportes}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Novo Transporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro de Transporte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa VTR</Label>
                  <AutocompleteInput
                    value={formData.placa_vtr}
                    onChange={(value) => setFormData({ ...formData, placa_vtr: value })}
                    suggestions={placaSuggestions}
                    required
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Destino</Label>
                  <AutocompleteInput
                    value={formData.destino}
                    onChange={(value) => setFormData({ ...formData, destino: value })}
                    suggestions={destinoSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data/Hora Saída</Label>
                  <DateTimePicker
                    value={formData.data_hora_saida}
                    onChange={(value) => setFormData({ ...formData, data_hora_saida: value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data/Hora Entrada</Label>
                  <DateTimePicker
                    value={formData.data_hora_entrada}
                    onChange={(value) => setFormData({ ...formData, data_hora_entrada: value })}
                  />
                </div>
                <div>
                  <Label>Odômetro Saída</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.odometro_saida}
                    onChange={(e) => setFormData({ ...formData, odometro_saida: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Odômetro Retorno</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.odometro_retorno}
                    onChange={(e) => setFormData({ ...formData, odometro_retorno: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Chefe VTR</Label>
                  <AutocompleteInput
                    value={formData.chefe_vtr}
                    onChange={(value) => setFormData({ ...formData, chefe_vtr: value })}
                    suggestions={chefeVtrSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Motorista</Label>
                  <AutocompleteInput
                    value={formData.motorista}
                    onChange={(value) => setFormData({ ...formData, motorista: value })}
                    suggestions={motoristaSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Classe de Material</Label>
                  <AutocompleteInput
                    value={formData.classe_material}
                    onChange={(value) => setFormData({ ...formData, classe_material: value })}
                    suggestions={classeSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Quantidade Transportada</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantidade_transportada}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_transportada: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Utilização</Label>
                <Textarea
                  value={formData.utilizacao}
                  onChange={(e) => setFormData({ ...formData, utilizacao: e.target.value })}
                />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Criar Registro
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recorrência dos destinos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={destinosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0A7373" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Classe de material transportada</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={materiaisData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {materiaisData.map((entry, index) => (
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Registros de Transporte</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Classe Material</TableHead>
                <TableHead>Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.placa_vtr}</TableCell>
                  <TableCell>{item.destino}</TableCell>
                  <TableCell>{item.motorista}</TableCell>
                  <TableCell>{item.classe_material}</TableCell>
                  <TableCell>{item.quantidade_transportada}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <RefreshButton onClick={fetchTransportes} isLoading={isRefreshing} />
    </div>
  );
};

export default PtecTrp;

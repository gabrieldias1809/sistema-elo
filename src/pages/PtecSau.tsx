import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { DateTimePicker } from "@/components/DateTimePicker";
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
  Legend,
} from "recharts";
import { format } from "date-fns";
import { Eye, Edit, Trash2 } from "lucide-react";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25"];

const PtecSau = () => {
  const [pms, setPms] = useState<any[]>([]);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [prontuarioOpen, setProntuarioOpen] = useState(false);
  const [viewPmOpen, setViewPmOpen] = useState(false);
  const [viewProntuarioOpen, setViewProntuarioOpen] = useState(false);
  const [selectedPm, setSelectedPm] = useState<any>(null);
  const [selectedProntuario, setSelectedProntuario] = useState<any>(null);
  const [editingProntuario, setEditingProntuario] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prontuarioToDelete, setProntuarioToDelete] = useState<string | null>(null);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [atividadeSuggestions, setAtividadeSuggestions] = useState<string[]>([]);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
  const [fracaoSuggestions, setFracaoSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    om_responsavel: "",
    numero_pms: "",
    tipo_pm: "PMS",
    atividade: "",
    data: "",
    hora: "",
    local: "",
    fracao: "",
    descricao: "",
    conduta_esperada: "",
    observacoes: "",
  });

  const [prontuarioData, setProntuarioData] = useState({
    nome: "",
    idade: "",
    nivel_gravidade: "",
    situacao_atual: "",
    data: "",
  });

  useEffect(() => {
    fetchPms();
    fetchProntuarios();
  }, []);

  useEffect(() => {
    if (editingProntuario) {
      setProntuarioData({
        nome: editingProntuario.nome || "",
        idade: editingProntuario.idade?.toString() || "",
        nivel_gravidade: editingProntuario.nivel_gravidade || "",
        situacao_atual: editingProntuario.situacao_atual || "",
        data: editingProntuario.data || "",
      });
    } else {
      setProntuarioData({
        nome: "",
        idade: "",
        nivel_gravidade: "",
        situacao_atual: "",
        data: "",
      });
    }
  }, [editingProntuario]);

  const fetchPms = async () => {
    const { data, error } = await supabase.from("ptec_sau_pms").select("*").order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setPms(data || []);

    // Extract unique suggestions
    const uniqueOms = [...new Set(data?.map((d) => d.om_responsavel).filter(Boolean))];
    const uniqueAtividades = [...new Set(data?.map((d) => d.atividade).filter(Boolean))];
    const uniqueLocais = [...new Set(data?.map((d) => d.local).filter(Boolean))];
    const uniqueFracoes = [...new Set(data?.map((d) => d.fracao).filter(Boolean))];

    setOmSuggestions(uniqueOms);
    setAtividadeSuggestions(uniqueAtividades);
    setLocalSuggestions(uniqueLocais);
    setFracaoSuggestions(uniqueFracoes);
  };

  const getNextPmNumber = async () => {
    const { data, error } = await supabase
      .from("ptec_sau_pms")
      .select("numero_pms")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return "001";
    }

    const lastNumber = parseInt(data[0].numero_pms) || 0;
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(3, "0");
  };

  useEffect(() => {
    if (open) {
      getNextPmNumber().then((nextNum) => {
        setFormData((prev) => ({ ...prev, numero_pms: nextNum }));
      });
    }
  }, [open]);

  const fetchProntuarios = async () => {
    const { data, error } = await supabase.from("ptec_sau_prontuarios").select("*").order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar prontuários");
      return;
    }

    setProntuarios(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_sau_pms").insert([
      {
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar PM");
      return;
    }

    toast.success("PM criado com sucesso!");
    setOpen(false);
    setFormData({
      om_responsavel: "",
      numero_pms: "",
      tipo_pm: "PMS",
      atividade: "",
      data: "",
      hora: "",
      local: "",
      fracao: "",
      descricao: "",
      conduta_esperada: "",
      observacoes: "",
    });
    fetchPms();
  };

  const handleProntuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const prontuarioPayload = {
      nome: prontuarioData.nome,
      idade: parseInt(prontuarioData.idade),
      nivel_gravidade: prontuarioData.nivel_gravidade,
      situacao_atual: prontuarioData.situacao_atual,
      data: prontuarioData.data,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    };

    if (editingProntuario) {
      const { error } = await supabase
        .from("ptec_sau_prontuarios")
        .update(prontuarioPayload)
        .eq("id", editingProntuario.id);

      if (error) {
        toast.error("Erro ao atualizar prontuário");
        return;
      }

      toast.success("Prontuário atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_sau_prontuarios").insert([prontuarioPayload]);

      if (error) {
        toast.error("Erro ao criar prontuário");
        return;
      }

      toast.success("Prontuário criado com sucesso!");
    }

    setProntuarioOpen(false);
    setEditingProntuario(null);
    setProntuarioData({
      nome: "",
      idade: "",
      nivel_gravidade: "",
      situacao_atual: "",
      data: "",
    });
    fetchProntuarios();
  };

  const handleEditProntuario = (prontuario: any) => {
    setEditingProntuario(prontuario);
    setProntuarioOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProntuarioToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!prontuarioToDelete) return;

    const { error } = await supabase.from("ptec_sau_prontuarios").delete().eq("id", prontuarioToDelete);

    if (error) {
      toast.error("Erro ao excluir prontuário");
      return;
    }

    toast.success("Prontuário excluído com sucesso!");
    setDeleteDialogOpen(false);
    setProntuarioToDelete(null);
    fetchProntuarios();
  };

  // Dados para gráficos PMS
  const atividadesData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.atividade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.atividade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const omsData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_responsavel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.om_responsavel || "N/A", value: 1 });
    }
    return acc;
  }, []);

  // Dados para gráficos de prontuários por dia - Stacked Bar Chart
  const situacoesPorDia = prontuarios.reduce((acc: any, item) => {
    const dataFormatada = item.data ? format(new Date(item.data), "dd/MM") : "N/A";

    if (!acc[dataFormatada]) {
      acc[dataFormatada] = {
        data: dataFormatada,
        evacuacao: 0,
        cirurgia: 0,
        obito: 0,
        cti: 0,
        enfermaria: 0,
        retorno: 0,
      };
    }

    switch (item.situacao_atual) {
      case "evacuação":
        acc[dataFormatada].evacuacao++;
        break;
      case "cirurgia":
        acc[dataFormatada].cirurgia++;
        break;
      case "óbito":
        acc[dataFormatada].obito++;
        break;
      case "CTI":
        acc[dataFormatada].cti++;
        break;
      case "enfermaria":
        acc[dataFormatada].enfermaria++;
        break;
      case "retorno ao combate":
        acc[dataFormatada].retorno++;
        break;
    }

    return acc;
  }, {});

  const situacoesData = Object.values(situacoesPorDia);

  const gravidadeData = prontuarios.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.nivel_gravidade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.nivel_gravidade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cia Sau</h1>
          <p className="text-muted-foreground">Companhia de Saúde - PM e Prontuários</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPms}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <i className="ri-add-line mr-2"></i>Novo PM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Problema Militar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>OM Responsável</Label>
                    <AutocompleteInput
                      value={formData.om_responsavel}
                      onChange={(value) => setFormData({ ...formData, om_responsavel: value })}
                      suggestions={omSuggestions}
                      required
                      className="placeholder:text-transparent"
                    />
                  </div>
                  <div>
                    <Label>N° PM</Label>
                    <Input
                      value={formData.numero_pms}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Tipo de PM</Label>
                    <Select
                      value={formData.tipo_pm}
                      onValueChange={(value) => setFormData({ ...formData, tipo_pm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PMS">PMS</SelectItem>
                        <SelectItem value="PMR">PMR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Atividade</Label>
                    <AutocompleteInput
                      value={formData.atividade}
                      onChange={(value) => setFormData({ ...formData, atividade: value })}
                      suggestions={atividadeSuggestions}
                      className="placeholder:text-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Data e Hora</Label>
                    <DateTimePicker
                      value={formData.data}
                      onChange={(value) => setFormData({ ...formData, data: value })}
                      placeholder="Selecione data e hora"
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <AutocompleteInput
                      value={formData.local}
                      onChange={(value) => setFormData({ ...formData, local: value })}
                      suggestions={localSuggestions}
                      className="placeholder:text-transparent"
                    />
                  </div>
                  <div>
                    <Label>Fração</Label>
                    <AutocompleteInput
                      value={formData.fracao}
                      onChange={(value) => setFormData({ ...formData, fracao: value })}
                      suggestions={fracaoSuggestions}
                      className="placeholder:text-transparent"
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição do PM</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Conduta Esperada no Atendimento</Label>
                  <Textarea
                    value={formData.conduta_esperada}
                    onChange={(e) => setFormData({ ...formData, conduta_esperada: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-white">
                  Criar PM
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={prontuarioOpen}
            onOpenChange={(open) => {
              setProntuarioOpen(open);
              if (!open) {
                setEditingProntuario(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <i className="ri-add-line mr-2"></i>Novo Prontuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProntuario ? "Editar" : "Novo"} Prontuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProntuarioSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome do Militar</Label>
                    <Input
                      value={prontuarioData.nome}
                      onChange={(e) => setProntuarioData({ ...prontuarioData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Idade</Label>
                    <Input
                      type="number"
                      value={prontuarioData.idade}
                      onChange={(e) => setProntuarioData({ ...prontuarioData, idade: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Data do Atendimento</Label>
                    <DateTimePicker
                      value={prontuarioData.data}
                      onChange={(value) => setProntuarioData({ ...prontuarioData, data: value })}
                      placeholder="Selecione data e hora"
                    />
                  </div>
                  <div>
                    <Label>Nível de Gravidade</Label>
                    <Select
                      value={prontuarioData.nivel_gravidade}
                      onValueChange={(value) => setProntuarioData({ ...prontuarioData, nivel_gravidade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="grave">Grave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Situação Atual</Label>
                    <Select
                      value={prontuarioData.situacao_atual}
                      onValueChange={(value) => setProntuarioData({ ...prontuarioData, situacao_atual: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="óbito">Óbito</SelectItem>
                        <SelectItem value="evacuação">Evacuação</SelectItem>
                        <SelectItem value="CTI">CTI</SelectItem>
                        <SelectItem value="enfermaria">Enfermaria</SelectItem>
                        <SelectItem value="retorno ao combate">Retorno ao Combate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary text-white">
                  {editingProntuario ? "Atualizar" : "Criar"} Prontuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gráficos PM */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Estatísticas de PM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">PM por Atividade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={atividadesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0A7373" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">PM por OM Responsável</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={omsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {omsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Gráficos de Prontuários */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Estatísticas de Atendimentos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Situações de Militares por Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={situacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="evacuacao" stackId="a" fill="#0A7373" name="Evacuações" />
                <Bar dataKey="cirurgia" stackId="a" fill="#B7BF99" name="Cirurgias" />
                <Bar dataKey="obito" stackId="a" fill="#DC2626" name="Óbitos" />
                <Bar dataKey="cti" stackId="a" fill="#EA580C" name="CTI" />
                <Bar dataKey="enfermaria" stackId="a" fill="#EDAA25" name="Enfermaria" />
                <Bar dataKey="retorno" stackId="a" fill="#16A34A" name="Retorno ao Combate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição por Gravidade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gravidadeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gravidadeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Total de Militares por Situação</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={situacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="evacuacao" fill="#0A7373" name="Evacuações" />
                <Bar dataKey="cirurgia" fill="#B7BF99" name="Cirurgias" />
                <Bar dataKey="obito" fill="#DC2626" name="Óbitos" />
                <Bar dataKey="cti" fill="#EA580C" name="CTI" />
                <Bar dataKey="enfermaria" fill="#EDAA25" name="Enfermaria" />
                <Bar dataKey="retorno" fill="#16A34A" name="Retorno ao Combate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Tabelas */}
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Registros de PM</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° PM</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>OM Responsável</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pms.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.numero_pms}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {item.tipo_pm || "PMS"}
                      </span>
                    </TableCell>
                    <TableCell>{item.om_responsavel}</TableCell>
                    <TableCell>{item.atividade || "-"}</TableCell>
                    <TableCell>
                      {item.data ? format(new Date(item.data), "dd/MM/yyyy HH:mm") : "-"}
                    </TableCell>
                    <TableCell>{item.local || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPm(item);
                          setViewPmOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Prontuários de Militares</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Gravidade</TableHead>
                  <TableHead>Situação Atual</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prontuarios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.idade}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.nivel_gravidade === "grave"
                            ? "bg-destructive/20 text-destructive"
                            : item.nivel_gravidade === "moderado"
                              ? "bg-yellow-500/20 text-yellow-700"
                              : "bg-green-500/20 text-green-700"
                        }`}
                      >
                        {item.nivel_gravidade}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.situacao_atual === "óbito"
                            ? "bg-destructive/20 text-destructive"
                            : item.situacao_atual === "CTI"
                              ? "bg-orange-500/20 text-orange-700"
                              : item.situacao_atual === "retorno ao combate"
                                ? "bg-green-500/20 text-green-700"
                                : "bg-blue-500/20 text-blue-700"
                        }`}
                      >
                        {item.situacao_atual}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.data ? format(new Date(item.data), "dd/MM/yyyy HH:mm") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProntuario(item);
                            setViewProntuarioOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProntuario(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Dialog de Visualização de PM */}
      <Dialog open={viewPmOpen} onOpenChange={setViewPmOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do PM N° {selectedPm?.numero_pms}</DialogTitle>
          </DialogHeader>
          {selectedPm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo de PM</Label>
                  <p className="font-medium">{selectedPm.tipo_pm || "PMS"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">OM Responsável</Label>
                  <p className="font-medium">{selectedPm.om_responsavel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Atividade</Label>
                  <p className="font-medium">{selectedPm.atividade || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data e Hora</Label>
                  <p className="font-medium">
                    {selectedPm.data ? format(new Date(selectedPm.data), "dd/MM/yyyy HH:mm") : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <p className="font-medium">{selectedPm.local || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fração</Label>
                  <p className="font-medium">{selectedPm.fracao || "-"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.descricao || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Conduta Esperada</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.conduta_esperada || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.observacoes || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Prontuário */}
      <Dialog open={viewProntuarioOpen} onOpenChange={setViewProntuarioOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Prontuário</DialogTitle>
          </DialogHeader>
          {selectedProntuario && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Nome do Militar</Label>
                  <p className="font-medium text-lg">{selectedProntuario.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idade</Label>
                  <p className="font-medium">{selectedProntuario.idade} anos</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data do Atendimento</Label>
                  <p className="font-medium">
                    {selectedProntuario.data
                      ? format(new Date(selectedProntuario.data), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nível de Gravidade</Label>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProntuario.nivel_gravidade === "grave"
                          ? "bg-destructive/20 text-destructive"
                          : selectedProntuario.nivel_gravidade === "moderado"
                            ? "bg-yellow-500/20 text-yellow-700"
                            : "bg-green-500/20 text-green-700"
                      }`}
                    >
                      {selectedProntuario.nivel_gravidade}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Situação Atual</Label>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProntuario.situacao_atual === "óbito"
                          ? "bg-destructive/20 text-destructive"
                          : selectedProntuario.situacao_atual === "CTI"
                            ? "bg-orange-500/20 text-orange-700"
                            : selectedProntuario.situacao_atual === "retorno ao combate"
                              ? "bg-green-500/20 text-green-700"
                              : "bg-blue-500/20 text-blue-700"
                      }`}
                    >
                      {selectedProntuario.situacao_atual}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PtecSau;

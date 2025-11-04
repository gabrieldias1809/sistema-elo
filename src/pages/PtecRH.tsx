import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { RefreshButton } from "@/components/RefreshButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import jsPDF from "jspdf";
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

  // ACISO states
  const [acisoData, setAcisoData] = useState<any[]>([]);
  const [openAciso, setOpenAciso] = useState(false);
  const [editingAciso, setEditingAciso] = useState<any>(null);
  const [viewingAciso, setViewingAciso] = useState<any>(null);
  const [localSuggestionsAciso, setLocalSuggestionsAciso] = useState<string[]>([]);
  const [publicoAlvoSuggestions, setPublicoAlvoSuggestions] = useState<string[]>([]);
  const [acisoFormData, setAcisoFormData] = useState({
    local: "",
    publico_alvo: "",
    data_hora: "",
    material_utilizado: "",
    interacao_publico: "Normal",
    observacoes: "",
  });

  useEffect(() => {
    fetchOcorrencias();
    fetchAcisos();
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

  // ACISO Functions
  const fetchAcisos = async () => {
    const { data, error } = await supabase.from("ptec_rh_aciso").select("*").order("data_hora", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar ACISOs");
      return;
    }

    setAcisoData(data || []);

    // Extract unique suggestions
    const uniqueLocais = [...new Set(data?.map((d) => d.local).filter(Boolean))];
    const uniquePublicoAlvo = [...new Set(data?.map((d) => d.publico_alvo).filter(Boolean))];

    setLocalSuggestionsAciso(uniqueLocais);
    setPublicoAlvoSuggestions(uniquePublicoAlvo);
  };

  const handleAcisoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...acisoFormData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    };

    if (editingAciso) {
      const { error } = await supabase.from("ptec_rh_aciso").update(dataToSave).eq("id", editingAciso.id);

      if (error) {
        toast.error("Erro ao atualizar ACISO");
        return;
      }

      toast.success("ACISO atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_rh_aciso").insert([dataToSave]);

      if (error) {
        toast.error("Erro ao criar ACISO");
        return;
      }

      toast.success("ACISO criado com sucesso!");
    }

    setOpenAciso(false);
    setEditingAciso(null);
    setAcisoFormData({
      local: "",
      publico_alvo: "",
      data_hora: "",
      material_utilizado: "",
      interacao_publico: "Normal",
      observacoes: "",
    });
    fetchAcisos();
  };

  const handleDeleteAciso = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este ACISO?")) return;

    const { error } = await supabase.from("ptec_rh_aciso").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao deletar ACISO");
      return;
    }

    toast.success("ACISO deletado com sucesso!");
    fetchAcisos();
  };

  const handleEditAciso = (aciso: any) => {
    setEditingAciso(aciso);
    setAcisoFormData({
      local: aciso.local,
      publico_alvo: aciso.publico_alvo,
      data_hora: aciso.data_hora,
      material_utilizado: aciso.material_utilizado || "",
      interacao_publico: aciso.interacao_publico,
      observacoes: aciso.observacoes || "",
    });
    setOpenAciso(true);
  };

  const generateAcisoPDF = (aciso: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório ACISO", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    let y = 40;
    
    doc.text(`Local: ${aciso.local}`, 20, y);
    y += 10;
    doc.text(`Público Alvo: ${aciso.publico_alvo}`, 20, y);
    y += 10;
    doc.text(`Data e Hora: ${format(new Date(aciso.data_hora), "dd/MM/yyyy HH:mm")}`, 20, y);
    y += 10;
    doc.text(`Interação: ${aciso.interacao_publico}`, 20, y);
    y += 15;
    
    if (aciso.material_utilizado) {
      doc.text("Material Utilizado:", 20, y);
      y += 7;
      const materialLines = doc.splitTextToSize(aciso.material_utilizado, 170);
      doc.text(materialLines, 20, y);
      y += materialLines.length * 7 + 8;
    }
    
    if (aciso.observacoes) {
      doc.text("Observações:", 20, y);
      y += 7;
      const obsLines = doc.splitTextToSize(aciso.observacoes, 170);
      doc.text(obsLines, 20, y);
    }
    
    doc.save(`ACISO_${format(new Date(aciso.data_hora), "ddMMyyyy")}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  // ACISO Charts Data
  const interacaoData = acisoData.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.interacao_publico);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.interacao_publico || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const acisosPorPeriodo = acisoData.reduce((acc: any[], item) => {
    const dataStr = new Date(item.data_hora).toLocaleDateString();
    const existing = acc.find((x) => x.name === dataStr);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: dataStr, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cia RH</h1>
        <p className="text-muted-foreground">Companhia de Recursos Humanos</p>
      </div>

      <Tabs defaultValue="ocorrencias" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="ocorrencias">Ocorrências Mortuárias</TabsTrigger>
          <TabsTrigger value="aciso">ACISO</TabsTrigger>
        </TabsList>

        <TabsContent value="ocorrencias">
          <div className="mb-6 flex justify-end gap-2">
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
        </TabsContent>

        <TabsContent value="aciso">
          <div className="mb-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAcisos}
              title="Atualizar dados"
            >
              <i className="ri-refresh-line"></i>
            </Button>
            <Dialog open={openAciso} onOpenChange={(open) => {
              setOpenAciso(open);
              if (!open) {
                setEditingAciso(null);
                setAcisoFormData({
                  local: "",
                  publico_alvo: "",
                  data_hora: "",
                  material_utilizado: "",
                  interacao_publico: "Normal",
                  observacoes: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white">
                  <i className="ri-add-line mr-2"></i>Novo ACISO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAciso ? "Editar ACISO" : "Novo ACISO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAcisoSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Local</Label>
                      <AutocompleteInput
                        value={acisoFormData.local}
                        onChange={(value) => setAcisoFormData({ ...acisoFormData, local: value })}
                        suggestions={localSuggestionsAciso}
                        required
                      />
                    </div>
                    <div>
                      <Label>Público Alvo</Label>
                      <AutocompleteInput
                        value={acisoFormData.publico_alvo}
                        onChange={(value) => setAcisoFormData({ ...acisoFormData, publico_alvo: value })}
                        suggestions={publicoAlvoSuggestions}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Data e Hora</Label>
                      <DateTimePicker
                        value={acisoFormData.data_hora}
                        onChange={(value) => setAcisoFormData({ ...acisoFormData, data_hora: value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Material Utilizado</Label>
                      <Textarea
                        value={acisoFormData.material_utilizado}
                        onChange={(e) => setAcisoFormData({ ...acisoFormData, material_utilizado: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Interação com o Público</Label>
                      <RadioGroup
                        value={acisoFormData.interacao_publico}
                        onValueChange={(value) => setAcisoFormData({ ...acisoFormData, interacao_publico: value })}
                        className="flex flex-wrap gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Insatisfeito" id="insatisfeito" />
                          <Label htmlFor="insatisfeito" className="cursor-pointer">Insatisfeito</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Normal" id="normal" />
                          <Label htmlFor="normal" className="cursor-pointer">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Satisfeito" id="satisfeito" />
                          <Label htmlFor="satisfeito" className="cursor-pointer">Satisfeito</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Muito Satisfeito" id="muito-satisfeito" />
                          <Label htmlFor="muito-satisfeito" className="cursor-pointer">Muito Satisfeito</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="col-span-2">
                      <Label>Observações</Label>
                      <Textarea
                        value={acisoFormData.observacoes}
                        onChange={(e) => setAcisoFormData({ ...acisoFormData, observacoes: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-white">
                    {editingAciso ? "Atualizar ACISO" : "Criar ACISO"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Gráficos ACISO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">ACISOs por Período</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={acisosPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#EDAA25" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Interação com o Público</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={interacaoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {interacaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tabela ACISO */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Registros ACISO</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Local</TableHead>
                    <TableHead>Público Alvo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Interação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acisoData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.local}</TableCell>
                      <TableCell>{item.publico_alvo}</TableCell>
                      <TableCell>{format(new Date(item.data_hora), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>{item.interacao_publico}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingAciso(item)}
                            title="Visualizar"
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAciso(item)}
                            title="Editar"
                          >
                            <i className="ri-edit-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateAcisoPDF(item)}
                            title="Gerar PDF"
                          >
                            <i className="ri-file-pdf-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAciso(item.id)}
                            title="Deletar"
                            className="text-destructive"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Visualização ACISO */}
      <Dialog open={!!viewingAciso} onOpenChange={(open) => !open && setViewingAciso(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do ACISO</DialogTitle>
          </DialogHeader>
          {viewingAciso && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <p className="text-foreground font-medium">{viewingAciso.local}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Público Alvo</Label>
                  <p className="text-foreground font-medium">{viewingAciso.publico_alvo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data e Hora</Label>
                  <p className="text-foreground font-medium">
                    {format(new Date(viewingAciso.data_hora), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Interação com o Público</Label>
                  <p className="text-foreground font-medium">{viewingAciso.interacao_publico}</p>
                </div>
              </div>
              {viewingAciso.material_utilizado && (
                <div>
                  <Label className="text-muted-foreground">Material Utilizado</Label>
                  <p className="text-foreground">{viewingAciso.material_utilizado}</p>
                </div>
              )}
              {viewingAciso.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-foreground">{viewingAciso.observacoes}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => generateAcisoPDF(viewingAciso)}
                >
                  <i className="ri-file-pdf-line mr-2"></i>Gerar PDF
                </Button>
                <Button
                  onClick={() => {
                    setViewingAciso(null);
                    handleEditAciso(viewingAciso);
                  }}
                >
                  <i className="ri-edit-line mr-2"></i>Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RefreshButton onClick={() => {
        fetchOcorrencias();
        fetchAcisos();
      }} isLoading={isRefreshing} />
    </div>
  );
};

export default PtecRH;

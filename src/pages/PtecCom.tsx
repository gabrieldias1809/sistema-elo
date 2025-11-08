import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
import { RefreshButton } from "@/components/RefreshButton";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import { getNextCentralizedOSNumber } from "@/hooks/useCentralizedOSNumber";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const PtecCom = () => {
  const queryClient = useQueryClient();
  const [os, setOS] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingOS, setViewingOS] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [marcaSuggestions, setMarcaSuggestions] = useState<string[]>([]);
  const [memSuggestions, setMemSuggestions] = useState<string[]>([]);
  const [sistemaSuggestions, setSistemaSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    numero_os: "",
    situacao: "",
    om_apoiada: "",
    marca: "",
    mem: "",
    sistema: "",
    tipo_manutencao: "",
    servico_solicitado: "",
    data_inicio: "",
    data_fim: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchOS();
    
    // Setup Realtime subscription
    const channel = supabase
      .channel("ptec_com_os_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ptec_com_os" },
        () => {
          fetchOS();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (open && !editingOS) {
      getNextOSNumber();
    } else if (open && editingOS) {
      setFormData({
        numero_os: editingOS.numero_os,
        situacao: editingOS.situacao || "",
        om_apoiada: editingOS.om_apoiada || "",
        marca: editingOS.marca || "",
        mem: editingOS.mem || "",
        sistema: editingOS.sistema || "",
        tipo_manutencao: editingOS.tipo_manutencao || "",
        servico_solicitado: editingOS.servico_solicitado || "",
        data_inicio: editingOS.data_inicio || "",
        data_fim: editingOS.data_fim || "",
        observacoes: editingOS.observacoes || "",
      });
    }
  }, [open, editingOS]);

  const generatePDF = (os: any) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEM DE SERVIÇO - PTEC COM", 105, 20, { align: "center" });
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Dados da OS
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    let y = 35;
    
    doc.text("Nº OS:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.numero_os || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Situação:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.situacao || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("OM Apoiada:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.om_apoiada || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Marca:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.marca || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("MEM:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.mem || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Sistema:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.sistema || "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Data Início:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.data_inicio ? format(new Date(os.data_inicio), "dd/MM/yyyy HH:mm") : "-", 60, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Data Fim:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(os.data_fim ? format(new Date(os.data_fim), "dd/MM/yyyy HH:mm") : "-", 60, y);
    
    // Serviço Solicitado
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Serviço Solicitado:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const servicoSolicitado = os.servico_solicitado || "-";
    const splitServico = doc.splitTextToSize(servicoSolicitado, 170);
    doc.text(splitServico, 20, y);
    y += splitServico.length * 7;
    
    // Serviço Realizado
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Serviço Realizado:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const servicoRealizado = os.servico_realizado || "-";
    const splitRealizado = doc.splitTextToSize(servicoRealizado, 170);
    doc.text(splitRealizado, 20, y);
    y += splitRealizado.length * 7;
    
    // Observações
    y += 8;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Observações:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const observacoes = os.observacoes || "-";
    const splitObs = doc.splitTextToSize(observacoes, 170);
    doc.text(splitObs, 20, y);
    
    // Salvar PDF
    doc.save(`OS_${os.numero_os}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  const fetchOS = async () => {
    const { data, error } = await supabase
      .from("ptec_com_os")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setOS(data || []);
    
    // Extract unique suggestions
    const uniqueOms = [...new Set(data?.map(d => d.om_apoiada).filter(Boolean))];
    const uniqueMarcas = [...new Set(data?.map(d => d.marca).filter(Boolean))];
    const uniqueMems = [...new Set(data?.map(d => d.mem).filter(Boolean))];
    const uniqueSistemas = [...new Set(data?.map(d => d.sistema).filter(Boolean))];
    
    setOmSuggestions(uniqueOms);
    setMarcaSuggestions(uniqueMarcas);
    setMemSuggestions(uniqueMems);
    setSistemaSuggestions(uniqueSistemas);
  };

  const getNextOSNumber = async () => {
    try {
      const nextNumber = await getNextCentralizedOSNumber();
      setFormData(prev => ({ ...prev, numero_os: nextNumber }));
    } catch (error) {
      console.error("Erro ao buscar próximo número de OS:", error);
      toast.error("Erro ao gerar número da OS");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Iniciando criação/atualização de OS", { formData, editingOS });

    // Validação de campos obrigatórios
    const missingFields: string[] = [];
    if (!formData.situacao) missingFields.push("Situação");
    if (!formData.om_apoiada) missingFields.push("OM Apoiada");
    if (!formData.marca) missingFields.push("Marca");
    if (!formData.mem) missingFields.push("MEM");
    if (!formData.sistema) missingFields.push("Sistema");
    if (!formData.tipo_manutencao) missingFields.push("Tipo de PMS");
    if (!formData.servico_solicitado) missingFields.push("Serviço Solicitado");

    if (missingFields.length > 0) {
      console.error("❌ Campos obrigatórios faltando:", missingFields);
      toast.error(`Preencha os seguintes campos: ${missingFields.join(", ")}`);
      return;
    }

    // Preparar dados com data_fim como null se não preenchida
    const dataToSubmit = {
      ...formData,
      data_fim: formData.data_fim || null,
      data_inicio: formData.data_inicio || null,
    };
    
    console.log("✅ Dados validados, preparando para enviar:", dataToSubmit);

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (editingOS) {
      console.log("📝 Atualizando OS existente:", editingOS.id);
      
      // Atualizar na tabela do PTEC
      const { error: errorPtec } = await supabase
        .from("ptec_com_os")
        .update(dataToSubmit)
        .eq("id", editingOS.id);

      if (errorPtec) {
        console.error("❌ Erro ao atualizar OS na tabela PTEC:", errorPtec);
        toast.error("Erro ao atualizar OS");
        return;
      }

      // Atualizar na tabela centralizada
      const { error: errorCentral } = await supabase
        .from("cia_mnt_os_centralizadas")
        .update({
          ...dataToSubmit,
          ptec_origem: "com",
        })
        .eq("numero_os", formData.numero_os);

      if (errorCentral) {
        console.error("❌ Erro ao atualizar OS centralizada:", errorCentral);
      }

      console.log("✅ OS atualizada com sucesso!");
      toast.success("OS atualizada com sucesso!");
    } else {
      console.log("📝 Criando nova OS");
      
      // Inserir na tabela do PTEC
      const { error: errorPtec } = await supabase.from("ptec_com_os").insert([
        {
          ...dataToSubmit,
          created_by: userId,
        },
      ]);

      if (errorPtec) {
        console.error("❌ Erro ao criar OS na tabela PTEC:", errorPtec);
        toast.error("Erro ao criar OS");
        return;
      }

      // Inserir na tabela centralizada
      const { error: errorCentral } = await supabase.from("cia_mnt_os_centralizadas").insert([
        {
          ...dataToSubmit,
          ptec_origem: "com",
          created_by: userId,
        },
      ]);

      if (errorCentral) {
        console.error("❌ Erro ao criar OS centralizada:", errorCentral);
        toast.error("Erro ao criar OS centralizada");
        return;
      }

      console.log("✅ OS criada com sucesso em ambas as tabelas!");
      toast.success("OS criada com sucesso!");
    }

    setOpen(false);
    setEditingOS(null);
    setFormData({
      numero_os: "",
      situacao: "",
      om_apoiada: "",
      marca: "",
      mem: "",
      sistema: "",
      tipo_manutencao: "",
      servico_solicitado: "",
      data_inicio: "",
      data_fim: "",
      observacoes: "",
    });
    fetchOS();
  };

  const handleEdit = (item: any) => {
    setEditingOS(item);
    setOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setOsToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!osToDelete) return;

    const { error } = await supabase
      .from("ptec_com_os")
      .delete()
      .eq("id", osToDelete.id);

    if (error) {
      toast.error("Erro ao excluir OS");
      return;
    }

    toast.success("OS excluída com sucesso!");
    setDeleteDialogOpen(false);
    setOsToDelete(null);
    fetchOS();
  };

  // Dados para gráficos
  const marcasData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.marca);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.marca || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const omData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_apoiada);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.om_apoiada, value: 1 });
    }
    return acc;
  }, []);

  const sistemaData = os.reduce((acc: any[], item) => {
    if (item.sistema) {
      const existing = acc.find((x) => x.name === item.sistema);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: item.sistema, value: 1 });
      }
    }
    return acc;
  }, []);

  const memData = os.reduce((acc: any[], item) => {
    if (item.mem) {
      const existing = acc.find((x) => x.name === item.mem);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: item.mem, value: 1 });
      }
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Com</h1>
          <p className="text-muted-foreground">
            Companhia de Manutenção de Comunicações
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOS}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <PedidoMaterialForm
            osOptions={os.map(item => ({ id: item.id, numero_os: item.numero_os }))}
            ptecOrigem="com"
            oficinaDestino="com"
            onSuccess={fetchOS}
          />
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setEditingOS(null);
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <i className="ri-add-line mr-2"></i>Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOS ? "Editar" : "Nova"} Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nº OS</Label>
                  <Input
                    value={formData.numero_os}
                    disabled={editingOS !== null}
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Situação</Label>
                  <Select
                    value={formData.situacao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, situacao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Manutenido">Manutenido</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>OM Apoiada</Label>
                  <AutocompleteInput
                    value={formData.om_apoiada}
                    onChange={(value) =>
                      setFormData({ ...formData, om_apoiada: value })
                    }
                    suggestions={omSuggestions}
                    required
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Marca</Label>
                  <AutocompleteInput
                    value={formData.marca}
                    onChange={(value) =>
                      setFormData({ ...formData, marca: value })
                    }
                    suggestions={marcaSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>MEM</Label>
                  <AutocompleteInput
                    value={formData.mem}
                    onChange={(value) =>
                      setFormData({ ...formData, mem: value })
                    }
                    suggestions={memSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Sistema</Label>
                  <AutocompleteInput
                    value={formData.sistema}
                    onChange={(value) =>
                      setFormData({ ...formData, sistema: value })
                    }
                    suggestions={sistemaSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Tipo de PMS</Label>
                  <Select
                    value={formData.tipo_manutencao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo_manutencao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PMS">PMS</SelectItem>
                      <SelectItem value="PMR">PMR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Data Início</Label>
                  <DateTimePicker
                    value={formData.data_inicio}
                    onChange={(value) =>
                      setFormData({ ...formData, data_inicio: value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data Fim</Label>
                  <DateTimePicker
                    value={formData.data_fim}
                    onChange={(value) =>
                      setFormData({ ...formData, data_fim: value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Serviço Solicitado</Label>
                <Textarea
                  value={formData.servico_solicitado}
                  onChange={(e) =>
                    setFormData({ ...formData, servico_solicitado: e.target.value })
                  }
                  className="placeholder:text-transparent"
                />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="placeholder:text-transparent"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                {editingOS ? "Atualizar OS" : "Criar OS"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Marcas mais recorrentes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={marcasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0A7373" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            OM mais recorrentes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={omData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {omData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sistemas com mais falhas
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sistemaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#EDAA25" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            MEM com mais recorrência
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={memData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#C43302" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ordens de Serviço
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OS</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>OM Apoiada</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Sistema</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {os.map((item) => (
                <TableRow 
                  key={item.id}
                  className={
                    item.situacao === "Aberta" 
                      ? "bg-red-500/20 hover:bg-red-500/30" 
                      : item.situacao === "Manutenido" 
                      ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                      : item.situacao === "Fechada"
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : ""
                  }
                >
                  <TableCell>{item.numero_os}</TableCell>
                  <TableCell>{item.situacao}</TableCell>
                  <TableCell>{item.om_apoiada}</TableCell>
                  <TableCell>{item.marca}</TableCell>
                  <TableCell>{item.sistema}</TableCell>
                  <TableCell>
                    {item.data_inicio
                      ? format(new Date(item.data_inicio), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingOS(item);
                          setViewDialogOpen(true);
                        }}
                      >
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(item)}
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

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Ordem de Serviço</span>
              {viewingOS && (
                <Button
                  onClick={() => generatePDF(viewingOS)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <i className="ri-printer-line mr-2"></i>
                  Gerar PDF
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nº OS</Label>
                  <p className="font-semibold">{viewingOS.numero_os}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Situação</Label>
                  <p className="font-semibold">{viewingOS.situacao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">OM Apoiada</Label>
                  <p className="font-semibold">{viewingOS.om_apoiada}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Marca</Label>
                  <p className="font-semibold">{viewingOS.marca || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">MEM</Label>
                  <p className="font-semibold">{viewingOS.mem || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sistema</Label>
                  <p className="font-semibold">{viewingOS.sistema || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Início</Label>
                  <p className="font-semibold">
                    {viewingOS.data_inicio
                      ? format(new Date(viewingOS.data_inicio), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Fim</Label>
                  <p className="font-semibold">
                    {viewingOS.data_fim
                      ? format(new Date(viewingOS.data_fim), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Serviço Solicitado</Label>
                <p className="font-semibold whitespace-pre-wrap">{viewingOS.servico_solicitado || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Serviço Realizado</Label>
                <p className="font-semibold whitespace-pre-wrap">{viewingOS.servico_realizado || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-semibold whitespace-pre-wrap">{viewingOS.observacoes || "-"}</p>
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
              Tem certeza que deseja excluir a OS {osToDelete?.numero_os}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RefreshButton onClick={fetchOS} isLoading={isRefreshing} />
    </div>
  );
};

export default PtecCom;

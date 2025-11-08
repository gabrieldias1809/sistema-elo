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
import { RefreshButton } from "@/components/RefreshButton";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];
import { format } from "date-fns";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
import { getNextCentralizedOSNumber } from "@/hooks/useCentralizedOSNumber";

const PtecOp = () => {
  const [os, setOS] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [tipoPmsSuggestions, setTipoPmsSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    numero_os: "",
    ptec_origem: "op",
    situacao: "",
    om_apoiada: "",
    tipo_pms: "",
    data_inicio: "",
    data_fim: "",
    descricao_problema: "",
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingOS, setViewingOS] = useState<any>(null);

  useEffect(() => {
    fetchOS();

    // Supabase Realtime
    const channel = supabase
      .channel("ptec_op_os_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ptec_op_os" }, () => {
        fetchOS();
      })
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
        ptec_origem: editingOS.ptec_origem || "op",
        situacao: editingOS.situacao || "",
        om_apoiada: editingOS.om_apoiada || "",
        tipo_pms: editingOS.tipo_pms || "",
        data_inicio: editingOS.data_inicio || "",
        data_fim: editingOS.data_fim || "",
        descricao_problema: editingOS.descricao_problema || "",
      });
    }
  }, [open, editingOS]);

  const fetchOS = async () => {
    const { data, error } = await supabase
      .from("ptec_op_os")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setOS(data || []);
    
    // Extract unique suggestions
    const uniqueOms = [...new Set(data?.map(d => d.om_apoiada).filter(Boolean))];
    const uniqueTipoPms = [...new Set(data?.map(d => d.tipo_pms).filter(Boolean))];
    
    setOmSuggestions(uniqueOms);
    setTipoPmsSuggestions(uniqueTipoPms);
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

    // Validação de campos obrigatórios
    const missingFields: string[] = [];
    if (!formData.situacao) missingFields.push("Situação");
    if (!formData.om_apoiada) missingFields.push("OM Apoiada");

    if (missingFields.length > 0) {
      toast.error(`Preencha os seguintes campos: ${missingFields.join(", ")}`);
      return;
    }

    const dataToSubmit = {
      ...formData,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
    };

    if (editingOS) {
      const { error } = await supabase
        .from("ptec_op_os")
        .update(dataToSubmit)
        .eq("id", editingOS.id);

      if (error) {
        toast.error("Erro ao atualizar OS");
        return;
      }

      toast.success("OS atualizada com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_op_os").insert([
        {
          ...dataToSubmit,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (error) {
        toast.error("Erro ao criar OS");
        return;
      }

      toast.success("OS criada com sucesso!");
    }

    setOpen(false);
    setEditingOS(null);
    setFormData({
      numero_os: "",
      ptec_origem: "op",
      situacao: "",
      om_apoiada: "",
      tipo_pms: "",
      data_inicio: "",
      data_fim: "",
      descricao_problema: "",
    });
    fetchOS();
  };

  const handleEdit = (item: any) => {
    setEditingOS(item);
    setOpen(true);
  };

  const handleView = (item: any) => {
    setViewingOS(item);
    setViewDialogOpen(true);
  };

  const handlePrint = (item: any) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OS ${item.numero_os}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td { padding: 8px; border: 1px solid #ddd; }
          .label { font-weight: bold; width: 30%; background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Ordem de Serviço - ${item.numero_os}</h1>
        <table>
          <tr><td class="label">Nº OS</td><td>${item.numero_os}</td></tr>
          <tr><td class="label">PTEC Origem</td><td>${item.ptec_origem?.toUpperCase() || 'OP'}</td></tr>
          <tr><td class="label">Situação</td><td>${item.situacao}</td></tr>
          <tr><td class="label">OM Apoiada</td><td>${item.om_apoiada}</td></tr>
          <tr><td class="label">Tipo de PMS</td><td>${item.tipo_pms || '-'}</td></tr>
          <tr><td class="label">Data Início</td><td>${item.data_inicio ? format(new Date(item.data_inicio), 'dd/MM/yyyy HH:mm') : '-'}</td></tr>
          <tr><td class="label">Data Fim</td><td>${item.data_fim ? format(new Date(item.data_fim), 'dd/MM/yyyy HH:mm') : '-'}</td></tr>
          <tr><td class="label">Descrição do Problema</td><td>${item.descricao_problema || '-'}</td></tr>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteClick = (item: any) => {
    setOsToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!osToDelete) return;

    const { error } = await supabase
      .from("ptec_op_os")
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
  const tipoPmsData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.tipo_pms);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.tipo_pms || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const situacaoData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.situacao);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.situacao, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Op</h1>
          <p className="text-muted-foreground">
            Companhia de Optrônica
          </p>
        </div>
        <div className="flex gap-2">
          <PedidoMaterialForm
            osOptions={os.map(item => ({ id: item.id, numero_os: item.numero_os }))}
            ptecOrigem="op"
            oficinaDestino="op"
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
                  <Label>Tipo de PMS</Label>
                  <AutocompleteInput
                    value={formData.tipo_pms}
                    onChange={(value) =>
                      setFormData({ ...formData, tipo_pms: value })
                    }
                    suggestions={tipoPmsSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Data Início (Opcional)</Label>
                  <DateTimePicker
                    value={formData.data_inicio}
                    onChange={(value) =>
                      setFormData({ ...formData, data_inicio: value })
                    }
                    placeholder="Selecione data e hora (opcional)"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data Fim (Opcional)</Label>
                  <DateTimePicker
                    value={formData.data_fim}
                    onChange={(value) =>
                      setFormData({ ...formData, data_fim: value })
                    }
                    placeholder="Selecione data e hora (opcional)"
                  />
                </div>
              </div>
              <div>
                <Label>Descrição do Problema</Label>
                <Textarea
                  value={formData.descricao_problema}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao_problema: e.target.value })
                  }
                  className="placeholder:text-transparent"
                  rows={5}
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
            Tipos de PMS
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tipoPmsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#C43302" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Relação OS x Situação
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={situacaoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {situacaoData.map((entry, index) => (
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
                <TableHead>Tipo PMS</TableHead>
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
                  <TableCell>{item.tipo_pms || "-"}</TableCell>
                  <TableCell>{item.data_inicio ? format(new Date(item.data_inicio), 'dd/MM/yyyy') : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(item)}
                        title="Visualizar"
                      >
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        title="Editar"
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

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Ordem de Serviço</span>
              {viewingOS && (
                <Button
                  onClick={() => handlePrint(viewingOS)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <i className="ri-printer-line mr-2"></i>
                  Imprimir
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nº OS</Label>
                  <p className="font-medium">{viewingOS.numero_os}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PTEC Origem</Label>
                  <p className="font-medium">{viewingOS.ptec_origem?.toUpperCase() || 'OP'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Situação</Label>
                  <p className="font-medium">{viewingOS.situacao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">OM Apoiada</Label>
                  <p className="font-medium">{viewingOS.om_apoiada}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de PMS</Label>
                  <p className="font-medium">{viewingOS.tipo_pms || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Início</Label>
                  <p className="font-medium">
                    {viewingOS.data_inicio
                      ? format(new Date(viewingOS.data_inicio), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Fim</Label>
                  <p className="font-medium">
                    {viewingOS.data_fim
                      ? format(new Date(viewingOS.data_fim), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Descrição do Problema</Label>
                <p className="font-medium whitespace-pre-wrap">{viewingOS.descricao_problema || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RefreshButton onClick={fetchOS} isLoading={isRefreshing} />
    </div>
  );
};

export default PtecOp;

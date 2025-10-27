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
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

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
        servico_solicitado: editingOS.servico_solicitado || "",
        data_inicio: editingOS.data_inicio || "",
        data_fim: editingOS.data_fim || "",
        observacoes: editingOS.observacoes || "",
      });
    }
  }, [open, editingOS]);

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
    const { data, error } = await supabase
      .from("ptec_com_os")
      .select("numero_os")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Erro ao buscar último número:", error);
      return;
    }

    const lastNumber = data && data.length > 0 ? parseInt(data[0].numero_os) : 0;
    const osNumber = (lastNumber + 1).toString().padStart(3, "0");
    setFormData(prev => ({ ...prev, numero_os: osNumber }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    const missingFields: string[] = [];
    if (!formData.situacao) missingFields.push("Situação");
    if (!formData.om_apoiada) missingFields.push("OM Apoiada");
    if (!formData.marca) missingFields.push("Marca");
    if (!formData.mem) missingFields.push("MEM");
    if (!formData.sistema) missingFields.push("Sistema");
    if (!formData.servico_solicitado) missingFields.push("Serviço Solicitado");

    if (missingFields.length > 0) {
      toast.error(`Preencha os seguintes campos: ${missingFields.join(", ")}`);
      return;
    }

    // Preparar dados com data_fim como null se não preenchida
    const dataToSubmit = {
      ...formData,
      data_fim: formData.data_fim || null,
      data_inicio: formData.data_inicio || null,
    };

    if (editingOS) {
      const { error } = await supabase
        .from("ptec_com_os")
        .update(dataToSubmit)
        .eq("id", editingOS.id);

      if (error) {
        toast.error("Erro ao atualizar OS");
        return;
      }

      toast.success("OS atualizada com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_com_os").insert([
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
      situacao: "",
      om_apoiada: "",
      marca: "",
      mem: "",
      sistema: "",
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Com</h1>
          <p className="text-muted-foreground">
            Companhia de Manutenção de Comunicações
          </p>
        </div>
        <div className="flex gap-3">
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
                  className={item.situacao === "Fechada" ? "bg-destructive/10" : ""}
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
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
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
    </div>
  );
};

export default PtecCom;

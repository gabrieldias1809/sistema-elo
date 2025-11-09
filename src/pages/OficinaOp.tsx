import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/DateTimePicker";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
import { PedidosMaterialTable } from "@/components/PedidosMaterialTable";
import { RefreshButton } from "@/components/RefreshButton";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { format } from "date-fns";
import { CustomTooltip } from "@/components/CustomTooltip";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const OficinaOp = () => {
  const [os, setOS] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingOS, setViewingOS] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    servico_realizado: "",
    situacao: "",
    numero_os: "",
  });

  useEffect(() => {
    fetchOS();

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
    if (open && editingOS) {
      setFormData({
        numero_os: editingOS.numero_os,
        servico_realizado: editingOS.servico_realizado || "",
        situacao: editingOS.situacao || "",
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingOS) return;

    const dataToSubmit = {
      servico_realizado: formData.servico_realizado,
      situacao: formData.situacao,
    };

    const { error } = await supabase
      .from("ptec_op_os")
      .update(dataToSubmit)
      .eq("id", editingOS.id);

    if (error) {
      toast.error("Erro ao atualizar OS");
      return;
    }

    toast.success("OS atualizada com sucesso!");
    setOpen(false);
    setEditingOS(null);
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
      <html><head><title>OS ${item.numero_os}</title>
      <style>body{font-family:Arial;padding:20px}h1{text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:8px;border:1px solid #ddd}.label{font-weight:bold;width:30%;background:#f5f5f5}</style>
      </head><body><h1>Ordem de Serviço - ${item.numero_os}</h1><table>
      <tr><td class="label">Nº OS</td><td>${item.numero_os}</td></tr>
      <tr><td class="label">Situação</td><td>${item.situacao}</td></tr>
      <tr><td class="label">OM Apoiada</td><td>${item.om_apoiada}</td></tr>
      <tr><td class="label">Tipo PMS</td><td>${item.tipo_pms || '-'}</td></tr>
      <tr><td class="label">Data Início</td><td>${item.data_inicio ? format(new Date(item.data_inicio), "dd/MM/yyyy HH:mm") : '-'}</td></tr>
      <tr><td class="label">Data Fim</td><td>${item.data_fim ? format(new Date(item.data_fim), "dd/MM/yyyy HH:mm") : '-'}</td></tr>
      <tr><td class="label">Descrição do Problema</td><td>${item.descricao_problema || '-'}</td></tr>
      <tr><td class="label">Serviço Realizado</td><td>${item.servico_realizado || '-'}</td></tr>
      </table></body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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

  const memData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.mem);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.mem || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const sistemaData = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.sistema);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.sistema || "N/A", value: 1 });
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Oficina Op</h1>
          <p className="text-muted-foreground">
            Oficina de Optrônica
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
          ptecOrigem="op"
          oficinaDestino="op"
          onSuccess={fetchOS}
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setEditingOS(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nº OS</Label>
              <Input
                value={formData.numero_os}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Situação</Label>
              <Select
                value={formData.situacao}
                onValueChange={(value) => setFormData({ ...formData, situacao: value })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Manutenido">Manutenido</SelectItem>
                  <SelectItem value="Fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Serviço Realizado</Label>
              <Textarea
                value={formData.servico_realizado}
                onChange={(e) =>
                  setFormData({ ...formData, servico_realizado: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-white">
              Atualizar OS
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Marcas mais recorrentes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={marcasData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marcasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            MEM mais recorrente
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

      {/* Tabela de Pedidos de Material */}
      <PedidosMaterialTable oficinaDestino="op" />

      {/* Tabela */}
      <Card className="p-6 mt-6">
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
                <TableHead>Descrição</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Serviço Realizado</TableHead>
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
                  <TableCell>{item.descricao_problema || "-"}</TableCell>
                  <TableCell>{item.data_inicio ? format(new Date(item.data_inicio), "dd/MM/yyyy HH:mm") : "-"}</TableCell>
                  <TableCell>{item.data_fim ? format(new Date(item.data_fim), "dd/MM/yyyy HH:mm") : "-"}</TableCell>
                  <TableCell>{item.servico_realizado || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(item)} title="Visualizar">
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)} title="Editar">
                        <i className="ri-edit-line"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Ordem de Serviço</span>
              {viewingOS && (
                <Button onClick={() => handlePrint(viewingOS)} variant="outline" size="sm" className="ml-auto">
                  <i className="ri-printer-line mr-2"></i>Imprimir
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Nº OS</Label><p className="font-medium">{viewingOS.numero_os}</p></div>
                <div><Label className="text-muted-foreground">Situação</Label><p className="font-medium">{viewingOS.situacao}</p></div>
                <div><Label className="text-muted-foreground">OM Apoiada</Label><p className="font-medium">{viewingOS.om_apoiada}</p></div>
                <div><Label className="text-muted-foreground">Tipo PMS</Label><p className="font-medium">{viewingOS.tipo_pms || "-"}</p></div>
                <div><Label className="text-muted-foreground">Data Início</Label><p className="font-medium">{viewingOS.data_inicio ? format(new Date(viewingOS.data_inicio), "dd/MM/yyyy HH:mm") : "-"}</p></div>
                <div><Label className="text-muted-foreground">Data Fim</Label><p className="font-medium">{viewingOS.data_fim ? format(new Date(viewingOS.data_fim), "dd/MM/yyyy HH:mm") : "-"}</p></div>
              </div>
              <div><Label className="text-muted-foreground">Descrição do Problema</Label><p className="font-medium whitespace-pre-wrap">{viewingOS.descricao_problema || "-"}</p></div>
              <div><Label className="text-muted-foreground">Serviço Realizado</Label><p className="font-medium whitespace-pre-wrap">{viewingOS.servico_realizado || "-"}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RefreshButton onClick={fetchOS} isLoading={isRefreshing} />
    </div>
  );
};

export default OficinaOp;
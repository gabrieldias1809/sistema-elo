import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { DateTimePicker } from "@/components/DateTimePicker";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
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

const OficinaCom = () => {
  const [os, setOS] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);

  const [formData, setFormData] = useState({
    servico_realizado: "",
    situacao_atual: "",
    data_fim: "",
    numero_os: "",
  });

  useEffect(() => {
    fetchOS();
  }, []);

  useEffect(() => {
    if (open && editingOS) {
      setFormData({
        numero_os: editingOS.numero_os,
        servico_realizado: editingOS.servico_realizado || "",
        situacao_atual: editingOS.situacao_atual || "",
        data_fim: editingOS.data_fim || "",
      });
    }
  }, [open, editingOS]);

  const fetchOS = async () => {
    const { data, error } = await supabase.from("ptec_com_os").select("*").order("created_at", { ascending: false });

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
      situacao_atual: formData.situacao_atual,
      data_fim: formData.data_fim,
    };

    const { error } = await supabase.from("ptec_com_os").update(dataToSubmit).eq("id", editingOS.id);

    if (error) {
      toast.error("Erro ao atualizar OS");
      return;
    }

    toast.success("OS atualizada com sucesso!");
    setOpen(false);
    setEditingOS(null);
    fetchOS();
  };

  const handleDeleteConfirm = async () => {
    if (!osToDelete) return;

    const { error } = await supabase.from("ptec_com_os").delete().eq("id", osToDelete.id);

    if (error) {
      toast.error("Erro ao excluir OS");
      return;
    }

    toast.success("OS excluída com sucesso!");
    setDeleteDialogOpen(false);
    setOsToDelete(null);
    fetchOS();
  };

  const handleEdit = (item: any) => {
    setEditingOS(item);
    setOpen(true);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Oficina Com</h1>
          <p className="text-muted-foreground">Oficina de Comunicações</p>
        </div>
        <PedidoMaterialForm
          osOptions={os.map((item) => ({ id: item.id, numero_os: item.numero_os }))}
          ptecOrigem="com"
          oficinaDestino="com"
          onSuccess={fetchOS}
        />
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditingOS(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nº OS</Label>
              <Input value={formData.numero_os} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Situação Atual</Label>
              <Input
                value={formData.situacao_atual}
                onChange={(e) => setFormData({ ...formData, situacao_atual: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <DateTimePicker
                value={formData.data_fim}
                onChange={(value) => setFormData({ ...formData, data_fim: value })}
              />
            </div>
            <div>
              <Label>Serviço Realizado</Label>
              <Textarea
                value={formData.servico_realizado}
                onChange={(e) => setFormData({ ...formData, servico_realizado: e.target.value })}
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Marcas mais recorrentes</h3>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">OM mais recorrentes</h3>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Ordens de Serviço</h3>
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
                <TableRow key={item.id} className={item.situacao === "Fechada" ? "bg-destructive/10" : ""}>
                  <TableCell>{item.numero_os}</TableCell>
                  <TableCell>{item.situacao}</TableCell>
                  <TableCell>{item.om_apoiada}</TableCell>
                  <TableCell>{item.marca}</TableCell>
                  <TableCell>{item.sistema}</TableCell>
                  <TableCell>
                    {item.data_inicio ? format(new Date(item.data_inicio), "dd/MM/yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(item)}>
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

export default OficinaCom;

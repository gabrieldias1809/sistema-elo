import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

  const handleEdit = (item: any) => {
    setEditingOS(item);
    setOpen(true);
  };

  // Dados para gráficos
  const combustivelPorOM = os.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_apoiada);
    if (existing) {
      existing.value += parseFloat(item.quantidade_classe_iii || 0);
    } else {
      acc.push({
        name: item.om_apoiada,
        value: parseFloat(item.quantidade_classe_iii || 0),
      });
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

      {/* Gráfico */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Combustível utilizado por OM (Litros)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combustivelPorOM}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0A7373" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

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
                <TableHead>Situação Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {os.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.numero_os}</TableCell>
                  <TableCell>{item.situacao}</TableCell>
                  <TableCell>{item.om_apoiada}</TableCell>
                  <TableCell>{item.marca}</TableCell>
                  <TableCell>{item.situacao_atual || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <i className="ri-edit-line"></i>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default OficinaCom;

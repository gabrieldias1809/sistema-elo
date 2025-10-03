import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const PtecRH = () => {
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: "",
    dia_semana: "",
    quantidade_corpos: "0",
    local: "",
    gdh: "",
    causa_provavel: "",
    graduacao: "",
    nome_guerra: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const fetchOcorrencias = async () => {
    const { data, error } = await supabase
      .from("ptec_rh_ocorrencias")
      .select("*")
      .order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setOcorrencias(data || []);
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
      data: "",
      dia_semana: "",
      quantidade_corpos: "0",
      local: "",
      gdh: "",
      causa_provavel: "",
      graduacao: "",
      nome_guerra: "",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec RH</h1>
          <p className="text-muted-foreground">Companhia de Recursos Humanos</p>
        </div>
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
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Dia da Semana</Label>
                  <Input
                    value={formData.dia_semana}
                    onChange={(e) =>
                      setFormData({ ...formData, dia_semana: e.target.value })
                    }
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
                <div>
                  <Label>Local</Label>
                  <Input
                    value={formData.local}
                    onChange={(e) =>
                      setFormData({ ...formData, local: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>GDH</Label>
                  <Input
                    value={formData.gdh}
                    onChange={(e) =>
                      setFormData({ ...formData, gdh: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Causa Provável</Label>
                  <Input
                    value={formData.causa_provavel}
                    onChange={(e) =>
                      setFormData({ ...formData, causa_provavel: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Graduação</Label>
                  <Input
                    value={formData.graduacao}
                    onChange={(e) =>
                      setFormData({ ...formData, graduacao: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Nome de Guerra</Label>
                  <Input
                    value={formData.nome_guerra}
                    onChange={(e) =>
                      setFormData({ ...formData, nome_guerra: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Corpos coletados por dia
          </h3>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Causas mais recorrentes
          </h3>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ocorrências Mortuárias
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Dia Semana</TableHead>
                <TableHead>Qnt. Corpos</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Nome Guerra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ocorrencias.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.data).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.dia_semana}</TableCell>
                  <TableCell>{item.quantidade_corpos}</TableCell>
                  <TableCell>{item.local}</TableCell>
                  <TableCell>{item.causa_provavel}</TableCell>
                  <TableCell>{item.nome_guerra}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PtecRH;

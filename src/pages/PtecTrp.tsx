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

const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", "#E5DEFF"];

const PtecTrp = () => {
  const [transportes, setTransportes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_trp_transportes").insert([
      {
        ...formData,
        odometro_saida: formData.odometro_saida
          ? parseFloat(formData.odometro_saida)
          : null,
        odometro_retorno: formData.odometro_retorno
          ? parseFloat(formData.odometro_retorno)
          : null,
        quantidade_transportada: formData.quantidade_transportada
          ? parseFloat(formData.quantidade_transportada)
          : null,
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Trp</h1>
          <p className="text-muted-foreground">
            Companhia de Transporte / Suprimento
          </p>
        </div>
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
                  <Input
                    value={formData.placa_vtr}
                    onChange={(e) =>
                      setFormData({ ...formData, placa_vtr: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Destino</Label>
                  <Input
                    value={formData.destino}
                    onChange={(e) =>
                      setFormData({ ...formData, destino: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Data/Hora Saída</Label>
                  <Input
                    type="datetime-local"
                    value={formData.data_hora_saida}
                    onChange={(e) =>
                      setFormData({ ...formData, data_hora_saida: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Data/Hora Entrada</Label>
                  <Input
                    type="datetime-local"
                    value={formData.data_hora_entrada}
                    onChange={(e) =>
                      setFormData({ ...formData, data_hora_entrada: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Odômetro Saída</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.odometro_saida}
                    onChange={(e) =>
                      setFormData({ ...formData, odometro_saida: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Odômetro Retorno</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.odometro_retorno}
                    onChange={(e) =>
                      setFormData({ ...formData, odometro_retorno: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Chefe VTR</Label>
                  <Input
                    value={formData.chefe_vtr}
                    onChange={(e) =>
                      setFormData({ ...formData, chefe_vtr: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Motorista</Label>
                  <Input
                    value={formData.motorista}
                    onChange={(e) =>
                      setFormData({ ...formData, motorista: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Classe de Material</Label>
                  <Input
                    value={formData.classe_material}
                    onChange={(e) =>
                      setFormData({ ...formData, classe_material: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, utilizacao: e.target.value })
                  }
                />
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
                Criar Registro
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recorrência dos destinos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={destinosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Classe de material transportada
          </h3>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Registros de Transporte
        </h3>
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
    </div>
  );
};

export default PtecTrp;

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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA"];

const PtecSau = () => {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    data: "",
    nivel_leve: "0",
    nivel_moderado: "0",
    nivel_grave: "0",
    nivel_obs: "0",
    cirurgias: "0",
    obitos: "0",
    evacuacoes: "0",
    internados_uti: "0",
    internados_enfermaria: "0",
    retorno_combate: "0",
    observacoes: "",
  });

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    const { data, error } = await supabase
      .from("ptec_sau_relatorios")
      .select("*")
      .order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setRelatorios(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_sau_relatorios").insert([
      {
        data: formData.data,
        nivel_leve: parseInt(formData.nivel_leve),
        nivel_moderado: parseInt(formData.nivel_moderado),
        nivel_grave: parseInt(formData.nivel_grave),
        nivel_obs: parseInt(formData.nivel_obs),
        cirurgias: parseInt(formData.cirurgias),
        obitos: parseInt(formData.obitos),
        evacuacoes: parseInt(formData.evacuacoes),
        internados_uti: parseInt(formData.internados_uti),
        internados_enfermaria: parseInt(formData.internados_enfermaria),
        retorno_combate: parseInt(formData.retorno_combate),
        observacoes: formData.observacoes,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar relatório");
      return;
    }

    toast.success("Relatório criado com sucesso!");
    setOpen(false);
    setFormData({
      data: "",
      nivel_leve: "0",
      nivel_moderado: "0",
      nivel_grave: "0",
      nivel_obs: "0",
      cirurgias: "0",
      obitos: "0",
      evacuacoes: "0",
      internados_uti: "0",
      internados_enfermaria: "0",
      retorno_combate: "0",
      observacoes: "",
    });
    fetchRelatorios();
  };

  // Dados para gráficos
  const gravidadeData = relatorios.reduce(
    (acc, item) => {
      acc[0].value += item.nivel_leve || 0;
      acc[1].value += item.nivel_moderado || 0;
      acc[2].value += item.nivel_grave || 0;
      acc[3].value += item.nivel_obs || 0;
      return acc;
    },
    [
      { name: "Leve", value: 0 },
      { name: "Moderado", value: 0 },
      { name: "Grave", value: 0 },
      { name: "OBS", value: 0 },
    ]
  );

  const cirurgiasData = relatorios.map((r) => ({
    data: new Date(r.data).toLocaleDateString(),
    cirurgias: r.cirurgias,
  }));

  const evacuacoesData = relatorios.reduce(
    (acc, item) => {
      acc[0].value += item.evacuacoes || 0;
      return acc;
    },
    [{ name: "Evacuações", value: 0 }]
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Sau</h1>
          <p className="text-muted-foreground">Companhia de Saúde</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Relatório de Saúde</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nível Leve</Label>
                  <Input
                    type="number"
                    value={formData.nivel_leve}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_leve: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Nível Moderado</Label>
                  <Input
                    type="number"
                    value={formData.nivel_moderado}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_moderado: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Nível Grave</Label>
                  <Input
                    type="number"
                    value={formData.nivel_grave}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_grave: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Nível OBS</Label>
                  <Input
                    type="number"
                    value={formData.nivel_obs}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_obs: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Cirurgias</Label>
                  <Input
                    type="number"
                    value={formData.cirurgias}
                    onChange={(e) =>
                      setFormData({ ...formData, cirurgias: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Óbitos</Label>
                  <Input
                    type="number"
                    value={formData.obitos}
                    onChange={(e) =>
                      setFormData({ ...formData, obitos: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Evacuações</Label>
                  <Input
                    type="number"
                    value={formData.evacuacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, evacuacoes: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Internados UTI</Label>
                  <Input
                    type="number"
                    value={formData.internados_uti}
                    onChange={(e) =>
                      setFormData({ ...formData, internados_uti: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Internados Enfermaria</Label>
                  <Input
                    type="number"
                    value={formData.internados_enfermaria}
                    onChange={(e) =>
                      setFormData({ ...formData, internados_enfermaria: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Retorno ao Combate</Label>
                  <Input
                    type="number"
                    value={formData.retorno_combate}
                    onChange={(e) =>
                      setFormData({ ...formData, retorno_combate: e.target.value })
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
                Criar Relatório
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Atendimentos por Gravidade
          </h3>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Cirurgias
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cirurgiasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cirurgias" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Evacuações
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={evacuacoesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#9b87f5"
                dataKey="value"
              >
                {evacuacoesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Timeline Geral
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={relatorios.map((r) => ({
                data: new Date(r.data).toLocaleDateString(),
                total:
                  (r.nivel_leve || 0) +
                  (r.nivel_moderado || 0) +
                  (r.nivel_grave || 0) +
                  (r.nivel_obs || 0),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#9b87f5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Relatórios de Saúde
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Leve</TableHead>
                <TableHead>Moderado</TableHead>
                <TableHead>Grave</TableHead>
                <TableHead>Cirurgias</TableHead>
                <TableHead>Óbitos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.data).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.nivel_leve}</TableCell>
                  <TableCell>{item.nivel_moderado}</TableCell>
                  <TableCell>{item.nivel_grave}</TableCell>
                  <TableCell>{item.cirurgias}</TableCell>
                  <TableCell>{item.obitos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PtecSau;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { Clock } from "lucide-react";

const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA"];

const PtecSau = () => {
  const [pms, setPms] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [atividadeSuggestions, setAtividadeSuggestions] = useState<string[]>([]);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
  const [fracaoSuggestions, setFracaoSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    om_responsavel: "",
    numero_pms: "",
    atividade: "",
    data: "",
    hora: "",
    local: "",
    fracao: "",
    descricao: "",
    conduta_esperada: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchPms();
  }, []);

  const fetchPms = async () => {
    const { data, error } = await supabase
      .from("ptec_sau_pms")
      .select("*")
      .order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }

    setPms(data || []);
    
    // Extract unique suggestions
    const uniqueOms = [...new Set(data?.map(d => d.om_responsavel).filter(Boolean))];
    const uniqueAtividades = [...new Set(data?.map(d => d.atividade).filter(Boolean))];
    const uniqueLocais = [...new Set(data?.map(d => d.local).filter(Boolean))];
    const uniqueFracoes = [...new Set(data?.map(d => d.fracao).filter(Boolean))];
    
    setOmSuggestions(uniqueOms);
    setAtividadeSuggestions(uniqueAtividades);
    setLocalSuggestions(uniqueLocais);
    setFracaoSuggestions(uniqueFracoes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_sau_pms").insert([
      {
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar PMS");
      return;
    }

    toast.success("PMS criado com sucesso!");
    setOpen(false);
    setFormData({
      om_responsavel: "",
      numero_pms: "",
      atividade: "",
      data: "",
      hora: "",
      local: "",
      fracao: "",
      descricao: "",
      conduta_esperada: "",
      observacoes: "",
    });
    fetchPms();
  };

  // Dados para gráficos
  const atividadesData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.atividade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.atividade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const omsData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_responsavel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.om_responsavel || "N/A", value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec Sau</h1>
          <p className="text-muted-foreground">Companhia de Saúde - PMS</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Novo PMS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Problema Militar Simulado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>OM Responsável</Label>
                  <AutocompleteInput
                    value={formData.om_responsavel}
                    onChange={(value) =>
                      setFormData({ ...formData, om_responsavel: value })
                    }
                    suggestions={omSuggestions}
                    required
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Número do PMS</Label>
                  <Input
                    value={formData.numero_pms}
                    onChange={(e) =>
                      setFormData({ ...formData, numero_pms: e.target.value })
                    }
                    required
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Atividade</Label>
                  <AutocompleteInput
                    value={formData.atividade}
                    onChange={(value) =>
                      setFormData({ ...formData, atividade: value })
                    }
                    suggestions={atividadeSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
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
                  <Label>Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      type="time"
                      value={formData.hora}
                      onChange={(e) =>
                        setFormData({ ...formData, hora: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Local</Label>
                  <AutocompleteInput
                    value={formData.local}
                    onChange={(value) =>
                      setFormData({ ...formData, local: value })
                    }
                    suggestions={localSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Fração</Label>
                  <AutocompleteInput
                    value={formData.fracao}
                    onChange={(value) =>
                      setFormData({ ...formData, fracao: value })
                    }
                    suggestions={fracaoSuggestions}
                    className="placeholder:text-transparent"
                  />
                </div>
              </div>
              <div>
                <Label>Descrição do PMS</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="placeholder:text-transparent"
                />
              </div>
              <div>
                <Label>Conduta Esperada no Atendimento</Label>
                <Textarea
                  value={formData.conduta_esperada}
                  onChange={(e) =>
                    setFormData({ ...formData, conduta_esperada: e.target.value })
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
                Criar PMS
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            PMS por Atividade
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={atividadesData}>
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
            PMS por OM Responsável
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={omsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {omsData.map((entry, index) => (
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
          Registros de PMS
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº PMS</TableHead>
                <TableHead>OM Responsável</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Local</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pms.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.numero_pms}</TableCell>
                  <TableCell>{item.om_responsavel}</TableCell>
                  <TableCell>{item.atividade || "-"}</TableCell>
                  <TableCell>
                    {item.data ? format(new Date(item.data), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>{item.hora || "-"}</TableCell>
                  <TableCell>{item.local || "-"}</TableCell>
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

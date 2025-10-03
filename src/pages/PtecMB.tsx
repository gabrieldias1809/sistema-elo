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
import { DateTimePicker } from "@/components/DateTimePicker";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const PtecMB = () => {
  const [os, setOS] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [marcaSuggestions, setMarcaSuggestions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    numero_os: "",
    situacao: "",
    om_apoiada: "",
    marca: "",
    mem: "",
    sistema: "",
    servico_solicitado: "",
    servico_realizado: "",
    situacao_atual: "",
    data_inicio: "",
    data_fim: "",
    quantidade_classe_iii: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchOS();
  }, []);

  useEffect(() => {
    if (open) {
      getNextOSNumber();
    }
  }, [open]);

  const fetchOS = async () => {
    const { data, error } = await supabase
      .from("ptec_mb_os")
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
    
    setOmSuggestions(uniqueOms);
    setMarcaSuggestions(uniqueMarcas);
  };

  const getNextOSNumber = async () => {
    const { data, error } = await supabase
      .from("ptec_mb_os")
      .select("numero_os")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Erro ao buscar último número:", error);
      return;
    }

    const lastNumber = data && data.length > 0 ? parseInt(data[0].numero_os) : 0;
    setFormData(prev => ({ ...prev, numero_os: (lastNumber + 1).toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_mb_os").insert([
      {
        ...formData,
        quantidade_classe_iii: formData.quantidade_classe_iii
          ? parseFloat(formData.quantidade_classe_iii)
          : null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar OS");
      return;
    }

    toast.success("OS criada com sucesso!");
    setOpen(false);
    setFormData({
      numero_os: "",
      situacao: "",
      om_apoiada: "",
      marca: "",
      mem: "",
      sistema: "",
      servico_solicitado: "",
      servico_realizado: "",
      situacao_atual: "",
      data_inicio: "",
      data_fim: "",
      quantidade_classe_iii: "",
      observacoes: "",
    });
    fetchOS();
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Ptec MB</h1>
          <p className="text-muted-foreground">
            Companhia de Manutenção de Material Bélico
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, situacao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
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
                  <Label>Quantidade Classe III (Litros)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantidade_classe_iii}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_classe_iii: e.target.value,
                      })
                    }
                    className="placeholder:text-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Data Início</Label>
                  <DateTimePicker
                    value={formData.data_inicio}
                    onChange={(value) =>
                      setFormData({ ...formData, data_inicio: value })
                    }
                  />
                </div>
                <div>
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
                Criar OS
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gráfico */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Combustível utilizado por OM (Litros)
        </h3>
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
                <TableHead>Combustível (L)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {os.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.numero_os}</TableCell>
                  <TableCell>{item.situacao}</TableCell>
                  <TableCell>{item.om_apoiada}</TableCell>
                  <TableCell>{item.marca}</TableCell>
                  <TableCell>{item.quantidade_classe_iii || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PtecMB;

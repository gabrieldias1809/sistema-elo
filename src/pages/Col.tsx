import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Edit, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshButton } from "@/components/RefreshButton";

interface Material {
  material: string;
  quantidade: number;
}

interface PedidoSup {
  id: string;
  numero_pedido: number;
  materiais: Material[];
  destino: string;
  data_hora: string;
  situacao: string;
  created_by: string;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Col() {
  const [pedidos, setPedidos] = useState<PedidoSup[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([{ material: "", quantidade: 1 }]);
  const [destino, setDestino] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoSup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchPedidos();
    
    const channel = supabase
      .channel("col_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "col_pedidos_sup" }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("col_pedidos_sup")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos");
      setIsRefreshing(false);
      return;
    }

    setPedidos((data || []) as unknown as PedidoSup[]);
    setIsRefreshing(false);
  };

  const addMaterial = () => {
    setMateriais([...materiais, { material: "", quantidade: 1 }]);
  };

  const removeMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: string | number) => {
    const updated = [...materiais];
    updated[index] = { ...updated[index], [field]: value };
    setMateriais(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validMateriais = materiais.filter(m => m.material.trim() !== "");
    
    if (validMateriais.length === 0) {
      toast.error("Adicione pelo menos um material");
      setLoading(false);
      return;
    }

    if (!destino.trim()) {
      toast.error("Preencha o destino");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("col_pedidos_sup").insert({
      materiais: JSON.parse(JSON.stringify(validMateriais)),
      destino,
      created_by: userData?.user?.id,
    });

    if (error) {
      toast.error("Erro ao criar pedido");
      setLoading(false);
      return;
    }

    toast.success("Pedido criado com sucesso!");
    setMateriais([{ material: "", quantidade: 1 }]);
    setDestino("");
    setLoading(false);
    fetchPedidos();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("col_pedidos_sup").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir pedido");
      return;
    }

    toast.success("Pedido excluído!");
    fetchPedidos();
  };

  const getMateriaisChart = () => {
    const materiaisCount: { [key: string]: number } = {};
    
    pedidos.forEach(pedido => {
      pedido.materiais.forEach(m => {
        materiaisCount[m.material] = (materiaisCount[m.material] || 0) + m.quantidade;
      });
    });

    return Object.entries(materiaisCount)
      .map(([material, quantidade]) => ({ material, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  };

  const getDestinosChart = () => {
    const destinosCount: { [key: string]: number } = {};
    
    pedidos.forEach(pedido => {
      destinosCount[pedido.destino] = (destinosCount[pedido.destino] || 0) + 1;
    });

    return Object.entries(destinosCount).map(([destino, value]) => ({ destino, value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">COL - Comando Logístico</h1>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Materiais Mais Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMateriaisChart()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="material" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinos Mais Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDestinosChart()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ destino, percent }) => `${destino} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {getDestinosChart().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Novo Pedido de Suprimento</CardTitle>
          <CardDescription>Solicite materiais para a Cia Sup</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Materiais</Label>
              {materiais.map((m, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Material"
                    value={m.material}
                    onChange={(e) => updateMaterial(index, "material", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={m.quantidade}
                    onChange={(e) => updateMaterial(index, "quantidade", parseInt(e.target.value) || 0)}
                    className="w-24"
                    min="1"
                  />
                  {materiais.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeMaterial(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMaterial} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </div>

            <div>
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Local/fração/unidade"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar Pedido"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Suprimento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.numero_pedido}</TableCell>
                  <TableCell>{new Date(pedido.data_hora).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{pedido.destino}</TableCell>
                  <TableCell>{pedido.materiais.length} item(ns)</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      pedido.situacao === "Entregue" ? "bg-green-500/20 text-green-700" :
                      pedido.situacao === "Separando" ? "bg-blue-500/20 text-blue-700" :
                      pedido.situacao === "Cancelado" ? "bg-red-500/20 text-red-700" :
                      "bg-yellow-500/20 text-yellow-700"
                    }`}>
                      {pedido.situacao}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isDialogOpen && selectedPedido?.id === pedido.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedPedido(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => {
                            setSelectedPedido(pedido);
                            setIsDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pedido #{selectedPedido?.numero_pedido}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Materiais</Label>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                {selectedPedido?.materiais.map((m, i) => (
                                  <li key={i}>{m.material} - Qtd: {m.quantidade}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label>Destino</Label>
                              <p className="mt-1">{selectedPedido?.destino}</p>
                            </div>
                            <div>
                              <Label>Situação Atual</Label>
                              <p className="mt-1">{selectedPedido?.situacao}</p>
                            </div>
                            <div>
                              <Label>Data e Hora</Label>
                              <p className="mt-1">{selectedPedido && new Date(selectedPedido.data_hora).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(pedido.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RefreshButton onClick={fetchPedidos} isLoading={isRefreshing} />
    </div>
  );
}

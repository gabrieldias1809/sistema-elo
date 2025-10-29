import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Plus, Package, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

interface PedidoTransporte {
  id: string;
  numero_pedido: number;
  pedido_material_id: string;
  destino: string;
  observacoes: string;
  situacao: string;
  created_at: string;
}

export default function CiaSup() {
  const [pedidosSup, setPedidosSup] = useState<PedidoSup[]>([]);
  const [pedidosTransporte, setPedidosTransporte] = useState<PedidoTransporte[]>([]);
  const [selectedPedidoMaterial, setSelectedPedidoMaterial] = useState("");
  const [destinoTransporte, setDestinoTransporte] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPedidosSup();
    fetchPedidosTransporte();
    
    const channelSup = supabase
      .channel("cia_sup_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "col_pedidos_sup" }, () => {
        fetchPedidosSup();
      })
      .subscribe();

    const channelTransp = supabase
      .channel("cia_sup_transp_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_sup_pedidos_transporte" }, () => {
        fetchPedidosTransporte();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelSup);
      supabase.removeChannel(channelTransp);
    };
  }, []);

  const fetchPedidosSup = async () => {
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

    setPedidosSup((data || []) as unknown as PedidoSup[]);
    setIsRefreshing(false);
  };

  const fetchPedidosTransporte = async () => {
    const { data, error } = await supabase
      .from("cia_sup_pedidos_transporte")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos de transporte");
      return;
    }

    setPedidosTransporte(data || []);
  };

  const updateSituacao = async (id: string, situacao: string) => {
    const { error } = await supabase
      .from("col_pedidos_sup")
      .update({ situacao })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar situação");
      return;
    }

    toast.success(`Pedido ${situacao}!`);
    fetchPedidosSup();
  };

  const handleCreateTransporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedPedidoMaterial || !destinoTransporte) {
      toast.error("Preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("cia_sup_pedidos_transporte").insert({
      pedido_material_id: selectedPedidoMaterial,
      destino: destinoTransporte,
      observacoes,
      created_by: userData?.user?.id,
    });

    if (error) {
      toast.error("Erro ao criar pedido de transporte");
      setLoading(false);
      return;
    }

    toast.success("Pedido de transporte criado!");
    setSelectedPedidoMaterial("");
    setDestinoTransporte("");
    setObservacoes("");
    setLoading(false);
    setIsDialogOpen(false);
    fetchPedidosTransporte();
  };

  const handleDeleteTransporte = async (id: string) => {
    const { error } = await supabase
      .from("cia_sup_pedidos_transporte")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir pedido de transporte");
      return;
    }

    toast.success("Pedido excluído!");
    fetchPedidosTransporte();
  };

  const getPedidoMaterialInfo = (id: string) => {
    const pedido = pedidosSup.find(p => p.id === id);
    return pedido ? `#${pedido.numero_pedido} - ${pedido.destino}` : "N/A";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cia Sup - Companhia de Suprimento</h1>
      </div>

      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pedidos">
            <Package className="h-4 w-4 mr-2" />
            Pedidos de Suprimento
          </TabsTrigger>
          <TabsTrigger value="transporte">
            <Truck className="h-4 w-4 mr-2" />
            Pedidos de Transporte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Pedidos de Suprimento</CardTitle>
              <CardDescription>Visualize e atualize os pedidos do COL</CardDescription>
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
                  {pedidosSup.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.numero_pedido}</TableCell>
                      <TableCell>{new Date(pedido.data_hora).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{pedido.destino}</TableCell>
                      <TableCell>
                        {pedido.materiais.map((m, i) => (
                          <div key={i}>{m.material} ({m.quantidade})</div>
                        ))}
                      </TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSituacao(pedido.id, "Separando")}
                            disabled={pedido.situacao === "Separando" || pedido.situacao === "Cancelado" || pedido.situacao === "Entregue"}
                          >
                            Separar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateSituacao(pedido.id, "Cancelado")}
                            disabled={pedido.situacao === "Cancelado" || pedido.situacao === "Entregue"}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transporte">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Transporte</CardTitle>
              <CardDescription>Solicite transporte para entrega de materiais</CardDescription>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pedido de Transporte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Pedido de Transporte</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTransporte} className="space-y-4">
                    <div>
                      <Label htmlFor="pedido">Pedido de Material</Label>
                      <Select value={selectedPedidoMaterial} onValueChange={setSelectedPedidoMaterial}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um pedido" />
                        </SelectTrigger>
                        <SelectContent>
                          {pedidosSup.filter(p => p.situacao === "Separando").map((pedido) => (
                            <SelectItem key={pedido.id} value={pedido.id}>
                              #{pedido.numero_pedido} - {pedido.destino}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="destino">Destino</Label>
                      <Input
                        id="destino"
                        value={destinoTransporte}
                        onChange={(e) => setDestinoTransporte(e.target.value)}
                        placeholder="Local de entrega"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obs">Observações</Label>
                      <Textarea
                        id="obs"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Informações adicionais"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Criando..." : "Criar Pedido"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Pedido Material</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosTransporte.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.numero_pedido}</TableCell>
                      <TableCell>{getPedidoMaterialInfo(pedido.pedido_material_id)}</TableCell>
                      <TableCell>{pedido.destino}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          pedido.situacao === "Entregue" ? "bg-green-500/20 text-green-700" :
                          pedido.situacao === "Em trânsito" ? "bg-blue-500/20 text-blue-700" :
                          pedido.situacao === "Cancelado" ? "bg-red-500/20 text-red-700" :
                          "bg-yellow-500/20 text-yellow-700"
                        }`}>
                          {pedido.situacao}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteTransporte(pedido.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RefreshButton onClick={fetchPedidosSup} isLoading={isRefreshing} />
    </div>
  );
}

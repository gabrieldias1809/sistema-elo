import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Truck, CheckCircle, XCircle, Eye } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PedidoTransporte {
  id: string;
  numero_pedido: number;
  pedido_material_id: string;
  destino: string;
  observacoes: string;
  chefe_viatura: string;
  situacao: string;
  created_at: string;
}

interface Material {
  material: string;
  quantidade: number;
  classe: string;
}

interface PedidoSup {
  id: string;
  numero_pedido: number;
  materiais: Material[];
  destino: string;
  coordenada: string;
  distancia: number;
  data_hora: string;
  data_hora_necessidade: string;
  situacao: string;
}

export default function CiaTrp() {
  const [pedidosTransporte, setPedidosTransporte] = useState<PedidoTransporte[]>([]);
  const [pedidosSup, setPedidosSup] = useState<PedidoSup[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPedidoSup, setSelectedPedidoSup] = useState<PedidoSup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPedidosTransporte();
    fetchPedidosSup();
    
    const channel = supabase
      .channel("cia_trp_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_sup_pedidos_transporte" }, () => {
        fetchPedidosTransporte();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidosTransporte = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("cia_sup_pedidos_transporte")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos de transporte");
      setIsRefreshing(false);
      return;
    }

    setPedidosTransporte(data || []);
    setIsRefreshing(false);
  };

  const fetchPedidosSup = async () => {
    const { data, error } = await supabase
      .from("col_pedidos_sup")
      .select("*");

    if (error) {
      toast.error("Erro ao carregar pedidos de suprimento");
      return;
    }

    setPedidosSup((data || []) as unknown as PedidoSup[]);
  };

  const getPedidoSupDetails = (id: string) => {
    return pedidosSup.find(p => p.id === id);
  };

  const updateSituacao = async (id: string, situacao: string) => {
    // Buscar o pedido de transporte para obter o pedido_material_id
    const { data: pedidoTransporte, error: fetchError } = await supabase
      .from("cia_sup_pedidos_transporte")
      .select("pedido_material_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      toast.error("Erro ao buscar pedido");
      return;
    }

    // Atualizar situação do pedido de transporte
    const { error } = await supabase
      .from("cia_sup_pedidos_transporte")
      .update({ situacao })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar situação");
      return;
    }

    // Se foi entregue, atualizar também o pedido de suprimento
    if (situacao === "Entregue" && pedidoTransporte?.pedido_material_id) {
      const { error: updateSupError } = await supabase
        .from("col_pedidos_sup")
        .update({ situacao: "Entregue" })
        .eq("id", pedidoTransporte.pedido_material_id);

      if (updateSupError) {
        toast.error("Erro ao atualizar pedido de suprimento");
        return;
      }
    }

    toast.success(`Pedido ${situacao}!`);
    fetchPedidosTransporte();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg">
          <Truck className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Cia Trp - Companhia de Transporte</h1>
          <p className="text-muted-foreground">Gerencie as entregas solicitadas pela Cia Sup</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Transporte</CardTitle>
          <CardDescription>Visualize e atualize o status das entregas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido Transporte</TableHead>
                <TableHead>Pedido Material ID</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Chefe Viatura</TableHead>
                <TableHead>Necessidade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosTransporte.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum pedido de transporte encontrado
                  </TableCell>
                </TableRow>
              ) : (
                pedidosTransporte.map((pedido) => {
                  const pedidoSup = getPedidoSupDetails(pedido.pedido_material_id);
                  return (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.numero_pedido}</TableCell>
                      <TableCell>{pedido.pedido_material_id.slice(0, 8)}...</TableCell>
                      <TableCell>{pedido.destino}</TableCell>
                      <TableCell>{pedido.chefe_viatura || "-"}</TableCell>
                      <TableCell>
                        {pedidoSup?.data_hora_necessidade ? new Date(pedidoSup.data_hora_necessidade).toLocaleString("pt-BR") : "-"}
                      </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pedido.situacao === "Entregue" ? "bg-green-500/20 text-green-700" :
                        pedido.situacao === "Em trânsito" ? "bg-blue-500/20 text-blue-700" :
                        pedido.situacao === "Cancelado" ? "bg-red-500/20 text-red-700" :
                        "bg-yellow-500/20 text-yellow-700"
                      }`}>
                        {pedido.situacao}
                      </span>
                      </TableCell>
                      <TableCell>{new Date(pedido.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isDialogOpen && selectedPedidoSup?.id === pedido.pedido_material_id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedPedidoSup(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const pedidoSup = getPedidoSupDetails(pedido.pedido_material_id);
                                if (pedidoSup) {
                                  setSelectedPedidoSup(pedidoSup);
                                  setIsDialogOpen(true);
                                } else {
                                  toast.error("Pedido não encontrado");
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Pedido de Suprimento #{selectedPedidoSup?.numero_pedido}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Materiais</Label>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  {selectedPedidoSup?.materiais.map((m, i) => (
                                    <li key={i}>{m.material} (Classe {m.classe}) - Qtd: {m.quantidade}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>Destino</Label>
                                  <p className="mt-1">{selectedPedidoSup?.destino}</p>
                                </div>
                                <div>
                                  <Label>Coordenada</Label>
                                  <p className="mt-1">{selectedPedidoSup?.coordenada || "-"}</p>
                                </div>
                                <div>
                                  <Label>Distância</Label>
                                  <p className="mt-1">{selectedPedidoSup?.distancia ? `${selectedPedidoSup.distancia} km` : "-"}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Data/Hora Necessidade</Label>
                                <p className="mt-1">{selectedPedidoSup?.data_hora_necessidade ? new Date(selectedPedidoSup.data_hora_necessidade).toLocaleString("pt-BR") : "-"}</p>
                              </div>
                              <div>
                                <Label>Situação Atual</Label>
                                <p className="mt-1">{selectedPedidoSup?.situacao}</p>
                              </div>
                              <div>
                                <Label>Data e Hora de Criação</Label>
                                <p className="mt-1">{selectedPedidoSup && new Date(selectedPedidoSup.data_hora).toLocaleString("pt-BR")}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateSituacao(pedido.id, "Entregue")}
                          disabled={pedido.situacao === "Entregue" || pedido.situacao === "Cancelado"}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Entregar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateSituacao(pedido.id, "Cancelado")}
                          disabled={pedido.situacao === "Cancelado" || pedido.situacao === "Entregue"}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RefreshButton onClick={fetchPedidosTransporte} isLoading={isRefreshing} />
    </div>
  );
}

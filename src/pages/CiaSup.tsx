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
import { Trash2, Plus, Package, Truck, Eye, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RefreshButton } from "@/components/RefreshButton";

// Componente Cia Sup para gerenciar pedidos de suprimento

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

export default function CiaSup() {
  const [pedidosSup, setPedidosSup] = useState<PedidoSup[]>([]);
  const [pedidosTransporte, setPedidosTransporte] = useState<PedidoTransporte[]>([]);
  const [selectedPedidoMaterial, setSelectedPedidoMaterial] = useState("");
  const [destinoTransporte, setDestinoTransporte] = useState("");
  const [chefeViatura, setChefeViatura] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPedidoSup, setSelectedPedidoSup] = useState<PedidoSup | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

    if (!selectedPedidoMaterial || !destinoTransporte || !chefeViatura) {
      toast.error("Preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("cia_sup_pedidos_transporte").insert({
      pedido_material_id: selectedPedidoMaterial,
      destino: destinoTransporte,
      chefe_viatura: chefeViatura,
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
    setChefeViatura("");
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

  const getPedidoSupDetails = (id: string) => {
    return pedidosSup.find(p => p.id === id);
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
                    <TableHead>Necessidade</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosSup.map((pedido) => (
                    pedido.materiais.map((material, index) => (
                      <TableRow key={`${pedido.id}-${index}`}>
                        {index === 0 && (
                          <>
                            <TableCell rowSpan={pedido.materiais.length}>{pedido.numero_pedido}</TableCell>
                            <TableCell rowSpan={pedido.materiais.length}>
                              {pedido.data_hora_necessidade ? new Date(pedido.data_hora_necessidade).toLocaleString("pt-BR") : "-"}
                            </TableCell>
                            <TableCell rowSpan={pedido.materiais.length}>{pedido.destino}</TableCell>
                          </>
                        )}
                        <TableCell>{material.material}</TableCell>
                        <TableCell>{material.quantidade}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{material.classe}</span>
                        </TableCell>
                        {index === 0 && (
                          <>
                            <TableCell rowSpan={pedido.materiais.length}>
                              <span className={`px-2 py-1 rounded text-xs ${
                                pedido.situacao === "Entregue" ? "bg-green-500/20 text-green-700" :
                                pedido.situacao === "Embarcado" ? "bg-purple-500/20 text-purple-700" :
                                pedido.situacao === "PPE" ? "bg-orange-500/20 text-orange-700" :
                                pedido.situacao === "Loteando" ? "bg-blue-500/20 text-blue-700" :
                                pedido.situacao === "Cancelado" ? "bg-red-500/20 text-red-700" :
                                "bg-yellow-500/20 text-yellow-700"
                              }`}>
                                {pedido.situacao}
                              </span>
                            </TableCell>
                            <TableCell rowSpan={pedido.materiais.length}>
                              <div className="flex gap-2">
                                <Dialog open={isViewDialogOpen && selectedPedidoSup?.id === pedido.id} onOpenChange={(open) => {
                                  setIsViewDialogOpen(open);
                                  if (!open) setSelectedPedidoSup(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      onClick={() => {
                                        setSelectedPedidoSup(pedido);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
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
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={pedido.situacao === "Cancelado" || pedido.situacao === "Entregue"}
                                    >
                                      Alterar Situação
                                      <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => updateSituacao(pedido.id, "Loteando")}>
                                      Loteando
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSituacao(pedido.id, "PPE")}>
                                      PPE
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSituacao(pedido.id, "Embarcado")}>
                                      Embarcado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSituacao(pedido.id, "Cancelado")} className="text-red-600">
                                      Cancelado
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
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
                          {pedidosSup.filter(p => p.situacao === "Loteando" || p.situacao === "PPE" || p.situacao === "Embarcado").map((pedido) => (
                            <SelectItem key={pedido.id} value={pedido.id}>
                              #{pedido.numero_pedido} - {pedido.destino}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="destino">Destino*</Label>
                      <Input
                        id="destino"
                        value={destinoTransporte}
                        onChange={(e) => setDestinoTransporte(e.target.value)}
                        placeholder="Local de entrega"
                      />
                    </div>

                    <div>
                      <Label htmlFor="chefeViatura">Chefe de Viatura*</Label>
                      <Input
                        id="chefeViatura"
                        value={chefeViatura}
                        onChange={(e) => setChefeViatura(e.target.value)}
                        placeholder="Nome do chefe de viatura"
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
                    <TableHead>Chefe Viatura</TableHead>
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
                      <TableCell>{pedido.chefe_viatura || "-"}</TableCell>
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
                        <div className="flex gap-2">
                          <Dialog open={isViewDialogOpen && selectedPedidoSup?.id === pedido.pedido_material_id} onOpenChange={(open) => {
                            setIsViewDialogOpen(open);
                            if (!open) setSelectedPedidoSup(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => {
                                  const pedidoSup = getPedidoSupDetails(pedido.pedido_material_id);
                                  if (pedidoSup) {
                                    setSelectedPedidoSup(pedidoSup);
                                    setIsViewDialogOpen(true);
                                  } else {
                                    toast.error("Pedido não encontrado");
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
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
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteTransporte(pedido.id)}
                          >
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
        </TabsContent>
      </Tabs>

      <RefreshButton onClick={fetchPedidosSup} isLoading={isRefreshing} />
    </div>
  );
}

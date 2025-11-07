import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Truck, CheckCircle, XCircle, Eye, Edit, Trash2, Car, User, ClipboardList } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";

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

interface Viatura {
  id: string;
  modelo: string;
  eb: string;
  status: string;
  obs: string;
  created_at: string;
}

interface Motorista {
  id: string;
  nome: string;
  habilitacao: string;
  status: string;
  obs: string;
  created_at: string;
}

interface FichaSaida {
  id: string;
  numero_ficha: string;
  motorista_id: string;
  viatura_id: string;
  horario_saida: string;
  horario_chegada: string;
  destino: string;
  situacao: string;
  created_at: string;
  pedido_transporte_id?: string;
  chefe_viatura?: string;
}

export default function CiaTrp() {
  const [pedidosTransporte, setPedidosTransporte] = useState<PedidoTransporte[]>([]);
  const [pedidosSup, setPedidosSup] = useState<PedidoSup[]>([]);
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [fichasSaida, setFichasSaida] = useState<FichaSaida[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPedidoSup, setSelectedPedidoSup] = useState<PedidoSup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViaturaDialogOpen, setIsViaturaDialogOpen] = useState(false);
  const [isMotoristaDialogOpen, setIsMotoristaDialogOpen] = useState(false);
  const [isFichaDialogOpen, setIsFichaDialogOpen] = useState(false);
  const [isDesignarDialogOpen, setIsDesignarDialogOpen] = useState(false);
  const [editingViatura, setEditingViatura] = useState<Viatura | null>(null);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);
  const [editingFicha, setEditingFicha] = useState<FichaSaida | null>(null);
  const [pedidoToDesignar, setPedidoToDesignar] = useState<PedidoTransporte | null>(null);

  // Form states para Viatura
  const [viaturaForm, setViaturaForm] = useState({
    modelo: "",
    eb: "",
    status: "Disponível",
    obs: ""
  });

  // Form states para Motorista
  const [motoristaForm, setMotoristaForm] = useState({
    nome: "",
    habilitacao: "",
    status: "Disponível",
    obs: ""
  });

  // Form states para Ficha de Saída
  const [fichaForm, setFichaForm] = useState({
    numero_ficha: "",
    motorista_id: "",
    viatura_id: "",
    horario_saida: "",
    horario_chegada: "",
    destino: "",
    situacao: "Em andamento"
  });

  // Form states para Designação
  const [designarForm, setDesignarForm] = useState({
    viatura_id: "",
    motorista_id: "",
    horario_saida: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    fetchAll();
    
    const channel = supabase
      .channel("cia_trp_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_sup_pedidos_transporte" }, fetchPedidosTransporte)
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_trp_viaturas" }, fetchViaturas)
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_trp_motoristas" }, fetchMotoristas)
      .on("postgres_changes", { event: "*", schema: "public", table: "cia_trp_fichas_saida" }, fetchFichasSaida)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchPedidosTransporte(),
      fetchPedidosSup(),
      fetchViaturas(),
      fetchMotoristas(),
      fetchFichasSaida()
    ]);
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

  const fetchViaturas = async () => {
    const { data, error } = await supabase
      .from("cia_trp_viaturas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar viaturas");
      return;
    }

    setViaturas(data || []);
  };

  const fetchMotoristas = async () => {
    const { data, error } = await supabase
      .from("cia_trp_motoristas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar motoristas");
      return;
    }

    setMotoristas(data || []);
  };

  const fetchFichasSaida = async () => {
    const { data, error } = await supabase
      .from("cia_trp_fichas_saida")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar fichas de saída");
      return;
    }

    setFichasSaida(data || []);
  };

  const getPedidoSupDetails = (id: string) => {
    return pedidosSup.find(p => p.id === id);
  };

  const getMotoristaById = (id: string) => {
    return motoristas.find(m => m.id === id);
  };

  const getViaturaById = (id: string) => {
    return viaturas.find(v => v.id === id);
  };

  const updateSituacao = async (id: string, situacao: string) => {
    const { data: pedidoTransporte, error: fetchError } = await supabase
      .from("cia_sup_pedidos_transporte")
      .select("pedido_material_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      toast.error("Erro ao buscar pedido");
      return;
    }

    const { error } = await supabase
      .from("cia_sup_pedidos_transporte")
      .update({ situacao })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar situação");
      return;
    }

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

  // CRUD Viaturas
  const handleViaturaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!viaturaForm.modelo || !viaturaForm.eb) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingViatura) {
      const { error } = await supabase
        .from("cia_trp_viaturas")
        .update(viaturaForm)
        .eq("id", editingViatura.id);

      if (error) {
        toast.error("Erro ao atualizar viatura");
        return;
      }

      toast.success("Viatura atualizada!");
      setEditingViatura(null);
      setIsViaturaDialogOpen(false);
    } else {
      const { error } = await supabase
        .from("cia_trp_viaturas")
        .insert([{ ...viaturaForm, created_by: (await supabase.auth.getUser()).data.user?.id }]);

      if (error) {
        toast.error("Erro ao cadastrar viatura");
        return;
      }

      toast.success("Viatura cadastrada!");
    }

    setViaturaForm({ modelo: "", eb: "", status: "Disponível", obs: "" });
    fetchViaturas();
  };

  const handleDeleteViatura = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta viatura?")) return;

    const { error } = await supabase
      .from("cia_trp_viaturas")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar viatura");
      return;
    }

    toast.success("Viatura deletada!");
    fetchViaturas();
  };

  // CRUD Motoristas
  const handleMotoristaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motoristaForm.nome || !motoristaForm.habilitacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingMotorista) {
      const { error } = await supabase
        .from("cia_trp_motoristas")
        .update(motoristaForm)
        .eq("id", editingMotorista.id);

      if (error) {
        toast.error("Erro ao atualizar motorista");
        return;
      }

      toast.success("Motorista atualizado!");
      setEditingMotorista(null);
      setIsMotoristaDialogOpen(false);
    } else {
      const { error } = await supabase
        .from("cia_trp_motoristas")
        .insert([{ ...motoristaForm, created_by: (await supabase.auth.getUser()).data.user?.id }]);

      if (error) {
        toast.error("Erro ao cadastrar motorista");
        return;
      }

      toast.success("Motorista cadastrado!");
    }

    setMotoristaForm({ nome: "", habilitacao: "", status: "Disponível", obs: "" });
    fetchMotoristas();
  };

  const handleDeleteMotorista = async (id: string) => {
    if (!confirm("Deseja realmente deletar este motorista?")) return;

    const { error } = await supabase
      .from("cia_trp_motoristas")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar motorista");
      return;
    }

    toast.success("Motorista deletado!");
    fetchMotoristas();
  };

  // CRUD Fichas de Saída
  const handleFichaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fichaForm.numero_ficha || !fichaForm.motorista_id || !fichaForm.viatura_id || !fichaForm.destino) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingFicha) {
      // Se está marcando como "Finalizada", liberar motorista e viatura e atualizar pedido
      if (fichaForm.situacao === "Finalizada" && editingFicha.situacao !== "Finalizada") {
        await supabase.from("cia_trp_motoristas").update({ status: "Disponível" }).eq("id", fichaForm.motorista_id);
        await supabase.from("cia_trp_viaturas").update({ status: "Disponível" }).eq("id", fichaForm.viatura_id);
        
        // Atualizar pedido de transporte vinculado
        if (editingFicha.pedido_transporte_id) {
          await supabase.from("cia_sup_pedidos_transporte").update({ situacao: "Entregue" }).eq("id", editingFicha.pedido_transporte_id);
          
          // Buscar e atualizar pedido de suprimento
          const { data: pedidoTransporte } = await supabase
            .from("cia_sup_pedidos_transporte")
            .select("pedido_material_id")
            .eq("id", editingFicha.pedido_transporte_id)
            .single();
          
          if (pedidoTransporte?.pedido_material_id) {
            await supabase.from("col_pedidos_sup").update({ situacao: "Entregue" }).eq("id", pedidoTransporte.pedido_material_id);
          }
        }
      }

      // Se está cancelando, liberar motorista e viatura e atualizar pedido
      if (fichaForm.situacao === "Cancelada" && editingFicha.situacao !== "Cancelada") {
        await supabase.from("cia_trp_motoristas").update({ status: "Disponível" }).eq("id", fichaForm.motorista_id);
        await supabase.from("cia_trp_viaturas").update({ status: "Disponível" }).eq("id", fichaForm.viatura_id);
        
        // Atualizar pedido de transporte vinculado
        if (editingFicha.pedido_transporte_id) {
          await supabase.from("cia_sup_pedidos_transporte").update({ situacao: "Cancelado" }).eq("id", editingFicha.pedido_transporte_id);
        }
      }

      const { error } = await supabase
        .from("cia_trp_fichas_saida")
        .update(fichaForm)
        .eq("id", editingFicha.id);

      if (error) {
        toast.error("Erro ao atualizar ficha");
        return;
      }

      toast.success("Ficha atualizada!");
      setEditingFicha(null);
      setIsFichaDialogOpen(false);
    } else {
      // Marcar motorista e viatura como ocupados
      await supabase.from("cia_trp_motoristas").update({ status: "Ocupado" }).eq("id", fichaForm.motorista_id);
      await supabase.from("cia_trp_viaturas").update({ status: "Ocupado" }).eq("id", fichaForm.viatura_id);

      const { error } = await supabase
        .from("cia_trp_fichas_saida")
        .insert([{ ...fichaForm, created_by: (await supabase.auth.getUser()).data.user?.id }]);

      if (error) {
        toast.error("Erro ao registrar saída");
        return;
      }

      toast.success("Saída registrada!");
    }

    setFichaForm({ numero_ficha: "", motorista_id: "", viatura_id: "", horario_saida: "", horario_chegada: "", destino: "", situacao: "Em andamento" });
    fetchFichasSaida();
    fetchMotoristas();
    fetchViaturas();
    fetchPedidosTransporte();
  };

  const handleDeleteFicha = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta ficha?")) return;

    // Buscar a ficha para liberar motorista e viatura se necessário
    const ficha = fichasSaida.find(f => f.id === id);
    if (ficha) {
      await supabase.from("cia_trp_motoristas").update({ status: "Disponível" }).eq("id", ficha.motorista_id);
      await supabase.from("cia_trp_viaturas").update({ status: "Disponível" }).eq("id", ficha.viatura_id);
    }

    const { error } = await supabase
      .from("cia_trp_fichas_saida")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar ficha");
      return;
    }

    toast.success("Ficha deletada!");
    fetchFichasSaida();
    fetchMotoristas();
    fetchViaturas();
  };

  // Designação de Transporte
  const handleDesignarTransporte = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!designarForm.viatura_id || !designarForm.motorista_id) {
      toast.error("Selecione viatura e motorista");
      return;
    }

    if (!pedidoToDesignar) {
      toast.error("Pedido não encontrado");
      return;
    }

    // Verificar disponibilidade
    const viatura = viaturas.find(v => v.id === designarForm.viatura_id);
    const motorista = motoristas.find(m => m.id === designarForm.motorista_id);

    if (viatura?.status !== "Disponível" || motorista?.status !== "Disponível") {
      toast.error("Recursos não estão disponíveis");
      return;
    }

    try {
      // Criar registro de saída
      const { error: fichaError } = await supabase
        .from("cia_trp_fichas_saida")
        .insert([{
          pedido_transporte_id: pedidoToDesignar.id,
          destino: pedidoToDesignar.destino,
          chefe_viatura: pedidoToDesignar.chefe_viatura,
          viatura_id: designarForm.viatura_id,
          motorista_id: designarForm.motorista_id,
          horario_saida: designarForm.horario_saida,
          situacao: "Em andamento",
          numero_ficha: `FI-${Date.now()}`,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (fichaError) {
        toast.error("Erro ao criar registro de saída");
        return;
      }

      // Atualizar status dos recursos
      await Promise.all([
        supabase.from("cia_trp_viaturas").update({ status: "Ocupado" }).eq("id", designarForm.viatura_id),
        supabase.from("cia_trp_motoristas").update({ status: "Ocupado" }).eq("id", designarForm.motorista_id),
        supabase.from("cia_sup_pedidos_transporte").update({ situacao: "Em andamento" }).eq("id", pedidoToDesignar.id)
      ]);

      toast.success("Transporte designado. Registro de saída criado.");
      setIsDesignarDialogOpen(false);
      setPedidoToDesignar(null);
      setDesignarForm({ viatura_id: "", motorista_id: "", horario_saida: new Date().toISOString().slice(0, 16) });
      
      // Refetch data
      await Promise.all([fetchFichasSaida(), fetchViaturas(), fetchMotoristas(), fetchPedidosTransporte()]);
    } catch (error) {
      toast.error("Erro ao designar transporte");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg">
          <Truck className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Cia Trp - Companhia de Transporte</h1>
          <p className="text-muted-foreground">Gerencie transportes, viaturas e motoristas</p>
        </div>
      </div>

      <Tabs defaultValue="pedidos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pedidos">Pedidos de Transporte</TabsTrigger>
          <TabsTrigger value="viaturas">Controle de Viaturas</TabsTrigger>
          <TabsTrigger value="motoristas">Controle de Motoristas</TabsTrigger>
          <TabsTrigger value="fichas">Registro de Saídas</TabsTrigger>
        </TabsList>

        {/* TAB: Pedidos de Transporte */}
        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Transporte</CardTitle>
              <CardDescription>Visualize e atualize o status das entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Pedido</TableHead>
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
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {pedido.situacao === "Pendente" ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setPedidoToDesignar(pedido);
                                    setIsDesignarDialogOpen(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Designar
                                </Button>
                              ) : pedido.situacao === "Em andamento" ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => updateSituacao(pedido.id, "Entregue")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Entregar
                                </Button>
                              ) : null}
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
        </TabsContent>

        {/* Modal de Designação */}
        <Dialog open={isDesignarDialogOpen} onOpenChange={setIsDesignarDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Designar Transporte - Pedido #{pedidoToDesignar?.numero_pedido}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDesignarTransporte} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Destino</Label>
                  <Input value={pedidoToDesignar?.destino || ""} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Chefe de Viatura</Label>
                  <Input value={pedidoToDesignar?.chefe_viatura || ""} disabled className="bg-muted" />
                </div>
              </div>

              <div>
                <Label>Viatura *</Label>
                <Select 
                  value={designarForm.viatura_id} 
                  onValueChange={(value) => setDesignarForm({ ...designarForm, viatura_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viatura disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturas.filter(v => v.status === "Disponível").length === 0 ? (
                      <SelectItem value="none" disabled>Nenhuma viatura disponível</SelectItem>
                    ) : (
                      viaturas.filter(v => v.status === "Disponível").map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.modelo} - {v.eb}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Motorista *</Label>
                <Select 
                  value={designarForm.motorista_id} 
                  onValueChange={(value) => setDesignarForm({ ...designarForm, motorista_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {motoristas.filter(m => m.status === "Disponível").length === 0 ? (
                      <SelectItem value="none" disabled>Nenhum motorista disponível</SelectItem>
                    ) : (
                      motoristas.filter(m => m.status === "Disponível").map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome} - CNH: {m.habilitacao}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hora de Saída *</Label>
                <Input 
                  type="datetime-local" 
                  value={designarForm.horario_saida}
                  onChange={(e) => setDesignarForm({ ...designarForm, horario_saida: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Situação</Label>
                <Input value="Em andamento" disabled className="bg-muted" />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDesignarDialogOpen(false);
                  setPedidoToDesignar(null);
                  setDesignarForm({ viatura_id: "", motorista_id: "", horario_saida: new Date().toISOString().slice(0, 16) });
                }}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={viaturas.filter(v => v.status === "Disponível").length === 0 || motoristas.filter(m => m.status === "Disponível").length === 0}
                >
                  Designar Transporte
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* TAB: Controle de Viaturas */}
        <TabsContent value="viaturas">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  <CardTitle>{editingViatura ? "Editar Viatura" : "Cadastrar Viatura"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleViaturaSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Select value={viaturaForm.modelo} onValueChange={(value) => setViaturaForm({ ...viaturaForm, modelo: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        <SelectItem value="Ambulância Hilux">Ambulância Hilux</SelectItem>
                        <SelectItem value="VW Worker 15.210">VW Worker 15.210</SelectItem>
                        <SelectItem value="Micro-ônibus">Micro-ônibus</SelectItem>
                        <SelectItem value="MB Atego 1725/42">MB Atego 1725/42</SelectItem>
                        <SelectItem value="Caminhão Baú">Caminhão Baú</SelectItem>
                        <SelectItem value="Porta Container">Porta Container</SelectItem>
                        <SelectItem value="Ford Cargo Oficina">Ford Cargo Oficina</SelectItem>
                        <SelectItem value="Cavalo Mecânico/Prancha">Cavalo Mecânico/Prancha</SelectItem>
                        <SelectItem value="Amb Land Rover Defender">Amb Land Rover Defender</SelectItem>
                        <SelectItem value="Gol Balizador (Cav Mec)">Gol Balizador (Cav Mec)</SelectItem>
                        <SelectItem value="Socorro Pesado (guincho)">Socorro Pesado (guincho)</SelectItem>
                        <SelectItem value="CTA">CTA</SelectItem>
                        <SelectItem value="CTC">CTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eb">EB</Label>
                    <Input
                      id="eb"
                      value={viaturaForm.eb}
                      onChange={(e) => setViaturaForm({ ...viaturaForm, eb: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={viaturaForm.status} onValueChange={(value) => setViaturaForm({ ...viaturaForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="obs">Observações</Label>
                    <Textarea
                      id="obs"
                      value={viaturaForm.obs}
                      onChange={(e) => setViaturaForm({ ...viaturaForm, obs: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingViatura ? "Atualizar" : "Cadastrar"}
                    </Button>
                    {editingViatura && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingViatura(null);
                        setViaturaForm({ modelo: "", eb: "", status: "Disponível", obs: "" });
                      }}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Viaturas Cadastradas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>EB</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viaturas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma viatura cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      viaturas.map((viatura) => (
                        <TableRow 
                          key={viatura.id}
                          className={viatura.status === "Disponível" ? "bg-green-500/10" : "bg-red-500/10"}
                        >
                          <TableCell>{viatura.modelo}</TableCell>
                          <TableCell>{viatura.eb}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              viatura.status === "Disponível" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
                            }`}>
                              {viatura.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingViatura(viatura);
                                  setViaturaForm({ modelo: viatura.modelo, eb: viatura.eb, status: viatura.status, obs: viatura.obs || "" });
                                  setIsViaturaDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteViatura(viatura.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Controle de Motoristas */}
        <TabsContent value="motoristas">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>{editingMotorista ? "Editar Motorista" : "Cadastrar Motorista"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMotoristaSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Motorista</Label>
                    <Input
                      id="nome"
                      value={motoristaForm.nome}
                      onChange={(e) => setMotoristaForm({ ...motoristaForm, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="habilitacao">Habilitação</Label>
                    <Input
                      id="habilitacao"
                      value={motoristaForm.habilitacao}
                      onChange={(e) => setMotoristaForm({ ...motoristaForm, habilitacao: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status-motorista">Status</Label>
                    <Select value={motoristaForm.status} onValueChange={(value) => setMotoristaForm({ ...motoristaForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="obs-motorista">Observações</Label>
                    <Textarea
                      id="obs-motorista"
                      value={motoristaForm.obs}
                      onChange={(e) => setMotoristaForm({ ...motoristaForm, obs: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingMotorista ? "Atualizar" : "Cadastrar"}
                    </Button>
                    {editingMotorista && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingMotorista(null);
                        setMotoristaForm({ nome: "", habilitacao: "", status: "Disponível", obs: "" });
                      }}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Motoristas Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Habilitação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {motoristas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum motorista cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      motoristas.map((motorista) => (
                        <TableRow 
                          key={motorista.id}
                          className={motorista.status === "Disponível" ? "bg-green-500/10" : "bg-red-500/10"}
                        >
                          <TableCell>{motorista.nome}</TableCell>
                          <TableCell>{motorista.habilitacao}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              motorista.status === "Disponível" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
                            }`}>
                              {motorista.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMotorista(motorista);
                                  setMotoristaForm({ nome: motorista.nome, habilitacao: motorista.habilitacao, status: motorista.status, obs: motorista.obs || "" });
                                  setIsMotoristaDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMotorista(motorista.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Registro de Saídas */}
        <TabsContent value="fichas">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  <CardTitle>{editingFicha ? "Editar Ficha" : "Registrar Saída"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFichaSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="numero_ficha">Nº da Ficha</Label>
                    <Input
                      id="numero_ficha"
                      value={fichaForm.numero_ficha}
                      onChange={(e) => setFichaForm({ ...fichaForm, numero_ficha: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="motorista_id">Motorista</Label>
                    <Select value={fichaForm.motorista_id} onValueChange={(value) => setFichaForm({ ...fichaForm, motorista_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motorista" />
                      </SelectTrigger>
                      <SelectContent>
                        {motoristas.filter(m => m.status === "Disponível" || m.id === fichaForm.motorista_id).map((motorista) => (
                          <SelectItem key={motorista.id} value={motorista.id}>{motorista.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="viatura_id">Viatura</Label>
                    <Select value={fichaForm.viatura_id} onValueChange={(value) => setFichaForm({ ...fichaForm, viatura_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma viatura" />
                      </SelectTrigger>
                      <SelectContent>
                        {viaturas.filter(v => v.status === "Disponível" || v.id === fichaForm.viatura_id).map((viatura) => (
                          <SelectItem key={viatura.id} value={viatura.id}>{viatura.modelo} - {viatura.eb}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="destino">Destino</Label>
                    <Input
                      id="destino"
                      value={fichaForm.destino}
                      onChange={(e) => setFichaForm({ ...fichaForm, destino: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario_saida">Horário de Saída</Label>
                    <Input
                      id="horario_saida"
                      type="datetime-local"
                      value={fichaForm.horario_saida}
                      onChange={(e) => setFichaForm({ ...fichaForm, horario_saida: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario_chegada">Horário de Chegada</Label>
                    <Input
                      id="horario_chegada"
                      type="datetime-local"
                      value={fichaForm.horario_chegada}
                      onChange={(e) => setFichaForm({ ...fichaForm, horario_chegada: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="situacao">Situação</Label>
                    <Select value={fichaForm.situacao} onValueChange={(value) => setFichaForm({ ...fichaForm, situacao: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Em andamento">Em andamento</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingFicha ? "Atualizar" : "Registrar"}
                    </Button>
                    {editingFicha && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingFicha(null);
                        setFichaForm({ numero_ficha: "", motorista_id: "", viatura_id: "", horario_saida: "", horario_chegada: "", destino: "", situacao: "Em andamento" });
                      }}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fichas de Saída</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Ficha</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Viatura</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fichasSaida.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma ficha de saída registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      fichasSaida.map((ficha) => {
                        const motorista = getMotoristaById(ficha.motorista_id);
                        const viatura = getViaturaById(ficha.viatura_id);
                        return (
                          <TableRow key={ficha.id}>
                            <TableCell>{ficha.numero_ficha}</TableCell>
                            <TableCell>{motorista?.nome || "-"}</TableCell>
                            <TableCell>{viatura ? `${viatura.modelo} - ${viatura.eb}` : "-"}</TableCell>
                            <TableCell>{ficha.destino}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                ficha.situacao === "Finalizada" ? "bg-green-500/20 text-green-700" : 
                                ficha.situacao === "Cancelada" ? "bg-red-500/20 text-red-700" :
                                "bg-blue-500/20 text-blue-700"
                              }`}>
                                {ficha.situacao}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingFicha(ficha);
                                    setFichaForm({
                                      numero_ficha: ficha.numero_ficha,
                                      motorista_id: ficha.motorista_id,
                                      viatura_id: ficha.viatura_id,
                                      horario_saida: ficha.horario_saida || "",
                                      horario_chegada: ficha.horario_chegada || "",
                                      destino: ficha.destino,
                                      situacao: ficha.situacao
                                    });
                                    setIsFichaDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteFicha(ficha.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
          </div>
        </TabsContent>
      </Tabs>

      <RefreshButton onClick={fetchAll} isLoading={isRefreshing} />

      {/* Modal de Edição de Viatura */}
      <Dialog open={isViaturaDialogOpen} onOpenChange={(open) => {
        setIsViaturaDialogOpen(open);
        if (!open) {
          setEditingViatura(null);
          setViaturaForm({ modelo: "", eb: "", status: "Disponível", obs: "" });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Viatura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleViaturaSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-modelo">Modelo</Label>
              <Select value={viaturaForm.modelo} onValueChange={(value) => setViaturaForm({ ...viaturaForm, modelo: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="Ambulância Hilux">Ambulância Hilux</SelectItem>
                  <SelectItem value="VW Worker 15.210">VW Worker 15.210</SelectItem>
                  <SelectItem value="Micro-ônibus">Micro-ônibus</SelectItem>
                  <SelectItem value="MB Atego 1725/42">MB Atego 1725/42</SelectItem>
                  <SelectItem value="Caminhão Baú">Caminhão Baú</SelectItem>
                  <SelectItem value="Porta Container">Porta Container</SelectItem>
                  <SelectItem value="Ford Cargo Oficina">Ford Cargo Oficina</SelectItem>
                  <SelectItem value="Cavalo Mecânico/Prancha">Cavalo Mecânico/Prancha</SelectItem>
                  <SelectItem value="Amb Land Rover Defender">Amb Land Rover Defender</SelectItem>
                  <SelectItem value="Gol Balizador (Cav Mec)">Gol Balizador (Cav Mec)</SelectItem>
                  <SelectItem value="Socorro Pesado (guincho)">Socorro Pesado (guincho)</SelectItem>
                  <SelectItem value="CTA">CTA</SelectItem>
                  <SelectItem value="CTC">CTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-eb">EB</Label>
              <Input
                id="edit-eb"
                value={viaturaForm.eb}
                onChange={(e) => setViaturaForm({ ...viaturaForm, eb: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-status-viatura">Status</Label>
              <Select value={viaturaForm.status} onValueChange={(value) => setViaturaForm({ ...viaturaForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Ocupado">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-obs-viatura">Observações</Label>
              <Textarea
                id="edit-obs-viatura"
                value={viaturaForm.obs}
                onChange={(e) => setViaturaForm({ ...viaturaForm, obs: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Atualizar
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsViaturaDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Motorista */}
      <Dialog open={isMotoristaDialogOpen} onOpenChange={(open) => {
        setIsMotoristaDialogOpen(open);
        if (!open) {
          setEditingMotorista(null);
          setMotoristaForm({ nome: "", habilitacao: "", status: "Disponível", obs: "" });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Motorista</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMotoristaSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Motorista</Label>
              <Input
                id="edit-nome"
                value={motoristaForm.nome}
                onChange={(e) => setMotoristaForm({ ...motoristaForm, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-habilitacao">Habilitação</Label>
              <Input
                id="edit-habilitacao"
                value={motoristaForm.habilitacao}
                onChange={(e) => setMotoristaForm({ ...motoristaForm, habilitacao: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-status-motorista">Status</Label>
              <Select value={motoristaForm.status} onValueChange={(value) => setMotoristaForm({ ...motoristaForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Ocupado">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-obs-motorista">Observações</Label>
              <Textarea
                id="edit-obs-motorista"
                value={motoristaForm.obs}
                onChange={(e) => setMotoristaForm({ ...motoristaForm, obs: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Atualizar
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsMotoristaDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Ficha de Saída */}
      <Dialog open={isFichaDialogOpen} onOpenChange={(open) => {
        setIsFichaDialogOpen(open);
        if (!open) {
          setEditingFicha(null);
          setFichaForm({ numero_ficha: "", motorista_id: "", viatura_id: "", horario_saida: "", horario_chegada: "", destino: "", situacao: "Em andamento" });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ficha de Saída</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFichaSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-numero-ficha">Número da Ficha</Label>
              <Input
                id="edit-numero-ficha"
                value={fichaForm.numero_ficha}
                onChange={(e) => setFichaForm({ ...fichaForm, numero_ficha: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-motorista">Motorista</Label>
              <Select value={fichaForm.motorista_id} onValueChange={(value) => setFichaForm({ ...fichaForm, motorista_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map((motorista) => (
                    <SelectItem key={motorista.id} value={motorista.id}>
                      {motorista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-viatura">Viatura</Label>
              <Select value={fichaForm.viatura_id} onValueChange={(value) => setFichaForm({ ...fichaForm, viatura_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a viatura" />
                </SelectTrigger>
                <SelectContent>
                  {viaturas.map((viatura) => (
                    <SelectItem key={viatura.id} value={viatura.id}>
                      {viatura.modelo} - {viatura.eb}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-destino">Destino</Label>
              <Input
                id="edit-destino"
                value={fichaForm.destino}
                onChange={(e) => setFichaForm({ ...fichaForm, destino: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-horario-saida">Horário de Saída</Label>
                <Input
                  id="edit-horario-saida"
                  type="datetime-local"
                  value={fichaForm.horario_saida}
                  onChange={(e) => setFichaForm({ ...fichaForm, horario_saida: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-horario-chegada">Horário de Chegada</Label>
                <Input
                  id="edit-horario-chegada"
                  type="datetime-local"
                  value={fichaForm.horario_chegada}
                  onChange={(e) => setFichaForm({ ...fichaForm, horario_chegada: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-situacao">Situação</Label>
              <Select value={fichaForm.situacao} onValueChange={(value) => setFichaForm({ ...fichaForm, situacao: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Atualizar
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFichaDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

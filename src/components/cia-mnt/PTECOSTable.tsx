import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";
import { DateTimePicker } from "@/components/DateTimePicker";

interface PTECOSTableProps {
  ptecOrigem: string;
  onCreateOS: () => void;
}

interface ConsolidatedOS {
  id: string;
  numero_os: string;
  ptec_origem: string;
  situacao: string;
  om_apoiada: string;
  marca?: string;
  mem?: string;
  sistema?: string;
  tipo_manutencao?: string;
  registro_material?: string;
  servico_solicitado?: string;
  servico_realizado?: string;
  situacao_atual?: string;
  observacoes?: string;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
}

interface PedidoMaterial {
  id: string;
  material: string;
  quantidade: number;
  classe_material?: string;
  oficina_destino: string;
  status: string;
  created_at: string;
  os_id: string;
}

export const PTECOSTable = ({ ptecOrigem, onCreateOS }: PTECOSTableProps) => {
  const [os, setOS] = useState<ConsolidatedOS[]>([]);
  const [pedidos, setPedidos] = useState<PedidoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [selectedOS, setSelectedOS] = useState<ConsolidatedOS | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<PedidoMaterial | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPedidoDialogOpen, setEditPedidoDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewPedidoDialogOpen, setViewPedidoDialogOpen] = useState(false);

  useEffect(() => {
    fetchOS();
    fetchPedidos();

    // Realtime subscription for OS
    const channelOS = supabase
      .channel(`ptec_${ptecOrigem}_os_changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cia_mnt_os_centralizadas" },
        (payload) => {
          if (payload.new && (payload.new as any).ptec_origem === ptecOrigem) {
            fetchOS();
          } else if (payload.old && (payload.old as any).ptec_origem === ptecOrigem) {
            fetchOS();
          }
        }
      )
      .subscribe();

    // Realtime subscription for pedidos
    const channelPedidos = supabase
      .channel(`ptec_${ptecOrigem}_pedidos_changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ptec_pedidos_material" },
        (payload) => {
          if (payload.new && (payload.new as any).ptec_origem === ptecOrigem) {
            fetchPedidos();
          } else if (payload.old && (payload.old as any).ptec_origem === ptecOrigem) {
            fetchPedidos();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelOS);
      supabase.removeChannel(channelPedidos);
    };
  }, [ptecOrigem]);

  const fetchOS = async () => {
    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { data, error } = await supabaseClient
        .from("cia_mnt_os_centralizadas")
        .select("*")
        .eq("ptec_origem", ptecOrigem)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar OS");
        console.error(error);
      } else {
        setOS(data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar OS:", err);
      toast.error("Erro ao carregar dados");
    }
    setLoading(false);
  };

  const fetchPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const { data, error } = await supabase
        .from("ptec_pedidos_material")
        .select("*")
        .eq("ptec_origem", ptecOrigem)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar pedidos de material");
        console.error(error);
      } else {
        setPedidos(data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      toast.error("Erro ao carregar pedidos");
    }
    setLoadingPedidos(false);
  };

  const handlePrintOS = (os: ConsolidatedOS) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OS ${os.numero_os}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td { padding: 8px; border: 1px solid #ddd; }
          .label { font-weight: bold; width: 30%; background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Ordem de Serviço - ${os.numero_os}</h1>
        <table>
          <tr><td class="label">Nº OS</td><td>${os.numero_os}</td></tr>
          <tr><td class="label">PTEC Origem</td><td>${os.ptec_origem?.toUpperCase()}</td></tr>
          <tr><td class="label">Situação</td><td>${os.situacao}</td></tr>
          <tr><td class="label">OM Apoiada</td><td>${os.om_apoiada}</td></tr>
          ${ptecOrigem !== 'armto' ? `<tr><td class="label">Marca</td><td>${os.marca || '-'}</td></tr>` : ''}
          <tr><td class="label">MEM</td><td>${os.mem || '-'}</td></tr>
          ${['com', 'op', 'auto', 'blind'].includes(ptecOrigem) ? `<tr><td class="label">Sistema</td><td>${os.sistema || '-'}</td></tr>` : ''}
          <tr><td class="label">Tipo Manutenção</td><td>${os.tipo_manutencao || '-'}</td></tr>
          ${['auto', 'blind', 'armto'].includes(ptecOrigem) ? `<tr><td class="label">Registro/Nº Material</td><td>${os.registro_material || '-'}</td></tr>` : ''}
          <tr><td class="label">Data Início</td><td>${os.data_inicio ? format(new Date(os.data_inicio), 'dd/MM/yyyy HH:mm') : '-'}</td></tr>
          <tr><td class="label">Data Fim</td><td>${os.data_fim ? format(new Date(os.data_fim), 'dd/MM/yyyy HH:mm') : '-'}</td></tr>
          <tr><td class="label">Serviço Solicitado</td><td>${os.servico_solicitado || '-'}</td></tr>
          <tr><td class="label">Serviço Realizado</td><td>${os.servico_realizado || '-'}</td></tr>
          <tr><td class="label">Situação Atual</td><td>${os.situacao_atual || '-'}</td></tr>
          <tr><td class="label">Observações</td><td>${os.observacoes || '-'}</td></tr>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteOS = async (osId: string) => {
    try {
      const { error } = await supabase
        .from("cia_mnt_os_centralizadas")
        .delete()
        .eq("id", osId);

      if (error) throw error;

      toast.success("OS deletada com sucesso");
      fetchOS();
    } catch (error) {
      console.error("Erro ao deletar OS:", error);
      toast.error("Erro ao deletar OS");
    }
  };

  const handleDeletePedido = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from("ptec_pedidos_material")
        .delete()
        .eq("id", pedidoId);

      if (error) throw error;

      toast.success("Pedido deletado com sucesso");
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao deletar pedido:", error);
      toast.error("Erro ao deletar pedido");
    }
  };

  const handleUpdateOS = async () => {
    if (!selectedOS) return;

    // Validar se o número da OS mudou e verificar duplicação
    const osOriginal = os.find(item => item.id === selectedOS.id);
    
    if (osOriginal && osOriginal.numero_os !== selectedOS.numero_os) {
      // Verificar se o novo número já existe no mesmo PTEC
      const { data: existingOS, error: checkError } = await supabase
        .from("cia_mnt_os_centralizadas")
        .select("numero_os")
        .eq("numero_os", selectedOS.numero_os.trim())
        .eq("ptec_origem", ptecOrigem)
        .neq("id", selectedOS.id)
        .maybeSingle();

      if (checkError) {
        console.error("❌ Erro ao verificar OS existente:", checkError);
        toast.error("Erro ao verificar número da OS");
        return;
      }

      if (existingOS) {
        toast.error(`Número da OS ${selectedOS.numero_os} já existe no PTEC ${ptecOrigem.toUpperCase()}. Escolha outro número.`);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("cia_mnt_os_centralizadas")
        .update({
          numero_os: selectedOS.numero_os,
          situacao: selectedOS.situacao,
          om_apoiada: selectedOS.om_apoiada,
          marca: selectedOS.marca,
          mem: selectedOS.mem,
          sistema: selectedOS.sistema,
          tipo_manutencao: selectedOS.tipo_manutencao,
          registro_material: selectedOS.registro_material,
          servico_solicitado: selectedOS.servico_solicitado,
          servico_realizado: selectedOS.servico_realizado,
          situacao_atual: selectedOS.situacao_atual,
          observacoes: selectedOS.observacoes,
          data_inicio: selectedOS.data_inicio,
          data_fim: selectedOS.data_fim,
        })
        .eq("id", selectedOS.id);

      if (error) throw error;

      toast.success("OS atualizada com sucesso");
      setEditDialogOpen(false);
      fetchOS();
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar OS");
    }
  };

  const handleUpdatePedido = async () => {
    if (!selectedPedido) return;

    try {
      const { error } = await supabase
        .from("ptec_pedidos_material")
        .update({
          material: selectedPedido.material,
          quantidade: selectedPedido.quantidade,
          classe_material: selectedPedido.classe_material,
          oficina_destino: selectedPedido.oficina_destino,
          status: selectedPedido.status,
        })
        .eq("id", selectedPedido.id);

      if (error) throw error;

      toast.success("Pedido atualizado com sucesso");
      setEditPedidoDialogOpen(false);
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast.error("Erro ao atualizar pedido");
    }
  };

  const osOptions = os.map(item => ({ id: item.id, numero_os: item.numero_os }));

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <h3 className="text-2xl font-bold">{os.length}</h3>
            </div>
            <i className="ri-file-list-line text-3xl text-primary"></i>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Abertas</p>
              <h3 className="text-2xl font-bold">
                {os.filter((item) => item.situacao === "Aberta").length}
              </h3>
            </div>
            <i className="ri-file-edit-line text-3xl text-orange-500"></i>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Manutenido</p>
              <h3 className="text-2xl font-bold">
                {os.filter((item) => item.situacao === "Manutenido").length}
              </h3>
            </div>
            <i className="ri-tools-line text-3xl text-blue-500"></i>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fechadas</p>
              <h3 className="text-2xl font-bold">
                {os.filter((item) => item.situacao === "Fechada").length}
              </h3>
            </div>
            <i className="ri-checkbox-circle-line text-3xl text-green-500"></i>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Ordens de Serviço ({os.length})</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchOS}>
              <i className="ri-refresh-line mr-2"></i>Atualizar
            </Button>
            <PedidoMaterialForm 
              osOptions={osOptions}
              ptecOrigem={ptecOrigem}
              oficinaDestino=""
              onSuccess={fetchPedidos}
            />
            <Button onClick={onCreateOS} className="gradient-primary text-white">
              <i className="ri-add-line mr-2"></i>Nova OS
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <i className="ri-loader-4-line text-4xl animate-spin text-primary"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº OS</TableHead>
                  <TableHead>OM Apoiada</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>MEM</TableHead>
                  <TableHead>Sistema</TableHead>
                  <TableHead>Tipo Mnt</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {os.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <i className="ri-file-list-line text-4xl mb-2 block"></i>
                      Nenhuma OS encontrada para este PTEC
                    </TableCell>
                  </TableRow>
                ) : (
                  os.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_os}</TableCell>
                      <TableCell>{item.om_apoiada}</TableCell>
                      <TableCell>{item.marca || "-"}</TableCell>
                      <TableCell>{item.mem || "-"}</TableCell>
                      <TableCell>{item.sistema || "-"}</TableCell>
                      <TableCell>
                        {item.tipo_manutencao ? (
                          <Badge variant="outline">{item.tipo_manutencao}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.situacao === "Fechada"
                              ? "default"
                              : item.situacao === "Aberta"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {item.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.data_inicio
                          ? format(new Date(item.data_inicio), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOS(item);
                              setViewDialogOpen(true);
                            }}
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOS(item);
                              setEditDialogOpen(true);
                            }}
                          >
                            <i className="ri-edit-line"></i>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <i className="ri-delete-bin-line text-destructive"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar a OS {item.numero_os}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOS(item.id)}>
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pedidos de Material */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pedidos de Material ({pedidos.length})</h3>
          <Button variant="outline" size="sm" onClick={fetchPedidos}>
            <i className="ri-refresh-line mr-2"></i>Atualizar
          </Button>
        </div>

        {loadingPedidos ? (
          <div className="flex justify-center items-center py-12">
            <i className="ri-loader-4-line text-4xl animate-spin text-primary"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Oficina Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <i className="ri-shopping-cart-line text-4xl mb-2 block"></i>
                      Nenhum pedido de material encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.material}</TableCell>
                      <TableCell>{pedido.quantidade}</TableCell>
                      <TableCell>{pedido.classe_material || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pedido.oficina_destino.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pedido.status === "Entregue"
                              ? "default"
                              : pedido.status === "Cancelado"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {pedido.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(pedido.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPedido(pedido);
                              setViewPedidoDialogOpen(true);
                            }}
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPedido(pedido);
                              setEditPedidoDialogOpen(true);
                            }}
                          >
                            <i className="ri-edit-line"></i>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <i className="ri-delete-bin-line text-destructive"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o pedido de {pedido.material}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePedido(pedido.id)}>
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Dialog para visualizar OS */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da OS {selectedOS?.numero_os}</span>
              {selectedOS && (
                <Button
                  onClick={() => handlePrintOS(selectedOS)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <i className="ri-printer-line mr-2"></i>
                  Imprimir
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOS && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nº OS</Label>
                <p className="text-sm mt-1">{selectedOS.numero_os}</p>
              </div>
              <div>
                <Label>Situação</Label>
                <p className="text-sm mt-1">{selectedOS.situacao}</p>
              </div>
              <div>
                <Label>OM Apoiada</Label>
                <p className="text-sm mt-1">{selectedOS.om_apoiada}</p>
              </div>
              {ptecOrigem !== "armto" && (
                <div>
                  <Label>Marca</Label>
                  <p className="text-sm mt-1">{selectedOS.marca || "-"}</p>
                </div>
              )}
              <div>
                <Label>MEM</Label>
                <p className="text-sm mt-1">{selectedOS.mem || "-"}</p>
              </div>
              {["com", "op", "auto", "blind"].includes(ptecOrigem) && (
                <div>
                  <Label>Sistema</Label>
                  <p className="text-sm mt-1">{selectedOS.sistema || "-"}</p>
                </div>
              )}
              <div>
                <Label>Tipo Manutenção</Label>
                <p className="text-sm mt-1">{selectedOS.tipo_manutencao || "-"}</p>
              </div>
              {["auto", "blind", "armto"].includes(ptecOrigem) && (
                <div>
                  <Label>Registro ou Nº do Material</Label>
                  <p className="text-sm mt-1">{selectedOS.registro_material || "-"}</p>
                </div>
              )}
              <div>
                <Label>Data Início</Label>
                <p className="text-sm mt-1">
                  {selectedOS.data_inicio ? format(new Date(selectedOS.data_inicio), "dd/MM/yyyy HH:mm") : "-"}
                </p>
              </div>
              <div>
                <Label>Data Fim</Label>
                <p className="text-sm mt-1">
                  {selectedOS.data_fim ? format(new Date(selectedOS.data_fim), "dd/MM/yyyy HH:mm") : "-"}
                </p>
              </div>
              <div className="col-span-2">
                <Label>Serviço Solicitado</Label>
                <p className="text-sm mt-1">{selectedOS.servico_solicitado || "-"}</p>
              </div>
              <div className="col-span-2">
                <Label>Serviço Realizado</Label>
                <p className="text-sm mt-1">{selectedOS.servico_realizado || "-"}</p>
              </div>
              <div className="col-span-2">
                <Label>Situação Atual</Label>
                <p className="text-sm mt-1">{selectedOS.situacao_atual || "-"}</p>
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <p className="text-sm mt-1">{selectedOS.observacoes || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar OS */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar OS {selectedOS?.numero_os}</DialogTitle>
          </DialogHeader>
          {selectedOS && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nº OS</Label>
                <Input
                  value={selectedOS.numero_os}
                  onChange={(e) => setSelectedOS({ ...selectedOS, numero_os: e.target.value })}
                />
              </div>
              <div>
                <Label>Situação</Label>
                <Select
                  value={selectedOS.situacao}
                  onValueChange={(value) => setSelectedOS({ ...selectedOS, situacao: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberta">Aberta</SelectItem>
                    <SelectItem value="Manutenido">Manutenido</SelectItem>
                    <SelectItem value="Fechada">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>OM Apoiada</Label>
                <Input
                  value={selectedOS.om_apoiada}
                  onChange={(e) => setSelectedOS({ ...selectedOS, om_apoiada: e.target.value })}
                />
              </div>
              {ptecOrigem !== "armto" && (
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={selectedOS.marca || ""}
                    onChange={(e) => setSelectedOS({ ...selectedOS, marca: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>MEM</Label>
                <Input
                  value={selectedOS.mem || ""}
                  onChange={(e) => setSelectedOS({ ...selectedOS, mem: e.target.value })}
                />
              </div>
              {["com", "op", "auto", "blind"].includes(ptecOrigem) && (
                <div>
                  <Label>Sistema</Label>
                  <Input
                    value={selectedOS.sistema || ""}
                    onChange={(e) => setSelectedOS({ ...selectedOS, sistema: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Tipo Manutenção</Label>
                <Select
                  value={selectedOS.tipo_manutencao || ""}
                  onValueChange={(value) => setSelectedOS({ ...selectedOS, tipo_manutencao: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PMS">PMS</SelectItem>
                    <SelectItem value="PMR">PMR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {["auto", "blind", "armto"].includes(ptecOrigem) && (
                <div>
                  <Label>Registro ou Nº do Material</Label>
                  <Input
                    value={selectedOS.registro_material || ""}
                    onChange={(e) => setSelectedOS({ ...selectedOS, registro_material: e.target.value })}
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label>Data Início</Label>
                <DateTimePicker
                  value={selectedOS.data_inicio || ""}
                  onChange={(value) => setSelectedOS({ ...selectedOS, data_inicio: value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Data Fim</Label>
                <DateTimePicker
                  value={selectedOS.data_fim || ""}
                  onChange={(value) => setSelectedOS({ ...selectedOS, data_fim: value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Serviço Solicitado</Label>
                <Textarea
                  value={selectedOS.servico_solicitado || ""}
                  onChange={(e) => setSelectedOS({ ...selectedOS, servico_solicitado: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Serviço Realizado</Label>
                <Textarea
                  value={selectedOS.servico_realizado || ""}
                  onChange={(e) => setSelectedOS({ ...selectedOS, servico_realizado: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Situação Atual</Label>
                <Textarea
                  value={selectedOS.situacao_atual || ""}
                  onChange={(e) => setSelectedOS({ ...selectedOS, situacao_atual: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={selectedOS.observacoes || ""}
                  onChange={(e) => setSelectedOS({ ...selectedOS, observacoes: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateOS}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar Pedido */}
      <Dialog open={viewPedidoDialogOpen} onOpenChange={setViewPedidoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="grid gap-4">
              <div>
                <Label>Material</Label>
                <p className="text-sm mt-1">{selectedPedido.material}</p>
              </div>
              <div>
                <Label>Quantidade</Label>
                <p className="text-sm mt-1">{selectedPedido.quantidade}</p>
              </div>
              <div>
                <Label>Classe Material</Label>
                <p className="text-sm mt-1">{selectedPedido.classe_material || "-"}</p>
              </div>
              <div>
                <Label>Oficina Destino</Label>
                <p className="text-sm mt-1">{selectedPedido.oficina_destino.toUpperCase()}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-sm mt-1">{selectedPedido.status}</p>
              </div>
              <div>
                <Label>Data</Label>
                <p className="text-sm mt-1">{format(new Date(selectedPedido.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar Pedido */}
      <Dialog open={editPedidoDialogOpen} onOpenChange={setEditPedidoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="grid gap-4">
              <div>
                <Label>Material</Label>
                <Input
                  value={selectedPedido.material}
                  onChange={(e) => setSelectedPedido({ ...selectedPedido, material: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={selectedPedido.quantidade}
                  onChange={(e) => setSelectedPedido({ ...selectedPedido, quantidade: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Classe Material</Label>
                <Select
                  value={selectedPedido.classe_material || ""}
                  onValueChange={(value) => setSelectedPedido({ ...selectedPedido, classe_material: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classe I">Classe I</SelectItem>
                    <SelectItem value="Classe II">Classe II</SelectItem>
                    <SelectItem value="Classe III">Classe III</SelectItem>
                    <SelectItem value="Classe IV">Classe IV</SelectItem>
                    <SelectItem value="Classe V">Classe V</SelectItem>
                    <SelectItem value="Classe VI">Classe VI</SelectItem>
                    <SelectItem value="Classe VII">Classe VII</SelectItem>
                    <SelectItem value="Classe VIII">Classe VIII</SelectItem>
                    <SelectItem value="Classe IX">Classe IX</SelectItem>
                    <SelectItem value="Classe X">Classe X</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Oficina Destino</Label>
                <Select
                  value={selectedPedido.oficina_destino}
                  onValueChange={(value) => setSelectedPedido({ ...selectedPedido, oficina_destino: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="com">COM</SelectItem>
                    <SelectItem value="auto">AUTO</SelectItem>
                    <SelectItem value="blind">BLIND</SelectItem>
                    <SelectItem value="op">OP</SelectItem>
                    <SelectItem value="armto">ARMTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedPedido.status}
                  onValueChange={(value) => setSelectedPedido({ ...selectedPedido, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solicitado">Solicitado</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditPedidoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePedido}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

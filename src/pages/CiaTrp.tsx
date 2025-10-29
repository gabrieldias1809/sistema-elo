import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Truck, CheckCircle, XCircle } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";

interface PedidoTransporte {
  id: string;
  numero_pedido: number;
  pedido_material_id: string;
  destino: string;
  observacoes: string;
  situacao: string;
  created_at: string;
}

export default function CiaTrp() {
  const [pedidosTransporte, setPedidosTransporte] = useState<PedidoTransporte[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPedidosTransporte();
    
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
                <TableHead>Observações</TableHead>
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
                pedidosTransporte.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.numero_pedido}</TableCell>
                    <TableCell>{pedido.pedido_material_id.slice(0, 8)}...</TableCell>
                    <TableCell>{pedido.destino}</TableCell>
                    <TableCell>{pedido.observacoes || "-"}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RefreshButton onClick={fetchPedidosTransporte} isLoading={isRefreshing} />
    </div>
  );
}

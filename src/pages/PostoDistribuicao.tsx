import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Package } from "lucide-react";

const PostoDistribuicao = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("ptec_pedidos_material_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ptec_pedidos_material"
        },
        () => {
          fetchPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("ptec_pedidos_material")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos");
      return;
    }

    setPedidos(data || []);
  };

  const handleStatusUpdate = async (pedidoId: string, novoStatus: string) => {
    const { error } = await supabase
      .from("ptec_pedidos_material")
      .update({ status: novoStatus })
      .eq("id", pedidoId);

    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }

    toast.success("Status atualizado com sucesso!");
    fetchPedidos();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Posto de Distribuição</h1>
              <p className="text-muted-foreground">Gerenciamento de Pedidos de Material</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPedidos}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos de Material</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ptec Origem</TableHead>
              <TableHead>Oficina Destino</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell className="font-medium">{pedido.ptec_origem}</TableCell>
                <TableCell>{pedido.oficina_destino}</TableCell>
                <TableCell>{pedido.material}</TableCell>
                <TableCell>{pedido.quantidade}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pedido.status === "Entregue" ? "bg-green-100 text-green-800" :
                    pedido.status === "Cancelado" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {pedido.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(pedido.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {pedido.status === "Solicitado" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(pedido.id, "Entregue")}
                      >
                        Entregar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(pedido.id, "Cancelado")}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PostoDistribuicao;
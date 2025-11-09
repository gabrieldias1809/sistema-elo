import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

interface PedidosMaterialTableProps {
  oficinaDestino: string;
}

export const PedidosMaterialTable = ({ oficinaDestino }: PedidosMaterialTableProps) => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    fetchPedidos();

    const channel = supabase
      .channel(`pedidos_material_${oficinaDestino}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ptec_pedidos_material" },
        () => {
          fetchPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [oficinaDestino]);

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("ptec_pedidos_material")
      .select("*")
      .eq("oficina_destino", oficinaDestino)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos de material");
      return;
    }

    setPedidos(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Solicitado":
        return "bg-yellow-500";
      case "Entregue":
        return "bg-green-500";
      case "Cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pedidos de Material
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Ptec Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            ) : (
              pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium">{pedido.material}</TableCell>
                  <TableCell>{pedido.classe_material || "-"}</TableCell>
                  <TableCell>{pedido.quantidade}</TableCell>
                  <TableCell className="uppercase">{pedido.ptec_origem}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(pedido.status)}>
                      {pedido.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pedido.created_at
                      ? format(new Date(pedido.created_at), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

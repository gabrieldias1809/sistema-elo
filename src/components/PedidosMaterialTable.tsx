import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";

interface PedidosMaterialTableProps {
  oficinaDestino: string;
}

export const PedidosMaterialTable = ({ oficinaDestino }: PedidosMaterialTableProps) => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [formData, setFormData] = useState({
    material: "",
    classe_material: "",
    quantidade: "",
    status: "",
  });

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

  const handleView = (pedido: any) => {
    setSelectedPedido(pedido);
    setViewDialogOpen(true);
  };

  const handleEdit = (pedido: any) => {
    setSelectedPedido(pedido);
    setFormData({
      material: pedido.material,
      classe_material: pedido.classe_material || "",
      quantidade: pedido.quantidade.toString(),
      status: pedido.status,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (pedido: any) => {
    setSelectedPedido(pedido);
    setDeleteDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPedido) return;

    const { error } = await supabase
      .from("ptec_pedidos_material")
      .update({
        material: formData.material,
        classe_material: formData.classe_material,
        quantidade: parseFloat(formData.quantidade),
        status: formData.status,
      })
      .eq("id", selectedPedido.id);

    if (error) {
      toast.error("Erro ao atualizar pedido");
      return;
    }

    toast.success("Pedido atualizado com sucesso!");
    setEditDialogOpen(false);
    setSelectedPedido(null);
    fetchPedidos();
  };

  const confirmDelete = async () => {
    if (!selectedPedido) return;

    const { error } = await supabase
      .from("ptec_pedidos_material")
      .delete()
      .eq("id", selectedPedido.id);

    if (error) {
      toast.error("Erro ao excluir pedido");
      return;
    }

    toast.success("Pedido excluído com sucesso!");
    setDeleteDialogOpen(false);
    setSelectedPedido(null);
    fetchPedidos();
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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(pedido)}
                        title="Visualizar"
                      >
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pedido)}
                        title="Editar"
                      >
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pedido)}
                        title="Excluir"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Material</Label>
                  <p className="font-medium">{selectedPedido.material}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Classe Material</Label>
                  <p className="font-medium">{selectedPedido.classe_material || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantidade</Label>
                  <p className="font-medium">{selectedPedido.quantidade}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ptec Origem</Label>
                  <p className="font-medium uppercase">{selectedPedido.ptec_origem}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedPedido.status)}>
                    {selectedPedido.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p className="font-medium">
                    {selectedPedido.created_at
                      ? format(new Date(selectedPedido.created_at), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label>Material</Label>
              <Input
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Classe Material</Label>
              <Select
                value={formData.classe_material}
                onValueChange={(value) => setFormData({ ...formData, classe_material: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Classe I</SelectItem>
                  <SelectItem value="II">Classe II</SelectItem>
                  <SelectItem value="III">Classe III</SelectItem>
                  <SelectItem value="IV">Classe IV</SelectItem>
                  <SelectItem value="V">Classe V</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solicitado">Solicitado</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gradient-primary text-white">
              Atualizar Pedido
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

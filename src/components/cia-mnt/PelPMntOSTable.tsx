import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { PedidoMaterialForm } from "@/components/PedidoMaterialForm";

interface PelPMntOSTableProps {
  onCreateOS: () => void;
}

interface OS {
  id: string;
  numero_os: string;
  situacao: string;
  om_apoiada: string;
  marca?: string;
  mem?: string;
  sistema?: string;
  tipo_viatura: string;
  registro_material?: string;
  servico_solicitado?: string;
  servico_realizado?: string;
  situacao_atual?: string;
  observacoes?: string;
  data_inicio?: string;
  data_fim?: string;
  quantidade_classe_iii?: number;
  created_at: string;
}

interface PedidoMaterial {
  id: string;
  material: string;
  quantidade: number;
  status: string;
  tipo_pedido: string;
  classe_material?: string;
  oficina_destino: string;
  created_at: string;
}

const PelPMntOSTable = ({ onCreateOS }: PelPMntOSTableProps) => {
  const [osList, setOsList] = useState<OS[]>([]);
  const [pedidos, setPedidos] = useState<PedidoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOS, setViewOS] = useState<OS | null>(null);
  const [editOS, setEditOS] = useState<OS | null>(null);
  const [viewPedido, setViewPedido] = useState<PedidoMaterial | null>(null);
  const [editPedido, setEditPedido] = useState<PedidoMaterial | null>(null);

  useEffect(() => {
    fetchOS();
    fetchPedidos();

    const osChannel = supabase
      .channel("pel_p_mnt_os_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "pel_p_mnt_os" }, () => {
        fetchOS();
      })
      .subscribe();

    const pedidosChannel = supabase
      .channel("pel_p_mnt_pedidos_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ptec_pedidos_material" }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(osChannel);
      supabase.removeChannel(pedidosChannel);
    };
  }, []);

  const fetchOS = async () => {
    try {
      const { data, error } = await supabase
        .from("pel_p_mnt_os")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOsList(data || []);
    } catch (error) {
      console.error("Erro ao buscar OS:", error);
      toast.error("Erro ao carregar OS");
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("ptec_pedidos_material")
        .select("*")
        .in("oficina_destino", ["auto", "blind"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  const handleDeleteOS = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;

    try {
      const { error } = await supabase.from("pel_p_mnt_os").delete().eq("id", id);
      if (error) throw error;
      toast.success("OS excluída com sucesso!");
      fetchOS();
    } catch (error) {
      console.error("Erro ao excluir OS:", error);
      toast.error("Erro ao excluir OS");
    }
  };

  const handleUpdateOS = async () => {
    if (!editOS) return;

    try {
      const { error } = await supabase
        .from("pel_p_mnt_os")
        .update({
          numero_os: editOS.numero_os,
          situacao: editOS.situacao,
          om_apoiada: editOS.om_apoiada,
          marca: editOS.marca,
          mem: editOS.mem,
          sistema: editOS.sistema,
          tipo_viatura: editOS.tipo_viatura,
          registro_material: editOS.registro_material,
          servico_solicitado: editOS.servico_solicitado,
          servico_realizado: editOS.servico_realizado,
          situacao_atual: editOS.situacao_atual,
          observacoes: editOS.observacoes,
          data_inicio: editOS.data_inicio,
          data_fim: editOS.data_fim,
          quantidade_classe_iii: editOS.quantidade_classe_iii,
        })
        .eq("id", editOS.id);

      if (error) throw error;
      toast.success("OS atualizada com sucesso!");
      setEditOS(null);
      fetchOS();
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar OS");
    }
  };

  const handlePrintOS = (os: OS) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Ordem de Serviço - Pel P Mnt", 10, 10);
    doc.setFontSize(12);
    doc.text(`Nº OS: ${os.numero_os}`, 10, 20);
    doc.text(`Situação: ${os.situacao}`, 10, 30);
    doc.text(`OM Apoiada: ${os.om_apoiada}`, 10, 40);
    doc.text(`Tipo de Viatura: ${os.tipo_viatura}`, 10, 50);
    if (os.marca) doc.text(`Marca: ${os.marca}`, 10, 60);
    if (os.mem) doc.text(`MEM: ${os.mem}`, 10, 70);
    doc.save(`OS_${os.numero_os}.pdf`);
  };

  const stats = {
    total: osList.length,
    aberta: osList.filter((os) => os.situacao === "Aberta").length,
    manutenido: osList.filter((os) => os.situacao === "Manutenido").length,
    fechada: osList.filter((os) => os.situacao === "Fechada").length,
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.aberta}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Manutenidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.manutenido}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fechadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.fechada}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ordens de Serviço - Pel P Mnt</CardTitle>
            <Button onClick={onCreateOS}>
              <i className="ri-add-line mr-2"></i>
              Nova OS
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OS</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>OM Apoiada</TableHead>
                <TableHead>Tipo Viatura</TableHead>
                <TableHead>MEM</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {osList.map((os) => (
                <TableRow key={os.id}>
                  <TableCell>{os.numero_os}</TableCell>
                  <TableCell>
                    <Badge variant={os.situacao === "Aberta" ? "default" : os.situacao === "Manutenido" ? "secondary" : "outline"}>
                      {os.situacao}
                    </Badge>
                  </TableCell>
                  <TableCell>{os.om_apoiada}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{os.tipo_viatura}</Badge>
                  </TableCell>
                  <TableCell>{os.mem}</TableCell>
                  <TableCell>{os.data_inicio ? new Date(os.data_inicio).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewOS(os)}>
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditOS(os)}>
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handlePrintOS(os)}>
                        <i className="ri-printer-line"></i>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteOS(os.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos de Material</CardTitle>
            <PedidoMaterialForm 
              ptecOrigem="pel_p_mnt" 
              oficinaDestino="auto"
              osOptions={osList.map(os => ({ id: os.id, numero_os: os.numero_os }))}
              onSuccess={fetchPedidos} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Oficina</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.material}</TableCell>
                  <TableCell>{pedido.quantidade}</TableCell>
                  <TableCell>
                    <Badge>{pedido.status}</Badge>
                  </TableCell>
                  <TableCell>{pedido.tipo_pedido}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{pedido.oficina_destino}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewPedido(pedido)}>
                        <i className="ri-eye-line"></i>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditPedido(pedido)}>
                        <i className="ri-edit-line"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewOS} onOpenChange={() => setViewOS(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar OS - {viewOS?.numero_os}</DialogTitle>
          </DialogHeader>
          {viewOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Situação</Label>
                  <p>{viewOS.situacao}</p>
                </div>
                <div>
                  <Label>OM Apoiada</Label>
                  <p>{viewOS.om_apoiada}</p>
                </div>
                <div>
                  <Label>Tipo de Viatura</Label>
                  <p>{viewOS.tipo_viatura}</p>
                </div>
                {viewOS.marca && (
                  <div>
                    <Label>Marca</Label>
                    <p>{viewOS.marca}</p>
                  </div>
                )}
                {viewOS.mem && (
                  <div>
                    <Label>MEM</Label>
                    <p>{viewOS.mem}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editOS} onOpenChange={() => setEditOS(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar OS - {editOS?.numero_os}</DialogTitle>
          </DialogHeader>
          {editOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Situação</Label>
                  <Select value={editOS.situacao} onValueChange={(value) => setEditOS({ ...editOS, situacao: value })}>
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
                  <Label>Tipo de Viatura</Label>
                  <Select value={editOS.tipo_viatura} onValueChange={(value) => setEditOS({ ...editOS, tipo_viatura: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blindado">Blindado</SelectItem>
                      <SelectItem value="não blindado">Não Blindado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Serviço Realizado</Label>
                  <Textarea
                    value={editOS.servico_realizado || ""}
                    onChange={(e) => setEditOS({ ...editOS, servico_realizado: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={editOS.observacoes || ""}
                    onChange={(e) => setEditOS({ ...editOS, observacoes: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateOS}>Salvar Alterações</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PelPMntOSTable;

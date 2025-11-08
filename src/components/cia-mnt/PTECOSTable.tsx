import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

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
  servico_solicitado?: string;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
}

export const PTECOSTable = ({ ptecOrigem, onCreateOS }: PTECOSTableProps) => {
  const [os, setOS] = useState<ConsolidatedOS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOS();

    // Realtime subscription
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {os.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

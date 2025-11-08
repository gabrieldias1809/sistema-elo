import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

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
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
}

const PTEC_LABELS: Record<string, string> = {
  com: "Ptec Com",
  pel_p_mnt: "Pel P Mnt",
  op: "Ptec Op",
  armto: "Ptec Armto",
};

export const ConsolidatedOSTable = () => {
  const [os, setOS] = useState<ConsolidatedOS[]>([]);
  const [filteredOS, setFilteredOS] = useState<ConsolidatedOS[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPtec, setFilterPtec] = useState<string>("all");
  const [filterSituacao, setFilterSituacao] = useState<string>("all");
  const [filterTipoManutencao, setFilterTipoManutencao] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOS();

    // Realtime subscription
    const channel = supabase
      .channel("cia_mnt_os_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cia_mnt_os_centralizadas" },
        () => {
          fetchOS();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [os, searchTerm, filterPtec, filterSituacao, filterTipoManutencao]);

  const fetchOS = async () => {
    setLoading(true);
    try {
      const supabaseClient = supabase as any;
      const { data, error } = await supabaseClient
        .from("cia_mnt_os_centralizadas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar OS consolidadas");
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

  const applyFilters = () => {
    let filtered = [...os];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.numero_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.om_apoiada.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mem?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por PTEC
    if (filterPtec !== "all") {
      filtered = filtered.filter((item) => item.ptec_origem === filterPtec);
    }

    // Filtro por situação
    if (filterSituacao !== "all") {
      filtered = filtered.filter((item) => item.situacao === filterSituacao);
    }

    // Filtro por tipo de manutenção
    if (filterTipoManutencao !== "all") {
      filtered = filtered.filter((item) => item.tipo_manutencao === filterTipoManutencao);
    }

    setFilteredOS(filtered);
  };

  // Dados para gráficos
  const osPorPtec = Object.entries(
    os.reduce((acc: Record<string, number>, item) => {
      acc[item.ptec_origem] = (acc[item.ptec_origem] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: PTEC_LABELS[name] || name, value }));

  const osPorSituacao = Object.entries(
    os.reduce((acc: Record<string, number>, item) => {
      acc[item.situacao] = (acc[item.situacao] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const osPorTipo = Object.entries(
    os.reduce((acc: Record<string, number>, item) => {
      if (item.tipo_manutencao) {
        acc[item.tipo_manutencao] = (acc[item.tipo_manutencao] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const getPtecBadgeColor = (ptec: string) => {
    const colors: Record<string, string> = {
      com: "bg-blue-500",
      pel_p_mnt: "bg-green-500",
      op: "bg-orange-500",
      armto: "bg-red-500",
    };
    return colors[ptec] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de OS</p>
              <h3 className="text-3xl font-bold">{os.length}</h3>
            </div>
            <i className="ri-file-list-3-line text-4xl text-primary"></i>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">OS Abertas</p>
              <h3 className="text-3xl font-bold">
                {os.filter((item) => item.situacao === "Aberta").length}
              </h3>
            </div>
            <i className="ri-file-edit-line text-4xl text-orange-500"></i>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">OS Concluídas</p>
              <h3 className="text-3xl font-bold">
                {os.filter((item) => item.situacao === "Fechada").length}
              </h3>
            </div>
            <i className="ri-checkbox-circle-line text-4xl text-green-500"></i>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">OS por PTEC</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={osPorPtec}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {osPorPtec.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">OS por Situação</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={osPorSituacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0A7373" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {osPorTipo.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">PMS vs PMR</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={osPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {osPorTipo.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Buscar por N°, OM, Marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select value={filterPtec} onValueChange={setFilterPtec}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por PTEC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os PTECs</SelectItem>
                <SelectItem value="com">Ptec Com</SelectItem>
                <SelectItem value="pel_p_mnt">Pel P Mnt</SelectItem>
                <SelectItem value="op">Ptec Op</SelectItem>
                <SelectItem value="armto">Ptec Armto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterSituacao} onValueChange={setFilterSituacao}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Situações</SelectItem>
                <SelectItem value="Aberta">Aberta</SelectItem>
                <SelectItem value="Manutenido">Manutenido</SelectItem>
                <SelectItem value="Fechada">Fechada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterTipoManutencao} onValueChange={setFilterTipoManutencao}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Manutenção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PMS">PMS</SelectItem>
                <SelectItem value="PMR">PMR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchTerm("");
                setFilterPtec("all");
                setFilterSituacao("all");
                setFilterTipoManutencao("all");
              }}
            >
              <i className="ri-filter-off-line mr-2"></i>Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Ordens de Serviço Consolidadas ({filteredOS.length})
          </h3>
          <Button variant="outline" size="sm" onClick={fetchOS}>
            <i className="ri-refresh-line mr-2"></i>Atualizar
          </Button>
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
                  <TableHead>PTEC</TableHead>
                  <TableHead>OM Apoiada</TableHead>
                  <TableHead>Marca/Reg. Material</TableHead>
                  <TableHead>MEM</TableHead>
                  <TableHead>Sistema</TableHead>
                  <TableHead>Tipo Mnt</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Data Início</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOS.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <i className="ri-file-list-line text-4xl mb-2 block"></i>
                      Nenhuma OS encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOS.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_os}</TableCell>
                      <TableCell>
                        <Badge className={`${getPtecBadgeColor(item.ptec_origem)} text-white`}>
                          {PTEC_LABELS[item.ptec_origem]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.om_apoiada}</TableCell>
                      <TableCell>
                        {['armto', 'pel_p_mnt'].includes(item.ptec_origem) ? (item as any).registro_material || "-" : item.marca || "-"}
                      </TableCell>
                      <TableCell>{item.mem || "-"}</TableCell>
                      <TableCell>{item.ptec_origem === 'armto' ? "-" : item.sistema || "-"}</TableCell>
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

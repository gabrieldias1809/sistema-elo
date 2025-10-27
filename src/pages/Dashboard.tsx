import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25", "#C43302"];

const Dashboard = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [ptecComData, setPtecComData] = useState<any[]>([]);
  const [ptecMbData, setPtecMbData] = useState<any[]>([]);
  const [ptecSauData, setPtecSauData] = useState<any[]>([]);
  const [ptecSauProntuarios, setPtecSauProntuarios] = useState<any[]>([]);
  const [ptecRhData, setPtecRhData] = useState<any[]>([]);
  const [ptecTrpData, setPtecTrpData] = useState<any[]>([]);

  const canViewPtecCom = roles.includes("admin") || roles.includes("ptec_com");
  const canViewPtecMb = roles.includes("admin") || roles.includes("ptec_mb");
  const canViewPtecSau = roles.includes("admin") || roles.includes("ptec_sau");
  const canViewPtecRh = roles.includes("admin") || roles.includes("ptec_rh");
  const canViewPtecTrp = roles.includes("admin") || roles.includes("ptec_trp");

  useEffect(() => {
    if (canViewPtecCom) fetchPtecCom();
    if (canViewPtecMb) fetchPtecMb();
    if (canViewPtecSau) {
      fetchPtecSau();
      fetchPtecSauProntuarios();
    }
    if (canViewPtecRh) fetchPtecRh();
    if (canViewPtecTrp) fetchPtecTrp();
  }, [roles]);

  const fetchPtecCom = async () => {
    const { data } = await supabase
      .from("ptec_com_os")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setPtecComData(data || []);
  };

  const fetchPtecMb = async () => {
    const { data } = await supabase
      .from("ptec_mb_os")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setPtecMbData(data || []);
  };

  const fetchPtecSau = async () => {
    const { data } = await supabase
      .from("ptec_sau_pms")
      .select("*")
      .order("data", { ascending: false })
      .limit(10);
    setPtecSauData(data || []);
  };

  const fetchPtecSauProntuarios = async () => {
    const { data } = await supabase
      .from("ptec_sau_prontuarios")
      .select("*")
      .order("data", { ascending: false })
      .limit(10);
    setPtecSauProntuarios(data || []);
  };

  const fetchPtecRh = async () => {
    const { data } = await supabase
      .from("ptec_rh_ocorrencias")
      .select("*")
      .order("data", { ascending: false })
      .limit(5);
    setPtecRhData(data || []);
  };

  const fetchPtecTrp = async () => {
    const { data } = await supabase
      .from("ptec_trp_transportes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setPtecTrpData(data || []);
  };

  const stats = [
    {
      title: "Módulos Ativos",
      value: roles.length.toString(),
      icon: "ri-apps-line",
    },
    {
      title: "Usuário",
      value: user?.email?.split("@")[0] || "N/A",
      icon: "ri-user-line",
    },
    {
      title: "Permissões",
      value: roles.includes("admin") ? "Admin" : "Operador",
      icon: "ri-shield-check-line",
    },
    {
      title: "Status",
      value: "Ativo",
      icon: "ri-checkbox-circle-line",
    },
  ];

  // Gráficos Ptec Com
  const marcasDataCom = ptecComData.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.marca);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.marca || "N/A", value: 1 });
    }
    return acc;
  }, []);

  // Gráficos Ptec MB
  const combustivelPorOM = ptecMbData.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_apoiada);
    if (existing) {
      existing.value += parseFloat(item.quantidade_classe_iii || 0);
    } else {
      acc.push({
        name: item.om_apoiada,
        value: parseFloat(item.quantidade_classe_iii || 0),
      });
    }
    return acc;
  }, []);

  // Gráficos Ptec Sau
  const atividadesDataSau = ptecSauData.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.atividade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.atividade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const gravidadeDataSau = ptecSauProntuarios.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.nivel_gravidade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.nivel_gravidade, value: 1 });
    }
    return acc;
  }, []);

  // Gráficos Ptec RH
  const corposPorDia = ptecRhData.map((item) => ({
    data: format(new Date(item.data), "dd/MM"),
    quantidade: item.quantidade_corpos,
  }));

  // Gráficos Ptec Trp
  const destinosData = ptecTrpData.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.destino);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.destino || "N/A", value: 1 });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Sistema ELO - Exercício de Campo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* AI Analysis Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Análise Inteligente com IA</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Gere relatórios personalizados e insights acionáveis a partir dos dados operacionais dos Ptecs
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Análise de tendências</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Identificação de gargalos</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Recomendações práticas</span>
              </div>
            </div>
            <Button onClick={() => navigate('/relatorios-ia')} className="gradient-primary text-white">
              <Brain className="h-4 w-4 mr-2" />
              Gerar Relatório com IA
            </Button>
          </div>
        </div>
      </Card>

      {/* Ptec Com Section */}
      {canViewPtecCom && ptecComData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec Com - Comunicações</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Marcas mais recorrentes
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={marcasDataCom}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A7373" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimas OS
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>OM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptecComData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.numero_os}</TableCell>
                      <TableCell>{item.situacao}</TableCell>
                      <TableCell>{item.om_apoiada}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Ptec MB Section */}
      {canViewPtecMb && ptecMbData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec MB - Material Bélico</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Combustível por OM (Litros)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={combustivelPorOM}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A7373" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimas OS
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Combustível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptecMbData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.numero_os}</TableCell>
                      <TableCell>{item.situacao}</TableCell>
                      <TableCell>{item.quantidade_classe_iii || "-"}L</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Ptec Sau Section */}
      {canViewPtecSau && ptecSauData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec Sau - Saúde (PMS)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                PMS por Atividade
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={atividadesDataSau}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A7373" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimos PMS
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº PMS</TableHead>
                    <TableHead>OM</TableHead>
                    <TableHead>Atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptecSauData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.numero_pms}</TableCell>
                      <TableCell>{item.om_responsavel}</TableCell>
                      <TableCell>{item.atividade || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Ptec Sau Prontuários Section */}
      {canViewPtecSau && ptecSauProntuarios.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec Sau - Prontuários</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Prontuários por Nível de Gravidade
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gravidadeDataSau}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A7373" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimos Prontuários
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptecSauProntuarios.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.idade}</TableCell>
                      <TableCell>{item.nivel_gravidade}</TableCell>
                      <TableCell>{item.situacao_atual}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Ptec RH Section */}
      {canViewPtecRh && ptecRhData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec RH - Recursos Humanos</h2>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Ocorrências Mortuárias
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={corposPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#0A7373" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Ptec Trp Section */}
      {canViewPtecTrp && ptecTrpData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ptec Trp - Transporte</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Destinos mais recorrentes
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={destinosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {destinosData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimos Transportes
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Motorista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptecTrpData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.placa_vtr}</TableCell>
                      <TableCell>{item.destino}</TableCell>
                      <TableCell>{item.motorista}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

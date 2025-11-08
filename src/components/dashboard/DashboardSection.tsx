import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleData } from "@/hooks/useDashboardData";
import { ChartCard } from "./ChartCard";
import { DataTable } from "./DataTable";
import { CiaSauCharts } from "./CiaSauCharts";

interface DashboardSectionProps {
  module: ModuleData;
}

export const DashboardSection = ({ module }: DashboardSectionProps) => {
  // Calcular estatísticas específicas para Cia Sau
  const getCiaSauStats = () => {
    if (module.id !== 'cia_sau' && module.id !== 'ptec_sau') {
      return null;
    }
    
    const prontuarios = module.data.filter((item: any) => item.nivel_gravidade);
    const pms = module.data.filter((item: any) => item.tipo_pm || item.numero_pms);
    
    const foraDeCombate = prontuarios.filter(
      (item: any) => item.situacao_atual && item.situacao_atual !== 'Retorno ao combate'
    ).length;
    const retornoAoCombate = prontuarios.filter(
      (item: any) => item.situacao_atual === 'Retorno ao combate'
    ).length;
    
    return { totalPM: pms.length, foraDeCombate, retornoAoCombate };
  };

  // Calcular estatísticas específicas para Cia Trp, Cia Sup e COL
  const getLogisticStats = () => {
    if (module.id !== 'cia_trp' && module.id !== 'cia_sup' && module.id !== 'col') {
      return null;
    }
    
    const total = module.data.length;
    const entregues = module.data.filter(
      (item: any) => item.situacao === 'Entregue' || item.situacao === 'Entregue'
    ).length;
    const pendentes = module.data.filter(
      (item: any) => item.situacao !== 'Entregue' && item.situacao !== 'Cancelado'
    ).length;
    
    return { total, entregues, pendentes };
  };

  const ciaSauStats = getCiaSauStats();
  const logisticStats = getLogisticStats();

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <Card className={`bg-gradient-to-r ${module.color}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-2xl">{module.icon}</span>
            {module.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ciaSauStats ? (
            <div className="grid grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{ciaSauStats.totalPM}</div>
                <div className="text-sm opacity-90">Total de PM Aberto</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{ciaSauStats.foraDeCombate}</div>
                <div className="text-sm opacity-90">Fora de Combate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{ciaSauStats.retornoAoCombate}</div>
                <div className="text-sm opacity-90">Retorno ao Combate</div>
              </div>
            </div>
          ) : logisticStats ? (
            <div className="grid grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{logisticStats.total}</div>
                <div className="text-sm opacity-90">Total de Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{logisticStats.entregues}</div>
                <div className="text-sm opacity-90">Entregues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{logisticStats.pendentes}</div>
                <div className="text-sm opacity-90">Pendentes</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{module.stats.total}</div>
                <div className="text-sm opacity-90">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{module.stats.concluidas}</div>
                <div className="text-sm opacity-90">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{module.stats.pendentes}</div>
                <div className="text-sm opacity-90">Pendentes</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos */}
      {module.id === 'cia_sau' || module.id === 'ptec_sau' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChartCard module={module} chartType="bar" />
          <ChartCard module={module} chartType="pie" />
          <CiaSauCharts module={module} />
        </div>
      ) : module.id === 'cia_rh' || module.id === 'ptec_rh' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChartCard module={module} chartType="bar" />
          <ChartCard module={module} chartType="pie" />
          <ChartCard module={module} chartType="interacao" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard module={module} chartType="bar" />
          <ChartCard module={module} chartType="pie" />
          {(module.id.includes('ptec_') || module.id.includes('oficina_')) && 
           !['oficina_auto', 'oficina_blind', 'oficina_op'].includes(module.id) && (
            <>
              <ChartCard module={module} chartType="sistema" />
              <ChartCard module={module} chartType="mem" />
            </>
          )}
        </div>
      )}

      {/* Tabelas de dados recentes */}
      {module.id === 'cia_sau' || module.id === 'ptec_sau' ? (
        <div className="space-y-4">
          <DataTable 
            module={{
              ...module,
              name: 'Registros de Prontuários',
              data: module.data.filter((item: any) => item.nivel_gravidade)
            }} 
          />
          <DataTable 
            module={{
              ...module,
              name: 'Registros de PMS',
              data: module.data.filter((item: any) => item.tipo_pm || item.numero_pms)
            }} 
          />
        </div>
      ) : (
        <DataTable module={module} />
      )}
    </div>
  );
};

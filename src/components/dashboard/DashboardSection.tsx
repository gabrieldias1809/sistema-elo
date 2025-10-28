import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleData } from "@/hooks/useDashboardData";
import { ChartCard } from "./ChartCard";
import { DataTable } from "./DataTable";
import { CiaSauCharts } from "./CiaSauCharts";

interface DashboardSectionProps {
  module: ModuleData;
}

export const DashboardSection = ({ module }: DashboardSectionProps) => {
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
        </CardContent>
      </Card>

      {/* Gráficos */}
      {module.id === 'cia_sau' || module.id === 'ptec_sau' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChartCard module={module} chartType="bar" />
          <ChartCard module={module} chartType="pie" />
          <CiaSauCharts module={module} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard module={module} chartType="bar" />
          <ChartCard module={module} chartType="pie" />
          {(module.id.includes('ptec_') || module.id.includes('oficina_')) && (
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

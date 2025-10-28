import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ModuleData } from "@/hooks/useDashboardData";

interface ChartCardProps {
  module: ModuleData;
  chartType: 'bar' | 'pie' | 'sistema' | 'mem';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ChartCard = ({ module, chartType }: ChartCardProps) => {
  // Processar dados para gráficos
  const getChartData = () => {
    if (chartType === 'sistema') {
      // Sistemas com mais falhas (PTECs e Oficinas)
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) {
        const sistemaCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.sistema || 'Não especificado';
          sistemaCount[key] = (sistemaCount[key] || 0) + 1;
        });
        return Object.entries(sistemaCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
      }
      return [];
    } else if (chartType === 'mem') {
      // MEM com mais recorrência (PTECs e Oficinas)
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) {
        const memCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.mem || 'Sem MEM';
          memCount[key] = (memCount[key] || 0) + 1;
        });
        return Object.entries(memCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
      }
      return [];
    } else if (chartType === 'bar') {
      // Gráficos específicos por módulo
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) {
        // Para PTECs e Oficinas: Marcas mais recorrentes
        const marcaCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.marca || 'Sem Marca';
          marcaCount[key] = (marcaCount[key] || 0) + 1;
        });
        return Object.entries(marcaCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_rh') {
        // Causas mais recorrentes
        const causaCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.causa_provavel || 'Não especificado';
          causaCount[key] = (causaCount[key] || 0) + 1;
        });
        return Object.entries(causaCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_sau') {
        // Prontuários por dia
        const prontuarios = module.data.filter((item: any) => item.nivel_gravidade);
        const daysCount: Record<string, number> = {};
        prontuarios.forEach((item: any) => {
          const date = new Date(item.data || item.created_at);
          const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          daysCount[key] = (daysCount[key] || 0) + 1;
        });
        return Object.entries(daysCount)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-7)
          .map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_trp') {
        // Recorrência de destinos
        const destinoCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.destino || 'Não especificado';
          destinoCount[key] = (destinoCount[key] || 0) + 1;
        });
        return Object.entries(destinoCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_sup' || module.id === 'col') {
        // Materiais mais pedidos
        const materialCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          if (item.materiais && Array.isArray(item.materiais)) {
            item.materiais.forEach((m: any) => {
              const key = m.material || 'Não especificado';
              materialCount[key] = (materialCount[key] || 0) + (m.quantidade || 1);
            });
          }
        });
        return Object.entries(materialCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));
      } else {
        // Default: situação ou status
        const situacaoCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.situacao || item.status || 'Sem Status';
          situacaoCount[key] = (situacaoCount[key] || 0) + 1;
        });
        return Object.entries(situacaoCount).map(([name, value]) => ({ name, value }));
      }
    } else {
      // Gráfico de pizza
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) {
        // Para PTECs e Oficinas: OMs mais recorrentes
        const omCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.om_apoiada || 'Não especificado';
          omCount[key] = (omCount[key] || 0) + 1;
        });
        return Object.entries(omCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_sau') {
        // Distribuição por gravidade
        const prontuarios = module.data.filter((item: any) => item.nivel_gravidade);
        const gravidadeCount: Record<string, number> = {};
        prontuarios.forEach((item: any) => {
          const key = item.nivel_gravidade || 'Não especificado';
          gravidadeCount[key] = (gravidadeCount[key] || 0) + 1;
        });
        return Object.entries(gravidadeCount).map(([name, value]) => ({ name, value }));
      } else if (module.id === 'cia_sup' || module.id === 'col') {
        // Destinos mais recorrentes
        const destinoCount: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.destino || 'Não especificado';
          destinoCount[key] = (destinoCount[key] || 0) + 1;
        });
        return Object.entries(destinoCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }));
      } else {
        // Default: distribuição por OM ou destino
        const distribution: Record<string, number> = {};
        module.data.forEach((item: any) => {
          const key = item.om_apoiada || item.destino || item.local || 'Outros';
          distribution[key] = (distribution[key] || 0) + 1;
        });
        return Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }));
      }
    }
  };

  const chartData = getChartData();
  
  // Títulos específicos por módulo
  const getTitle = () => {
    if (chartType === 'sistema') {
      return 'Sistemas com Mais Falhas';
    } else if (chartType === 'mem') {
      return 'MEM com Mais Recorrência';
    } else if (chartType === 'bar') {
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) return 'Marcas Mais Recorrentes';
      if (module.id === 'cia_rh') return 'Causas Mais Recorrentes';
      if (module.id === 'cia_sau') return 'Situação de Militares por Dia';
      if (module.id === 'cia_trp') return 'Destinos Mais Recorrentes';
      if (module.id === 'cia_sup' || module.id === 'col') return 'Materiais Mais Pedidos';
      return 'Por Situação';
    } else {
      if (module.id.includes('ptec_') || module.id.includes('oficina_')) return 'OMs Mais Recorrentes';
      if (module.id === 'cia_sau') return 'Distribuição por Gravidade';
      if (module.id === 'cia_sup' || module.id === 'col') return 'Destinos Mais Recorrentes';
      return 'Por Distribuição';
    }
  };
  
  const title = getTitle();

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Quantidade",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[200px]"
        >
          {chartType === 'bar' || chartType === 'sistema' || chartType === 'mem' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

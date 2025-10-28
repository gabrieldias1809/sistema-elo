import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ModuleData } from "@/hooks/useDashboardData";

interface ChartCardProps {
  module: ModuleData;
  chartType: 'bar' | 'pie';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ChartCard = ({ module, chartType }: ChartCardProps) => {
  // Processar dados para gráficos
  const getChartData = () => {
    if (chartType === 'bar') {
      // Gráfico de barras: situação ou status
      const situacaoCount: Record<string, number> = {};
      module.data.forEach((item: any) => {
        const key = item.situacao || item.status || 'Sem Status';
        situacaoCount[key] = (situacaoCount[key] || 0) + 1;
      });
      
      return Object.entries(situacaoCount).map(([name, value]) => ({
        name,
        value
      }));
    } else {
      // Gráfico de pizza: distribuição por OM ou destino
      const distribution: Record<string, number> = {};
      module.data.forEach((item: any) => {
        const key = item.om_apoiada || item.destino || item.local || 'Outros';
        distribution[key] = (distribution[key] || 0) + 1;
      });
      
      return Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({
          name,
          value
        }));
    }
  };

  const chartData = getChartData();
  const title = chartType === 'bar' ? 'Por Situação' : 'Por Distribuição';

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
          {chartType === 'bar' ? (
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

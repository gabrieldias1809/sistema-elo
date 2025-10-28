import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { ModuleData } from "@/hooks/useDashboardData";

interface CiaSauChartsProps {
  module: ModuleData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const CiaSauCharts = ({ module }: CiaSauChartsProps) => {
  // Separar prontuários e PMS
  const prontuarios = module.data.filter((item: any) => item.nivel_gravidade);
  const pms = module.data.filter((item: any) => item.tipo_pm || item.numero_pms);

  // Gráfico 1: Total de militares por situação
  const getSituacaoData = () => {
    const situacaoCount: Record<string, number> = {};
    prontuarios.forEach((item: any) => {
      const key = item.situacao_atual || 'Não especificado';
      situacaoCount[key] = (situacaoCount[key] || 0) + 1;
    });
    return Object.entries(situacaoCount).map(([name, value]) => ({ name, value }));
  };

  const situacaoData = getSituacaoData();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Gráfico já existente: Situação de militares por dia */}
      
      {/* Gráfico novo: Total de militares por situação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total de Militares por Situação</CardTitle>
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
            <PieChart>
              <Pie
                data={situacaoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {situacaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

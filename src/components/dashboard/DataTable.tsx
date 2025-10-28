import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModuleData } from "@/hooks/useDashboardData";
import { format } from "date-fns";

interface DataTableProps {
  module: ModuleData;
}

export const DataTable = ({ module }: DataTableProps) => {
  const recentData = module.data.slice(0, 10);

  if (recentData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Nenhum registro encontrado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determinar colunas baseado no tipo de dados
  const getColumns = () => {
    const firstItem = recentData[0];
    
    if ('numero_os' in firstItem) {
      return ['numero_os', 'om_apoiada', 'situacao', 'created_at'];
    } else if ('numero_pedido' in firstItem) {
      return ['numero_pedido', 'destino', 'situacao', 'created_at'];
    } else if ('placa_vtr' in firstItem) {
      return ['placa_vtr', 'destino', 'motorista', 'created_at'];
    } else if ('nome' in firstItem) {
      return ['nome', 'idade', 'nivel_gravidade', 'created_at'];
    } else {
      return Object.keys(firstItem).slice(0, 4);
    }
  };

  const columns = getColumns();

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-';
    
    if (key.includes('created_at') || key.includes('data')) {
      try {
        return format(new Date(value), 'dd/MM/yyyy HH:mm');
      } catch {
        return value;
      }
    }
    
    return value;
  };

  const formatColumnName = (key: string) => {
    const names: Record<string, string> = {
      numero_os: 'Nº OS',
      numero_pedido: 'Nº Pedido',
      om_apoiada: 'OM',
      situacao: 'Situação',
      status: 'Status',
      destino: 'Destino',
      placa_vtr: 'Placa',
      motorista: 'Motorista',
      nome: 'Nome',
      idade: 'Idade',
      nivel_gravidade: 'Gravidade',
      created_at: 'Data',
    };
    
    return names[key] || key.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Registros Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{formatColumnName(col)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentData.map((row: any, idx: number) => (
              <TableRow key={row.id || idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{formatValue(col, row[col])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

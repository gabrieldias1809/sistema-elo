import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { modulesData, isAdmin } = useDashboardData();

  if (!modulesData || modulesData.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard {isAdmin ? 'Consolidado' : ''}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? 'Visão completa de todos os módulos do sistema'
            : 'Visualização dos dados do seu módulo'
          }
        </p>
      </div>

      {/* Módulos */}
      <div className="space-y-8">
        {modulesData.map((module) => (
          <DashboardSection key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

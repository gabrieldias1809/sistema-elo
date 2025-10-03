import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, roles } = useAuth();

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

      {/* Módulos Disponíveis */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Seus Módulos
        </h2>
        <div className="space-y-3">
          {roles.includes("admin") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-shield-star-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Administrador</p>
                <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
              </div>
            </div>
          )}
          {roles.includes("ptec_com") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-radio-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Ptec Com</p>
                <p className="text-sm text-muted-foreground">Manutenção de Comunicações</p>
              </div>
            </div>
          )}
          {roles.includes("ptec_mb") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-gun-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Ptec MB</p>
                <p className="text-sm text-muted-foreground">Manutenção de Material Bélico</p>
              </div>
            </div>
          )}
          {roles.includes("ptec_sau") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-heart-pulse-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Ptec Sau</p>
                <p className="text-sm text-muted-foreground">Companhia de Saúde</p>
              </div>
            </div>
          )}
          {roles.includes("ptec_rh") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-team-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Ptec RH</p>
                <p className="text-sm text-muted-foreground">Recursos Humanos</p>
              </div>
            </div>
          )}
          {roles.includes("ptec_trp") && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <i className="ri-truck-line text-white"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Ptec Trp</p>
                <p className="text-sm text-muted-foreground">Transporte e Suprimento</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

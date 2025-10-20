import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const { user, loading, hasRole, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const allNavItems = [
    { title: "Dashboard", url: "/", icon: "ri-dashboard-line", role: null },
    { title: "Ptec Com", url: "/ptec-com", icon: "ri-computer-line", role: "ptec_com" as const },
    { title: "Ptec MB", url: "/ptec-mb", icon: "ri-tools-line", role: "ptec_mb" as const },
    { title: "Ptec Sau", url: "/ptec-sau", icon: "ri-heart-pulse-line", role: "ptec_sau" as const },
    { title: "Cia RH", url: "/ptec-rh", icon: "ri-team-line", role: "ptec_rh" as const },
    { title: "Cia Trp", url: "/ptec-trp", icon: "ri-truck-line", role: "ptec_trp" as const },
    { title: "Gerenciar Usuários", url: "/usuarios", icon: "ri-user-settings-line", role: "admin" as const },
  ];

  const navItems = allNavItems.filter((item) => !item.role || hasRole(item.role));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <i className="ri-coins-line text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-foreground font-montserrat">Sistema ELO</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.email?.substring(0, 2).toUpperCase()}</span>
              </div>
              <span className="text-muted-foreground text-sm">{user.email}</span>
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground ml-2" title="Sair">
                <i className="ri-logout-box-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-40">
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  end
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "gradient-primary text-white border border-primary/30"
                        : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
                    }`
                  }
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

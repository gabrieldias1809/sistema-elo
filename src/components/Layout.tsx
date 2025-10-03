import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navItems = [
    { title: "Dashboard", url: "/", icon: "ri-dashboard-line" },
    { title: "Assets", url: "/assets", icon: "ri-coins-line" },
    { title: "Staking Providers", url: "/providers", icon: "ri-building-line" },
    { title: "Staking Calculator", url: "/calculator", icon: "ri-calculator-line" },
    { title: "Active Staking", url: "/active", icon: "ri-pulse-line" },
    { title: "UI Kit", url: "/ui-kit", icon: "ri-palette-line" },
    { title: "Settings", url: "/settings", icon: "ri-settings-line" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <i className="ri-coins-line text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-foreground font-pacifico">
              CryptoStake
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="whitespace-nowrap cursor-pointer font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 gradient-primary hover:gradient-primary-hover text-white shadow-lg hover:shadow-xl px-4 py-2 text-sm">
              <i className="ri-add-line"></i>Deposit
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-muted-foreground text-sm">João Silva</span>
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
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

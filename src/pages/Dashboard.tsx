import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Balance",
      value: "$45,231.89",
      change: "+20.1%",
      icon: "ri-wallet-3-line",
      positive: true,
    },
    {
      title: "Active Stakes",
      value: "12",
      change: "+2",
      icon: "ri-pulse-line",
      positive: true,
    },
    {
      title: "Total Rewards",
      value: "$1,234.56",
      change: "+12.5%",
      icon: "ri-gift-line",
      positive: true,
    },
    {
      title: "APY Average",
      value: "8.5%",
      change: "-0.2%",
      icon: "ri-percent-line",
      positive: false,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your staking overview.
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
              <span
                className={`text-sm font-medium ${
                  stat.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                  <i className="ri-arrow-up-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-foreground">Staking Deposit</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">+1,500 USDT</p>
                <p className="text-sm text-green-500">+12.5% APY</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

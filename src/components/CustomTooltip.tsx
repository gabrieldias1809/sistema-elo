import { TooltipProps } from "recharts";

export const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      {label && (
        <p className="text-foreground font-semibold mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground text-sm">
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

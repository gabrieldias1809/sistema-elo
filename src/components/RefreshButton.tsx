import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const RefreshButton = ({ onClick, isLoading }: RefreshButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 gradient-primary text-white"
      title="Atualizar dados"
    >
      <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-border p-8">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
            <i className="ri-coins-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-pacifico">
            Sistema ELO
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted border-border text-foreground"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted border-border text-foreground"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Usuários: admin, ptec_com, ptec_mb, ptec_sau, ptec_rh, ptec_trp
        </p>
      </Card>
    </div>
  );
};

export default Auth;

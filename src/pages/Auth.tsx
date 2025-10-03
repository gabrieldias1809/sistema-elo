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
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignUp && !nomeGuerra)) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, nomeGuerra);

      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso! Você já pode fazer login.");
      setIsSignUp(false);
      setPassword("");
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error("Erro ao fazer login: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/");
    }
    
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
          {isSignUp ? "Criar Conta" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {isSignUp && (
            <div>
              <Label htmlFor="nomeGuerra" className="text-foreground">
                Nome de Guerra
              </Label>
              <Input
                id="nomeGuerra"
                type="text"
                value={nomeGuerra}
                onChange={(e) => setNomeGuerra(e.target.value)}
                className="bg-muted border-border text-foreground"
                placeholder="Seu nome de guerra"
              />
            </div>
          )}

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
            {loading 
              ? (isSignUp ? "Criando conta..." : "Entrando...") 
              : (isSignUp ? "Criar Conta" : "Entrar")
            }
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword("");
              setNomeGuerra("");
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp 
              ? "Já tem uma conta? Fazer login" 
              : "Não tem conta? Criar uma nova"
            }
          </button>
        </div>

        {!isSignUp && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Usuários: admin, ptec_com, ptec_mb, ptec_sau, ptec_rh, ptec_trp
          </p>
        )}
      </Card>
    </div>
  );
};

export default Auth;

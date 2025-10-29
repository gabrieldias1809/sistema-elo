import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import sistemaEloIcon from "@/assets/sistema-elo-icon.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
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
    } else {
      if (!email || !password || !confirmPassword || !nomeGuerra) {
        toast.error("Preencha todos os campos");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }

      setLoading(true);
      const { error } = await signUp(email, password, nomeGuerra);

      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8 gap-4">
          <img 
            src={sistemaEloIcon} 
            alt="Sistema ELO" 
            className="w-20 h-20"
          />
          <h1 className="text-2xl font-bold text-foreground font-montserrat">Sistema ELO</h1>
          <p className="text-sm text-muted-foreground">Gestão Militar Integrada</p>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
          {isLogin ? "Login" : "Criar Conta"}
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
              className="bg-input border-border text-foreground"
              placeholder="seu@email.com"
            />
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="nomeGuerra" className="text-foreground">
                Nome de Guerra
              </Label>
              <Input
                id="nomeGuerra"
                type="text"
                value={nomeGuerra}
                onChange={(e) => setNomeGuerra(e.target.value)}
                className="bg-input border-border text-foreground"
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
              className="bg-input border-border text-foreground"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="••••••••"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-white"
            disabled={loading}
          >
            {loading ? (isLogin ? "Entrando..." : "Criando conta...") : (isLogin ? "Entrar" : "Criar Conta")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setPassword("");
              setConfirmPassword("");
              setNomeGuerra("");
            }}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Fazer login"}
          </button>
        </div>

        {isLogin && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Usuários existentes: admin, ptec_com, ptec_mb, ptec_sau, ptec_rh, ptec_trp
          </p>
        )}
      </Card>
    </div>
  );
};

export default Auth;

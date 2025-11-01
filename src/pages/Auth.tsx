import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import sistemaEloIcon from "@/assets/sistema-elo-icon.png";
import sistemaEloBackground from "@/assets/sistema-elo-background.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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

  if (showLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${sistemaEloBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay with blur for loading screen */}
        <div className="absolute inset-0 backdrop-blur-lg bg-background/70" />

        {/* Loading spinner */}
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${sistemaEloBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/60" />

      <Card className="w-full max-w-md bg-card/30 backdrop-blur-xl border-border/50 p-8 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <img src={sistemaEloIcon} alt="Sistema ELO Icon" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold text-foreground tracking-wider">SISTEMA ELO</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Gestão Militar Integrada</p>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-6 text-center">{isLogin ? "Login" : "Criar Conta"}</h2>

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
              className="bg-muted/50 border-border/50 text-foreground backdrop-blur-sm"
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
                className="bg-muted/50 border-border/50 text-foreground backdrop-blur-sm"
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
              className="bg-muted/50 border-border/50 text-foreground backdrop-blur-sm"
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
                className="bg-muted/50 border-border/50 text-foreground backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-white hover:gradient-primary-hover transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLogin ? "Entrando..." : "Criando conta..."}
              </div>
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Auth;

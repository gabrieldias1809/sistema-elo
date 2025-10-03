import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const UIKit = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Login successful!");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">UI Kit</h1>
        <p className="text-muted-foreground mb-4">
          Biblioteca completa de componentes do sistema
        </p>
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <a href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            Dashboard
          </a>
          <i className="ri-arrow-right-s-line text-muted-foreground"></i>
          <a href="/ui-kit" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            Componentes
          </a>
          <i className="ri-arrow-right-s-line text-muted-foreground"></i>
          <span className="text-foreground">UI Kit</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Login Form</h3>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary hover:gradient-primary-hover text-white font-medium shadow-lg">
              Entrar
            </Button>
          </form>
        </Card>

        {/* Buttons */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Buttons</h3>
          <div className="space-y-3">
            <Button className="w-full gradient-primary hover:gradient-primary-hover text-white">
              <i className="ri-star-line mr-2"></i>
              Primary Button
            </Button>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              <i className="ri-heart-line mr-2"></i>
              Outline Button
            </Button>
            <Button variant="secondary" className="w-full">
              <i className="ri-settings-line mr-2"></i>
              Secondary Button
            </Button>
            <Button variant="destructive" className="w-full">
              <i className="ri-delete-bin-line mr-2"></i>
              Destructive Button
            </Button>
          </div>
        </Card>

        {/* Input Fields */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Input Fields</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Text Input</Label>
              <Input placeholder="Enter text..." className="bg-muted border-border text-foreground" />
            </div>
            <div>
              <Label className="text-foreground">Email Input</Label>
              <Input type="email" placeholder="email@example.com" className="bg-muted border-border text-foreground" />
            </div>
            <div>
              <Label className="text-foreground">Password Input</Label>
              <Input type="password" placeholder="••••••••" className="bg-muted border-border text-foreground" />
            </div>
            <div>
              <Label className="text-foreground">Number Input</Label>
              <Input type="number" placeholder="0.00" className="bg-muted border-border text-foreground" />
            </div>
          </div>
        </Card>

        {/* Cards */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cards</h3>
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-primary to-blue-600 p-4 border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="ri-trophy-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Premium Card</p>
                  <p className="text-white font-semibold">Gradient Style</p>
                </div>
              </div>
            </Card>
            <Card className="bg-muted border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Standard Card</p>
                  <p className="text-foreground font-semibold">Default Style</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UIKit;

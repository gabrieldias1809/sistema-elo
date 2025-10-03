import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type AppRole = "admin" | "ptec_com" | "ptec_mb" | "ptec_sau" | "ptec_rh" | "ptec_trp";

interface User {
  id: string;
  email: string;
  nome_guerra: string;
  roles: AppRole[];
}

const UserManagement = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const allRoles: AppRole[] = ["admin", "ptec_com", "ptec_mb", "ptec_sau", "ptec_rh", "ptec_trp"];

  const roleLabels: Record<AppRole, string> = {
    admin: "Administrador",
    ptec_com: "Ptec Com",
    ptec_mb: "Ptec MB",
    ptec_sau: "Ptec Saúde",
    ptec_rh: "Ptec RH",
    ptec_trp: "Ptec Transporte"
  };

  useEffect(() => {
    if (!hasRole("admin")) {
      toast.error("Acesso negado: apenas administradores");
      return;
    }
    loadUsers();
  }, [hasRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get all users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: User[] = authUsers.users.map((user) => {
        const profile = profiles?.find((p) => p.id === user.id);
        const roles = userRoles?.filter((r) => r.user_id === user.id).map((r) => r.role as AppRole) || [];
        
        return {
          id: user.id,
          email: user.email || "",
          nome_guerra: profile?.nome_guerra || "",
          roles
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, role: AppRole) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const hasRole = user.roles.includes(role);

    try {
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
        toast.success(`Role ${roleLabels[role]} removida`);
      } else {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (error) throw error;
        toast.success(`Role ${roleLabels[role]} adicionada`);
      }

      // Reload users
      loadUsers();
    } catch (error: any) {
      toast.error("Erro ao atualizar role: " + error.message);
    }
  };

  if (!hasRole("admin")) {
    return (
      <div className="p-8">
        <Card className="p-6 bg-card border-border">
          <p className="text-destructive">Acesso negado. Apenas administradores podem acessar esta página.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <Card className="p-6 bg-card border-border">
          <p className="text-foreground">Carregando usuários...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
        <Button onClick={loadUsers} variant="outline">
          <i className="ri-refresh-line mr-2"></i>
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.nome_guerra || "Sem nome de guerra"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {user.roles.length === 0 ? (
                    <Badge variant="outline">Sem roles</Badge>
                  ) : (
                    user.roles.map((role) => (
                      <Badge key={role} variant="default">
                        {roleLabels[role]}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Atribuir Roles:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${user.id}-${role}`}
                        checked={user.roles.includes(role)}
                        onCheckedChange={() => toggleRole(user.id, role)}
                      />
                      <Label
                        htmlFor={`${user.id}-${role}`}
                        className="text-sm font-normal cursor-pointer text-foreground"
                      >
                        {roleLabels[role]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="p-6 bg-card border-border">
          <p className="text-center text-muted-foreground">Nenhum usuário encontrado</p>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;

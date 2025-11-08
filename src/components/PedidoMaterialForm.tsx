import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { useSuggestions } from "@/hooks/useSuggestions";

interface PedidoMaterialFormProps {
  osOptions: Array<{ id: string; numero_os: string }>;
  ptecOrigem: string;
  oficinaDestino: string;
  onSuccess?: () => void;
  tipoPedido?: 'suprimento' | 'complementar';
}

export const PedidoMaterialForm = ({ osOptions, ptecOrigem, oficinaDestino, onSuccess, tipoPedido = 'suprimento' }: PedidoMaterialFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    material: "",
    os_id: "",
    classe_material: "",
    quantidade: "1",
    oficina_destino: oficinaDestino || "",
  });

  const { suggestions: materialSuggestions, loading: loadingMaterial } = useSuggestions({
    table: 'ptec_pedidos_material',
    field: 'material',
    enabled: open
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ptec_pedidos_material").insert([
      {
        material: formData.material,
        os_id: formData.os_id,
        classe_material: formData.classe_material,
        quantidade: parseFloat(formData.quantidade),
        ptec_origem: ptecOrigem,
        oficina_destino: formData.oficina_destino || oficinaDestino,
        status: "Solicitado",
        tipo_pedido: tipoPedido,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast.error("Erro ao criar pedido");
      return;
    }

    toast.success("Pedido criado com sucesso!");
    setOpen(false);
    setFormData({ material: "", os_id: "", classe_material: "", quantidade: "1", oficina_destino: oficinaDestino || "" });
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <i className="ri-shopping-cart-line mr-2"></i>Solicitar Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Material</Label>
            <AutocompleteInput
              value={formData.material}
              onChange={(value) => setFormData({ ...formData, material: value })}
              suggestions={materialSuggestions}
              loading={loadingMaterial}
              placeholder="Digite o nome do material"
              required
            />
          </div>
          <div>
            <Label>Ordem de Serviço</Label>
            <Select
              value={formData.os_id}
              onValueChange={(value) => setFormData({ ...formData, os_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a OS" />
              </SelectTrigger>
              <SelectContent>
                {osOptions.map((os) => (
                  <SelectItem key={os.id} value={os.id}>
                    OS {os.numero_os}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Classe de Material</Label>
            <Select
              value={formData.classe_material}
              onValueChange={(value) => setFormData({ ...formData, classe_material: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Classe I</SelectItem>
                <SelectItem value="II">Classe II</SelectItem>
                <SelectItem value="III">Classe III</SelectItem>
                <SelectItem value="IV">Classe IV</SelectItem>
                <SelectItem value="V">Classe V</SelectItem>
                <SelectItem value="VI">Classe VI</SelectItem>
                <SelectItem value="VII">Classe VII</SelectItem>
                <SelectItem value="VIII">Classe VIII</SelectItem>
                <SelectItem value="IX">Classe IX</SelectItem>
                <SelectItem value="X">Classe X</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              required
            />
          </div>
          {!oficinaDestino && (
            <div>
              <Label>Oficina Destino</Label>
              <Select
                value={formData.oficina_destino}
                onValueChange={(value) => setFormData({ ...formData, oficina_destino: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a oficina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="com">COM</SelectItem>
                  <SelectItem value="auto">AUTO</SelectItem>
                  <SelectItem value="blind">BLIND</SelectItem>
                  <SelectItem value="op">OP</SelectItem>
                  <SelectItem value="armto">ARMTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full gradient-primary text-white">
            Criar Pedido
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
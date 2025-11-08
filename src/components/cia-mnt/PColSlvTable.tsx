import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Printer } from "lucide-react";
import { DateTimePicker } from "@/components/DateTimePicker";
import jsPDF from "jspdf";

interface Registro {
  id: string;
  numero_registro: string;
  situacao_problema: string;
  material_empregado?: string;
  viatura: string;
  numero_viatura?: string;
  origem: string;
  militares_necessarios?: string;
  data_hora_inicio?: string;
  data_hora_fim?: string;
  observacoes?: string;
  created_at: string;
}

export function PColSlvTable() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    numero_registro: "",
    situacao_problema: "",
    material_empregado: "",
    viatura: "",
    numero_viatura: "",
    origem: "",
    militares_necessarios: "",
    data_hora_inicio: "",
    data_hora_fim: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("p_col_slv_registros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistros(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar registros: " + error.message);
    }
  };

  const getNextNumeroRegistro = async () => {
    try {
      const { data, error } = await supabase
        .from("p_col_slv_registros")
        .select("numero_registro")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "001";
      }

      const lastNumber = parseInt(data[0].numero_registro);
      const nextNumber = lastNumber + 1;
      return nextNumber.toString().padStart(3, "0");
    } catch (error) {
      return "001";
    }
  };

  const handleOpenDialog = async (registro?: Registro) => {
    if (registro) {
      setIsEditing(true);
      setSelectedRegistro(registro);
      setFormData({
        numero_registro: registro.numero_registro,
        situacao_problema: registro.situacao_problema,
        material_empregado: registro.material_empregado || "",
        viatura: registro.viatura,
        numero_viatura: registro.numero_viatura || "",
        origem: registro.origem,
        militares_necessarios: registro.militares_necessarios || "",
        data_hora_inicio: registro.data_hora_inicio || "",
        data_hora_fim: registro.data_hora_fim || "",
        observacoes: registro.observacoes || "",
      });
    } else {
      setIsEditing(false);
      setSelectedRegistro(null);
      const nextNumber = await getNextNumeroRegistro();
      setFormData({
        numero_registro: nextNumber,
        situacao_problema: "",
        material_empregado: "",
        viatura: "",
        numero_viatura: "",
        origem: "",
        militares_necessarios: "",
        data_hora_inicio: "",
        data_hora_fim: "",
        observacoes: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.situacao_problema || !formData.viatura || !formData.origem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      const registroData = {
        numero_registro: formData.numero_registro,
        situacao_problema: formData.situacao_problema,
        material_empregado: formData.material_empregado || null,
        viatura: formData.viatura,
        numero_viatura: formData.numero_viatura || null,
        origem: formData.origem,
        militares_necessarios: formData.militares_necessarios || null,
        data_hora_inicio: formData.data_hora_inicio || null,
        data_hora_fim: formData.data_hora_fim || null,
        observacoes: formData.observacoes || null,
        created_by: userData.user?.id,
      };

      if (isEditing && selectedRegistro) {
        const { error } = await supabase
          .from("p_col_slv_registros")
          .update(registroData)
          .eq("id", selectedRegistro.id);

        if (error) throw error;
        toast.success("Registro atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("p_col_slv_registros")
          .insert([registroData]);

        if (error) throw error;
        toast.success("Registro criado com sucesso!");
      }

      setOpen(false);
      fetchRegistros();
    } catch (error: any) {
      toast.error("Erro ao salvar registro: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      const { error } = await supabase
        .from("p_col_slv_registros")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Registro excluído com sucesso!");
      fetchRegistros();
    } catch (error: any) {
      toast.error("Erro ao excluir registro: " + error.message);
    }
  };

  const handlePrint = (registro: Registro) => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("REGISTRO DE SALVAMENTO - P Col Slv", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    let y = 40;
    
    doc.text(`Nº Registro: ${registro.numero_registro}`, 20, y);
    y += 10;
    doc.text(`Situação Problema: ${registro.situacao_problema}`, 20, y);
    y += 10;
    doc.text(`Viatura: ${registro.viatura}`, 20, y);
    y += 10;
    
    if (registro.numero_viatura) {
      doc.text(`Nº Viatura: ${registro.numero_viatura}`, 20, y);
      y += 10;
    }
    
    doc.text(`Origem: ${registro.origem}`, 20, y);
    y += 10;
    
    if (registro.material_empregado) {
      doc.text(`Material Empregado: ${registro.material_empregado}`, 20, y);
      y += 10;
    }
    
    if (registro.militares_necessarios) {
      doc.text(`Militares Necessários: ${registro.militares_necessarios}`, 20, y);
      y += 10;
    }
    
    if (registro.data_hora_inicio) {
      doc.text(`Data/Hora Início: ${new Date(registro.data_hora_inicio).toLocaleString('pt-BR')}`, 20, y);
      y += 10;
    }
    
    if (registro.data_hora_fim) {
      doc.text(`Data/Hora Fim: ${new Date(registro.data_hora_fim).toLocaleString('pt-BR')}`, 20, y);
      y += 10;
    }
    
    if (registro.observacoes) {
      y += 5;
      doc.text("Observações:", 20, y);
      y += 7;
      const splitObs = doc.splitTextToSize(registro.observacoes, 170);
      doc.text(splitObs, 20, y);
    }
    
    doc.save(`registro_salvamento_${registro.numero_registro}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">P Col Slv - Registros de Salvamento</h2>
          <p className="text-muted-foreground">Gerenciamento de registros de salvamento</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <i className="ri-add-line"></i>
          Novo Registro
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Registro</TableHead>
              <TableHead>Situação Problema</TableHead>
              <TableHead>Viatura</TableHead>
              <TableHead>Nº Viatura</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell className="font-medium">{registro.numero_registro}</TableCell>
                <TableCell>{registro.situacao_problema}</TableCell>
                <TableCell>{registro.viatura}</TableCell>
                <TableCell>{registro.numero_viatura || "-"}</TableCell>
                <TableCell>{registro.origem}</TableCell>
                <TableCell>
                  {registro.data_hora_inicio
                    ? new Date(registro.data_hora_inicio).toLocaleString('pt-BR')
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRegistro(registro);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(registro)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrint(registro)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(registro.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Registro" : "Novo Registro de Salvamento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_registro">Nº Registro *</Label>
                <Input
                  id="numero_registro"
                  value={formData.numero_registro}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="numero_viatura">Nº Viatura</Label>
                <Input
                  id="numero_viatura"
                  value={formData.numero_viatura}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_viatura: e.target.value })
                  }
                  placeholder="Ex: 01-2580"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="viatura">Viatura *</Label>
              <Input
                id="viatura"
                value={formData.viatura}
                onChange={(e) =>
                  setFormData({ ...formData, viatura: e.target.value })
                }
                placeholder="Nome da viatura salvada"
                required
              />
            </div>

            <div>
              <Label htmlFor="situacao_problema">Situação Problema *</Label>
              <Textarea
                id="situacao_problema"
                value={formData.situacao_problema}
                onChange={(e) =>
                  setFormData({ ...formData, situacao_problema: e.target.value })
                }
                placeholder="Descreva a situação problema"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origem">Origem *</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) =>
                    setFormData({ ...formData, origem: e.target.value })
                  }
                  placeholder="Origem da solicitação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="militares_necessarios">Militares Necessários</Label>
                <Input
                  id="militares_necessarios"
                  value={formData.militares_necessarios}
                  onChange={(e) =>
                    setFormData({ ...formData, militares_necessarios: e.target.value })
                  }
                  placeholder="Quantidade ou nomes"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="material_empregado">Material Empregado</Label>
              <Textarea
                id="material_empregado"
                value={formData.material_empregado}
                onChange={(e) =>
                  setFormData({ ...formData, material_empregado: e.target.value })
                }
                placeholder="Descreva o material empregado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data/Hora Início</Label>
                <DateTimePicker
                  value={formData.data_hora_inicio}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      data_hora_inicio: value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Data/Hora Fim</Label>
                <DateTimePicker
                  value={formData.data_hora_fim}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      data_hora_fim: value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Criar"} Registro
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Registro</DialogTitle>
          </DialogHeader>
          {selectedRegistro && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nº Registro</Label>
                  <p className="font-medium">{selectedRegistro.numero_registro}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Viatura</Label>
                  <p className="font-medium">{selectedRegistro.viatura}</p>
                </div>
              </div>
              {selectedRegistro.numero_viatura && (
                <div>
                  <Label className="text-muted-foreground">Nº Viatura</Label>
                  <p className="font-medium">{selectedRegistro.numero_viatura}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Situação Problema</Label>
                <p className="font-medium">{selectedRegistro.situacao_problema}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Origem</Label>
                  <p className="font-medium">{selectedRegistro.origem}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Militares Necessários</Label>
                  <p className="font-medium">{selectedRegistro.militares_necessarios || "-"}</p>
                </div>
              </div>
              {selectedRegistro.material_empregado && (
                <div>
                  <Label className="text-muted-foreground">Material Empregado</Label>
                  <p className="font-medium">{selectedRegistro.material_empregado}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data/Hora Início</Label>
                  <p className="font-medium">
                    {selectedRegistro.data_hora_inicio
                      ? new Date(selectedRegistro.data_hora_inicio).toLocaleString('pt-BR')
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data/Hora Fim</Label>
                  <p className="font-medium">
                    {selectedRegistro.data_hora_fim
                      ? new Date(selectedRegistro.data_hora_fim).toLocaleString('pt-BR')
                      : "-"}
                  </p>
                </div>
              </div>
              {selectedRegistro.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="font-medium">{selectedRegistro.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

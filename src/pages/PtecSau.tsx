import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { DateTimePicker } from "@/components/DateTimePicker";
import { RefreshButton } from "@/components/RefreshButton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Eye, Edit, Trash2, FileDown } from "lucide-react";
import jsPDF from "jspdf";

const COLORS = ["#010221", "#0A7373", "#B7BF99", "#EDAA25"];

const PtecSau = () => {
  const [pms, setPms] = useState<any[]>([]);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [prontuarioOpen, setProntuarioOpen] = useState(false);
  const [viewPmOpen, setViewPmOpen] = useState(false);
  const [viewProntuarioOpen, setViewProntuarioOpen] = useState(false);
  const [selectedPm, setSelectedPm] = useState<any>(null);
  const [selectedProntuario, setSelectedProntuario] = useState<any>(null);
  const [editingPm, setEditingPm] = useState<any>(null);
  const [editingProntuario, setEditingProntuario] = useState<any>(null);
  const [deletePmDialogOpen, setDeletePmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pmToDelete, setPmToDelete] = useState<string | null>(null);
  const [prontuarioToDelete, setProntuarioToDelete] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [omSuggestions, setOmSuggestions] = useState<string[]>([]);
  const [atividadeSuggestions, setAtividadeSuggestions] = useState<string[]>([]);
  const [fracaoSuggestions, setFracaoSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    om_responsavel: "",
    numero_pms: "",
    tipo_pm: "PMS",
    atividade: "",
    data: "",
    hora: "",
    fracao: "",
    descricao: "",
    conduta_esperada: "",
    observacoes: "",
    militares_envolvidos: [] as Array<{ posto_graduacao: string; nome_guerra: string }>,
  });

  const [prontuarioData, setProntuarioData] = useState({
    nome: "",
    idade: "",
    nivel_gravidade: "",
    situacao_atual: "",
    data: "",
  });

  useEffect(() => {
    fetchPms();
    fetchProntuarios();
  }, []);

  useEffect(() => {
    if (editingPm) {
      // Formatar data e hora para datetime-local
      let datetimeLocal = "";
      if (editingPm.data) {
        const dateStr = editingPm.data;
        const timeStr = editingPm.hora || "00:00:00";
        datetimeLocal = `${dateStr}T${timeStr.substring(0, 5)}`;
      }
      
      setFormData({
        om_responsavel: editingPm.om_responsavel || "",
        numero_pms: editingPm.numero_pms || "",
        tipo_pm: editingPm.tipo_pm || "PMS",
        atividade: editingPm.atividade || "",
        data: datetimeLocal,
        hora: "",
        fracao: editingPm.fracao || "",
        descricao: editingPm.descricao || "",
        conduta_esperada: editingPm.conduta_esperada || "",
        observacoes: editingPm.observacoes || "",
        militares_envolvidos: editingPm.militares_envolvidos || [],
      });
    } else {
      setFormData({
        om_responsavel: "",
        numero_pms: "",
        tipo_pm: "PMS",
        atividade: "",
        data: "",
        hora: "",
        fracao: "",
        descricao: "",
        conduta_esperada: "",
        observacoes: "",
        militares_envolvidos: [],
      });
    }
  }, [editingPm]);

  useEffect(() => {
    if (editingProntuario) {
      // Formatar data para input type="date" (YYYY-MM-DD)
      let dateFormatted = "";
      if (editingProntuario.data) {
        dateFormatted = editingProntuario.data.split('T')[0];
      }
      
      setProntuarioData({
        nome: editingProntuario.nome || "",
        idade: editingProntuario.idade?.toString() || "",
        nivel_gravidade: editingProntuario.nivel_gravidade || "",
        situacao_atual: editingProntuario.situacao_atual || "",
        data: dateFormatted,
      });
    } else {
      setProntuarioData({
        nome: "",
        idade: "",
        nivel_gravidade: "",
        situacao_atual: "",
        data: "",
      });
    }
  }, [editingProntuario]);

  const fetchPms = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase.from("ptec_sau_pms").select("*").order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados");
      setIsRefreshing(false);
      return;
    }

    setPms(data || []);

    // Extract unique suggestions
    const uniqueOms = [...new Set(data?.map((d) => d.om_responsavel).filter(Boolean))];
    const uniqueAtividades = [...new Set(data?.map((d) => d.atividade).filter(Boolean))];
    const uniqueFracoes = [...new Set(data?.map((d) => d.fracao).filter(Boolean))];

    setOmSuggestions(uniqueOms);
    setAtividadeSuggestions(uniqueAtividades);
    setFracaoSuggestions(uniqueFracoes);
    setIsRefreshing(false);
  };

  const getNextPmNumber = async () => {
    const { data, error } = await supabase
      .from("ptec_sau_pms")
      .select("numero_pms")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return "001";
    }

    const lastNumber = parseInt(data[0].numero_pms) || 0;
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(3, "0");
  };

  useEffect(() => {
    if (open && !editingPm) {
      getNextPmNumber().then((nextNum) => {
        setFormData((prev) => ({ ...prev, numero_pms: nextNum }));
      });
    }
  }, [open, editingPm]);

  const fetchProntuarios = async () => {
    const { data, error } = await supabase.from("ptec_sau_prontuarios").select("*").order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar prontuários");
      return;
    }

    setProntuarios(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Separar data e hora do input datetime-local
    let dataFormatted = "";
    let horaFormatted = "";
    
    if (formData.data) {
      const [datePart, timePart] = formData.data.split('T');
      dataFormatted = datePart; // YYYY-MM-DD
      horaFormatted = timePart ? `${timePart}:00` : "00:00:00"; // HH:MM:SS
    }

    // Capturar o horário local do computador
    const now = new Date();
    const updatedAt = now.toISOString();

    const pmPayload = {
      om_responsavel: formData.om_responsavel,
      numero_pms: formData.numero_pms,
      tipo_pm: formData.tipo_pm,
      atividade: formData.atividade,
      data: dataFormatted,
      hora: horaFormatted,
      fracao: formData.fracao,
      descricao: formData.descricao,
      conduta_esperada: formData.conduta_esperada,
      observacoes: formData.observacoes,
      militares_envolvidos: formData.militares_envolvidos,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: updatedAt,
    };

    if (editingPm) {
      const { error } = await supabase
        .from("ptec_sau_pms")
        .update(pmPayload)
        .eq("id", editingPm.id);

      if (error) {
        toast.error("Erro ao atualizar PM");
        console.error("Erro ao atualizar PM:", error);
        return;
      }

      toast.success("PM atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_sau_pms").insert([pmPayload]);

      if (error) {
        toast.error("Erro ao criar PM");
        console.error("Erro ao criar PM:", error);
        return;
      }

      toast.success("PM criado com sucesso!");
    }

    setOpen(false);
    setEditingPm(null);
    setFormData({
      om_responsavel: "",
      numero_pms: "",
      tipo_pm: "PMS",
      atividade: "",
      data: "",
      hora: "",
      fracao: "",
      descricao: "",
      conduta_esperada: "",
      observacoes: "",
      militares_envolvidos: [],
    });
    fetchPms();
  };

  const handleProntuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capturar o horário local do computador
    const now = new Date();
    const updatedAt = now.toISOString();

    const prontuarioPayload = {
      nome: prontuarioData.nome,
      idade: parseInt(prontuarioData.idade),
      nivel_gravidade: prontuarioData.nivel_gravidade,
      situacao_atual: prontuarioData.situacao_atual,
      data: prontuarioData.data,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: updatedAt,
    };

    if (editingProntuario) {
      const { error } = await supabase
        .from("ptec_sau_prontuarios")
        .update(prontuarioPayload)
        .eq("id", editingProntuario.id);

      if (error) {
        toast.error("Erro ao atualizar prontuário");
        return;
      }

      toast.success("Prontuário atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("ptec_sau_prontuarios").insert([prontuarioPayload]);

      if (error) {
        toast.error("Erro ao criar prontuário");
        return;
      }

      toast.success("Prontuário criado com sucesso!");
    }

    setProntuarioOpen(false);
    setEditingProntuario(null);
    setProntuarioData({
      nome: "",
      idade: "",
      nivel_gravidade: "",
      situacao_atual: "",
      data: "",
    });
    fetchProntuarios();
  };

  const handleEditPm = (pm: any) => {
    setEditingPm(pm);
    setOpen(true);
  };

  const handleEditProntuario = (prontuario: any) => {
    setEditingProntuario(prontuario);
    setProntuarioOpen(true);
  };

  const handleDeletePmClick = (id: string) => {
    setPmToDelete(id);
    setDeletePmDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProntuarioToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePmConfirm = async () => {
    if (!pmToDelete) return;

    const { error } = await supabase.from("ptec_sau_pms").delete().eq("id", pmToDelete);

    if (error) {
      toast.error("Erro ao excluir PM");
      return;
    }

    toast.success("PM excluído com sucesso!");
    setDeletePmDialogOpen(false);
    setPmToDelete(null);
    fetchPms();
  };

  const handleDeleteConfirm = async () => {
    if (!prontuarioToDelete) return;

    const { error } = await supabase.from("ptec_sau_prontuarios").delete().eq("id", prontuarioToDelete);

    if (error) {
      toast.error("Erro ao excluir prontuário");
      return;
    }

    toast.success("Prontuário excluído com sucesso!");
    setDeleteDialogOpen(false);
    setProntuarioToDelete(null);
    fetchProntuarios();
  };

  // Dados para gráficos PMS
  const atividadesData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.atividade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.atividade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const omsData = pms.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.om_responsavel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.om_responsavel || "N/A", value: 1 });
    }
    return acc;
  }, []);

  // Dados para gráficos de prontuários por dia - Stacked Bar Chart
  const situacoesPorDia = prontuarios.reduce((acc: any, item) => {
    const dataFormatada = item.data ? format(new Date(item.data), "dd/MM") : "N/A";

    if (!acc[dataFormatada]) {
      acc[dataFormatada] = {
        data: dataFormatada,
        evacuacao: 0,
        cirurgia: 0,
        obito: 0,
        cti: 0,
        enfermaria: 0,
        retorno: 0,
      };
    }

    switch (item.situacao_atual) {
      case "evacuação":
        acc[dataFormatada].evacuacao++;
        break;
      case "cirurgia":
        acc[dataFormatada].cirurgia++;
        break;
      case "óbito":
        acc[dataFormatada].obito++;
        break;
      case "CTI":
        acc[dataFormatada].cti++;
        break;
      case "enfermaria":
        acc[dataFormatada].enfermaria++;
        break;
      case "retorno ao combate":
        acc[dataFormatada].retorno++;
        break;
    }

    return acc;
  }, {});

  const situacoesData = Object.values(situacoesPorDia);

  const gravidadeData = prontuarios.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.nivel_gravidade);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.nivel_gravidade || "N/A", value: 1 });
    }
    return acc;
  }, []);

  const generatePmPdf = (pm: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("REGISTRO DE PROBLEMA MILITAR", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    let y = 40;
    
    doc.text(`N° PM: ${pm.numero_pms}`, 20, y);
    y += 10;
    doc.text(`Tipo: ${pm.tipo_pm || "PMS"}`, 20, y);
    y += 10;
    doc.text(`OM Responsável: ${pm.om_responsavel}`, 20, y);
    y += 10;
    doc.text(`Atividade: ${pm.atividade || "-"}`, 20, y);
    y += 10;
    
    // Mostrar data e hora separadamente
    const dataHora = pm.data && pm.hora 
      ? `${format(new Date(pm.data), "dd/MM/yyyy")} ${pm.hora.substring(0, 5)}`
      : "-";
    doc.text(`Data/Hora: ${dataHora}`, 20, y);
    y += 10;
    doc.text(`Local: ${pm.local || "-"}`, 20, y);
    y += 10;
    doc.text(`Fração: ${pm.fracao || "-"}`, 20, y);
    y += 15;
    
    // Militares Envolvidos
    if (pm.militares_envolvidos && pm.militares_envolvidos.length > 0) {
      doc.text("Militares Envolvidos:", 20, y);
      y += 8;
      pm.militares_envolvidos.forEach((militar: any) => {
        doc.text(`  ${militar.posto_graduacao} ${militar.nome_guerra}`, 25, y);
        y += 7;
      });
      y += 8;
    }
    
    doc.text("Descrição:", 20, y);
    y += 8;
    const descricaoLines = doc.splitTextToSize(pm.descricao || "-", 170);
    doc.text(descricaoLines, 20, y);
    y += descricaoLines.length * 7 + 10;
    
    doc.text("Conduta Esperada:", 20, y);
    y += 8;
    const condutaLines = doc.splitTextToSize(pm.conduta_esperada || "-", 170);
    doc.text(condutaLines, 20, y);
    y += condutaLines.length * 7 + 10;
    
    doc.text("Observações:", 20, y);
    y += 8;
    const obsLines = doc.splitTextToSize(pm.observacoes || "-", 170);
    doc.text(obsLines, 20, y);
    
    doc.save(`PM_${pm.numero_pms}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  const generateProntuarioPdf = (prontuario: any) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("PRONTUÁRIO MILITAR", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    let y = 40;
    
    doc.text(`Nome do Militar: ${prontuario.nome}`, 20, y);
    y += 10;
    doc.text(`Idade: ${prontuario.idade} anos`, 20, y);
    y += 10;
    doc.text(`Data do Atendimento: ${prontuario.data ? format(new Date(prontuario.data), "dd/MM/yyyy") : "-"}`, 20, y);
    y += 10;
    doc.text(`Nível de Gravidade: ${prontuario.nivel_gravidade}`, 20, y);
    y += 10;
    doc.text(`Situação Atual: ${prontuario.situacao_atual}`, 20, y);
    
    doc.save(`Prontuario_${prontuario.nome.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cia Sau</h1>
          <p className="text-muted-foreground">Companhia de Saúde - PM e Prontuários</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPms}
            title="Atualizar dados"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Dialog
            open={open}
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) {
                setEditingPm(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <i className="ri-add-line mr-2"></i>Novo PM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPm ? "Editar" : "Novo"} Problema Militar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>OM Responsável</Label>
                    <AutocompleteInput
                      value={formData.om_responsavel}
                      onChange={(value) => setFormData({ ...formData, om_responsavel: value })}
                      suggestions={omSuggestions}
                      required
                      className="placeholder:text-transparent"
                    />
                  </div>
                  <div>
                    <Label>N° PM</Label>
                    <Input
                      value={formData.numero_pms}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Tipo de PM</Label>
                    <Select
                      value={formData.tipo_pm}
                      onValueChange={(value) => setFormData({ ...formData, tipo_pm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PMS">PMS</SelectItem>
                        <SelectItem value="PMR">PMR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Atividade</Label>
                    <AutocompleteInput
                      value={formData.atividade}
                      onChange={(value) => setFormData({ ...formData, atividade: value })}
                      suggestions={atividadeSuggestions}
                      className="placeholder:text-transparent"
                    />
                  </div>
                  <div>
                    <Label>Data e Hora</Label>
                    <Input
                      type="datetime-local"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Fração</Label>
                    <AutocompleteInput
                      value={formData.fracao}
                      onChange={(value) => setFormData({ ...formData, fracao: value })}
                      suggestions={fracaoSuggestions}
                      className="placeholder:text-transparent"
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição do PM</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Conduta Esperada no Atendimento</Label>
                  <Textarea
                    value={formData.conduta_esperada}
                    onChange={(e) => setFormData({ ...formData, conduta_esperada: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="placeholder:text-transparent"
                  />
                </div>
                
                {/* Militares Envolvidos */}
                <div className="space-y-2">
                  <Label>Militares Envolvidos</Label>
                  {formData.militares_envolvidos.map((militar, index) => (
                    <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
                      <div>
                        <Input
                          placeholder="Posto/Grad"
                          value={militar.posto_graduacao}
                          onChange={(e) => {
                            const newMilitares = [...formData.militares_envolvidos];
                            newMilitares[index].posto_graduacao = e.target.value;
                            setFormData({ ...formData, militares_envolvidos: newMilitares });
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Nome de Guerra"
                          value={militar.nome_guerra}
                          onChange={(e) => {
                            const newMilitares = [...formData.militares_envolvidos];
                            newMilitares[index].nome_guerra = e.target.value;
                            setFormData({ ...formData, militares_envolvidos: newMilitares });
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newMilitares = formData.militares_envolvidos.filter((_, i) => i !== index);
                          setFormData({ ...formData, militares_envolvidos: newMilitares });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        militares_envolvidos: [
                          ...formData.militares_envolvidos,
                          { posto_graduacao: "", nome_guerra: "" }
                        ]
                      });
                    }}
                  >
                    <i className="ri-add-line mr-2"></i>Adicionar Militar
                  </Button>
                </div>
                
                <Button type="submit" className="w-full gradient-primary text-white">
                  {editingPm ? "Atualizar" : "Criar"} PM
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={prontuarioOpen}
            onOpenChange={(open) => {
              setProntuarioOpen(open);
              if (!open) {
                setEditingProntuario(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <i className="ri-add-line mr-2"></i>Novo Prontuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProntuario ? "Editar" : "Novo"} Prontuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProntuarioSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome do Militar</Label>
                    <Input
                      value={prontuarioData.nome}
                      onChange={(e) => setProntuarioData({ ...prontuarioData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Idade</Label>
                    <Input
                      type="number"
                      value={prontuarioData.idade}
                      onChange={(e) => setProntuarioData({ ...prontuarioData, idade: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Data do Atendimento</Label>
                    <Input
                      type="date"
                      value={prontuarioData.data}
                      onChange={(e) => setProntuarioData({ ...prontuarioData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Nível de Gravidade</Label>
                    <Select
                      value={prontuarioData.nivel_gravidade}
                      onValueChange={(value) => setProntuarioData({ ...prontuarioData, nivel_gravidade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="grave">Grave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Situação Atual</Label>
                    <Select
                      value={prontuarioData.situacao_atual}
                      onValueChange={(value) => setProntuarioData({ ...prontuarioData, situacao_atual: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="óbito">Óbito</SelectItem>
                        <SelectItem value="evacuação">Evacuação</SelectItem>
                        <SelectItem value="CTI">CTI</SelectItem>
                        <SelectItem value="enfermaria">Enfermaria</SelectItem>
                        <SelectItem value="retorno ao combate">Retorno ao Combate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary text-white">
                  {editingProntuario ? "Atualizar" : "Criar"} Prontuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gráficos PM */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Estatísticas de PM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">PM por Atividade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={atividadesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0A7373" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">PM por OM Responsável</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={omsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {omsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Gráficos de Prontuários */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Estatísticas de Atendimentos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Situações de Militares por Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={situacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="evacuacao" stackId="a" fill="#0A7373" name="Evacuações" />
                <Bar dataKey="cirurgia" stackId="a" fill="#B7BF99" name="Cirurgias" />
                <Bar dataKey="obito" stackId="a" fill="#DC2626" name="Óbitos" />
                <Bar dataKey="cti" stackId="a" fill="#EA580C" name="CTI" />
                <Bar dataKey="enfermaria" stackId="a" fill="#EDAA25" name="Enfermaria" />
                <Bar dataKey="retorno" stackId="a" fill="#16A34A" name="Retorno ao Combate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição por Gravidade</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gravidadeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gravidadeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Total de Militares por Situação</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={situacoesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="evacuacao" fill="#0A7373" name="Evacuações" />
                <Bar dataKey="cirurgia" fill="#B7BF99" name="Cirurgias" />
                <Bar dataKey="obito" fill="#DC2626" name="Óbitos" />
                <Bar dataKey="cti" fill="#EA580C" name="CTI" />
                <Bar dataKey="enfermaria" fill="#EDAA25" name="Enfermaria" />
                <Bar dataKey="retorno" fill="#16A34A" name="Retorno ao Combate" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Tabelas */}
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Registros de PM</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° PM</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>OM Responsável</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pms.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.numero_pms}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {item.tipo_pm || "PMS"}
                      </span>
                    </TableCell>
                    <TableCell>{item.om_responsavel}</TableCell>
                    <TableCell>{item.atividade || "-"}</TableCell>
                    <TableCell>
                      {item.data && item.hora 
                        ? `${format(new Date(item.data), "dd/MM/yyyy")} ${item.hora.substring(0, 5)}`
                        : "-"}
                    </TableCell>
                    <TableCell>{item.local || "-"}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {item.updated_at 
                          ? format(new Date(item.updated_at), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPm(item);
                            setViewPmOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPm(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePmClick(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Prontuários de Militares</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Gravidade</TableHead>
                  <TableHead>Situação Atual</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prontuarios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.idade}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.nivel_gravidade === "grave"
                            ? "bg-destructive/20 text-destructive"
                            : item.nivel_gravidade === "moderado"
                              ? "bg-yellow-500/20 text-yellow-700"
                              : "bg-green-500/20 text-green-700"
                        }`}
                      >
                        {item.nivel_gravidade}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.situacao_atual === "óbito"
                            ? "bg-destructive/20 text-destructive"
                            : item.situacao_atual === "CTI"
                              ? "bg-orange-500/20 text-orange-700"
                              : item.situacao_atual === "retorno ao combate"
                                ? "bg-green-500/20 text-green-700"
                                : "bg-blue-500/20 text-blue-700"
                        }`}
                      >
                        {item.situacao_atual}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.data ? format(new Date(item.data), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {item.updated_at 
                          ? format(new Date(item.updated_at), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProntuario(item);
                            setViewProntuarioOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProntuario(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <RefreshButton onClick={fetchPms} isLoading={isRefreshing} />

      {/* Dialog de Visualização de PM */}
      <Dialog open={viewPmOpen} onOpenChange={setViewPmOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do PM N° {selectedPm?.numero_pms}</span>
              {selectedPm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePmPdf(selectedPm)}
                  className="ml-4"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedPm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo de PM</Label>
                  <p className="font-medium">{selectedPm.tipo_pm || "PMS"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">OM Responsável</Label>
                  <p className="font-medium">{selectedPm.om_responsavel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Atividade</Label>
                  <p className="font-medium">{selectedPm.atividade || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data e Hora</Label>
                  <p className="font-medium">
                    {selectedPm.data && selectedPm.hora
                      ? `${format(new Date(selectedPm.data), "dd/MM/yyyy")} ${selectedPm.hora.substring(0, 5)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <p className="font-medium">{selectedPm.local || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fração</Label>
                  <p className="font-medium">{selectedPm.fracao || "-"}</p>
                </div>
              </div>
              {selectedPm.militares_envolvidos && selectedPm.militares_envolvidos.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Militares Envolvidos</Label>
                  <div className="mt-2 space-y-1">
                    {selectedPm.militares_envolvidos.map((militar: any, index: number) => (
                      <p key={index} className="font-medium">
                        {militar.posto_graduacao} {militar.nome_guerra}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.descricao || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Conduta Esperada</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.conduta_esperada || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedPm.observacoes || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Prontuário */}
      <Dialog open={viewProntuarioOpen} onOpenChange={setViewProntuarioOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do Prontuário</span>
              {selectedProntuario && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateProntuarioPdf(selectedProntuario)}
                  className="ml-4"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedProntuario && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Nome do Militar</Label>
                  <p className="font-medium text-lg">{selectedProntuario.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idade</Label>
                  <p className="font-medium">{selectedProntuario.idade} anos</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data do Atendimento</Label>
                  <p className="font-medium">
                    {selectedProntuario.data
                      ? format(new Date(selectedProntuario.data), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nível de Gravidade</Label>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProntuario.nivel_gravidade === "grave"
                          ? "bg-destructive/20 text-destructive"
                          : selectedProntuario.nivel_gravidade === "moderado"
                            ? "bg-yellow-500/20 text-yellow-700"
                            : "bg-green-500/20 text-green-700"
                      }`}
                    >
                      {selectedProntuario.nivel_gravidade}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Situação Atual</Label>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProntuario.situacao_atual === "óbito"
                          ? "bg-destructive/20 text-destructive"
                          : selectedProntuario.situacao_atual === "CTI"
                            ? "bg-orange-500/20 text-orange-700"
                            : selectedProntuario.situacao_atual === "retorno ao combate"
                              ? "bg-green-500/20 text-green-700"
                              : "bg-blue-500/20 text-blue-700"
                      }`}
                    >
                      {selectedProntuario.situacao_atual}
                     </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletePmDialogOpen} onOpenChange={setDeletePmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este PM? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePmConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PtecSau;

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getNextCentralizedOSNumber } from "@/hooks/useCentralizedOSNumber";
import { ConsolidatedOSTable } from "@/components/cia-mnt/ConsolidatedOSTable";
import { PTECOSTable } from "@/components/cia-mnt/PTECOSTable";
import { PColSlvTable } from "@/components/cia-mnt/PColSlvTable";

const CiaMnt = () => {
  const [open, setOpen] = useState(false);
  const [selectedPtec, setSelectedPtec] = useState<string>("");
  const [formData, setFormData] = useState({
    numero_os: "",
    ptec_origem: "",
    situacao: "",
    om_apoiada: "",
    marca: "",
    mem: "",
    sistema: "",
    tipo_manutencao: "",
    registro_numero_material: "",
    servico_solicitado: "",
    data_inicio: "",
    data_fim: "",
    observacoes: "",
    observacoes_material: "",
  });

  const handleOpenDialog = async (ptecOrigem?: string) => {
    try {
      const nextNumber = await getNextCentralizedOSNumber();
      setFormData(prev => ({ 
        ...prev, 
        numero_os: nextNumber,
        ptec_origem: ptecOrigem || ""
      }));
      setOpen(true);
    } catch (error) {
      console.error("Erro ao buscar próximo número de OS:", error);
      toast.error("Erro ao gerar número da OS");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    const missingFields: string[] = [];
    if (!formData.ptec_origem) missingFields.push("PTEC Origem");
    if (!formData.situacao) missingFields.push("Situação");
    if (!formData.om_apoiada) missingFields.push("OM Apoiada");
    
    // Marca não é obrigatória para Armto
    if (formData.ptec_origem !== "armto" && !formData.marca) {
      missingFields.push("Marca");
    }
    
    if (!formData.mem) missingFields.push("MEM");
    if (!formData.tipo_manutencao) missingFields.push("Tipo de PMS");
    if (!formData.servico_solicitado) missingFields.push("Serviço Solicitado");

    // Para PTECs com sistema (Com, Op - mas não Armto), validar sistema
    if (["com", "op"].includes(formData.ptec_origem) && !formData.sistema) {
      missingFields.push("Sistema");
    }

    // Para PTECs com registro_numero_material (Auto, Blind, Armto), validar esse campo
    if (["auto", "blind", "armto"].includes(formData.ptec_origem) && !formData.registro_numero_material) {
      missingFields.push("Registro ou Nº do Material");
    }

    if (missingFields.length > 0) {
      toast.error(`Preencha os seguintes campos: ${missingFields.join(", ")}`);
      return;
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    // Mapear nome da tabela baseado no PTEC
    const tableMap: Record<string, string> = {
      com: "ptec_com_os",
      auto: "ptec_auto_os",
      blind: "ptec_blind_os",
      op: "ptec_op_os",
      armto: "ptec_armto_os",
    };

    const tableName = tableMap[formData.ptec_origem];
    if (!tableName) {
      toast.error("PTEC de origem inválido");
      return;
    }

    // Preparar dados para tabela PTEC (campos comuns a todas)
    let dataToSubmit: any = {
      numero_os: formData.numero_os,
      situacao: formData.situacao,
      om_apoiada: formData.om_apoiada,
      mem: formData.mem,
      servico_solicitado: formData.servico_solicitado,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
      created_by: userId,
    };

    // Adicionar marca apenas se não for Armto
    if (formData.ptec_origem !== "armto" && formData.marca) {
      dataToSubmit.marca = formData.marca;
    }

    // Adicionar sistema apenas para Com e Op (não Armto)
    if (["com", "op"].includes(formData.ptec_origem) && formData.sistema) {
      dataToSubmit.sistema = formData.sistema;
    }
    
    // Adicionar registro_material para Auto, Blind e Armto
    if (["auto", "blind", "armto"].includes(formData.ptec_origem) && formData.registro_numero_material) {
      dataToSubmit.registro_material = formData.registro_numero_material;
    }
    
    // Campo observacoes existe em todas as tabelas PTEC
    dataToSubmit.observacoes = formData.observacoes || formData.observacoes_material || null;

    try {
      // Inserir na tabela específica do PTEC
      const { error: errorPtec } = await supabase.from(tableName as any).insert([dataToSubmit]);

      if (errorPtec) {
        console.error("❌ Erro ao criar OS na tabela PTEC:", errorPtec);
        toast.error("Erro ao criar OS na tabela do PTEC");
        return;
      }

      // Inserir na tabela centralizada
      const centralData = {
        numero_os: formData.numero_os,
        ptec_origem: formData.ptec_origem,
        situacao: formData.situacao,
        om_apoiada: formData.om_apoiada,
        marca: formData.marca,
        mem: formData.mem,
        sistema: formData.sistema || null,
        tipo_manutencao: formData.tipo_manutencao || null,
        servico_solicitado: formData.servico_solicitado,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes || formData.observacoes_material || null,
        created_by: userId,
      };

      const { error: errorCentral } = await supabase.from("cia_mnt_os_centralizadas").insert([centralData]);

      if (errorCentral) {
        console.error("❌ Erro ao criar OS centralizada:", errorCentral);
        toast.error("Erro ao criar OS centralizada");
        return;
      }

      toast.success("OS criada com sucesso!");
      setOpen(false);
      setFormData({
        numero_os: "",
        ptec_origem: "",
        situacao: "",
        om_apoiada: "",
        marca: "",
        mem: "",
        sistema: "",
        tipo_manutencao: "",
        registro_numero_material: "",
        servico_solicitado: "",
        data_inicio: "",
        data_fim: "",
        observacoes: "",
        observacoes_material: "",
      });
    } catch (error) {
      console.error("❌ Erro ao criar OS:", error);
      toast.error("Erro ao criar OS");
    }
  };

  // Determinar quais campos mostrar baseado no PTEC selecionado
  const showSistema = ["com", "op"].includes(formData.ptec_origem);
  const showRegistroMaterial = ["auto", "blind", "armto"].includes(formData.ptec_origem);
  const showMarca = formData.ptec_origem !== "armto";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cia Mnt - Manutenção</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento centralizado de Ordens de Serviço por Posto Técnico</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nº OS</Label>
                  <Input value={formData.numero_os} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>PTEC Origem *</Label>
                  <Select
                    value={formData.ptec_origem}
                    onValueChange={(value) => setFormData({ ...formData, ptec_origem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="com">Ptec Com</SelectItem>
                      <SelectItem value="auto">Ptec Auto</SelectItem>
                      <SelectItem value="blind">Ptec Blind</SelectItem>
                      <SelectItem value="op">Ptec Op</SelectItem>
                      <SelectItem value="armto">Ptec Armto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Situação *</Label>
                  <Select
                    value={formData.situacao}
                    onValueChange={(value) => setFormData({ ...formData, situacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Manutenido">Manutenido</SelectItem>
                      <SelectItem value="Fechada">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>OM Apoiada *</Label>
                  <Input
                    value={formData.om_apoiada}
                    onChange={(e) => setFormData({ ...formData, om_apoiada: e.target.value })}
                    required
                  />
                </div>
                {showMarca && (
                  <div>
                    <Label>Marca *</Label>
                    <Input
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      required={showMarca}
                    />
                  </div>
                )}
                <div>
                  <Label>MEM *</Label>
                  <Input
                    value={formData.mem}
                    onChange={(e) => setFormData({ ...formData, mem: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tipo de PMS *</Label>
                  <Select
                    value={formData.tipo_manutencao}
                    onValueChange={(value) => setFormData({ ...formData, tipo_manutencao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PMS">PMS</SelectItem>
                      <SelectItem value="PMR">PMR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showRegistroMaterial && (
                  <div>
                    <Label>Registro ou Nº do Material *</Label>
                    <Input
                      value={formData.registro_numero_material}
                      onChange={(e) =>
                        setFormData({ ...formData, registro_numero_material: e.target.value })
                      }
                      required={showRegistroMaterial}
                    />
                  </div>
                )}
                {showSistema && (
                  <div>
                    <Label>Sistema *</Label>
                    <Input
                      value={formData.sistema}
                      onChange={(e) => setFormData({ ...formData, sistema: e.target.value })}
                      required={showSistema}
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Data Início</Label>
                  <DateTimePicker
                    value={formData.data_inicio}
                    onChange={(value) => setFormData({ ...formData, data_inicio: value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Data Fim</Label>
                  <DateTimePicker
                    value={formData.data_fim}
                    onChange={(value) => setFormData({ ...formData, data_fim: value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Serviço Solicitado *</Label>
                  <Textarea
                    value={formData.servico_solicitado}
                    onChange={(e) => setFormData({ ...formData, servico_solicitado: e.target.value })}
                    required
                  />
                </div>
                {showRegistroMaterial && (
                  <div className="col-span-2">
                    <Label>Observações do Material</Label>
                    <Textarea
                      value={formData.observacoes_material}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes_material: e.target.value })
                      }
                    />
                  </div>
                )}
                {showSistema && (
                  <div className="col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="gradient-primary text-white">
                  Criar OS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setFormData({
                      numero_os: "",
                      ptec_origem: "",
                      situacao: "",
                      om_apoiada: "",
                      marca: "",
                      mem: "",
                      sistema: "",
                      tipo_manutencao: "",
                      registro_numero_material: "",
                      servico_solicitado: "",
                      data_inicio: "",
                      data_fim: "",
                      observacoes: "",
                      observacoes_material: "",
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      <Tabs defaultValue="consolidado" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="consolidado">
            <i className="ri-dashboard-line mr-2"></i>
            Consolidado
          </TabsTrigger>
          <TabsTrigger value="com">
            <i className="ri-wifi-line mr-2"></i>
            Ptec Com
          </TabsTrigger>
          <TabsTrigger value="auto">
            <i className="ri-car-line mr-2"></i>
            Ptec Auto
          </TabsTrigger>
          <TabsTrigger value="blind">
            <i className="ri-shield-line mr-2"></i>
            Ptec Blind
          </TabsTrigger>
          <TabsTrigger value="op">
            <i className="ri-settings-3-line mr-2"></i>
            Ptec Op
          </TabsTrigger>
          <TabsTrigger value="armto">
            <i className="ri-gun-line mr-2"></i>
            Ptec Armto
          </TabsTrigger>
          <TabsTrigger value="p-col-slv">
            <i className="ri-life-buoy-line mr-2"></i>
            P Col Slv
          </TabsTrigger>
        </TabsList>
        <TabsContent value="consolidado">
          <ConsolidatedOSTable />
        </TabsContent>
        <TabsContent value="com">
          <PTECOSTable ptecOrigem="com" onCreateOS={() => handleOpenDialog("com")} />
        </TabsContent>
        <TabsContent value="auto">
          <PTECOSTable ptecOrigem="auto" onCreateOS={() => handleOpenDialog("auto")} />
        </TabsContent>
        <TabsContent value="blind">
          <PTECOSTable ptecOrigem="blind" onCreateOS={() => handleOpenDialog("blind")} />
        </TabsContent>
        <TabsContent value="op">
          <PTECOSTable ptecOrigem="op" onCreateOS={() => handleOpenDialog("op")} />
        </TabsContent>
        <TabsContent value="armto">
          <PTECOSTable ptecOrigem="armto" onCreateOS={() => handleOpenDialog("armto")} />
        </TabsContent>
        <TabsContent value="p-col-slv">
          <PColSlvTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CiaMnt;

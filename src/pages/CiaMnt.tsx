import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PtecCom from "./PtecCom";
import PtecAuto from "./PtecAuto";
import PtecBlind from "./PtecBlind";
import PtecOp from "./PtecOp";
import PtecArmto from "./PtecArmto";

const CiaMnt = () => {
  const [selectedPtec, setSelectedPtec] = useState<string>("");

  const renderPtecContent = () => {
    switch (selectedPtec) {
      case "com":
        return <PtecCom />;
      case "auto":
        return <PtecAuto />;
      case "blind":
        return <PtecBlind />;
      case "op":
        return <PtecOp />;
      case "armto":
        return <PtecArmto />;
      default:
        return (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <i className="ri-tools-fill text-6xl text-muted-foreground"></i>
              <h3 className="text-xl font-semibold">Selecione um PTEC</h3>
              <p className="text-muted-foreground">
                Escolha um Pelotão Técnico acima para visualizar e gerenciar suas Ordens de Serviço
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cia Mnt</h1>
        <p className="text-muted-foreground">
          Companhia de Manutenção - Supervisão de Pelotões Técnicos
        </p>
      </div>

      {/* PTEC Selector */}
      <Card className="p-6 gradient-primary">
        <div className="max-w-md">
          <Label className="text-white text-base mb-3 block">
            <i className="ri-folder-settings-line mr-2"></i>
            Selecionar PTEC
          </Label>
          <Select value={selectedPtec} onValueChange={setSelectedPtec}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Escolha o Pelotão Técnico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="com">
                <div className="flex items-center gap-2">
                  <i className="ri-radio-line"></i>
                  Ptec Com - Comunicações
                </div>
              </SelectItem>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <i className="ri-car-line"></i>
                  Ptec Auto - Automotiva
                </div>
              </SelectItem>
              <SelectItem value="blind">
                <div className="flex items-center gap-2">
                  <i className="ri-shield-line"></i>
                  Ptec Blind - Blindados
                </div>
              </SelectItem>
              <SelectItem value="op">
                <div className="flex items-center gap-2">
                  <i className="ri-hammer-line"></i>
                  Ptec Op - Optrônicos
                </div>
              </SelectItem>
              <SelectItem value="armto">
                <div className="flex items-center gap-2">
                  <i className="ri-sword-line"></i>
                  Ptec Armto - Armamento
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Content Area */}
      <div>
        {renderPtecContent()}
      </div>
    </div>
  );
};

export default CiaMnt;

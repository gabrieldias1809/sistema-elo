import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PtecCom from "./pages/PtecCom";
import PtecMB from "./pages/PtecMB";
import PtecAuto from "./pages/PtecAuto";
import PtecBlind from "./pages/PtecBlind";
import PtecOp from "./pages/PtecOp";
import PtecArmto from "./pages/PtecArmto";
import OficinaCom from "./pages/OficinaCom";
import OficinaAuto from "./pages/OficinaAuto";
import OficinaBlind from "./pages/OficinaBlind";
import OficinaOp from "./pages/OficinaOp";
import OficinaArmto from "./pages/OficinaArmto";
import PostoDistribuicao from "./pages/PostoDistribuicao";
import PtecSau from "./pages/PtecSau";
import PtecRH from "./pages/PtecRH";
import PtecTrp from "./pages/PtecTrp";
import UserManagement from "./pages/UserManagement";
import Col from "./pages/Col";
import CiaSup from "./pages/CiaSup";
import CiaTrp from "./pages/CiaTrp";
import CiaMnt from "./pages/CiaMnt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="ptec-com" element={<PtecCom />} />
              <Route path="ptec-mb" element={<PtecMB />} />
              <Route path="ptec-auto" element={<PtecAuto />} />
              <Route path="ptec-blind" element={<PtecBlind />} />
              <Route path="ptec-op" element={<PtecOp />} />
              <Route path="ptec-armto" element={<PtecArmto />} />
              <Route path="oficina-com" element={<OficinaCom />} />
              <Route path="oficina-auto" element={<OficinaAuto />} />
              <Route path="oficina-blind" element={<OficinaBlind />} />
              <Route path="oficina-op" element={<OficinaOp />} />
              <Route path="oficina-armto" element={<OficinaArmto />} />
              <Route path="posto-distribuicao" element={<PostoDistribuicao />} />
              <Route path="ptec-sau" element={<PtecSau />} />
              <Route path="ptec-rh" element={<PtecRH />} />
              <Route path="ptec-trp" element={<PtecTrp />} />
              <Route path="col" element={<Col />} />
              <Route path="cia-sup" element={<CiaSup />} />
              <Route path="cia-trp" element={<CiaTrp />} />
              <Route path="cia-mnt" element={<CiaMnt />} />
              <Route path="usuarios" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

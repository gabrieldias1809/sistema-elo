import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import PtecCom from "./pages/PtecCom";
import PtecMB from "./pages/PtecMB";
import PtecSau from "./pages/PtecSau";
import PtecRH from "./pages/PtecRH";
import PtecTrp from "./pages/PtecTrp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/ptec-com" element={<Layout><PtecCom /></Layout>} />
            <Route path="/ptec-mb" element={<Layout><PtecMB /></Layout>} />
            <Route path="/ptec-sau" element={<Layout><PtecSau /></Layout>} />
            <Route path="/ptec-rh" element={<Layout><PtecRH /></Layout>} />
            <Route path="/ptec-trp" element={<Layout><PtecTrp /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

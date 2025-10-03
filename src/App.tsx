import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Providers from "./pages/Providers";
import Calculator from "./pages/Calculator";
import ActiveStaking from "./pages/ActiveStaking";
import UIKit from "./pages/UIKit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/assets" element={<Layout><Assets /></Layout>} />
          <Route path="/providers" element={<Layout><Providers /></Layout>} />
          <Route path="/calculator" element={<Layout><Calculator /></Layout>} />
          <Route path="/active" element={<Layout><ActiveStaking /></Layout>} />
          <Route path="/ui-kit" element={<Layout><UIKit /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Pengaturan from "./pages/Pengaturan";
import DaftarSurat from "./pages/DaftarSurat";
import TambahSurat from "./pages/TambahSurat";
import PreviewSurat from "./pages/PreviewSurat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="/surat/:jenisSlug" element={<DaftarSurat />} />
              <Route path="/surat/:jenisSlug/tambah" element={<TambahSurat />} />
              <Route path="/surat/:jenisSlug/:id/preview" element={<PreviewSurat />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

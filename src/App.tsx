
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import SupabaseInitializer from './components/SupabaseInitializer';

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    // We now have hardcoded fallbacks, so we don't need to check if env vars are set
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zkdglqmguhyyxcmqvwhr.supabase.co";
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZGdscW1ndWh5eXhjbXF2d2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Nzk3MDIsImV4cCI6MjA2MzM1NTcwMn0.9mzbiLC2zOcN5gSLl_4WC1Fh8kCftAF4Eg0f1PbqvbM";
    
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseConfigured(false);
      toast.error(
        "Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
        { duration: 10000, id: "supabase-env-error" }
      );
    }
  }, []);

  return (
    <>
      <SupabaseInitializer />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;

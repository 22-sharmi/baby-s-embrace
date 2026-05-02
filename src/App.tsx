import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole } from "@/context/RoleContext";
import Index from "./pages/Index";
import RoleSelection from "./pages/RoleSelection";
import Timeline from "./pages/Timeline";
import MemoryForm from "./pages/MemoryForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireRole({ children, contributorOnly }: { children: JSX.Element; contributorOnly?: boolean }) {
  const { role, ready } = useRole();
  if (!ready) return null;
  if (!role) return <Navigate to="/welcome" replace />;
  if (contributorOnly && role === "baby") return <Navigate to="/timeline" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<RoleSelection />} />
            <Route
              path="/timeline"
              element={
                <RequireRole>
                  <Timeline />
                </RequireRole>
              }
            />
            <Route
              path="/add"
              element={
                <RequireRole contributorOnly>
                  <MemoryForm />
                </RequireRole>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <RequireRole contributorOnly>
                  <MemoryForm />
                </RequireRole>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

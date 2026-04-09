import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import AdminArticles from "./pages/admin/AdminArticles.tsx";
import AdminActivities from "./pages/admin/AdminActivities.tsx";
import AdminLeaders from "./pages/admin/AdminLeaders.tsx";
import EditArticle from "./pages/admin/EditArticle.tsx";
import EditActivity from "./pages/admin/EditActivity.tsx";
import EditLeader from "./pages/admin/EditLeader.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminArticles />} />
              <Route path="articles/:id" element={<EditArticle />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="activities/:id" element={<EditActivity />} />
              <Route path="leaders" element={<AdminLeaders />} />
              <Route path="leaders/:id" element={<EditLeader />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

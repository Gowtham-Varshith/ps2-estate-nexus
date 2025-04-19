import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LayoutsPage from "./pages/LayoutsPage";
import LayoutDetailPage from "./pages/LayoutDetailPage";
import BillingFormPage from "./pages/BillingFormPage";
import AISearchPage from "./pages/AISearchPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Initialize query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Index />} />
            
            {/* Protected Routes - accessible to all authenticated users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Layout routes */}
            <Route 
              path="/layouts" 
              element={
                <ProtectedRoute>
                  <LayoutsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/layouts/:id" 
              element={
                <ProtectedRoute>
                  <LayoutDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Billing routes */}
            <Route 
              path="/billing/new" 
              element={
                <ProtectedRoute>
                  <BillingFormPage />
                </ProtectedRoute>
              } 
            />
            
            {/* AI Search route */}
            <Route 
              path="/ai-search" 
              element={
                <ProtectedRoute>
                  <AISearchPage />
                </ProtectedRoute>
              } 
            />
            
            {/* TODO: Add routes for other pages as they are created */}
            {/*
            <Route 
              path="/layouts/new" 
              element={
                <ProtectedRoute allowedRoles={["black", "admin"]}>
                  <CreateLayoutPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <BillingTablePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing/:id" 
              element={
                <ProtectedRoute>
                  <BillingDetailPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute>
                  <ExpensesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/expenses/new" 
              element={
                <ProtectedRoute>
                  <CreateExpensePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/clients/:id" 
              element={
                <ProtectedRoute>
                  <ClientDetailPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/ai-search" 
              element={
                <ProtectedRoute>
                  <AISearchPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/backup" 
              element={
                <ProtectedRoute>
                  <BackupPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              } 
            />
            */}
            
            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

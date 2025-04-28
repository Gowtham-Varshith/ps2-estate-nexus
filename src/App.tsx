
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
import CreateLayoutPage from "./pages/CreateLayoutPage";
import BillingFormPage from "./pages/BillingFormPage";
import BillingTablePage from "./pages/BillingTablePage";
import BillingDetailPage from "./pages/BillingDetailPage";
import ExpensesPage from "./pages/ExpensesPage";
import CreateExpensePage from "./pages/CreateExpensePage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import DocumentsPage from "./pages/DocumentsPage";
import AISearchPage from "./pages/AISearchPage";
import BackupPage from "./pages/BackupPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import InfoManagementPage from "./pages/InfoManagementPage";
import InfoDetailPage from "./pages/InfoDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import PlotDetailPage from "./pages/PlotDetailPage";
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
            
            <Route 
              path="/layouts/new" 
              element={
                <ProtectedRoute allowedRoles={["staff", "black", "admin"]}>
                  <CreateLayoutPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Plot routes */}
            <Route 
              path="/plots/:id" 
              element={
                <ProtectedRoute>
                  <PlotDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Billing routes */}
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <BillingTablePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing/new" 
              element={
                <ProtectedRoute>
                  <BillingFormPage />
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
            
            {/* Expense routes */}
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
            
            {/* Info Management routes (replacing Client routes) */}
            <Route 
              path="/info" 
              element={
                <ProtectedRoute>
                  <InfoManagementPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/info/:id" 
              element={
                <ProtectedRoute>
                  <InfoDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* For backward compatibility */}
            <Route 
              path="/clients" 
              element={<Navigate to="/info" replace />} 
            />
            
            <Route 
              path="/clients/:id" 
              element={<Navigate to={location => `/info/${location.pathname.split('/').pop()}`} replace />} 
            />
            
            {/* Document routes */}
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentsPage />
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
            
            {/* Notifications route */}
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings route */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={["black", "admin"]}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Backup route */}
            <Route 
              path="/backup" 
              element={
                <ProtectedRoute>
                  <BackupPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Activity Logs route - Admin only */}
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

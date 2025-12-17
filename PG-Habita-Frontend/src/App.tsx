import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import Layout from "@/components/layout/Layout";

// Importaciones directas
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import Perfil from "@/pages/Perfil";
import RolesPage from "@/pages/RolesPage";
import PermisosPage from "@/pages/PermisosPage";
import SuscripcionesPage from "@/pages/SuscripcionesPage";
import UsuariosPage from "@/pages/UsuariosPage.tsx";
import PropiedadesPage from "@/pages/PropiedadesPage.tsx";
import LandingPage from "@/components/LandingPage.tsx";
import ReservasPage from '@/pages/ReservasPage';
import ReservaModal from '@/components/reservas/ReservaModal';
import PagosPage from '@/pages/PagosPage';
import Register from '@/pages/Register';
import BackupPage from '@/pages/admin/BackupPage';
import ReportesPage from '@/pages/ReportesPage'; // 🔥 NUEVA IMPORTACIÓN
import BitacoraPage from '@/pages/BitacoraPage'; // 🔥 NUEVA IMPORTACIÓN
import CalendarioPage from '@/pages/CalendarioPage'; // 🔥 NUEVA IMPORTACIÓN

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        },
    },
});

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Register />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/calendario" element={<CalendarioPage />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route path="dashboard" element={<Dashboard />} />

                            {/* Nuevas rutas de administración protegidas */}
                            <Route path="admin/roles" element={
                                <AdminRoute>
                                    <RolesPage />
                                </AdminRoute>
                            } />
                            <Route path="admin/permisos" element={
                                <AdminRoute>
                                    <PermisosPage />
                                </AdminRoute>
                            } />
                            <Route path="suscripciones" element={
                                <AdminRoute>
                                    <SuscripcionesPage />
                                </AdminRoute>
                            } />

                            <Route path="admin/usuarios" element={
                                <AdminRoute>
                                    <UsuariosPage />
                                </AdminRoute>
                            } />

                            <Route path="admin/backup" element={
                                <AdminRoute>
                                    <BackupPage />
                                </AdminRoute>
                            } />

                            {/* 🔥 NUEVAS RUTAS PARA REPORTES Y BITÁCORA */}
                            <Route path="reportes" element={
                                <ProtectedRoute>
                                    <ReportesPage />
                                </ProtectedRoute>
                            } />

                            <Route path="bitacora" element={
                                <AdminRoute>
                                    <BitacoraPage />
                                </AdminRoute>
                            } />

                            <Route path="reservas" element={<ReservasPage />} />

                            <Route path="propiedades" element={<PropiedadesPage />} />
                            <Route path="/pagos" element={<PagosPage />} />

                            <Route path="profile" element={<Perfil />} />

                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>

                    {/* 🔥 MODAL GLOBAL PARA RESERVAS - FUERA DE RUTAS */}
                    <ReservaModal />
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
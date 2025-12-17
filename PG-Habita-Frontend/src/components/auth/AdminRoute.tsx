import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user } = useAuth();

    // Verificar si el usuario tiene permisos de administración (sin restricciones)
    const isAdmin = user && (
        user.is_superuser || 
        user.is_staff || 
        ['ADMIN', 'SUPERUSER', 'ADMINISTRATOR', 'Administrador'].includes(user.role?.toUpperCase?.() || '')
    );

    if (!isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
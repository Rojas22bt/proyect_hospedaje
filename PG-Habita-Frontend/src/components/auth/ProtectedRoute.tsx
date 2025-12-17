import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DEV_MODE = false;

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                           children,
                                                           allowedRoles
                                                       }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasAllowedRole = () => {
        if (!allowedRoles || !user) return true;

        if (DEV_MODE) return true;

        // Administradores tienen acceso a todas las rutas sin restricciones
        if (user.is_superuser || user.is_staff || 
            ['ADMIN', 'SUPERUSER', 'ADMINISTRATOR', 'Administrador'].includes(user.role?.toUpperCase?.() || '')) {
            return true;
        }

        return allowedRoles.includes(user.role);
    };

    if (!hasAllowedRole()) {
        console.log('🚫 Acceso denegado - Rol requerido:', allowedRoles, 'Rol actual:', user?.role);
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Image, Images } from 'lucide-react';

// Iconos
import {
    Home,
    MessageSquare,
    Settings,
    LogOut,
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    AlertTriangle,
    TrendingUp,
    Building2,
    BarChart3,
    User,
    Grid2X2,
    Shield,
    Key,
    UserCog,
    ChevronLeft,
    ChevronRight,
    Crown,
    Star,
    Building,
    Database,
    FileText,
    ClipboardList
} from 'lucide-react';

interface SidebarProps {
    className?: string;
    isCollapsed?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    className,
    isCollapsed = false,
    isExpanded = false,
    onToggle
}) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [localExpanded, setLocalExpanded] = useState(false);

    useEffect(() => {
        if (isExpanded !== undefined) {
            setLocalExpanded(isExpanded);
        }
    }, [isExpanded]);

    const handleToggle = useCallback(() => {
        if (onToggle) {
            onToggle();
        } else {
            setLocalExpanded(!localExpanded);
        }
    }, [onToggle, localExpanded]);

    const getInitials = useCallback((firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }, []);

    const TranslateRole = useCallback((role: string) => {
        const roleUpper = role.toUpperCase();
        switch (roleUpper) {
            case 'SUPERUSER':
                return 'SuperUsuario';
            case 'ANFITRION':
                return 'Anfitrión';
            case 'HUESPED':
                return 'Huésped';
            case 'ADMIN':
                return 'Administrador';
            case 'CLIENT':
                return user?.suscripcion?.status === 'basic' ? 'Huésped' : 'Anfitrión';
            default:
                return role;
        }
    }, [user?.suscripcion?.status]);

    const getRoleColor = useCallback((role: string) => {
        switch (role) {
            case 'ADMIN':
            case 'SUPERUSER':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
            case 'CLIENT':
                return user?.suscripcion?.status === 'basic'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    }, [user?.suscripcion?.status]);

    const getRoleIcon = useCallback((role: string) => {
        const roleUpper = role.toUpperCase();
        if (['ADMIN', 'SUPERUSER'].includes(roleUpper)) {
            return <Crown className="h-3 w-3" />;
        } else if (roleUpper === 'CLIENT' && user?.suscripcion?.status !== 'basic') {
            return <Building className="h-3 w-3" />;
        }
        return <User className="h-3 w-3" />;
    }, [user?.suscripcion?.status]);

    const getSubscriptionInfo = useCallback((subscription: string) => {
        switch (subscription?.toLowerCase()) {
            case 'premium':
                return {
                    name: 'Premium',
                    color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
                    icon: <Crown className="h-3 w-3" />,
                    badgeColor: 'bg-amber-500'
                };
            case 'esmeralda':
                return {
                    name: 'Esmeralda',
                    color: 'bg-gradient-to-r from-emerald-500 to-green-500',
                    icon: <Sparkles className="h-3 w-3" />,
                    badgeColor: 'bg-emerald-500'
                };
            case 'basica':
            default:
                return {
                    name: 'Básica',
                    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    icon: <Star className="h-3 w-3" />,
                    badgeColor: 'bg-blue-500'
                };
        }
    }, []);

    // 🔥 DEFINICIÓN MEJORADA DE ITEMS DE NAVEGACIÓN
    const getNavItems = useCallback(() => {
        if (!user) return { main: [], statistics: [], admin: [] };

        const userRoleUpper = user.role?.toUpperCase?.() || '';
        const isAdminUser = ['ADMIN', 'SUPERUSER', 'SUPERADMIN'].includes(userRoleUpper);

        const huespedItems = [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Mis Reservas', href: '/reservas', icon: Calendar },
            { name: 'Mis Pagos', href: '/mis-pagos', icon: CreditCard }, // 🔥 NUEVO - MIS PAGOS
            { name: 'Perfil', href: '/perfil', icon: User },
        ];

        // 🔥 ITEMS PARA ANFITRIONES (CLIENTES PREMIUM/ESMERALDA)
        const anfitrionItems = [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Mis Propiedades', href: '/propiedades', icon: Building2 },
            { name: 'Mis Reservas', href: '/reservas', icon: Calendar },
            { name: 'Mis Pagos', href: '/pagos', icon: CreditCard },
            { name: 'Mi Galería', href: '/mi-galeria', icon: Image },
            { name: 'Facturación', href: '/facturacion', icon: BarChart3 },
            { name: 'Reportes', href: '/reportes', icon: TrendingUp },
            { name: 'Mis Reportes', href: '/reportes', icon: FileText },
        ];

        // 🔥 ITEMS PARA ADMINISTRADORES Y SUPERUSUARIOS (acceso completo sin restricciones)
        const adminItems = [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Propiedades', href: '/propiedades', icon: Building2 },
            { name: 'Reservas', href: '/reservas', icon: Calendar },
            { name: 'Pagos', href: '/pagos', icon: CreditCard },
            { name: 'Facturación', href: '/facturacion', icon: BarChart3 },
            { name: 'Galería', href: '/files', icon: Images },
            { name: 'Reportes', href: '/reportes', icon: FileText },
            { name: 'Bitácora', href: '/bitacora', icon: ClipboardList }
        ];

        // 🔥 ITEMS EXCLUSIVOS PARA ADMINISTRACIÓN (SOLO SUPERUSUARIOS Y ADMINS - sin restricciones)
        const adminManagementItems = isAdminUser ? [
            { name: 'Roles', href: '/admin/roles', icon: Shield },
            { name: 'Permisos', href: '/admin/permisos', icon: Key },
            { name: 'Suscripciones', href: '/suscripciones', icon: Crown },
            { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
            { name: 'Backup', href: '/admin/backup', icon: Database }
        ] : [];

        const statisticsItems = [
            { name: 'Alertas', href: '/alertas', icon: AlertTriangle },
            { name: 'Tendencias', href: '/tendencias', icon: TrendingUp },
        ];

        if (isAdminUser) {
            return {
                main: adminItems,
                statistics: statisticsItems,
                admin: adminManagementItems
            };
        } else if (userRoleUpper === 'CLIENT') {
            if (user.suscripcion?.status === 'basic') {
                return {
                    main: huespedItems,
                    statistics: [{ name: 'Mis Alertas', href: '/alertas', icon: AlertTriangle }],
                    admin: []
                };
            } else {
                return {
                    main: anfitrionItems,
                    statistics: statisticsItems,
                    admin: []
                };
            }
        }

        return {
            main: huespedItems,
            statistics: [],
            admin: []
        };
    }, [user]);

    const { main: mainItems, statistics: statisticsItems, admin: adminItems } = useMemo(() =>
        getNavItems(),
        [getNavItems]
    );

    // 🔥 COMPONENTE PARA ITEMS DE NAVEGACIÓN
    const NavItem = useCallback(({
        item,
        isActive,
        isAdmin = false,
        className = ""
    }: {
        item: any;
        isActive: boolean;
        isAdmin?: boolean;
        className?: string;
    }) => {
        const Icon = item.icon;

        return (
            <Button
                variant="ghost"
                asChild
                className={cn(
                    "flex flex-col items-center gap-2 p-3 h-auto bg-gradient-to-b from-[#2A3B4C] to-[#1E2A38] border border-gray-700/50 transition-all duration-300 group",
                    isAdmin
                        ? "hover:from-purple-500/20 hover:to-purple-400/10 hover:border-purple-400/30"
                        : "hover:from-habita-primary/20 hover:to-habita-primary/10 hover:border-habita-primary/30",
                    isActive
                        ? isAdmin
                            ? "text-purple-400 from-purple-500/20 to-purple-400/10 border-purple-400/40 shadow-lg shadow-purple-500/20"
                            : "text-habita-primary from-habita-primary/20 to-habita-primary/10 border-habita-primary/40 shadow-lg shadow-habita-primary/20"
                        : "text-[#A0AEC0] hover:text-white",
                    className
                )}
            >
                <Link to={item.href}>
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        isActive
                            ? isAdmin
                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                                : "bg-habita-primary text-white shadow-lg shadow-habita-primary/25"
                            : "bg-[#1A2A3A] group-hover:shadow-lg",
                        isAdmin
                            ? "group-hover:bg-purple-500 group-hover:shadow-purple-500/25"
                            : "group-hover:bg-habita-primary group-hover:shadow-habita-primary/25"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight max-w-full break-words">
                        {item.name}
                    </span>
                </Link>
            </Button>
        );
    }, []);

    // Si está completamente colapsado
    if (isCollapsed && !localExpanded) {
        return (
            <div className={cn(
                "w-16 bg-habita-secondary flex flex-col items-center py-4 h-full border-r border-gray-700",
                className
            )}>
                {/* Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-habita-primary to-red-600 rounded-xl flex items-center justify-center mb-8 shadow-lg">
                    <span className="text-white font-bold text-sm">H</span>
                </div>

                {/* Botón toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    className="mb-6 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Navegación básica */}
                <div className="flex-1 flex flex-col items-center space-y-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className={cn(
                            "w-10 h-10 transition-all duration-300 group relative",
                            location.pathname === '/dashboard'
                                ? "bg-habita-primary text-white shadow-lg"
                                : "bg-[#2A3B4C] text-[#A0AEC0] hover:bg-habita-primary hover:text-white hover:shadow-lg"
                        )}
                    >
                        <Link to="/dashboard">
                            <Home className="h-5 w-5" />
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Dashboard
                            </div>
                        </Link>
                    </Button>
                </div>

                {/* Avatar de usuario colapsado */}
                {user && (
                    <div className="mt-4 group relative">
                        <Avatar className="h-8 w-8 ring-2 ring-habita-primary/50 cursor-pointer hover:scale-110 transition-all duration-300">
                            <AvatarImage src={user.profile?.foto} alt={user.first_name} />
                            <AvatarFallback className={cn(
                                "text-xs font-bold",
                                getRoleColor(user.role)
                            )}>
                                {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 min-w-max">
                            <div className="font-semibold">{user.first_name}</div>
                            <div className="text-gray-300">{TranslateRole(user.role)}</div>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="w-10 h-10 bg-[#2A3B4C] text-[#A0AEC0] hover:bg-red-600 hover:text-white hover:shadow-lg transition-all duration-300 mt-4"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    // Versión expandida
    return (
        <div className={cn(
            "flex h-full bg-habita-secondary border-r border-gray-700 transition-all duration-300",
            localExpanded ? "w-96" : "w-20",
            className
        )}>
            {/* Sección izquierda - siempre visible */}
            <div className="w-20 flex flex-col items-center py-4 flex-shrink-0">
                {/* Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-habita-primary to-red-600 rounded-xl flex items-center justify-center mb-8 shadow-lg">
                    <span className="text-white font-bold text-sm">H</span>
                </div>

                {/* Botón toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    className="mb-6 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
                >
                    {localExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>

                {/* Navegación principal vertical */}
                <div className="flex-1 flex flex-col items-center space-y-4">
                    {mainItems.slice(0, 3).map((item) => {
                        const isActive = location.pathname === item.href;

                        return (
                            <Button
                                key={item.name}
                                variant="ghost"
                                size="icon"
                                asChild
                                className={cn(
                                    "w-10 h-10 transition-all duration-300 relative group",
                                    isActive
                                        ? "bg-habita-primary text-white shadow-lg"
                                        : "bg-[#2A3B4C] text-[#A0AEC0] hover:bg-habita-primary hover:text-white hover:shadow-lg"
                                )}
                            >
                                <Link to={item.href}>
                                    <item.icon className="h-5 w-5" />
                                    {!localExpanded && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            </Button>
                        );
                    })}
                </div>

                {/* Configuración y Logout */}
                <div className="flex flex-col items-center space-y-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 bg-[#2A3B4C] text-[#A0AEC0] hover:bg-habita-primary hover:text-white hover:shadow-lg transition-all duration-300"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="w-10 h-10 bg-[#2A3B4C] text-[#A0AEC0] hover:bg-red-600 hover:text-white hover:shadow-lg transition-all duration-300"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Sección derecha - solo visible cuando está expandido */}
            {localExpanded && (
                <div className="flex-1 bg-gradient-to-b from-[#1A2A3A] to-[#0F1A26] overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-white text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Habita ERP
                            </h1>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>

                        {/* Tarjeta de Usuario Mejorada */}
                        {user && (
                            <div className="mb-8">
                                <div className="bg-gradient-to-br from-[#2A3B4C] to-[#1E2A38] rounded-2xl p-4 shadow-xl border border-gray-700/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 ring-4 ring-habita-primary/30 shadow-lg">
                                                <AvatarImage src={user.profile?.foto} alt={user.first_name} />
                                                <AvatarFallback className={cn(
                                                    "text-base font-bold",
                                                    getRoleColor(user.role)
                                                )}>
                                                    {getInitials(user.first_name, user.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-lg",
                                                getRoleColor(user.role)
                                            )}>
                                                {getRoleIcon(user.role)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold text-lg truncate">
                                                {user.first_name} {user.last_name}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate mb-2">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={cn(
                                                    "text-xs font-semibold px-2 py-1 rounded-full shadow-sm border-0",
                                                    getRoleColor(user.role)
                                                )}>
                                                    {TranslateRole(user.role)}
                                                </Badge>
                                                {user.suscripcion?.status && (
                                                    <Badge className={cn(
                                                        "text-xs font-semibold px-2 py-1 rounded-full shadow-sm border-0",
                                                        getSubscriptionInfo(user.suscripcion.status).badgeColor
                                                    )}>
                                                        <div className="flex items-center space-x-1">
                                                            {getSubscriptionInfo(user.suscripcion.status).icon}
                                                            <span>{getSubscriptionInfo(user.suscripcion.status).name}</span>
                                                        </div>
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navegación principal en grid */}
                        <nav className="grid grid-cols-2 gap-3 mb-8">
                            {mainItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <NavItem
                                        key={item.name}
                                        item={item}
                                        isActive={isActive}
                                    />
                                );
                            })}
                        </nav>

                        {/* 🔥 Módulos de Administración - SOLO PARA SUPERUSUARIOS Y ADMINS */}
                        {adminItems.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-[#8A9BA8] text-sm font-semibold mb-4 uppercase tracking-wide flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Administración
                                </h2>
                                <nav className="grid grid-cols-2 gap-3">
                                    {adminItems.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <NavItem
                                                key={item.name}
                                                item={item}
                                                isActive={isActive}
                                                isAdmin={true}
                                            />
                                        );
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Estadísticas */}
                        {statisticsItems.length > 0 && (
                            <div>
                                <h2 className="text-[#8A9BA8] text-sm font-semibold mb-4 uppercase tracking-wide flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Estadísticas
                                </h2>
                                <nav className="grid grid-cols-2 gap-3">
                                    {statisticsItems.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <NavItem
                                                key={item.name}
                                                item={item}
                                                isActive={isActive}
                                            />
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
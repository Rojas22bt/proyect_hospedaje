import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Grid2X2, User, Bell, Search, Calendar, Home, Menu, ChevronDown,
    LogOut, Settings, Crown, Star, Building, Mail, Phone, MapPin,
    Sparkles, CheckCircle2, Trash2, Eye, Plus, BarChart3,
    TrendingUp, Key // 🔥 NUEVOS ICONOS
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Notificacion } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { useNotificaciones } from '@/hooks/useNotificaciones';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const { user, logout, capabilities, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPropertiesHovered, setIsPropertiesHovered] = useState(false);


    const {
        notificacionesNoLeidas,
        countNoLeidas,
        marcarLeida,
        marcarTodasLeidas,
        deleteNotificacion,
        isLoading: isLoadingNotificaciones,
    } = useNotificaciones();


    const notificacionesArray = Array.isArray(notificacionesNoLeidas) ? notificacionesNoLeidas : [];
    const countNoLeidasSafe = Array.isArray(notificacionesNoLeidas) ? notificacionesNoLeidas.length : 0;

    // 🔥 FUNCIÓN DE LOGOUT MANEJADA
    const handleLogout = () => {
        logout();
    };

    // Función para obtener icono según tipo de notificación
    const getTipoIcono = (tipo: string) => {
        const iconos: { [key: string]: string } = {
            'reserva_creada': '🎉',
            'reserva_confirmada': '✅',
            'reserva_cancelada': '❌',
            'reserva_rechazada': '🚫',
            'pago_recibido': '💰',
            'pago_fallido': '⚠️',
            'sistema': '🔔',
            'recordatorio_checkin': '📅',
            'recordatorio_checkout': '🏠',
        };
        return iconos[tipo] || '📢';
    };

    // Función para obtener color según tipo de notificación
    const getTipoColor = (tipo: string) => {
        const colores: { [key: string]: string } = {
            'reserva_creada': 'bg-blue-100 text-blue-800',
            'reserva_confirmada': 'bg-green-100 text-green-800',
            'reserva_cancelada': 'bg-red-100 text-red-800',
            'reserva_rechazada': 'bg-orange-100 text-orange-800',
            'pago_recibido': 'bg-green-100 text-green-800',
            'pago_fallido': 'bg-yellow-100 text-yellow-800',
            'sistema': 'bg-gray-100 text-gray-800',
        };
        return colores[tipo] || 'bg-gray-100 text-gray-800';
    };

    // Resto de tus funciones existentes...
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const TranslateRole = (role: string) => {
        const roleUpper = role.toUpperCase();
        switch (roleUpper) {
            case 'SUPERUSER':
                return 'SuperUsuario';
            case 'ADMIN':
                return 'Administrador';
            case 'CLIENT':
                // Mostrar según suscripción
                if (user?.suscripcion?.nombre.toLowerCase() === 'básica') {
                    return 'Huésped';
                } else {
                    return 'Anfitrión';
                }
            default:
                return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
            case 'SUPERUSER':
                return 'bg-gradient-to-r from-purple-500 to-purple-600';
            case 'CLIENT':
                return user?.suscripcion?.nombre.toLowerCase() === 'básica'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
    };

    const getRoleIcon = (role: string) => {
        const roleUpper = role.toUpperCase();
        if (['ADMIN', 'SUPERUSER'].includes(roleUpper)) {
            return <Crown className="h-3 w-3" />;
        } else if (roleUpper === 'CLIENT' && user?.suscripcion?.nombre.toLowerCase() !== 'básica') {
            return <Building className="h-3 w-3" />;
        }
        return <User className="h-3 w-3" />;
    };

    const getSubscriptionInfo = (subscription: string) => {
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
            case 'básica':
            default:
                return {
                    name: 'Básica',
                    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    icon: <Star className="h-3 w-3" />,
                    badgeColor: 'bg-blue-500'
                };
        }
    };

    const getQuickActions = () => {
        const actions = [];

        // Acciones para SUPERUSER y ADMIN (sin restricciones)
        if (user?.role === 'SUPERUSER' || user?.role === 'ADMIN' || 
            user?.is_superuser || user?.is_staff ||
            ['ADMINISTRATOR', 'Administrador'].includes(user?.role || '')) {
            // Administradores tienen acceso a todas las opciones
            actions.push(
                { label: 'Dashboard', icon: Grid2X2, onClick: () => navigate('/dashboard') },
                { label: 'Propiedades', icon: Home, onClick: () => navigate('/propiedades') },
                { label: 'Reservas', icon: Calendar, onClick: () => navigate('/reservas') },
                { label: 'Usuarios', icon: User, onClick: () => navigate('/admin/usuarios') },
                { label: 'Reportes', icon: BarChart3, onClick: () => navigate('/reportes') },
                { label: 'Roles', icon: Key, onClick: () => navigate('/admin/roles') }
            );

            return actions;
        }

        // Acciones para CLIENT - basadas en permisos Y capacidades
        if (user?.role === 'CLIENT') {
            // Todos los CLIENT pueden ver propiedades y hacer reservas
            actions.push(
                { label: 'Mis Reservas', icon: Calendar, onClick: () => navigate('/reservas') }
            );

            // Solo si tiene permiso Y capacidad para gestionar propiedades
            if (capabilities.canManageProperties && hasPermission('cud_propiedad')) {
                actions.unshift(
                    { label: 'Mis Propiedades', icon: Home, onClick: () => navigate('/propiedades') },
                );

                // Si tiene permisos para reportes
                if (hasPermission('ver_reportes')) {
                    actions.push({ label: 'Reportes', icon: BarChart3, onClick: () => navigate('/reportes') });
                }
            }

            return actions;
        }

        return [];
    };

    const quickActions = getQuickActions();

    // Efecto para detectar scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "bg-gradient-to-r from-habita-secondary to-habita-primary/90 border-b border-habita-primary/30 shadow-sm backdrop-blur-sm transition-all duration-500 sticky top-0 z-50",
            isScrolled && "shadow-lg bg-gradient-to-r from-habita-secondary to-habita-primary border-b-habita-primary/50"
        )}>
            <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Lado izquierdo */}
                    <div className="flex items-center space-x-6">
                        {/* Botón menú móvil */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleSidebar}
                            className="lg:hidden text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Logo y nombre */}
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                                <span className="text-habita-primary font-bold text-lg group-hover:text-habita-secondary transition-colors duration-300">H</span>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                                    Habita ERP
                                </h2>
                                <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">
                                    Tu Hogar, en cualquier lugar
                                </p>
                            </div>
                        </div>

                        {/* Barra de búsqueda */}
                        <div className="hidden md:block relative w-80">
                            <div className="relative">
                                <Search className={cn(
                                    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 transition-all duration-300",
                                    searchFocused ? "text-habita-primary scale-110" : "text-gray-400"
                                )} />
                                <Input
                                    placeholder="Buscar propiedades, reservas..."
                                    className={cn(
                                        "pl-10 bg-white/90 border-white/20 focus:bg-white focus:border-white/40 transition-all duration-300",
                                        searchFocused && "shadow-lg scale-105"
                                    )}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lado derecho */}
                    <div className="flex items-center space-x-4">
                        {/* 🔥 BOTÓN LLAMATIVO PARA PROPIEDADES EN ALQUILER */}
                        <div className="hidden lg:block">
                            <Button
                                onMouseEnter={() => setIsPropertiesHovered(true)}
                                onMouseLeave={() => setIsPropertiesHovered(false)}
                                onClick={() => navigate('/')}
                                className={cn(
                                    "relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold py-2 px-4 rounded-xl shadow-2xl transition-all duration-500 transform border-2 border-yellow-300",
                                    isPropertiesHovered ? "scale-105 shadow-2xl shadow-orange-300" : "scale-100 shadow-lg",
                                    "animate-pulse-glow"
                                )}
                            >
                                {/* Efecto de partículas */}
                                {isPropertiesHovered && (
                                    <>
                                        <div className="absolute inset-0 bg-white bg-opacity-20 animate-ping rounded-xl"></div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-30 animate-pulse"></div>
                                    </>
                                )}

                                <div className="relative z-10 flex items-center gap-2">
                                    <Key className={cn(
                                        "h-4 w-4 transition-transform duration-500",
                                        isPropertiesHovered ? "animate-bounce rotate-12" : "animate-pulse"
                                    )} />
                                    <span className="font-bold text-sm whitespace-nowrap">
                                        Propiedades en Alquiler
                                    </span>
                                    <TrendingUp className={cn(
                                        "h-4 w-4 transition-transform duration-500",
                                        isPropertiesHovered ? "animate-bounce -rotate-12" : ""
                                    )} />
                                </div>

                                {/* Badge flotante */}
                                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-2 border-white animate-bounce-soft text-xs px-1 py-0 min-w-[20px] h-5 flex items-center justify-center">
                                    <Sparkles className="h-2 w-2 mr-1" />
                                    Nuevo
                                </Badge>
                            </Button>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="hidden lg:flex items-center space-x-2">
                            {quickActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={action.onClick}
                                    className="text-white hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center space-x-2 transition-all duration-200 animate-in slide-in-from-right-8"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <action.icon className="h-4 w-4" />
                                    <span className="hidden xl:inline">{action.label}</span>
                                </Button>
                            ))}
                        </div>

                        {/* Separador */}
                        <div className="hidden lg:block h-6 w-px bg-white/30 transition-all duration-300 hover:bg-white/50" />

                        {/* NOTIFICACIONES - CORREGIDO */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "relative text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200",
                                        countNoLeidasSafe > 0 && "animate-pulse"
                                    )}
                                    disabled={isLoadingNotificaciones}
                                >
                                    <Bell className="h-5 w-5" />
                                    {countNoLeidasSafe > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-xs border-2 border-white">
                                            {countNoLeidasSafe > 9 ? '9+' : countNoLeidasSafe}
                                        </Badge>
                                    )}
                                    {isLoadingNotificaciones && (
                                        <div className="absolute inset-0 bg-white/20 rounded animate-pulse" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-96 max-h-[80vh] overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                                    {notificacionesArray.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => marcarTodasLeidas()}
                                            className="text-xs text-habita-primary hover:text-habita-secondary"
                                        >
                                            Marcar todas leídas
                                        </Button>
                                    )}
                                </div>

                                <ScrollArea className="h-80">
                                    {notificacionesArray.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-medium">No hay notificaciones nuevas</p>
                                            <p className="text-sm mt-1">Te avisaremos cuando tengas novedades</p>
                                        </div>
                                    ) : (
                                        notificacionesArray.map((notificacion) => (
                                            <DropdownMenuItem
                                                key={notificacion.id}
                                                className={cn(
                                                    "p-4 flex flex-col items-start gap-2 cursor-default border-b border-gray-100 last:border-b-0",
                                                    "bg-blue-50/50"
                                                )}
                                                onClick={() => marcarLeida({ id: notificacion.id })}
                                            >
                                                <div className="flex justify-between w-full items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-lg">
                                                                {getTipoIcono(notificacion.tipo)}
                                                            </span>
                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                {notificacion.titulo}
                                                            </p>
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {notificacion.mensaje}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn("text-xs", getTipoColor(notificacion.tipo))}
                                                            >
                                                                {notificacion.tipo_display || notificacion.tipo}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(notificacion.creado_en).toLocaleDateString('es-ES', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 ml-2 flex-shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                marcarLeida({ id: notificacion.id });
                                                            }}
                                                            className="h-7 w-7 hover:bg-green-50 hover:text-green-600"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotificacion(notificacion.id);
                                                            }}
                                                            className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </ScrollArea>

                                {notificacionesArray.length > 0 && (
                                    <div className="p-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs text-gray-500 hover:text-gray-700"
                                            onClick={() => navigate('/notificaciones')}
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver todas las notificaciones
                                        </Button>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Perfil del usuario */}
                        {user && (
                            <DropdownMenu onOpenChange={setIsProfileOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "relative h-12 px-4 rounded-xl bg-white/10 text-white border border-white/20 transition-all duration-300 group overflow-hidden hover:bg-white/20 hover:border-white/30 hover:scale-105",
                                            isProfileOpen && "bg-white/20 border-white/40 scale-105 shadow-lg ring-2 ring-white/20"
                                        )}
                                    >
                                        {/* Efecto de fondo animado */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-all duration-500",
                                            isProfileOpen
                                                ? "translate-x-full opacity-0"
                                                : "group-hover:translate-x-full -translate-x-full opacity-100"
                                        )} />

                                        <div className="flex items-center space-x-3 relative z-10">
                                            <div className="relative">
                                                <Avatar className={cn(
                                                    "h-8 w-8 transition-all duration-300 ring-2 ring-white/40",
                                                    isProfileOpen && "scale-110 ring-white/60 shadow-lg"
                                                )}>
                                                    <AvatarImage src={user.profile?.foto} alt={user.first_name} />
                                                    <AvatarFallback className={cn(
                                                        "text-sm font-bold text-white",
                                                        getRoleColor(user.role)
                                                    )}>
                                                        {getInitials(user.first_name, user.last_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg border border-white",
                                                    getRoleColor(user.role)
                                                )}>
                                                    {getRoleIcon(user.role)}
                                                </div>
                                            </div>

                                            <div className="hidden lg:block text-left">
                                                <p className="text-sm font-semibold leading-none">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Badge className={cn(
                                                        "text-xs font-semibold px-2 py-0 h-4 border-0",
                                                        getRoleColor(user.role)
                                                    )}>
                                                        {TranslateRole(user.role)}
                                                    </Badge>
                                                    {user.suscripcion?.nombre && (
                                                        <Badge className={cn(
                                                            "text-xs font-semibold px-2 py-0 h-4 border-0",
                                                            getSubscriptionInfo(user.suscripcion.nombre).badgeColor
                                                        )}>
                                                            <div className="flex items-center space-x-1">
                                                                {getSubscriptionInfo(user.suscripcion.nombre).icon}
                                                            </div>
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronDown className={cn(
                                                "h-4 w-4 transition-all duration-300",
                                                isProfileOpen ? "rotate-180 scale-110" : "group-hover:rotate-180"
                                            )} />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-96 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden"
                                    align="end"
                                    forceMount
                                >
                                    {/* Efecto de desenrollado */}
                                    <div className="relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-habita-primary/10 via-habita-primary/5 to-habita-secondary/10 transform origin-top animate-in slide-in-from-top-1 duration-300" />

                                        <DropdownMenuLabel className="font-normal p-6 relative transform animate-in slide-in-from-top-2 duration-500">
                                            <div className="flex items-start space-x-4">
                                                <div className="relative">
                                                    <Avatar className="h-20 w-20 ring-4 ring-white/80 shadow-xl">
                                                        <AvatarImage src={user.profile?.foto} alt={user.first_name} />
                                                        <AvatarFallback className={cn(
                                                            "text-xl font-bold text-white",
                                                            getRoleColor(user.role)
                                                        )}>
                                                            {getInitials(user.first_name, user.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 border-white",
                                                        getRoleColor(user.role)
                                                    )}>
                                                        {getRoleIcon(user.role)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 truncate">
                                                            {user.first_name} {user.last_name}
                                                        </h3>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <Badge className={cn(
                                                                getRoleColor(user.role),
                                                                "text-sm font-semibold px-3 py-1 shadow-sm border-0"
                                                            )}>
                                                                {TranslateRole(user.role)}
                                                            </Badge>
                                                            {user.suscripcion?.nombre && (
                                                                <Badge className={cn(
                                                                    "text-sm font-semibold px-3 py-1 shadow-sm border-0",
                                                                    getSubscriptionInfo(user.suscripcion.nombre).badgeColor
                                                                )}>
                                                                    <div className="flex items-center space-x-1">
                                                                        {getSubscriptionInfo(user.suscripcion.nombre).icon}
                                                                        <span>{getSubscriptionInfo(user.suscripcion.nombre).name}</span>
                                                                    </div>
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Información de contacto */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <Mail className="h-4 w-4" />
                                                            <span className="truncate">Bienvenido, {user.first_name}</span>
                                                        </div>
                                                        {user.profile?.telefono && (
                                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                <Phone className="h-4 w-4" />
                                                                <span>{user.profile.telefono}</span>
                                                            </div>
                                                        )}
                                                        {user.profile?.direccion && (
                                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                <MapPin className="h-4 w-4" />
                                                                <span className="truncate">{user.profile.direccion}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                    </div>

                                    <div className="transform animate-in fade-in-50 duration-700">
                                        <DropdownMenuSeparator />

                                        {/* Estadísticas con animación escalonada */}
                                        <div className="px-6 py-4 bg-gray-50/50 transform animate-in slide-in-from-left-2 duration-500 delay-100">
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-habita-primary">12</p>
                                                    <p className="text-xs text-gray-600">Propiedades</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-500">8</p>
                                                    <p className="text-xs text-gray-600">Activas</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-500">95%</p>
                                                    <p className="text-xs text-gray-600">Rating</p>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />

                                        {/* Items del menú con animación escalonada */}
                                        <div className="p-2 space-y-1 transform animate-in slide-in-from-left-2 duration-500 delay-200">
                                            <DropdownMenuItem
                                                onClick={() => navigate('/perfil')}
                                                className="group cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-habita-primary/10 hover:shadow-md hover:scale-102"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200 shadow-sm">
                                                        <User className="h-5 w-5 text-habita-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-800 font-semibold">Mi Perfil</span>
                                                        <span className="text-xs text-gray-600">Gestiona tu información personal</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => navigate('/configuracion')}
                                                className="group cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-habita-primary/10 hover:shadow-md hover:scale-102"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200 shadow-sm">
                                                        <Settings className="h-5 w-5 text-habita-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-800 font-semibold">Configuración</span>
                                                        <span className="text-xs text-gray-600">Ajustes del sistema</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>

                                        <DropdownMenuSeparator />

                                        {/* Logout con animación */}
                                        <div className="p-2 transform animate-in slide-in-from-left-2 duration-500 delay-300">
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="group cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-red-50 hover:shadow-md hover:scale-102"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-200 shadow-sm">
                                                        <LogOut className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-red-700 font-semibold">Cerrar sesión</span>
                                                        <span className="text-xs text-red-600">Salir del sistema</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Barra de búsqueda móvil con animación */}
                <div className="mt-3 lg:hidden animate-in slide-in-from-top-4 duration-500">
                    <div className="relative">
                        <Search className={cn(
                            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-300",
                            searchFocused ? "text-habita-primary scale-110" : "text-gray-400"
                        )} />
                        <Input
                            placeholder="Buscar..."
                            className={cn(
                                "pl-10 bg-white/95 border-white/30 transition-all duration-300",
                                searchFocused && "shadow-lg scale-105"
                            )}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>
                </div>

                {/* Breadcrumb para móvil con animación */}
                <div className="mt-3 lg:hidden animate-in fade-in-50 duration-700">
                    <div className="flex items-center space-x-2 text-sm text-white/80">
                        <span className="hover:text-white transition-colors duration-200">Dashboard</span>
                        <span className="animate-pulse">•</span>
                        <span className="text-white font-medium hover:scale-105 transition-transform duration-200">
                            {location.pathname.split('/').pop() || 'Inicio'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
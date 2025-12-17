import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Loader2, User, Mail, Phone, Calendar, Shield, Crown } from 'lucide-react';
import { User as UserType } from '@/types/auth'; // Importar como alias

interface UsuariosListProps {
    usuarios: UserType[]; // CAMBIAR: Usar UserType
    isLoading: boolean;
    onEdit: (usuario: UserType) => void;
    onDelete: (id: number) => void;
}

const UsuariosList: React.FC<UsuariosListProps> = ({
                                                       usuarios,
                                                       isLoading,
                                                       onEdit,
                                                       onDelete
                                                   }) => {
    const formatDate = (dateString: string | Date | undefined): string => {
        if (!dateString) return 'No especificada';
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('es-ES');
    };

    const getRoleColor = (role: string) => {
        const roleUpper = role.toUpperCase();
        if (['ADMIN', 'SUPERUSER', 'SUPERADMIN'].includes(roleUpper)) {
            return {
                bg: 'from-purple-500 to-pink-500',
                text: 'text-purple-700',
                border: 'border-purple-200',
                badge: 'bg-purple-500'
            };
        } else if (roleUpper === 'ANFITRION') {
            return {
                bg: 'from-green-500 to-emerald-500',
                text: 'text-green-700',
                border: 'border-green-200',
                badge: 'bg-green-500'
            };
        }
        return {
            bg: 'from-blue-500 to-cyan-500',
            text: 'text-blue-700',
            border: 'border-blue-200',
            badge: 'bg-blue-500'
        };
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? <Badge className="bg-green-500 text-white border-2 border-green-600">ACTIVO</Badge>
            : <Badge variant="secondary" className="border-2 border-gray-400">INACTIVO</Badge>;
    };

    const getRoleIcon = (role: string) => {
        const roleUpper = role.toUpperCase();
        if (['ADMIN', 'SUPERUSER', 'SUPERADMIN'].includes(roleUpper)) {
            return <Crown className="h-4 w-4" />;
        }
        return <Shield className="h-4 w-4" />;
    };

    if (isLoading) {
        return (
            <Card className="shadow-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="flex flex-col justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-habita-primary mb-4" />
                    <span className="text-gray-600 text-lg font-semibold">Cargando usuarios...</span>
                    <p className="text-gray-500 mt-2">Obteniendo información de los usuarios</p>
                </CardContent>
            </Card>
        );
    }

    if (usuarios.length === 0) {
        return (
            <Card className="shadow-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="text-center py-20">
                    <div className="p-5 bg-gradient-to-br from-habita-primary to-red-600 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg border-2 border-white">
                        <User className="h-10 w-10 text-white mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay usuarios registrados</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        Comienza creando el primer usuario para tu plataforma
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-habita-primary to-red-600 mx-auto rounded-full"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {usuarios.map((usuario, index) => {
                const roleTheme = getRoleColor(usuario.rol.nombre);

                return (
                    <Card
                        key={usuario.id}
                        className={`
              shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]
              border-2 ${roleTheme.border} bg-gradient-to-br from-white to-gray-50
              relative overflow-hidden
            `}
                    >
                        {/* Línea decorativa lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${roleTheme.bg}`}></div>

                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                {/* Información del Usuario */}
                                <div className="flex items-start gap-6 flex-1">
                                    {/* Avatar del Usuario */}
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${roleTheme.bg} shadow-lg border-2 border-white`}>
                                        <div className="text-white">
                                            <User className="h-6 w-6" />
                                        </div>
                                    </div>

                                    {/* Detalles del Usuario */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <h3 className={`text-2xl font-bold ${roleTheme.text}`}>
                                                {usuario.first_name} {usuario.last_name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(usuario.is_active)}
                                                <Badge className={`text-white border-2 border-white ${roleTheme.badge}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getRoleIcon(usuario.rol.nombre)}
                                                        {usuario.rol.nombre}
                                                    </div>
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Información de contacto */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail className="h-4 w-4" />
                                                <span className="font-medium">{usuario.correo}</span>
                                            </div>

                                            {usuario.N_Cel && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="font-medium">{usuario.N_Cel}</span>
                                                </div>
                                            )}

                                            {usuario.fecha_Nac && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">{formatDate(usuario.fecha_Nac)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Información adicional */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
                                                <div className="text-sm text-gray-600">Username</div>
                                                <div className="font-semibold text-gray-900">{usuario.username}</div>
                                            </div>

                                            {usuario.suscripcion && (
                                                <div className="bg-white p-3 rounded-xl border-2 border-amber-200 shadow-sm">
                                                    <div className="text-sm text-gray-600">Suscripción</div>
                                                    <div className="font-semibold text-amber-700">{usuario.suscripcion.nombre}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Último login */}
                                        <div className="text-sm text-gray-500">
                                            Último acceso: {formatDate(usuario.last_login)}
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-3 ml-6">
                                    <Button
                                        onClick={() => onEdit(usuario)}
                                        className={`
                      border-2 border-white shadow-xl hover:shadow-2xl 
                      bg-gradient-to-br from-habita-primary to-red-600 text-white
                      hover:scale-105 transition-all duration-200 px-6 py-3
                      font-semibold
                    `}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => onDelete(usuario.id)}
                                        className="border-2 border-red-300 text-red-600 bg-white hover:bg-red-50
                             shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200
                             px-6 py-3 font-semibold"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>

                            {/* Separador decorativo entre items */}
                            {index < usuarios.length - 1 && (
                                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default UsuariosList;
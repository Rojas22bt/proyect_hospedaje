import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Home, UserRound, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';

const Perfil: React.FC = () => {
    const { user: authUser, updateUser } = useAuth();
    const [profileData, setProfileData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        N_Cel: '',
        fecha_Nac: '',
    });

    const isAdmin = authUser?.role === 'ADMIN';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await api.getProfile();
                setProfileData(data);
                setFormData({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email || '',
                    N_Cel: data.N_Cel || '',
                    fecha_Nac: data.fecha_Nac || '',
                });
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                toast({
                    title: 'Error',
                    description: 'No se pudo cargar la información del perfil',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const updatedUser = await api.updateUsuario({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: isAdmin ? formData.email : undefined,
                N_Cel: isAdmin ? formData.N_Cel : undefined,
                fecha_Nac: isAdmin ? formData.fecha_Nac : undefined,
            } as Partial<User>);
            setProfileData(prev => prev ? { ...prev, ...updatedUser } : null);
            updateUser({ ...authUser!, ...updatedUser });
            setIsEditing(false);
            toast({
                title: 'Perfil actualizado',
                description: 'Tu información ha sido actualizada correctamente',
            });
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            toast({
                title: 'Error',
                description: 'No se pudo actualizar la información del perfil',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getRoleInSpanish = (role: string) => {
        switch (role) {
            case 'ANFITRION':
                return 'Anfitrión';
            case 'HUESPED':
                return 'Huésped';
            case 'ADMIN':
                return 'Administrador';
            default:
                return role;
        }
    };

    if (isLoading && !profileData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                Perfil de Usuario
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <Avatar className="h-32 w-32 mb-4">
                                <AvatarImage src={profileData?.profile?.foto} alt={profileData?.first_name} />
                                <AvatarFallback className="text-2xl bg-green-600 text-white">
                                    {profileData && getInitials(profileData.first_name, profileData.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="font-medium text-lg">{profileData?.first_name} {profileData?.last_name}</p>
                                <div className="flex items-center justify-center gap-1 my-1">
                                    <UserRound className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm text-gray-500">{profileData?.username}</p>
                                </div>
                                <div className="flex items-center justify-center gap-1 my-1">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm text-gray-500">{profileData?.email}</p>
                                </div>
                                <div className="mt-3 px-4 py-1 bg-green-100 text-green-800 rounded-full inline-flex items-center">
                                    {profileData?.role === 'ANFITRION' && <Home className="h-4 w-4 mr-1" />}
                                    {profileData?.role === 'HUESPED' && <UserRound className="h-4 w-4 mr-1" />}
                                    {profileData?.role === 'ADMIN' && <ShieldCheck className="h-4 w-4 mr-1" />}
                                    {getRoleInSpanish(profileData?.role || '')}
                                </div>
                                {profileData?.suscripcion && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Suscripción</p>
                                        <p className="text-sm font-medium bg-gray-100 text-gray-800 py-1 px-3 rounded-full">
                                            {profileData.suscripcion.nombre} ({profileData.suscripcion.status})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>
                                {isAdmin
                                    ? "Como administrador, puedes actualizar toda tu información de contacto"
                                    : "Puedes actualizar tu nombre. Para cambios en otros campos, contacta al administrador"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">Nombre</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Apellido</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Correo Electrónico
                                        {!isAdmin && <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || !isAdmin}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="N_Cel">
                                        Teléfono
                                        {!isAdmin && <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>}
                                    </Label>
                                    <Input
                                        id="N_Cel"
                                        name="N_Cel"
                                        value={formData.N_Cel}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || !isAdmin}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_Nac">
                                        Fecha de Nacimiento
                                        {!isAdmin && <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>}
                                    </Label>
                                    <Input
                                        id="fecha_Nac"
                                        name="fecha_Nac"
                                        type="date"
                                        value={formData.fecha_Nac}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || !isAdmin}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">
                                        Nombre de Usuario
                                        <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        value={profileData?.username || ''}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">
                                        Rol
                                        <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>
                                    </Label>
                                    <Input
                                        id="role"
                                        value={getRoleInSpanish(profileData?.role || '')}
                                        disabled
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setFormData({
                                                        first_name: profileData?.first_name || '',
                                                        last_name: profileData?.last_name || '',
                                                        email: profileData?.email || '',
                                                        N_Cel: profileData?.N_Cel || '',
                                                        fecha_Nac: profileData?.fecha_Nac || '',
                                                    });
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button type="button" onClick={() => setIsEditing(true)}>
                                            Editar Perfil
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
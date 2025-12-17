import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    UserPlus,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Home,
    User,
    Building2,
    Sparkles,
    Phone,
    Calendar
} from 'lucide-react';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        correo: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        N_Cel: '',
        fecha_Nac: ''
    });

    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.username.trim()) {
            errors.username = 'El username es requerido';
        }

        if (!formData.correo.trim()) {
            errors.correo = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            errors.correo = 'El correo no es válido';
        }

        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.first_name.trim()) {
            errors.first_name = 'El nombre es requerido';
        }

        if (!formData.last_name.trim()) {
            errors.last_name = 'El apellido es requerido';
        }

        if (!formData.N_Cel.trim()) {
            errors.N_Cel = 'El teléfono es requerido';
        }

        if (!formData.fecha_Nac) {
            errors.fecha_Nac = 'La fecha de nacimiento es requerida';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await register({
            username: formData.username,
            correo: formData.correo,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            N_Cel: formData.N_Cel,
            fecha_Nac: formData.fecha_Nac,
            // Estos campos se asignan automáticamente en el backend
            rol_id: 3, // Client
            is_active: true,
            suscripcion_id: 1 // Básica
        });

        if (success) {
            navigate('/dashboard');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (formErrors[e.target.name]) {
            setFormErrors({
                ...formErrors,
                [e.target.name]: ''
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-habita-secondary via-habita-primary/20 to-habita-secondary p-4 relative overflow-hidden">
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-habita-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-habita-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse-slow"></div>
            </div>

            <div className="w-full max-w-2xl z-10">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl transform hover:scale-[1.02] transition-all duration-500 animate-scale-in">
                    <CardHeader className="space-y-1 text-center pb-6 pt-10">
                        {/* Logo animado */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-habita-primary to-red-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 animate-float">
                                    <Home className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <div className="w-8 h-8 bg-habita-secondary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-habita-primary to-habita-secondary bg-clip-text text-transparent tracking-tight">
                            ÚNETE A HABITA
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-lg font-medium">
                            Crea tu cuenta y descubre tu próximo hogar
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información Personal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                                    <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-habita-primary" />
                                        Nombre *
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    {formErrors.first_name && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                                    )}
                                </div>

                                {/* Apellido */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
                                    <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-habita-primary" />
                                        Apellido *
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                    {formErrors.last_name && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Teléfono */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
                                    <Label htmlFor="N_Cel" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-habita-primary" />
                                        Teléfono *
                                    </Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="N_Cel"
                                            name="N_Cel"
                                            type="tel"
                                            required
                                            value={formData.N_Cel}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="77314104"
                                        />
                                    </div>
                                    {formErrors.N_Cel && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.N_Cel}</p>
                                    )}
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '500ms' }}>
                                    <Label htmlFor="fecha_Nac" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-habita-primary" />
                                        Fecha de Nacimiento *
                                    </Label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="fecha_Nac"
                                            name="fecha_Nac"
                                            type="date"
                                            required
                                            value={formData.fecha_Nac}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                        />
                                    </div>
                                    {formErrors.fecha_Nac && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.fecha_Nac}</p>
                                    )}
                                </div>
                            </div>

                            {/* Información de Cuenta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
                                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-habita-primary" />
                                        Username *
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="tu_usuario"
                                        />
                                    </div>
                                    {formErrors.username && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '700ms' }}>
                                    <Label htmlFor="correo" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-habita-primary" />
                                        Correo Electrónico *
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="correo"
                                            name="correo"
                                            type="email"
                                            required
                                            value={formData.correo}
                                            onChange={handleChange}
                                            className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="usuario@ejemplo.com"
                                        />
                                    </div>
                                    {formErrors.correo && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.correo}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contraseñas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Contraseña */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-habita-primary" />
                                        Contraseña *
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-12 pr-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-habita-primary/60 hover:text-habita-primary transition-colors duration-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                                    )}
                                </div>

                                {/* Confirmar Contraseña */}
                                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '900ms' }}>
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-habita-primary" />
                                        Confirmar Contraseña *
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-habita-primary/60 group-hover:text-habita-primary transition-colors duration-300" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-12 pr-12 h-14 border-2 border-gray-200 rounded-xl focus:border-habita-primary focus:ring-habita-primary/20 transition-all duration-300 text-lg placeholder-gray-400"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-habita-primary/60 hover:text-habita-primary transition-colors duration-300"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formErrors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            {/* Mensaje de error */}
                            {error && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl animate-scale-in">
                                    <AlertDescription className="text-red-700 font-medium flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Botón de registro */}
                            <Button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-habita-primary to-habita-secondary hover:from-habita-primary/90 hover:to-habita-secondary/90 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:shadow-3xl animate-fade-in"
                                style={{ animationDelay: '1000ms' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                                        <span>Creando cuenta...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <UserPlus className="w-6 h-6" />
                                        <span>Crear Mi Cuenta</span>
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Enlace de login */}
                        <div className="text-center animate-fade-in" style={{ animationDelay: '1100ms' }}>
                            <p className="text-gray-600">
                                ¿Ya tienes una cuenta?{' '}
                                <Link
                                    to="/login"
                                    className="font-semibold text-habita-primary hover:text-habita-secondary transition-colors duration-300"
                                >
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200/50">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center space-x-4 mb-2">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        Propiedades
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <User className="w-3 h-3 mr-1" />
                                        Comunidad
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Home className="w-3 h-3 mr-1" />
                                        Hogares
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    © {new Date().getFullYear()} Habita ERP - Plataforma integral de gestión inmobiliaria
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterForm;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    LogIn,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Home,
    User,
    Building2,
    Sparkles
} from 'lucide-react';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        correo: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(formData);
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-habita-secondary via-habita-primary/20 to-habita-secondary p-4 relative overflow-hidden">
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-habita-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-habita-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse-slow"></div>
            </div>

            <div className="w-full max-w-md z-10">
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl transform hover:scale-[1.02] transition-all duration-500 animate-scale-in">
                    <CardHeader className="space-y-1 text-center pb-8 pt-10">
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
                            HABITA
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-lg font-medium">
                            Tu Hogar, en Cualquier Lugar
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campo Email */}
                            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                                <Label htmlFor="correo" className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-habita-primary" />
                                    Correo Electrónico
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
                            </div>

                            {/* Campo Contraseña */}
                            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-habita-primary" />
                                    Contraseña
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
                            </div>

                            {/* Enlace de recuperación */}
                            <div className="text-right animate-fade-in" style={{ animationDelay: '600ms' }}>
                                <Link
                                    to="/recuperar-contrasena"
                                    className="text-sm font-medium text-habita-primary hover:text-habita-secondary transition-colors duration-300"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
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

                            {/* Botón de login */}
                            <Button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-habita-primary to-habita-secondary hover:from-habita-primary/90 hover:to-habita-secondary/90 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:shadow-3xl animate-fade-in"
                                style={{ animationDelay: '800ms' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                                        <span>Iniciando sesión...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <LogIn className="w-6 h-6" />
                                        <span>Ingresar a la Plataforma</span>
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Enlace de registro */}
                        <div className="text-center animate-fade-in" style={{ animationDelay: '1000ms' }}>
                            <p className="text-gray-600">
                                ¿No tienes una cuenta?{' '}
                                <Link
                                    to="/registro"
                                    className="font-semibold text-habita-primary hover:text-habita-secondary transition-colors duration-300"
                                >
                                    Regístrate aquí
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

export default LoginForm;
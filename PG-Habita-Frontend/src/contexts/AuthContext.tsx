import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginCredentials, UserCapabilities } from '@/types/auth';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    updateUser: (user: User) => void;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; capabilities: UserCapabilities } }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_USER'; payload: { user: User; capabilities: UserCapabilities } }
    | { type: 'RESTORE_SESSION'; payload: { user: User; token: string; capabilities: UserCapabilities } };


const calculateUserCapabilities = (user: User): UserCapabilities => {
    // Obtener lista de permisos del usuario
    const userPermissions = user.permisos ||
                           (user.rol?.permisos?.map(p => p.nombre) || []);

    // Función para verificar permisos
    const hasPermission = (permission: string): boolean => {
        // Administradores y Superusuarios tienen todos los permisos
        if (user.is_superuser || user.is_staff || 
            ['SUPERUSER', 'ADMIN', 'ADMINISTRATOR', 'Administrador'].includes(user.role || '')) {
            return true;
        }

        return userPermissions.includes(permission);
    };

    const defaultCapabilities: UserCapabilities = {
        canCreateProperties: hasPermission('cud_propiedad'),
        canManageProperties: hasPermission('ver_propiedades') && hasPermission('cud_propiedad'),
        canViewProperties: hasPermission('ver_propiedades'),
        canMakeReservations: hasPermission('cud_reserva'),
        propertyLimit: 0,
        subscriptionTier: 'basic',
        hasPermission
    };

    // SUPERUSER y ADMIN tienen todos los permisos (sin restricciones)
    if (['SUPERUSER', 'ADMIN', 'ADMINISTRATOR', 'Administrador'].includes(user.role || '') || 
        user.is_superuser || user.is_staff) {
        return {
            ...defaultCapabilities,
            canCreateProperties: true,
            canManageProperties: true,
            canViewProperties: true,
            canMakeReservations: true,
            propertyLimit: Infinity,
            subscriptionTier: 'admin',
            hasPermission: () => true
        };
    }

    // CLIENT - capacidades según suscripción Y permisos
    if (user.role === 'CLIENT' && user.suscripcion) {
        const subscriptionName = user.suscripcion.nombre.toLowerCase();

        // Verificar permisos base
        const baseCapabilities = {
            ...defaultCapabilities,
            canCreateProperties: hasPermission('cud_propiedad'),
            canManageProperties: hasPermission('ver_propiedades') && hasPermission('cud_propiedad'),
            canViewProperties: hasPermission('ver_propiedades'),
            canMakeReservations: hasPermission('cud_reserva'),
        };

        switch (subscriptionName) {
            case 'básica':
                return {
                    ...baseCapabilities,
                    canCreateProperties: false,
                    canManageProperties: false,
                    propertyLimit: 0,
                    subscriptionTier: 'basic'
                };

            case 'premium':
                return {
                    ...baseCapabilities,
                    canCreateProperties: hasPermission('cud_propiedad'),
                    canManageProperties: hasPermission('ver_propiedades') && hasPermission('cud_propiedad'),
                    propertyLimit: 5,
                    subscriptionTier: 'premium'
                };

            case 'esmeralda':
                return {
                    ...baseCapabilities,
                    canCreateProperties: hasPermission('cud_propiedad'),
                    canManageProperties: hasPermission('ver_propiedades') && hasPermission('cud_propiedad'),
                    propertyLimit: Infinity,
                    subscriptionTier: 'esmeralda'
                };

            default:
                return {
                    ...baseCapabilities,
                    canCreateProperties: false,
                    canManageProperties: false,
                    propertyLimit: 0,
                    subscriptionTier: 'basic'
                };
        }
    }

    return defaultCapabilities;
};

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    capabilities: {
        canCreateProperties: false,
        canManageProperties: false,
        canViewProperties: true,
        canMakeReservations: true,
        propertyLimit: 0,
        subscriptionTier: 'basic',
        hasPermission: () => false
    }
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isLoading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                capabilities: action.payload.capabilities,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
                capabilities: initialState.capabilities
            };
        case 'LOGOUT':
            return initialState;
        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload.user,
                capabilities: action.payload.capabilities
            };
        case 'RESTORE_SESSION':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                capabilities: action.payload.capabilities,
                isAuthenticated: true,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // 🔥 FUNCIÓN PARA VERIFICAR PERMISOS
    const hasPermission = (permission: string): boolean => {
        return state.capabilities.hasPermission(permission);
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                const capabilities = calculateUserCapabilities(user);
                dispatch({
                    type: 'RESTORE_SESSION',
                    payload: { user, token, capabilities }
                });
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        }
    }, []);


    const register = async (userData: any): Promise<boolean> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            console.log('Intentando registro con:', userData);

            // 🔥 USAR AXIOS DIRECTAMENTE SIN EL INTERCEPTOR
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}api/usuarios/register/`,
                userData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            );

            console.log('Respuesta del registro:', response);

            // 🔥 EL REGISTRO NO DEVUELVE TOKENS, HACER LOGIN AUTOMÁTICO
            const loginResponse = await api.login({
                correo: userData.correo,
                password: userData.password
            });

            if (!loginResponse.access) {
                throw new Error('No se pudo iniciar sesión después del registro');
            }

            localStorage.setItem('accessToken', loginResponse.access);
            localStorage.setItem('refreshToken', loginResponse.refresh);

            const userResponse = await api.getProfile();
            console.log('Respuesta completa de getProfile:', userResponse);

            let userRole = 'CLIENT';
            let userPermissions: string[] = [];

            if (userResponse.rol && typeof userResponse.rol === 'object' && userResponse.rol.nombre) {
                userRole = userResponse.rol.nombre;
                console.log('✅ Rol extraído:', userRole);
            }

            // 🔥 OBTENER PERMISOS DEL TOKEN O DEL ROL
            if (loginResponse.user?.permisos) {
                userPermissions = loginResponse.user.permisos;
            } else if (userResponse.rol?.permisos) {
                userPermissions = userResponse.rol.permisos.map((p: any) => p.nombre);
            }

            console.log('🎯 Rol final:', userRole);
            console.log('🔑 Permisos del usuario:', userPermissions);

            const user: User = {
                id: userResponse.id,
                username: userResponse.username,
                correo: userResponse.correo,
                first_name: userResponse.first_name || '',
                last_name: userResponse.last_name || '',
                role: userRole,
                rol: userResponse.rol,
                is_active: userResponse.is_active ?? true,
                is_staff: userResponse.is_staff ?? false,
                last_login: userResponse.last_login ? new Date(userResponse.last_login) : new Date(),
                N_Cel: userResponse.N_Cel || '',
                fecha_Nac: userResponse.fecha_Nac || undefined,
                suscripcion: userResponse.suscripcion || undefined,
                profile: userResponse.profile || undefined,
                permisos: userPermissions
            };

            console.log('👤 Usuario final:', user);

            // 🔥 CALCULAR CAPACIDADES CON PERMISOS
            const capabilities = calculateUserCapabilities(user);
            console.log('🎯 Capacidades calculadas:', capabilities);

            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token: loginResponse.access, capabilities },
            });

            toast({
                title: "Registro exitoso",
                description: `¡Bienvenido/a ${user.first_name || user.username}! Tu cuenta ha sido creada correctamente.`,
            });

            return true;
        } catch (error: unknown) {
            console.error('Error en registro:', error);
            let errorMessage = 'Error al crear la cuenta';

            if (error && typeof error === 'object' && 'code' in error) {
                const err = error as { code?: string; response?: any; request?: any; message?: string };

                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'El servidor está tardando demasiado en responder. Por favor, inténtelo de nuevo más tarde.';
                } else if (err.response) {
                    if (err.response.status === 400) {
                        if (err.response.data?.username) {
                            errorMessage = `Username: ${err.response.data.username[0]}`;
                        } else if (err.response.data?.correo) {
                            errorMessage = `Correo: ${err.response.data.correo[0]}`;
                        } else if (err.response.data?.detail) {
                            errorMessage = err.response.data.detail;
                        } else if (typeof err.response.data === 'string') {
                            errorMessage = err.response.data;
                        } else {
                            errorMessage = 'Datos de registro inválidos. Verifique la información.';
                        }
                    } else if (err.response.status >= 500) {
                        errorMessage = 'Error en el servidor. Por favor, inténtelo más tarde.';
                    }
                } else if (err.request) {
                    errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }

            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });

            toast({
                title: "Error en el registro",
                description: errorMessage,
                variant: "destructive",
            });

            return false;
        }
    };

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            console.log('Intentando login con:', credentials);
            const response = await api.login(credentials);

            console.log('Respuesta del login:', response);
            if (!response.access) {
                throw new Error('La respuesta del servidor no contiene el token de acceso');
            }

            localStorage.setItem('accessToken', response.access);
            localStorage.setItem('refreshToken', response.refresh);

            const userResponse = await api.getProfile();
            console.log('Respuesta completa de getProfile:', userResponse);

            let userRole = 'CLIENT';
            let userPermissions: string[] = [];

            if (userResponse.rol && typeof userResponse.rol === 'object' && userResponse.rol.nombre) {
                userRole = userResponse.rol.nombre;
                console.log('✅ Rol extraído:', userRole);
            }

            // 🔥 OBTENER PERMISOS DEL TOKEN O DEL ROL
            if (response.user?.permisos) {
                userPermissions = response.user.permisos;
            } else if (userResponse.rol?.permisos) {
                userPermissions = userResponse.rol.permisos.map((p: any) => p.nombre);
            }

            console.log('🎯 Rol final:', userRole);
            console.log('🔑 Permisos del usuario:', userPermissions);

            const user: User = {
                id: userResponse.id,
                username: userResponse.username,
                correo: userResponse.correo,
                first_name: userResponse.first_name || '',
                last_name: userResponse.last_name || '',
                role: userRole,
                rol: userResponse.rol,
                is_active: userResponse.is_active ?? true,
                is_staff: userResponse.is_staff ?? false,
                last_login: userResponse.last_login ? new Date(userResponse.last_login) : new Date(),
                N_Cel: userResponse.N_Cel || '',
                fecha_Nac: userResponse.fecha_Nac || undefined,
                suscripcion: userResponse.suscripcion || undefined,
                profile: userResponse.profile || undefined,
                permisos: userPermissions
            };

            console.log('👤 Usuario final:', user);

            // 🔥 CALCULAR CAPACIDADES CON PERMISOS
            const capabilities = calculateUserCapabilities(user);
            console.log('🎯 Capacidades calculadas:', capabilities);

            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token: response.access, capabilities },
            });

            toast({
                title: "Inicio de sesión exitoso",
                description: `Bienvenido/a ${user.first_name || user.username}`,
            });

            return true;
        } catch (error: unknown) {
            console.error('Error en login:', error);
            let errorMessage = 'Error al iniciar sesión';

            if (error && typeof error === 'object' && 'code' in error) {
                const err = error as { code?: string; response?: any; request?: any; message?: string };

                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'El servidor está tardando demasiado en responder. Por favor, inténtelo de nuevo más tarde.';
                } else if (err.response) {
                    if (err.response.status === 401) {
                        errorMessage = 'Credenciales incorrectas. Verifique su correo y contraseña.';
                    } else if (err.response.data?.detail) {
                        errorMessage = err.response.data.detail;
                    } else if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.status >= 500) {
                        errorMessage = 'Error en el servidor. Por favor, inténtelo más tarde.';
                    }
                } else if (err.request) {
                    errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }

            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });

            toast({
                title: "Error de autenticación",
                description: errorMessage,
                variant: "destructive",
            });

            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });

        toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente",
        });
    };

    const updateUser = (user: User) => {
        const capabilities = calculateUserCapabilities(user);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'UPDATE_USER', payload: { user, capabilities } });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register, // 🔥 EXPORTAR FUNCIÓN DE REGISTRO
                logout,
                updateUser,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
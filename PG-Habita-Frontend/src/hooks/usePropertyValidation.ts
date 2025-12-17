import { useAuth } from '@/contexts/AuthContext';
import { usePropiedades } from './usePropiedades';
import { toast } from '@/hooks/use-toast';

export const usePropertyValidation = () => {
    const { user, capabilities, hasPermission } = useAuth();
    const { propiedades } = usePropiedades();

    const canCreateProperty = (): { canCreate: boolean; message?: string } => {
        if (!user) {
            return { canCreate: false, message: 'Debes iniciar sesión' };
        }

        // 🔥 VERIFICAR PERMISO PRIMERO
        if (!hasPermission('cud_propiedad')) {
            return {
                canCreate: false,
                message: 'No tienes permisos para crear propiedades.'
            };
        }

        // Luego verificar capacidades según suscripción
        if (user.role === 'CLIENT') {
            if (!capabilities.canCreateProperties) {
                return {
                    canCreate: false,
                    message: 'Tu suscripción actual no permite crear propiedades. Actualiza a Premium o Esmeralda.'
                };
            }

            // Verificar límite para suscripción Premium
            if (capabilities.subscriptionTier === 'premium') {
                const userProperties = propiedades.filter(p => p.user === user.id);
                if (userProperties.length >= capabilities.propertyLimit) {
                    return {
                        canCreate: false,
                        message: `Has alcanzado el límite de ${capabilities.propertyLimit} propiedades. Actualiza a Esmeralda para propiedades ilimitadas.`
                    };
                }
            }
        }

        return { canCreate: true };
    };

    const validateBeforeCreate = (): boolean => {
        const validation = canCreateProperty();
        if (!validation.canCreate && validation.message) {
            toast({
                title: "❌ No puedes crear propiedades",
                description: validation.message,
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    return {
        canCreateProperty,
        validateBeforeCreate,
        propertyLimit: capabilities.propertyLimit,
        currentPropertyCount: propiedades.filter(p => p.user === user?.id).length,
        hasPropertyPermission: hasPermission('cud_propiedad') // 🔥 VERIFICACIÓN DIRECTA
    };
};
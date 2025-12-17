import api from './api';
import { Permiso, PermisoFormData } from '@/types/auth';

export const permisosService = {
    // Obtener todos los permisos
    getPermisos: (): Promise<Permiso[]> =>
        api.fetchPermisos(),

    // Obtener un permiso por ID
    getPermiso: (id: number): Promise<Permiso> =>
        api.fetchPermiso(id),

    // Crear un nuevo permiso
    createPermiso: (data: PermisoFormData): Promise<Permiso> =>
        api.createPermiso(data),

    // Actualizar un permiso - ORDEN CORREGIDO: id primero, luego data
    updatePermiso: (id: number, data: Partial<PermisoFormData>): Promise<Permiso> =>
        api.updatePermiso(id, data), // ← id primero, data segundo

    // Eliminar un permiso
    deletePermiso: (id: number): Promise<void> =>
        api.deletePermiso(id),
};
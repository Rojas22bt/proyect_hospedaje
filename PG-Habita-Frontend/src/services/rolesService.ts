import api from './api';
import { Rol, RolFormData } from '@/types/auth';

export const rolesService = {
    // Obtener todos los roles
    getRoles: (): Promise<Rol[]> =>
        api.fetchRoles(),

    // Obtener un rol por ID
    getRol: (id: number): Promise<Rol> =>
        api.fetchRol(id),

    // Crear un nuevo rol
    createRol: (data: RolFormData): Promise<Rol> =>
        api.createRol(data),

    // Actualizar un rol - ORDEN CORREGIDO: id primero, luego data
    updateRol: (id: number, data: Partial<RolFormData>): Promise<Rol> =>
        api.updateRol(id, data), // ← id primero, data segundo

    // Eliminar un rol
    deleteRol: (id: number): Promise<void> =>
        api.deleteRol(id),
};
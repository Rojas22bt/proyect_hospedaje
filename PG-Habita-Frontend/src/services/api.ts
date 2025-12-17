import axios from 'axios';
import {
    LoginCredentials,
    AuthResponse,
    User,
    Servicio,
    Plan,
    Reservas,
    FilterParams, Rol, RolFormData, Permiso, PermisoFormData, Suscripcion, SuscripcionFormData,
    UsuarioFormData, Propiedad, PropiedadFormData,Reserva,ReservaFormData
} from '@/types/auth';

interface DashboardStats {
    total_propiedades: number;
    total_reservas: number;
    ocupacion_promedio: number;
    ingresos_totales: number;
    reservas_pendientes: number;
}

type ReportesMeta = Record<
    string,
    {
        label: string;
        campos: Record<string, { label: string; tipo: string }>;
        filtros?: Record<string, { label: string; tipo: string }>;
        agrupaciones?: string[];
    }
>;

// Instancia de Axios
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        // 🔥 EXCLUIR RUTAS PÚBLICAS DEL TOKEN
        const publicRoutes = [
            'api/usuarios/token/', // Login
            'api/usuarios/',       // Registro
            'api/usuarios/register/' // Por si acaso
        ];

        const isPublicRoute = publicRoutes.some(route =>
            config.url?.includes(route)
        );

        if (token && config.headers && !isPublicRoute) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        ...error,
        message: 'El servidor está tardando demasiado en responder.',
      });
    }

    // Si es error 401 y no es una solicitud de refresh
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/token/refresh/')) {

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Usar axiosInstance para el refresh
          const response = await axiosInstance.post('api/usuarios/token/refresh/', {
            refresh: refreshToken
          });

          if (response.data.access) {
            localStorage.setItem('accessToken', response.data.access);
            // Actualizar el header de la solicitud original
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Limpiar tokens y redirigir al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    if (!error.response) {
      return Promise.reject({
        ...error,
        message: 'No se puede conectar con el servidor.',
      });
    }

    return Promise.reject(error);
  },
);

const api = {

    // Permisos
    fetchPermisos: (): Promise<Permiso[]> =>
        axiosInstance.get('api/permisos/').then(res => res.data),

    fetchPermiso: (id: number): Promise<Permiso> =>
        axiosInstance.get(`api/permisos/permisos/${id}`).then(res => res.data),

    createPermiso: (data: PermisoFormData): Promise<Permiso> =>
        axiosInstance.post('api/permisos/', data).then(res => res.data),

    updatePermiso: (id: number, data: Partial<PermisoFormData>): Promise<Permiso> =>
        axiosInstance.put(`api/permisos/permisos/${id}`, data).then(res => res.data),

    deletePermiso: (id: number): Promise<void> =>
        axiosInstance.delete(`api/permisos/permisos/${id}`).then(res => res.data),

    // Roles
    fetchRoles: (): Promise<Rol[]> =>
        axiosInstance.get('api/roles/').then(res => res.data),

    fetchRol: (id: number): Promise<Rol> =>
        axiosInstance.get(`api/roles/${id}/`).then(res => res.data),

    createRol: (data: RolFormData): Promise<Rol> =>
        axiosInstance.post('api/roles/', data).then(res => res.data),

    updateRol: (id: number, data: Partial<RolFormData>): Promise<Rol> =>
        axiosInstance.put(`api/roles/${id}/`, data).then(res => res.data),

    deleteRol: (id: number): Promise<void> =>
        axiosInstance.delete(`api/roles/${id}/`).then(res => res.data),

    // SUSCRIPCIONES
    fetchSuscripciones: (filters?: FilterParams): Promise<Suscripcion[]> =>
        axiosInstance.get('api/suscripciones/').then(res => res.data),

    fetchSuscripcion: (id: number): Promise<Suscripcion> =>
        axiosInstance.get(`api/suscripciones/suscripciones/${id}`).then(res => res.data),

    createSuscripcion: (data: SuscripcionFormData): Promise<Suscripcion> =>
        axiosInstance.post('api/suscripciones/', data).then(res => res.data),

    updateSuscripcion: (id: number, data: Partial<SuscripcionFormData>): Promise<Suscripcion> =>
        axiosInstance.put(`api/suscripciones/suscripciones/${id}`, data).then(res => res.data),

    deleteSuscripcion: (id: number): Promise<void> =>
        axiosInstance.delete(`api/suscripciones/suscripciones/${id}`).then(res => res.data),

    // USUARIOS - CRUD COMPLETO
    fetchUsuarios: (): Promise<User[]> =>
        axiosInstance.get('api/usuarios/').then(res => {
            console.log('🔍 Respuesta completa de /api/usuarios/:', res);
            console.log('📦 Datos recibidos:', res.data);
            console.log('🎯 Tipo de datos:', typeof res.data);
            return res.data;
        }),

    fetchUsuario: (id: number): Promise<User> =>
        axiosInstance.get(`api/usuarios/${id}/`).then(res => res.data),

    createUsuario: (data: UsuarioFormData): Promise<User> =>
        axiosInstance.post('api/usuarios/', data).then(res => res.data),

    updateUsuario: (id: number, data: Partial<UsuarioFormData>): Promise<User> =>
        axiosInstance.put(`api/usuarios/${id}/`, data).then(res => res.data),

    deleteUsuario: (id: number): Promise<void> =>
        axiosInstance.delete(`api/usuarios/${id}/`).then(res => res.data),

    // Autenticación
    login: (credentials: LoginCredentials): Promise<AuthResponse> =>
        axiosInstance.post('api/usuarios/token/', credentials).then(res => res.data),

    register: (userData: any): Promise<AuthResponse> =>
        axiosInstance.post('api/usuarios/register/', userData).then(res => res.data),

    refreshToken: (refresh: string): Promise<AuthResponse> =>
        axiosInstance.post('api/usuarios/token/refresh/', { refresh }).then(res => res.data),

    getProfile: (): Promise<User> =>
        axiosInstance.get('api/usuarios/me/').then(res => res.data),

    // Servicios
    fetchServicios: (filters?: FilterParams): Promise<Servicio[]> =>
        axiosInstance.get('api/servicios/', { params: filters }).then(res => res.data),
    createServicio: (data: Partial<Servicio>): Promise<Servicio> =>
        axiosInstance.post('api/servicios/', data).then(res => res.data),
    updateServicio: (data: Partial<Servicio>, pk: number): Promise<Servicio> =>
        axiosInstance.put(`api/servicios/${pk}/`, data).then(res => res.data),
    deleteServicio: (pk: number): Promise<void> =>
        axiosInstance.delete(`api/servicios/${pk}/`).then(res => res.data),

    // Planes
    fetchPlanes: (filters?: FilterParams): Promise<Plan[]> =>
        axiosInstance.get('api/planes/', { params: filters }).then(res => res.data),
    createPlan: (data: Partial<Plan>): Promise<Plan> =>
        axiosInstance.post('api/planes/', data).then(res => res.data),
    updatePlan: (data: Partial<Plan>, pk: number): Promise<Plan> =>
        axiosInstance.put(`api/planes/${pk}/`, data).then(res => res.data),
    deletePlan: (pk: number): Promise<void> =>
        axiosInstance.delete(`api/planes/${pk}/`).then(res => res.data),

    // Propiedades
    fetchPropiedades: (): Promise<Propiedad[]> =>
        axiosInstance.get('api/propiedades/').then(res => {
            console.log('🔍 Respuesta de propiedades:', res.data);
            return res.data;
        }),

    fetchPropiedad: (id: number): Promise<Propiedad> =>
        axiosInstance.get(`api/propiedades/${id}/`).then(res => res.data),

    createPropiedad: (data: PropiedadFormData): Promise<Propiedad> =>
        axiosInstance.post('api/propiedades/', data).then(res => res.data),

    updatePropiedad: (id: number, data: Partial<PropiedadFormData>): Promise<Propiedad> =>
        axiosInstance.put(`api/propiedades/${id}/`, data).then(res => res.data),

    deletePropiedad: (id: number): Promise<void> =>
        axiosInstance.delete(`api/propiedades/${id}/`).then(res => res.data),

    darBajaPropiedad: (id: number, data: BajaPropiedadData): Promise<Propiedad> =>
        axiosInstance.post(`api/propiedades/${id}/dar-baja/`, data).then(res => res.data),

    reactivarPropiedad: (id: number): Promise<Propiedad> =>
        axiosInstance.post(`api/propiedades/${id}/reactivar/`).then(res => res.data),

    // Reservas
    fetchReservas: async (): Promise<Reserva[]> => {
        const response = await axiosInstance.get('api/reservas/');
        return response.data;
    },

    fetchReserva: async (id: number): Promise<Reserva> => {
        const response = await axiosInstance.get(`api/reservas/${id}/`);
        return response.data;
    },

    createReserva: async (data: ReservaFormData): Promise<Reserva> => {
        const response = await axiosInstance.post('api/reservas/', data);
        return response.data;
    },

    updateReserva: async (id: number, data: Partial<ReservaFormData>): Promise<Reserva> => {
        const response = await axiosInstance.put(`api/reservas/${id}/`, data);
        return response.data;
    },

    deleteReserva: async (id: number): Promise<void> => {
        await axiosInstance.delete(`api/reservas/${id}/`);
    },

    fetchFechasOcupadas: (propiedadId: number): Promise<{fechas_ocupadas: string[]}> =>
        axiosInstance.get(`api/reservas/fechas-ocupadas/${propiedadId}/`).then(res => res.data),

    // NOTIFICACIONES
    fetchNotificaciones: async (): Promise<Notificacion[]> => {
        const response = await axiosInstance.get('api/notificaciones/');
        return response.data;
    },

    fetchNotificacionesNoLeidas: async (): Promise<Notificacion[]> => {
        const response = await axiosInstance.get('api/notificaciones/no-leidas/');
        return response.data;
    },

    countNotificacionesNoLeidas: async (): Promise<{ count: number }> => {
        const response = await axiosInstance.get('api/notificaciones/no-leidas/');
        return { count: response.data.length };
    },

    createNotificacion: async (data: NotificacionFormData): Promise<Notificacion> => {
        const response = await axiosInstance.post('api/notificaciones/', data);
        return response.data;
    },

    marcarNotificacionLeida: async (id: number, data: { leida: boolean }): Promise<void> => {
        await axiosInstance.post(`api/notificaciones/${id}/marcar-leida/`, data);
    },

    marcarTodasLeidas: async (): Promise<void> => {
        await axiosInstance.post('api/notificaciones/marcar-todas-leidas/');
    },

    deleteNotificacion: async (id: number): Promise<void> => {
        await axiosInstance.delete(`api/notificaciones/${id}/`);
    },

    // PUBLICIDAD
    fetchPublicidades: (): Promise<Publicidad[]> =>
        axiosInstance.get('api/ads/').then(res => res.data),

    fetchPublicidad: (id: number): Promise<Publicidad> =>
        axiosInstance.get(`api/ads/${id}/`).then(res => res.data),

    createPublicidad: (data: PublicidadFormData): Promise<Publicidad> =>
        axiosInstance.post('api/ads/', data).then(res => res.data),

    updatePublicidad: (id: number, data: Partial<PublicidadFormData>): Promise<Publicidad> =>
        axiosInstance.put(`api/ads/${id}/`, data).then(res => res.data),

    deletePublicidad: (id: number): Promise<void> =>
        axiosInstance.delete(`api/ads/${id}/`).then(res => res.data),

    fetchPublicidadesActivas: (): Promise<PublicidadActiva[]> =>
        axiosInstance.get('api/ads/activas/').then(res => res.data),

    togglePublicidadActiva: (id: number): Promise<{status: string; activa: boolean; message: string}> =>
        axiosInstance.post(`api/ads/${id}/toggle-activa/`).then(res => res.data),

    // Dashboard extendido
    fetchDashboardEstadisticas: (): Promise<DashboardStats> =>
        axiosInstance.get('api/dashboard/estadisticas/').then(res => res.data),

    fetchFilesByPropiedad: (propiedadId: number): Promise<File[]> =>
        axiosInstance.get(`api/files/propiedades/${propiedadId}/`).then(res => res.data),

    fetchAllFiles: (): Promise<File[]> =>
        axiosInstance.get('api/files/').then(res => res.data),

    uploadFiles: (data: FormData): Promise<File[]> =>
        axiosInstance.post('api/files/upload-multiple/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),

    listarFavoritos: async (): Promise<any[]> => {
      const response = await axiosInstance.get('api/favoritos/favoritos/');
      return response.data;
    },

    toggleFavorito: async (propiedadId: number): Promise<{accion: string; es_favorito: boolean}> => {
      const response = await axiosInstance.post('api/favoritos/toggle/', {
        propiedad_id: propiedadId
      });
      return response.data;
    },




 crearBackup: (): Promise<{status: string; message: string; filename: string; stats: any}> =>
     axiosInstance.post('api/backup/create/').then(res => res.data),

   listarBackups: (): Promise<{status: string; backups: Backup[]; total: number}> =>
     axiosInstance.get('api/backup/list/').then(res => res.data),

   descargarBackup: (filename: string): Promise<any> =>
     axiosInstance.get(`api/backup/download/${filename}/`, {
       responseType: 'blob'
     }),

   eliminarBackup: (filename: string): Promise<{status: string; message: string}> =>
     axiosInstance.delete(`api/backup/delete/${filename}/`).then(res => res.data),

   backupStatus: (): Promise<{status: string; database_stats: DatabaseStats}> =>
     axiosInstance.get('api/backup/status/').then(res => res.data),


 // 🔥 REPORTES
  obtenerReportesReservas: (params: string): Promise<{status: string; reporte: ReporteData}> =>
    axiosInstance.get(`api/reportes/reservas/?${params}`).then(res => res.data),

    obtenerReportesMeta: (): Promise<{status: string; meta: ReportesMeta}> =>
        axiosInstance.get('api/reportes/meta/').then(res => res.data),

    generarReporteDinamico: (payload: any): Promise<{status: string; reporte: any}> =>
        axiosInstance.post('api/reportes/dinamico/generar/', payload).then(res => res.data),

    exportarReporteDinamico: (payload: any, formato: 'pdf' | 'csv' | 'excel' | 'xlsx') =>
        axiosInstance.post(`api/reportes/dinamico/exportar/?formato=${formato}`, payload, {
            responseType: 'blob',
        }),

    generarReportePorIA: (payload: { prompt: string; contexto_adicional?: string }): Promise<{status: string; reporte: any; config?: any}> =>
        axiosInstance.post('api/reportes/ia/', payload).then(res => res.data),

  // 🔥 BITÁCORA
  obtenerBitacora: (params: string): Promise<{
    status: string;
    bitacoras: BitacoraItem[];
    total: number;
    pagina: number;
    total_paginas: number;
  }> =>
    axiosInstance.get(`api/bitacora/?${params}`).then(res => res.data),




   restaurarBackup: (filename: string): Promise<{
       status: string;
       message: string;
       filename: string;
       stats: any;
       backup_info: any;
     }> =>
       axiosInstance.post('api/backup/restore/', { filename }).then(res => res.data),



fetchPropiedadesPublicas: (): Promise<Propiedad[]> =>
  axiosInstance.get('api/propiedades/public/').then(res => res.data),


    setPrincipalImage: (fileId: number): Promise<File> =>
        axiosInstance.post(`api/files/${fileId}/set-principal/`).then(res => res.data),

    deleteFile: (fileId: number): Promise<void> =>
        axiosInstance.delete(`api/files/${fileId}/`).then(res => res.data),

    // En api.ts - VERSIÓN MEJORADA PARA TODA BOLIVIA Y MÁS
    geocodificarDireccion: async (direccion: string): Promise<GeocodingResult> => {
        try {
            if (!direccion.trim()) {
                return {
                    latitud: 0,
                    longitud: 0,
                    direccion_completa: direccion,
                    ciudad: '',
                    provincia: '',
                    departamento: '',
                    pais: '',
                    exito: false,
                    error: 'La dirección está vacía'
                };
            }

            // 🔥 MEJORAR: Buscar en toda Bolivia sin forzar Santa Cruz
            const query = encodeURIComponent(direccion);
            console.log('🔍 Buscando ubicación:', direccion);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&accept-language=es&countrycodes=bo&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('📍 Resultados de geocodificación:', data);

            if (data && data.length > 0) {
                const result = data[0];
                const address = result.address;

                // 🔥 DETECTAR AUTOMÁTICAMENTE LA UBICACIÓN
                const ciudad = address?.city || address?.town || address?.village || address?.municipality || '';
                const provincia = address?.state || address?.county || '';
                const departamento = address?.state || address?.county || '';
                const pais = address?.country || 'Bolivia';

                return {
                    latitud: parseFloat(result.lat),
                    longitud: parseFloat(result.lon),
                    direccion_completa: result.display_name,
                    ciudad: ciudad,
                    provincia: provincia,
                    departamento: departamento,
                    pais: pais,
                    exito: true
                };
            } else {
                console.warn('❌ No se encontraron resultados para:', direccion);

                // 🔥 INTENTAR BÚSQUEDA MÁS AMPLIA SIN FILTRO DE PAÍS
                const responseGlobal = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ', Bolivia')}&limit=3&accept-language=es&addressdetails=1`
                );

                if (responseGlobal.ok) {
                    const globalData = await responseGlobal.json();
                    if (globalData && globalData.length > 0) {
                        const globalResult = globalData[0];
                        const globalAddress = globalResult.address;

                        return {
                            latitud: parseFloat(globalResult.lat),
                            longitud: parseFloat(globalResult.lon),
                            direccion_completa: globalResult.display_name,
                            ciudad: globalAddress?.city || globalAddress?.town || globalAddress?.village || '',
                            provincia: globalAddress?.state || globalAddress?.county || '',
                            departamento: globalAddress?.state || globalAddress?.county || '',
                            pais: globalAddress?.country || 'Bolivia',
                            exito: true
                        };
                    }
                }

                return {
                    latitud: 0,
                    longitud: 0,
                    direccion_completa: direccion,
                    ciudad: '',
                    provincia: '',
                    departamento: '',
                    pais: '',
                    exito: false,
                    error: 'No se pudo encontrar la ubicación. Intenta con una dirección más específica incluyendo ciudad y departamento.'
                };
            }
        } catch (error) {
            console.error('❌ Error en geocodificación:', error);
            return {
                latitud: 0,
                longitud: 0,
                direccion_completa: direccion,
                ciudad: '',
                provincia: '',
                departamento: '',
                pais: '',
                exito: false,
                error: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
            };
        }
    },

    // 🔥 FUNCIÓN PARA ACTUALIZAR UBICACIÓN EN EL BACKEND
    actualizarUbicacionPropiedad: (id: number, data: {
        latitud?: number;
        longitud?: number;
        direccion_completa?: string;
        ciudad?: string;
        provincia?: string;
        departamento?: string;
        pais?: string;
    }): Promise<Propiedad> =>
        axiosInstance.patch(`api/propiedades/${id}/`, data).then(res => res.data),
};

export default api;

export interface Permiso {
    id: number;
    nombre: string;
    descipcion: string | null;
}

export interface Rol {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: Permiso[];
}

export interface RolFormData {
    nombre: string;
    descripcion: string;
    permisos_ids: number[];
}

export interface PermisoFormData {
    nombre: string;
    descipcion: string;
}

export interface Suscripcion {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_mensual: number;
    status: 'Activa' | 'Inactiva';
    precio_semestral: number;
    precio_anual: number;
    precio_total: number;
}

export interface SuscripcionFormData {
    nombre: string;
    descripcion: string;
    precio_mensual: number | string;
    status: 'Activa' | 'Inactiva';
}



export interface User {
    id: number;
    username: string;
    correo: string;
    first_name: string;
    last_name: string;
    role: string;
    rol?: Rol;
    is_active: boolean;
    profile?: UserProfile;
    N_Cel?: string;
    fecha_Nac?: string;
    is_staff: boolean;
    last_login:Date;
   suscripcion?: {
           id: number;
           nombre: string;
           status: string;
       };
       permisos?: string[];
}

export interface UserProfile {
    telefono?: string;
    direccion?: string;
    fecha_nacimiento?: string;
    foto?: string;
}

export interface UsuarioFormData {
    username: string;
    correo: string;
    first_name: string;
    last_name: string;
    N_Cel: string;
    fecha_Nac: string;
    rol_id: number;
    suscripcion_id?: number;
    password?: string;
    is_active: boolean;
}

export interface LoginCredentials {
    correo: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface UserCapabilities {
    canCreateProperties: boolean;
    canManageProperties: boolean;
    canViewProperties: boolean;
    canMakeReservations: boolean;
    propertyLimit: number;
    subscriptionTier: 'basic' | 'premium' | 'esmeralda' | 'admin';
    hasPermission: (permission: string) => boolean; // 🔥 FUNCIÓN PARA VERIFICAR PERMISOS
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    capabilities: UserCapabilities;
}

export type FilterParams = {
    [key: string]: string | number | boolean | undefined;
};

// Nuevos tipos basados en los modelos de Django
export interface Servicio {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_Creacion: string;
    precio: number;
    status: boolean;
    descuento: number;
}

export interface Suscripciones {
    id: number;
    nombre: string;
    status: string;
}

export interface Plan {
    id: number;
    usuario: User;
    suscripcion: Suscripciones;
    usuario_id: number;
    suscripcion_id: number;
    fecha_inicio: string;
    duracion: 'Mensual' | 'Semestral' | 'Anual';
    fecha_final: string;
}

export interface PropiedadFormData {
    nombre: string;
    descripcion: string;
    tipo: 'Departamento' | 'Casa' | 'Cabaña' | '';
    caracteristicas: string[];
    status: boolean;
    precio_noche: number;
    cant_bath: number;
    cant_hab: number;
    max_huespedes: number;
    pets: boolean;

    latitud?: number | null;
    longitud?: number | null;
    direccion_completa?: string;
    ciudad?: string;
    provincia?: string;
    departamento?: string;
    pais?: string;
}


export interface GeocodingResult {
    latitud: number;
    longitud: number;
    direccion_completa: string;
    ciudad: string;
    provincia: string;
    departamento: string;
    pais: string;
    exito: boolean;
    error?: string;
}


export interface Propiedad {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: 'Departamento' | 'Casa' | 'Cabaña' | '';
    caracteristicas: string[];
    status: boolean;
    precio_noche: number;
    cant_bath: number;
    cant_hab: number;
    max_huespedes: number;
    pets: boolean;
    estado_baja: 'activa' | 'baja_temporal' | 'baja_indefinida';
    fecha_baja_inicio?: string;
    fecha_baja_fin?: string;
    motivo_baja?: string;
    esta_disponible: boolean;
    user: number;
    descuento?: number;
    creado_en?: string;
    actualizado_en?: string;

    // 🔥 CAMPOS GEOGRÁFICOS
    latitud?: number | null;
    longitud?: number | null;
    direccion_completa: string;
    ciudad?: string;
    provincia?: string;
    departamento?: string;
    pais?: string;
    es_destino_turistico?: boolean;


    files?: File[];
    imagen_principal?: string;
}



export interface BajaPropiedadData {
    tipo_baja: 'temporal' | 'indefinida';
    fecha_baja_fin?: string;
    motivo_baja?: string;
}


export interface Reserva {
  id: number;
  monto_total: number;
  cant_huesp: number;
  cant_noches: number;
  descuento: number;
  comentario_huesp: string;
  fecha_checkin: string;
  fecha_checkout: string;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'confirmada' | 'cancelada' | 'completada';
  pago_estado: 'pendiente' | 'pagado' | 'reembolsado' | 'fallido';
  user: number;
  propiedad: number;
  user_username?: string;
  propiedad_nombre?: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface ReservaConDetalles extends Reserva {
  usuario?: User;
  propiedadInfo?: Propiedad;
}


export interface ReservaFormData {
  monto_total: number;
  cant_huesp: number;
  cant_noches: number;
  descuento: number;
  comentario_huesp: string;
  fecha_checkin: string;
  fecha_checkout: string;
  // 🔥 CORREGIDO
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'confirmada' | 'cancelada' | 'completada';
  pago_estado: 'pendiente' | 'pagado' | 'reembolsado' | 'fallido'; // 🔥 AGREGADO
  user: number;
  propiedad: number;
}

export interface Notificacion {
    id: number;
    usuario: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    tipo_display?: string;
    reserva?: number;
    leida: boolean;
    enviada: boolean;
    creado_en: string;
    // Campos expandidos
    usuario_username?: string;
    propiedad_nombre?: string;
}

export interface NotificacionFormData {
    titulo: string;
    mensaje: string;
    tipo: string;
    reserva?: number;
}

export interface MarcarLeidaData {
    leida: boolean;
}

// Publicidad
export interface Publicidad {
    id: number;
    titulo: string;
    descripcion: string | null;
    imagen_url: string | null;
    tipo: string;
    tipo_display?: string;
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
    creado_por: number;
    creado_por_username?: string;
    creado_en: string;
}

export interface PublicidadFormData {
    titulo: string;
    descripcion: string;
    imagen_url: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
}

export interface PublicidadActiva {
    id: number;
    titulo: string;
    descripcion: string | null;
    imagen_url: string | null;
    tipo: string;
    tipo_display?: string;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface DashboardStats {
    total_propiedades: number;
    total_reservas: number;
    ocupacion_promedio: number;
    ingresos_totales: number;
    reservas_pendientes: number;
    notificaciones_no_leidas: number;
    publicidades_activas: number;
    notificaciones_recientes: number;
    reservas_recientes: number;

    // Información del usuario
    user_role: string;
    is_staff: boolean;
    is_superuser: boolean;
}

export interface File {
  id: number;
  propiedad: number;
  archivo: string;
  archivo_url?: string;
  nombre_archivo: string;
  tipo_archivo: string;
  fecha_subida: string;
  es_principal: boolean;
}

export interface FileUploadData {
  archivos: File[];
  propiedad_id: number;
  es_principal: boolean;
}

export interface Backup {
  name: string;
  size: string;
  created: string;
  timestamp: string;
  records: number;
}

export interface DatabaseStats {
  usuarios: number;
  propiedades: number;
  reservas: number;
  favoritos: number;
  ultimo_backup: string;
}
export interface ReporteData {
  total_reservas: number;
  total_ganancias: number;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  estadisticas: {
    reservas_por_estado: Array<{ estado: string; count: number; total: number }>;
    reservas_por_propiedad: Array<{ propiedad__nombre: string; count: number; total: number }>;
    top_propiedades: Array<any>;
  };
  graficos: any;
}

export interface BitacoraItem {
  id: number;
  usuario: {
    id: number;
    username: string;
    nombre_completo: string;
  };
  accion: string;
  modulo: string;
  detalles: any;
  ip_address: string;
  user_agent: string;
  creado_en: string;
}
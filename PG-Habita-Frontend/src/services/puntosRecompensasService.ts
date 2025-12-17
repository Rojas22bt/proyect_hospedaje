import api from './api';

export interface Puntos {
  id: number;
  usuario: number;
  saldo: number;
  total_acumulado: number;
  creado_en: string;
  actualizado_en: string;
}

export interface Recompensa {
  id: number;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  activa: boolean;
  stock: number;
  creado_en: string;
}

export interface Canje {
  id: number;
  usuario: number;
  recompensa: number;
  puntos_usados: number;
  fecha_canje: string;
}

export const puntosRecompensasService = {
  // Puntos
  fetchPuntos: async (): Promise<Puntos> => {
    const response = await api.axiosInstance.get('api/puntos/mi-saldo/');
    return response.data;
  },

  // Recompensas
  fetchRecompensas: async (): Promise<Recompensa[]> => {
    const response = await api.axiosInstance.get('api/recompensas/');
    return response.data;
  },

  fetchRecompensa: async (id: number): Promise<Recompensa> => {
    const response = await api.axiosInstance.get(`api/recompensas/${id}/`);
    return response.data;
  },

  canjearRecompensa: async (recompensaId: number): Promise<Canje> => {
    const response = await api.axiosInstance.post('api/recompensas/canjear/', {
      recompensa_id: recompensaId,
    });
    return response.data;
  },

  fetchMisCanjes: async (): Promise<Canje[]> => {
    const response = await api.axiosInstance.get('api/recompensas/mis-canjes/');
    return response.data;
  },
};

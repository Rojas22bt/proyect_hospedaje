import api from './api';

export interface Resena {
  id: number;
  usuario: number;
  usuario_username?: string;
  propiedad: number;
  propiedad_nombre?: string;
  reserva: number | null;
  estrellas: number;
  comentario: string;
  creado_en: string;
}

export interface ResenaFormData {
  propiedad: number;
  reserva?: number;
  estrellas: number;
  comentario: string;
}

export const resenasService = {
  fetchResenas: async (): Promise<Resena[]> => {
    const response = await api.axiosInstance.get('api/resenas/');
    return response.data;
  },

  fetchResenasByPropiedad: async (propiedadId: number): Promise<Resena[]> => {
    const response = await api.axiosInstance.get(`api/resenas/propiedad/${propiedadId}/`);
    return response.data;
  },

  fetchMisResenas: async (): Promise<Resena[]> => {
    const response = await api.axiosInstance.get('api/resenas/mis-resenas/');
    return response.data;
  },

  createResena: async (data: ResenaFormData): Promise<Resena> => {
    const response = await api.axiosInstance.post('api/resenas/', data);
    return response.data;
  },

  updateResena: async (id: number, data: Partial<ResenaFormData>): Promise<Resena> => {
    const response = await api.axiosInstance.put(`api/resenas/${id}/`, data);
    return response.data;
  },

  deleteResena: async (id: number): Promise<void> => {
    await api.axiosInstance.delete(`api/resenas/${id}/`);
  },
};

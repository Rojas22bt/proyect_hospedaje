import api from './api';

export interface Factura {
  id: number;
  reserva: number;
  nit_ci: string;
  nombre: string;
  total: number;
  enviada: boolean;
  creado_en: string;
}

export interface FacturaFormData {
  reserva: number;
  nit_ci: string;
  nombre: string;
  total: number;
}

export const facturasService = {
  fetchFacturas: async (): Promise<Factura[]> => {
    const response = await api.axiosInstance.get('api/facturas/');
    return response.data;
  },

  fetchFactura: async (id: number): Promise<Factura> => {
    const response = await api.axiosInstance.get(`api/facturas/${id}/`);
    return response.data;
  },

  createFactura: async (data: FacturaFormData): Promise<Factura> => {
    const response = await api.axiosInstance.post('api/facturas/', data);
    return response.data;
  },

  updateFactura: async (id: number, data: Partial<FacturaFormData>): Promise<Factura> => {
    const response = await api.axiosInstance.put(`api/facturas/${id}/`, data);
    return response.data;
  },

  deleteFactura: async (id: number): Promise<void> => {
    await api.axiosInstance.delete(`api/facturas/${id}/`);
  },
};

import api from './api';

export const serviciosService = {
  fetchServicios: async () => {
    const response = await api.axiosInstance.get('api/servicios/');
    return response.data;
  },

  fetchServicio: async (id: number) => {
    const response = await api.axiosInstance.get(`api/servicios/${id}/`);
    return response.data;
  },

  createServicio: async (data: any) => {
    const response = await api.axiosInstance.post('api/servicios/', data);
    return response.data;
  },

  updateServicio: async (id: number, data: any) => {
    const response = await api.axiosInstance.put(`api/servicios/${id}/`, data);
    return response.data;
  },

  deleteServicio: async (id: number) => {
    await api.axiosInstance.delete(`api/servicios/${id}/`);
  },
};

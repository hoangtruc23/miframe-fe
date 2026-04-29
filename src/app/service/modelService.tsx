import apiClient from "@/app/axios/apiClient";

export const modelService = {
    getAll: async (params?: any) => {
        const response = await apiClient.get('/models/getAll', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await apiClient.post('/models/create', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.put(`/models/update/${id}`, data);
        return response.data;
    },

    // delete: async (id: string) => {
    //     const response = await axios.delete(`/api/models/${id}`);
    //     return response.data;
    // }
};
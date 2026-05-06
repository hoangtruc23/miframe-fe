import apiClient from "@/app/axios/apiClient";

export const expenseService = {
    getAll: async (params?: any) => {
        const response = await apiClient.get('/expense/getAll', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await apiClient.post('/expense/create', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.put(`/expense/update/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        // const response = await axios.delete(`/api/expenses/${id}`);
        const response = await apiClient.delete(`/expense/delete/${id}`);
        return response.data;
    }
};
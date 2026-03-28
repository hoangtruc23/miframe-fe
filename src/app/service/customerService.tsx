import apiClient from "@/app/axios/apiClient";

export const CustomerService = {
    getAll: async (params?: any) => {
        const response = await apiClient.get('/customers/getAll', { params });
        return response.data;
    },
}
import apiClient from "@/app/axios/apiClient";

export const AuthService = {
    login: async (username: string, password: string) => {
        const response = await apiClient.post('/auth/login', { username, password });
        return response.data;
    }
}
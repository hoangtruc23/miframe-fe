import apiClient from "@/app/axios/apiClient";

export const RentalService = {
    urlApi: `${process.env.NEXT_PUBLIC_API_URL}/rental`,
    async getDashboard(month: string, year: string) {
        const res = await fetch(this.urlApi + `/dashboard?month=${month}&year=${year}`)
        if (!res.ok) {
            throw new Error("Lỗi")
        }

        return res.json()
    },

    getRentalToday: async () => {
        const response = await apiClient.get('/rental/getRentalToday');
        return response.data;
    },

    async getAll(query: string) {
        const res = await fetch(this.urlApi + "/getAll?" + new URLSearchParams(query))
        if (!res.ok) {
            throw new Error("Lấy danh sách máy thất bại")
        }

        return res.json()
    },
    async create(data: any) {
        const res = await fetch(this.urlApi + "/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            throw new Error("Tạo máy thất bại")
        }

        return res.json()
    },
    async update(rentalId: string, data: any) {
        const res = await fetch(this.urlApi + `/update/${rentalId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            throw new Error("Cập nhật máy thất bại")
        }

        return res.json()
    },
    delete: async (id: string) => {
        const response = await apiClient.get(`/rental/delete/${id}`);
        return response.data;
    },



}
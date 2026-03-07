import { environment } from "@/environments/environment"

export const RentalService = {
    urlApi: environment.apiUrl + "rental",
    async getDashboard() {
        const res = await fetch(this.urlApi + "/dashboard")
        if (!res.ok) {
            throw new Error("Lỗi")
        }

        return res.json()
    },
    async getAll() {
        const res = await fetch(this.urlApi + "/getAll")
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




}
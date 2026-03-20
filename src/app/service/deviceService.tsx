import { environment } from "@/environments/environment"

export const DeviceService = {
    urlApi: environment.apiUrl + "device",
    async getAll(query: string) {
        const res = await fetch(this.urlApi + "/getAll/?" + new URLSearchParams(query))
        if (!res.ok) {
            throw new Error("Lấy danh sách máy thất bại")
        }

        return res.json()
    },
    async getAvailableDevices(query: string) {
        const res = await fetch(this.urlApi + "/getAvailableDevices/?" + new URLSearchParams(query))
        if (!res.ok) {
            throw new Error("Lấy danh sách máy thất bại")
        }

        return res.json()
    },
    async create(data: unknown) {
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
    async update(deviceId: string, data: unknown) {
        const res = await fetch(this.urlApi + `/update/${deviceId}`, {
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
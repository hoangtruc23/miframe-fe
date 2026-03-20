"use client"
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DeviceService } from '@/app/service/deviceService'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import DeviceModel from '@/app/Model/Device'
import { toast } from 'sonner'


function DeviceManagement() {
    const [open, setOpen] = useState(false)
    const [devices, setDevices] = useState<DeviceModel[]>([])
    const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null)
    const [statusDevice, setStatusDevice] = useState('')
    // const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState<DeviceModel | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevice }).toString())
            if (res.status === 200) {
                setDevices(res.data)
            }
        } catch (error: unknown) {
            console.error("Lỗi tải thiết bị:", (error as Error).message)
        }
    }, [statusDevice])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleOpenCreate = () => {
        setSelectedDevice(null)
        setFormData({
            name: '',
            model: '',
            code: '',
            note: '',
            status: '',
            priceBuy: 0,
            priceSell: 0,
        })
        setOpen(true)
    }

    const handleOpenEdit = (device: DeviceModel) => {
        setSelectedDevice(device)
        setFormData({
            name: device.name,
            model: device.model,
            code: device.code,
            note: device.note || '',
            status: device.status,
            priceBuy: device.priceBuy || 0,
            priceSell: device.priceSell || 0,
        })
        setOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (selectedDevice) {
                // UPDATE
                const res = await DeviceService.update(selectedDevice._id!, formData);

                if (res.status === 200) {
                    toast.success("Cập nhật thiết bị thành công")
                    fetchData()
                } else {
                    toast.error(res.message)
                    return
                }
            } else {
                // CREATE
                const res = await DeviceService.create(formData)
                if (res.status === 200) {
                    toast.success("Tạo thiết bị thành công")
                    fetchData()
                } else {
                    toast.error(res.message)
                    return
                }
            }

            setOpen(false)
        } catch (error: unknown) {
            console.error("Lỗi khi xử lý thiết bị:", (error as Error).message)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý thiết bị</h1>

                <Button className="gap-2" onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4" />
                    Thêm thiết bị
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedDevice ? "Cập nhật thiết bị" : "Thêm thiết bị"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-6">

                            <div className="space-y-2">
                                <Label>Tên thiết bị</Label>
                                <Input
                                    disabled
                                    required
                                    value={`${formData?.model} - ${formData?.code}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Dòng máy</Label>
                                <Input
                                    required
                                    value={formData?.model || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value, name: `${e.target.value} - ${formData?.code}` })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mã máy</Label>
                                    <Input
                                        required
                                        value={formData?.code || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, code: e.target.value, name: `${formData?.model} - ${e.target.value}` })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Giá mua</Label>
                                    <Input
                                        type="number"
                                        value={formData?.priceBuy || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                priceBuy: Number(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Giá thuê</Label>
                                    <Input
                                        type="number"
                                        value={formData?.priceRental || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                priceRental: Number(e.target.value)
                                            })

                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Ghi chú</Label>
                                    <Input
                                        value={formData?.note || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, note: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>

                                    <Select
                                        value={formData?.status || ''}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="available">Sẵn sàng</SelectItem>
                                            <SelectItem value="rented">Đang cho thuê</SelectItem>
                                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Hủy</Button>
                            </DialogClose>

                            <Button type="submit">
                                {selectedDevice ? "Cập nhật" : "Xác nhận tạo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            <div className="my-2">
                <span className="text-sm font-medium text-gray-600 mx-2">Lọc theo trạng thái</span>
                <select
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                    value={statusDevice}
                    onChange={(e) => setStatusDevice(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="available">Sẵn sàng</option>
                    <option value="rented">Đang cho thuê</option>
                    <option value="maintenance">Bảo trì</option>
                </select>
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã máy</TableHead>
                            <TableHead>Dòng máy</TableHead>
                            <TableHead>Tên thiết bị</TableHead>
                            <TableHead>Giá mua</TableHead>
                            <TableHead>Giá thuê</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ghi chú</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {devices.map((device) => (
                            <TableRow key={device._id}>
                                <TableCell>{device.code}</TableCell>
                                <TableCell>{device.model}</TableCell>
                                <TableCell>{device.name}</TableCell>
                                <TableCell>{device.priceBuy?.toLocaleString()}</TableCell>
                                <TableCell>{device.priceRental?.toLocaleString()}</TableCell>
                                <TableCell>{device.status === "available" ? "Sẵn sàng" : device.status === "rented" ? "Đang cho thuê" : "Bảo trì"}</TableCell>
                                <TableCell>{device.note}</TableCell>

                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(device)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default DeviceManagement
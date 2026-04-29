"use client"

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DeviceService } from '@/app/service/deviceService'
import DeviceModel from '@/app/Model/Device'
import { toast } from 'sonner'
import StatusBadge from '@/app/(components)/StatusBadge'
import DialogModelDevices from '@/app/(components)/DialogModelDevices'
import DialogDevice from '@/app/(components)/DialogDevice'
import { modelService } from '@/app/service/modelService'

function DeviceManagement() {
    // --- STATE CHO DIALOG ---
    const [openDevice, setOpenDevice] = useState(false)
    const [openModel, setOpenModel] = useState(false)

    // --- STATE CHO DATA ---
    const [devices, setDevices] = useState<DeviceModel[]>([])
    const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null)
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [listModels, setListModels] = useState<any>(null)

    const [statusDevice, setStatusDevice] = useState('')
    const [countDevice, setCountDevice] = useState({
        totalDevices: 0,
        availableDevices: 0,
        rentedDevices: 0,
        maintenanceDevices: 0
    })

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        try {
            const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevice }).toString())
            if (res.status === 200) {
                setDevices(res.data)
                const activeDevices = res.data.filter((d: DeviceModel) => d.status !== 'sold');
                setCountDevice({
                    totalDevices: activeDevices.length,
                    availableDevices: res.data.filter((d: DeviceModel) => d.status === 'available').length,
                    rentedDevices: res.data.filter((d: DeviceModel) => d.status === 'rented').length,
                    maintenanceDevices: res.data.filter((d: DeviceModel) => d.status === 'maintenance').length,
                })
            }
        } catch (error: any) {
            toast.error("Lỗi tải thiết bị: " + error.message)
        }
    }, [statusDevice])

    const fetchModel = useCallback(async () => {
        try {
            const res = await modelService.getAll()
            setListModels(res)
        } catch (error: any) {
            toast.error("Lỗi tải model thiết bị: " + error.message)
        }
    }, [])

    useEffect(() => {
        fetchData()
        fetchModel()
    }, [fetchData])

    // --- HANDLER CHO DEVICE ---
    const handleOpenAddDevice = () => {
        setSelectedDevice(null)
        setOpenDevice(true)
    }

    const handleEditDevice = (device: DeviceModel) => {
        setSelectedDevice(device)
        setOpenDevice(true)
    }

    const handleSaveDevice = async (data: any) => {
        try {
            if (selectedDevice) {
                await DeviceService.update(selectedDevice._id!, data);
                toast.success("Cập nhật thiết bị thành công")
            } else {
                await DeviceService.create(data)
                toast.success("Tạo thiết bị thành công")
            }
            fetchData()
            setOpenDevice(false)
        } catch (error: any) {
            toast.error("Lỗi khi lưu thiết bị")
        }
    }

    // --- HANDLER CHO MODEL ---
    const handleOpenAddModel = () => {
        setSelectedModel(null)
        setOpenModel(true)
    }

    const handleSaveModel = async (data: any) => {
        try {
            console.log(data)
            await modelService.create(data);
            toast.success("Lưu model thành công");
            setOpenModel(false)
        } catch (error) {
            toast.error("Lỗi lưu model")
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
            const res = await DeviceService.delete(id);
            if (res.status === 200) {
                toast.success("Xóa thiết bị thành công")
                fetchData()
            }
        };
    }

    return (
        <div>
            {/* Header */}
            <div className="md:flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý thiết bị</h1>
                <div className="flex gap-2">
                    <Button className="gap-2" onClick={handleOpenAddModel}>
                        <Plus className="w-4 h-4" /> Thêm model máy
                    </Button>
                    <Button className="gap-2" onClick={handleOpenAddDevice}>
                        <Plus className="w-4 h-4" /> Thêm thiết bị
                    </Button>
                </div>
            </div>

            {/* Dialogs */}
            <DialogModelDevices
                open={openModel}
                onOpenChange={setOpenModel}
                initialData={selectedModel}
                onSave={handleSaveModel}
            />

            <DialogDevice
                open={openDevice}
                onOpenChange={setOpenDevice}
                selectedDevice={selectedDevice}
                onSave={handleSaveDevice}
                listModelDevice={listModels}
            />

            {/* Filter */}
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-pink-50 rounded-lg border">
                    <div className="text-xs text-pink-500 uppercase font-bold">Tổng máy</div>
                    <div className="text-2xl font-bold text-pink-900">{countDevice.totalDevices}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 uppercase font-bold">Đang trống</div>
                    <div className="text-2xl font-bold text-green-700">{countDevice.availableDevices}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 uppercase font-bold">Đang thuê</div>
                    <div className="text-2xl font-bold text-blue-700">{countDevice.rentedDevices}</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-xs text-amber-600 uppercase font-bold">Bảo trì</div>
                    <div className="text-2xl font-bold text-amber-700">{countDevice.maintenanceDevices}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Tên máy</TableHead>
                                <TableHead>Dòng máy</TableHead>
                                <TableHead>Giá mua</TableHead>
                                <TableHead>Giá thuê</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map((device) => (
                                <TableRow key={device._id}>
                                    <TableCell>{device.name}</TableCell>
                                    <TableCell>{device.modelId?.name || 'N/A'}</TableCell>
                                    <TableCell>{device.priceBuy?.toLocaleString()}đ</TableCell>
                                    <TableCell>{device.modelId?.pricePerDay?.toLocaleString()}đ</TableCell>
                                    <TableCell><StatusBadge status={device.status || ''} /></TableCell>
                                    <TableCell className="text-right text-nowrap">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditDevice(device)}><Edit2 className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(device._id!)}><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default DeviceManagement
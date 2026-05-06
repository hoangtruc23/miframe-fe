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
import { Input } from '@/components/ui/input'

type SelectedDevice = {
    _id: string;
    name: string;
    priceRental: number;
}

function DeviceManagement() {
    // --- STATE CHO DIALOG ---
    const [openDevice, setOpenDevice] = useState(false)
    const [openModel, setOpenModel] = useState(false)

    // --- STATE CHO DATA ---
    const [devices, setDevices] = useState<DeviceModel[]>([])
    const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null)
    const [selectedModel, setSelectedModel] = useState<any>(null)
    const [listModels, setListModels] = useState<any>(null)

    const [filterDevice, setFilterDevice] = useState([])
    const [filterDeviceSelected, setFilterDeviceSelected] = useState('')

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
            const params = new URLSearchParams({
                status: statusDevice,
                ...(filterDeviceSelected && { modelDevice: filterDeviceSelected })
            }).toString();
            const res = await DeviceService.getAll(params);

            // const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevice }).toString())
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
    }, [statusDevice, filterDeviceSelected])

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

    const fetchDataDevices = useCallback(async () => {
        try {
            const models = await DeviceService.getAllModelDevice();
            setFilterDevice(models.data);
            const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevice }).toString());
            setDevices(res.data);
        } catch (error) {
            toast.error("Lỗi tải thiết bị");
            console.error(error);
        }
    }, [statusDevice]);

    useEffect(() => {
        fetchDataDevices();
    }, []);

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


            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Filter */}
            <div className="flex flex-col md:flex-row gap-3 bg-white border border-slate-200/80 rounded-xl p-4 my-3">
                <div className="w-full md:w-56">
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Trạng thái</label>
                    <select
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                        value={statusDevice}
                        onChange={(e) => setStatusDevice(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="available">Sẵn sàng</option>
                        <option value="rented">Đang cho thuê</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>
                <div className="w-full md:w-56">
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Thiết bị</label>
                    <select
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                        value={filterDeviceSelected}
                        onChange={(e) => setFilterDeviceSelected(e.target.value)}
                    >
                        <option value="">Tất cả thiết bị</option>
                        {filterDevice && filterDevice.map((d: SelectedDevice, i: number) => (
                            <option key={i} value={d?._id}>{d?.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                    <Input
                        className="h-9 text-sm border-slate-200"
                        placeholder="Nhập số 4 số cuối SN ..."
                    // onChange={(e) => handleSearchPhone(e.target.value)}
                    />
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

            {/* --- GIAO DIỆN MOBILE CARD --- */}
            <div className="md:hidden divide-y">
                {devices.map((device) => (
                    <div key={device._id} className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{device.code}</span>
                                <h3 className="font-bold text-slate-900">{device.name}</h3>
                            </div>
                            <StatusBadge status={device.status || ''} />
                        </div>

                        <div className="text-sm text-slate-500">Giá thuê: <span className="text-blue-600 font-semibold">{device.priceRental}đ</span></div>
                        <div className="text-sm text-slate-500">{device.note || ''}</div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1 h-9" onClick={() => handleEditDevice(device)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Sửa
                            </Button>
                            <Button variant="outline" className="flex-1 h-9 text-red-500 border-red-100 bg-red-50" onClick={() => device._id && handleDelete(device._id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DeviceManagement
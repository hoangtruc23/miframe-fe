"use client"
import moment from 'moment';
import 'moment/locale/vi';
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, Plus, User, BadgePercent, Trash2, Edit2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useCallback, useEffect, useState, useMemo } from 'react'
import DeviceModel from '@/app/Model/Device'
import { RentalService } from '@/app/service/rentalService'
import { DeviceService } from '@/app/service/deviceService'
import { toast } from 'sonner'
import RentalScheduleModel from '@/app/Model/RentalSchedule'

type RentalStatus = 'deposit' | 'appointment' | 'rented' | 'completed' | 'canceled';

type RentalForm = {
    deviceId: string
    status: RentalStatus | ""
    startRental: string
    endRental: string
    note: string
    discount: number
    days: number
    total: number
    nameCustomer: string
    noteCustomer: string
    phoneCustomer: string
}

const INITIAL_FORM: RentalForm = {
    deviceId: "",
    status: "appointment",
    startRental: "",
    endRental: "",
    note: "",
    discount: 0,
    days: 0,
    total: 0,
    nameCustomer: "",
    noteCustomer: "",
    phoneCustomer: "",
};

function RentalSchedule() {
    const [rentals, setRentals] = useState<RentalScheduleModel[]>([])
    const [devices, setDevices] = useState<DeviceModel[]>([])
    const [statusDevices, setStatusDevices] = useState("")
    const [selectedItem, setSelectedItem] = useState<RentalScheduleModel | null>(null)
    const [deviceSelected, setDeviceSelected] = useState<DeviceModel | null>(null)
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<RentalForm>(INITIAL_FORM)

    const statusConfig: Record<RentalStatus, { label: string; color: string }> = {
        deposit: { label: "Đã cọc", color: "bg-blue-50 text-blue-700 border-blue-200" },
        appointment: { label: "Hẹn lịch", color: "bg-purple-50 text-purple-700 border-purple-200" },
        rented: { label: "Đang thuê", color: "bg-orange-50 text-orange-700 border-orange-200" },
        completed: { label: "Hoàn thành", color: "bg-green-50 text-green-700 border-green-200" },
        canceled: { label: "Đã hủy", color: "bg-red-50 text-red-700 border-red-200" },
    };

    const updateField = (field: keyof RentalForm, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Logic tính tiền tự động
    const calculatedTotal = useMemo(() => {
        if (!formData.startRental || !formData.endRental || !deviceSelected) return 0;
        const start = moment(formData.startRental);
        const end = moment(formData.endRental);
        const totalHours = end.diff(start, 'hours', true);
        if (totalHours <= 0) return 0;

        const fullDays = Math.floor(totalHours / 24);
        const extraHours = totalHours % 24;
        let additionalDayCharge = 0;
        let extraFee = 0;

        if (extraHours > 0 && extraHours <= 3) extraFee = 50000;
        else if (extraHours > 3 && extraHours <= 12) additionalDayCharge = 0.5;
        else if (extraHours > 12) additionalDayCharge = 1;

        const billableDays = Math.max(fullDays + additionalDayCharge, 1);
        const priceRental = deviceSelected.priceRental || 0;
        const subTotal = (billableDays * priceRental) + extraFee;
        return subTotal - (subTotal * (formData.discount / 100));
    }, [formData.startRental, formData.endRental, formData.discount, deviceSelected]);

    // Cập nhật formData.total khi calculatedTotal thay đổi
    useEffect(() => {
        updateField('total', calculatedTotal);
    }, [calculatedTotal]);

    const fetchDataRental = useCallback(async () => {
        try {
            const res = await RentalService.getAll()
            setRentals(res.data)
        } catch (error: unknown) {
            toast.error("Lỗi tải lịch thuê: " + error)
        }
    }, [])

    const fetchDataDevices = useCallback(async () => {
        try {
            const res = await DeviceService.getAll({ status: statusDevices });
            setDevices(res.data);
        } catch (error: unknown) {
            toast.error("Lỗi tải thiết bị: " + error);
        }
    }, [statusDevices]);

    useEffect(() => {
        fetchDataRental();
        fetchDataDevices();
    }, [fetchDataRental, fetchDataDevices]);

    // Mở Dialog thêm mới
    const handleOpenAdd = () => {
        setSelectedItem(null);
        setDeviceSelected(null);
        setFormData(INITIAL_FORM);
        setStatusDevices('available');
        setOpen(true);
    };

    // Mở Dialog chỉnh sửa
    const handleOpenEdit = (rental: any) => {
        setSelectedItem(rental);
        const currentDevice = devices.find(d => d._id === (rental.deviceId?._id || rental.deviceId));
        setDeviceSelected(currentDevice || null);

        setFormData({
            nameCustomer: rental.customerId?.name || "",
            noteCustomer: rental.customerId?.note || "",
            phoneCustomer: rental.customerId?.phone || "",
            deviceId: rental.deviceId?._id || rental.deviceId || "",
            status: rental.status || "",
            startRental: rental.startRental ? moment(rental.startRental).format('YYYY-MM-DDTHH:mm') : "",
            endRental: rental.endRental ? moment(rental.endRental).format('YYYY-MM-DDTHH:mm') : "",
            note: rental.note || "",
            discount: rental.discount || 0,
            days: rental.days || 0,
            total: rental.total || 0,
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const apiCall = selectedItem
                ? RentalService.update(selectedItem._id, formData)
                : RentalService.create(formData);

            const res = await apiCall;
            if (res.status === 200) {
                setOpen(false);
                toast.success(res.message);
                fetchDataRental();
            } else {
                toast.error(res.message);
            }
        } catch (error: unknown) {
            toast.error("Đã xảy ra lỗi: " + error);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý lịch thuê</h1>
                    <p className="text-slate-500">Điều phối thiết bị và theo dõi đơn thuê.</p>
                </div>
                <Button className="gap-2 shadow-md hover:shadow-lg" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm lịch thuê
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>{selectedItem ? "Cập nhật đơn thuê" : "Tạo đơn thuê mới"}</DialogTitle>
                            <DialogDescription>
                                {selectedItem ? `Chỉnh sửa mã đơn: #${selectedItem._id?.slice(-6)}` : "Nhập thông tin khách hàng và chọn thiết bị."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><User className="w-3 h-3" /> Khách hàng</Label>
                                    <Input required placeholder="Tên khách" value={formData.nameCustomer} onChange={(e) => updateField('nameCustomer', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Input placeholder="Số điện thoại" value={formData.phoneCustomer} onChange={(e) => updateField('phoneCustomer', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label>Ghi chú (Cọc bao nhiêu,...)</Label>
                                <Input placeholder="Nhập lưu ý..." value={formData.noteCustomer} onChange={(e) => updateField('noteCustomer', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><CalendarDays className="w-3 h-3" /> Bắt đầu</Label>
                                    <Input required type="datetime-local" value={formData.startRental} onChange={(e) => updateField('startRental', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kết thúc</Label>
                                    <Input required type="datetime-local" value={formData.endRental} onChange={(e) => updateField('endRental', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Thiết bị</Label>

                                    {selectedItem ? <Input value={selectedItem.deviceId.name} disabled /> : <Select value={formData.deviceId} onValueChange={(val) => {
                                        updateField('deviceId', val);
                                        setDeviceSelected(devices.find(d => d._id === val) || null);
                                    }}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Chọn máy" /></SelectTrigger>
                                        <SelectContent>
                                            {devices.map(d => <SelectItem key={d._id} value={d._id!}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>}

                                </div>

                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>
                                    <Select value={formData.status} onValueChange={(val) => updateField('status', val)}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusConfig).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-dashed">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-blue-600 font-semibold"><BadgePercent className="w-4 h-4" /> Giảm giá (%)</Label>
                                    <Input type="number" min="0" max="100" value={formData.discount} onChange={(e) => updateField('discount', Number(e.target.value))} />
                                </div>
                                <div className="space-y-1 text-right flex flex-col justify-center">
                                    <span className="text-[12px] font-bold uppercase tracking-wider">Tạm tính: {formData.total.toLocaleString()}đ</span>
                                    <Input type="number" value={formData.total} onChange={(e) => updateField('total', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                                {selectedItem ? "Lưu thay đổi" : "Xác nhận tạo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead>Thời gian thuê</TableHead>
                            <TableHead>Thiết bị</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals.map((rental) => (
                            <TableRow key={rental._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700">{moment(rental.startRental).format('HH:mm DD/MM')}</span>
                                        <span className="text-xs text-slate-400 italic">đến {moment(rental.endRental).format('HH:mm DD/MM')}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{rental.deviceId?.name || '---'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{rental.customerId?.name || 'N/A'}</span>
                                        <span className="text-xs text-slate-400 truncate max-w-[150px]">{rental.customerId.note}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                    {rental.total?.toLocaleString()}đ
                                </TableCell>
                                <TableCell>
                                    {rental.status && statusConfig[rental.status as RentalStatus] ? (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig[rental.status as RentalStatus].color}`}>
                                            {statusConfig[rental.status as RentalStatus].label}
                                        </span>
                                    ) : <span className="text-slate-300">---</span>}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleOpenEdit(rental)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                            <Trash2 className="w-4 h-4" />
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

export default RentalSchedule
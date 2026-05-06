"use client"
import moment from 'moment';
moment.locale('vi');
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
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
import { BadgePercent, Plus, Monitor, Trash2, Edit2, Loader2, CalendarDays } from 'lucide-react'
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import StatusBadge from '@/app/(components)/StatusBadge';

type RentalStatus = 'appointment' | 'rented' | 'completed' | 'canceled';

type SelectedDevice = {
    _id: string;
    name: string;
    priceRental: number;
}

type RentalForm = {
    deviceIds: string[]
    status: RentalStatus | ""
    startRental: string
    endRental: string
    note: string
    discount: number
    total: number
    nameCustomer: string
    noteCustomer: string
    phoneCustomer: string
    depositPaid?: number
}

const INITIAL_FORM: RentalForm = {
    deviceIds: [],
    status: "appointment",
    startRental: "",
    endRental: "",
    note: "",
    discount: 0,
    total: 0,
    depositPaid: 0,
    nameCustomer: "",
    noteCustomer: "",
    phoneCustomer: "",
};

const statusConfig: Record<RentalStatus, { label: string; className: string }> = {
    appointment: { label: "Hẹn lịch", className: "bg-purple-50 text-purple-800 border-purple-200" },
    rented: { label: "Đang thuê", className: "bg-amber-50 text-amber-800 border-amber-200" },
    completed: { label: "Hoàn thành", className: "bg-green-50 text-green-800 border-green-200" },
    canceled: { label: "Đã hủy", className: "bg-red-50 text-red-800 border-red-200" },
};

// function StatusBadge({ status }: { status: string }) {
//     const cfg = statusConfig[status as RentalStatus];
//     if (!cfg) return null;
//     return (
//         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.className}`}>
//             <span className="w-1.5 h-1.5 rounded-full bg-current" />
//             {cfg.label}
//         </span>
//     );
// }

function StatCard({ label, value, valueClass = "" }: { label: string; value: number | string; valueClass?: string }) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</div>
            <div className={`text-2xl font-semibold ${valueClass || "text-slate-800"}`}>{value}</div>
        </div>
    );
}

function RentalSchedule() {
    const [rentals, setRentals] = useState<RentalScheduleModel[]>([])
    const [devices, setDevices] = useState<DeviceModel[]>([])
    const [statusDevices, setStatusDevices] = useState("")
    const [selectedItem, setSelectedItem] = useState<RentalScheduleModel | null>(null)
    const [availableDevices, setAvailableDevices] = useState<DeviceModel[]>([]);
    const [filterStatus, setFilterStatus] = useState('active')
    const [filterDevice, setFilterDevice] = useState([])
    const [filterDeviceSelected, setFilterDeviceSelected] = useState('')
    const [selectedDeviceList, setSelectedDeviceList] = useState<SelectedDevice[]>([])

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<RentalForm>(INITIAL_FORM)
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const updateField = (field: keyof RentalForm, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculatedTotal = useMemo(() => {
        if (!formData.startRental || !formData.endRental || selectedDeviceList.length === 0) return 0;
        const start = moment(formData.startRental);
        const end = moment(formData.endRental);
        const totalHours = end.diff(start, 'hours', true);
        if (totalHours <= 0) return 0;

        const fullDays = Math.floor(totalHours / 24);
        const extraHours = totalHours % 24;
        let additionalDayCharge = 0;

        if (extraHours > 6 && extraHours <= 12) {
            additionalDayCharge = 0.5;
        } else if (extraHours > 12) {
            additionalDayCharge = 1;
        }

        const billableDays = Math.max(fullDays + additionalDayCharge, 1);
        const totalBasePrice = selectedDeviceList.reduce((sum, dev) => sum + (dev.priceRental || 0), 0);
        const subTotal = billableDays * totalBasePrice;
        return Math.round(subTotal - (subTotal * (formData.discount / 100)));
    }, [formData.startRental, formData.endRental, formData.discount, selectedDeviceList]);

    useEffect(() => {
        updateField('total', calculatedTotal);
    }, [calculatedTotal]);

    const fetchDataRental = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                status: filterStatus,
                ...(filterDeviceSelected && { modelDevice: filterDeviceSelected })
            }).toString();
            const res = await RentalService.getAll(params);
            setRentals(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách lịch thuê.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterDeviceSelected]);

    const fetchDataDevices = useCallback(async () => {
        try {
            const models = await DeviceService.getAllModelDevice();
            setFilterDevice(models.data);
            const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevices }).toString());
            setDevices(res.data);
        } catch (error) {
            toast.error("Lỗi tải thiết bị");
            console.error(error);
        }
    }, [statusDevices]);

    useEffect(() => {
        fetchDataDevices();
    }, []);

    useEffect(() => {
        const checkAvailable = async () => {
            if (!formData.startRental || !formData.endRental) {
                setAvailableDevices([]);
                return;
            }
            try {
                const query = new URLSearchParams({ start: formData.startRental, end: formData.endRental }).toString();
                const res = await DeviceService.getAvailableDevices(query);
                setAvailableDevices(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Lỗi kiểm tra máy trống:", error);
                setAvailableDevices([]);
            }
        };
        checkAvailable();
    }, [formData.startRental, formData.endRental]);

    useEffect(() => {
        fetchDataRental();
    }, [filterStatus, filterDeviceSelected]);

    // Stats
    const stats = useMemo(() => ({
        total: rentals.length,
        rented: rentals.filter((r: any) => r.status === 'rented').length,
        appointment: rentals.filter((r: any) => r.status === 'appointment').length,
        completed: rentals.filter((r: any) => r.status === 'completed').length,
    }), [rentals]);

    const handleOpenAdd = () => {
        setSelectedItem(null);
        setSelectedDeviceList([]);
        setFormData(INITIAL_FORM);
        setStatusDevices('available');
        setOpen(true);
    };

    const handleOpenEdit = (rental: any) => {
        setSelectedItem(rental);
        const currentDevices = Array.isArray(rental.deviceIds) ? rental.deviceIds : rental.deviceIds ? [rental.deviceIds] : [];
        setSelectedDeviceList(currentDevices.map((d: any) => ({
            _id: d._id || d,
            name: d.name || "Thiết bị cũ",
            priceRental: d.priceRental || 0
        })));
        setFormData({
            nameCustomer: rental.customerId?.name || "",
            noteCustomer: rental.customerId?.note || "",
            phoneCustomer: rental.customerId?.phone || "",
            deviceIds: currentDevices.map((d: any) => d._id || d),
            status: rental.status || "",
            startRental: rental.startRental ? moment(rental.startRental).format('YYYY-MM-DDTHH:mm') : "",
            endRental: rental.endRental ? moment(rental.endRental).format('YYYY-MM-DDTHH:mm') : "",
            note: rental.note || "",
            discount: rental.discount || 0,
            total: rental.total || 0,
            depositPaid: rental.depositPaid || 0,
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedDeviceList.length === 0) { toast.error("Vui lòng chọn ít nhất 1 thiết bị"); return; }
        if (!formData.nameCustomer.trim()) { toast.error("Vui lòng nhập tên khách hàng"); return; }
        const start = moment(formData.startRental);
        const end = moment(formData.endRental);
        if (!start.isValid() || !end.isValid() || start.isSameOrAfter(end)) {
            toast.error("Thời gian bắt đầu phải trước thời gian kết thúc"); return;
        }
        const finalData = { ...formData, deviceIds: selectedDeviceList.map(d => d._id) };
        setIsSubmitting(true);
        try {
            const apiCall = selectedItem ? RentalService.update(selectedItem._id, finalData) : RentalService.create(finalData);
            const res = await apiCall;
            if (res.status === 200 || res.success) {
                setOpen(false);
                toast.success(selectedItem ? "Cập nhật thành công" : "Tạo đơn thuê thành công");
                fetchDataRental();
            } else {
                toast.error(res.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi hệ thống. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRental = async (id: string) => {
        setDeleteConfirmId(null);
        setIsLoading(true);
        try {
            const res = await RentalService.delete(id);
            toast.success(res.message || "Xoá đơn thuê thành công");
            fetchDataRental();
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xoá. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchPhone = async (value: string) => {
        const res = await RentalService.getAll(new URLSearchParams({ phone: value }).toString());
        setRentals(res.data);
    };

    return (
        <div className="p-6 space-y-5 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Lịch thuê thiết bị</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Quản lý tất cả đơn hàng cho thuê</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm lịch thuê
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Tổng đơn" value={stats.total} />
                <StatCard label="Đang thuê" value={stats.rented} valueClass="text-amber-600" />
                <StatCard label="Hẹn lịch" value={stats.appointment} valueClass="text-blue-600" />
                <StatCard label="Hoàn thành" value={stats.completed} valueClass="text-green-700" />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 bg-white border border-slate-200/80 rounded-xl p-4">
                <div className="w-full md:w-48">
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Trạng thái</label>
                    <select
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="active">Hoạt động</option>
                        <option value="rented">Đang thuê</option>
                        <option value="appointment">Hẹn lịch</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
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
                        placeholder="Nhập số điện thoại..."
                        onChange={(e) => handleSearchPhone(e.target.value)}
                    />
                </div>

            </div>

            {/* Dialog Form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>{selectedItem ? "Cập nhật đơn thuê" : "Tạo đơn thuê mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Số điện thoại</Label>
                                    <Input value={formData.phoneCustomer} onChange={(e) => updateField('phoneCustomer', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Tên khách hàng <span className="text-red-400">*</span></Label>
                                    <Input required value={formData.nameCustomer} onChange={(e) => updateField('nameCustomer', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Ghi chú khách hàng</Label>
                                <Input placeholder="Lưu ý..." value={formData.noteCustomer} onChange={(e) => updateField('noteCustomer', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <CalendarDays className="w-3 h-3 text-blue-500" /> Nhận máy
                                    </Label>
                                    <Input required type="datetime-local" value={formData.startRental} onChange={(e) => updateField('startRental', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <CalendarDays className="w-3 h-3 text-amber-500" /> Trả máy
                                    </Label>
                                    <Input required type="datetime-local" value={formData.endRental} onChange={(e) => updateField('endRental', e.target.value)} />
                                </div>
                            </div>

                            {/* Device list */}
                            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Label className="flex items-center gap-2 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                                    <Monitor className="w-3.5 h-3.5" /> Danh sách máy thuê ({selectedDeviceList.length})
                                </Label>

                                <div className="space-y-1.5">
                                    {selectedDeviceList.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-sm">
                                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setSelectedDeviceList(prev => prev.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Select
                                    onValueChange={(val) => {
                                        const dev = devices.find(d => d._id === val) || availableDevices.find(d => d._id === val);
                                        if (dev && !selectedDeviceList.find(s => s._id === val)) {
                                            setSelectedDeviceList(prev => [...prev, {
                                                _id: dev._id!,
                                                name: dev.name || "Thiết bị",
                                                priceRental: dev.priceRental || 0
                                            }]);
                                        }
                                    }}
                                    disabled={!formData.startRental || !formData.endRental}
                                >
                                    <SelectTrigger className="bg-white text-sm">
                                        <SelectValue placeholder={(!formData.startRental || !formData.endRental) ? "Vui lòng chọn thời gian trước" : "+ Thêm máy vào đơn"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDevices.length > 0 ? (
                                            availableDevices.map(d => (
                                                <SelectItem key={d._id} value={d._id!}>
                                                    {d.name} — {d.priceRental?.toLocaleString()}đ/ngày
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-slate-400 text-center italic">
                                                {(!formData.startRental || !formData.endRental) ? "Chưa chọn thời gian thuê" : "Không còn máy trống trong khoảng này"}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Trạng thái đơn</Label>
                                    <Select value={formData.status} onValueChange={(val) => updateField('status', val as RentalStatus)}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusConfig).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <BadgePercent className="w-3 h-3 text-blue-500" /> Giảm giá (%)
                                    </Label>
                                    <Input type="number" min={0} max={100} value={formData.discount} onChange={(e) => updateField('discount', Number(e.target.value))} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500 uppercase tracking-wider">
                                    Tổng cộng tạm tính
                                    {formData.total > 0 && <span className="ml-1 font-semibold text-blue-600 normal-case">{formData.total.toLocaleString()}đ</span>}
                                </Label>
                                <Input type="number" value={formData.total} onChange={(e) => updateField('total', Number(e.target.value))} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Đã chuyển khoản</Label>
                                <Input type="number" value={formData.depositPaid} onChange={(e) => updateField('depositPaid', Number(e.target.value))} />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-28" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</>
                                ) : (
                                    selectedItem ? "Lưu thay đổi" : "Tạo đơn hàng"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 lg:hidden">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                ) : rentals.length === 0 ? (
                    <div className="text-center py-12 text-slate-200 bg-white rounded-xl border border-slate-200">Chưa có lịch thuê nào</div>
                ) : (
                    rentals.map((rental: any) => (
                        <div key={rental._id} className="bg-white p-4 rounded-xl border border-slate-400 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    {/* Time block mobile */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-medium bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded w-9 text-center">Nhận</span>
                                            <span className="text-sm font-semibold">{moment(rental.startRental).format('DD/MM')}</span>
                                            <span className="text-xs text-slate-400">{moment(rental.startRental).format('HH:mm')}</span>
                                        </div>
                                        <div className="w-px h-3 bg-slate-200 ml-4.5" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded w-9 text-center">Trả</span>
                                            <span className="text-sm font-semibold">{moment(rental.endRental).format('DD/MM')}</span>
                                            <span className="text-xs text-slate-400">{moment(rental.endRental).format('HH:mm')}</span>
                                        </div>
                                    </div>
                                    <div className="text-base font-semibold mt-2">{rental.customerId?.name || 'N/A'}</div>
                                    <div className="text-sm text-slate-400">{rental.customerId?.phone || ''}</div>
                                    {rental.customerId?.note && <div className="text-xs text-slate-400">{rental.customerId.note}</div>}
                                </div>
                                <StatusBadge status={rental.status || ''} />
                            </div>

                            <div className="flex flex-wrap gap-1.5 py-2.5 border-y border-dashed border-slate-200">
                                {Array.isArray(rental.deviceIds) ? rental.deviceIds.map((d: any, i: number) => (
                                    <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                        <Monitor className="w-3 h-3" /> {d.name}
                                    </span>
                                )) : <span className="text-sm">{rental.deviceId?.name || '---'}</span>}
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-[11px] text-slate-400">Tổng tiền thuê</div>
                                    <div className="text-base font-semibold text-blue-600">{rental.total?.toLocaleString()}đ</div>
                                    {rental.depositPaid > 0 && (
                                        <div className="text-md ">Đã CK: {rental.depositPaid?.toLocaleString()}đ</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleOpenEdit(rental)}>
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-400 border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirmId(rental._id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-slate-100">
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Thời gian</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Khách hàng</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Thiết bị</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Tổng tiền</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Trạng thái</TableHead>
                            <TableHead className="text-right text-[11px] uppercase tracking-wider font-medium">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                                </TableCell>
                            </TableRow>
                        ) : rentals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    Chưa có lịch thuê nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            rentals.map((rental: any) => (
                                <TableRow key={rental._id} className="border-slate-300 hover:bg-slate-50/60">

                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded w-9 text-center shrink-0">Nhận</span>
                                                <span className="text-sm font-medium text-slate-800">{moment(rental.startRental).format('DD/MM')}</span>
                                                <span className="text-xs text-slate-600">{moment(rental.startRental).format('HH:mm')}</span>
                                            </div>
                                            <div className="w-px h-3 bg-slate-200 ml-4.5" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded w-9 text-center shrink-0">Trả</span>
                                                <span className="text-sm font-medium text-slate-800">{moment(rental.endRental).format('DD/MM')}</span>
                                                <span className="text-xs text-slate-600">{moment(rental.endRental).format('HH:mm')}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-800">{rental.customerId?.name || 'N/A'}</div>
                                        <div className="text-xs text-slate-400">{rental.customerId?.phone}</div>
                                        {rental.customerId?.note && (
                                            <div className="text-xs text-slate-400 truncate max-w-37.5">{rental.customerId.note}</div>
                                        )}
                                    </TableCell>

                                    <TableCell className="max-w-50">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(rental.deviceIds) ? rental.deviceIds.map((d: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                                    {d.name}
                                                </span>
                                            )) : (
                                                <span className="text-sm">{rental.deviceId?.name || '---'}</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm font-semibold text-blue-600">{rental.total?.toLocaleString()}đ</div>
                                        {rental.depositPaid > 0 && (
                                            <div className="text-xs text-slate-400">CK: {rental.depositPaid?.toLocaleString()}đ</div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <StatusBadge status={rental.status || ''} />
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleOpenEdit(rental)}
                                                disabled={isLoading}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmId(rental._id)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xoá đơn thuê này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Huỷ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDeleteRental(deleteConfirmId)}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? "Đang xoá..." : "Xoá"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default RentalSchedule;
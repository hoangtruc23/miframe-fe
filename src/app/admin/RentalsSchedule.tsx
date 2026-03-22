"use client"
import moment from 'moment';
import 'moment/locale/vi';
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
import { CalendarDays, Plus, BadgePercent, Trash2, Edit2, Monitor, Loader2 } from 'lucide-react'
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
import StatusBadge from '@/app/(components)/StatusBadge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type RentalStatus = 'deposit' | 'appointment' | 'rented' | 'completed' | 'canceled';

// Định nghĩa kiểu dữ liệu cho thiết bị trong danh sách chọn
type SelectedDevice = {
    _id: string;
    name: string;
    priceRental: number;
}

type RentalForm = {
    deviceIds: string[] // Chuyển thành mảng ID để gửi lên server
    status: RentalStatus | ""
    startRental: string
    endRental: string
    note: string
    discount: number
    total: number
    nameCustomer: string
    noteCustomer: string
    phoneCustomer: string
}

const INITIAL_FORM: RentalForm = {
    deviceIds: [],
    status: "appointment",
    startRental: "",
    endRental: "",
    note: "",
    discount: 0,
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
    const [availableDevices, setAvailableDevices] = useState<DeviceModel[]>([]);
    const [filterStatus, setFilterStatus] = useState('rented')
    // Lưu danh sách thiết bị đang được chọn trong Form
    const [selectedDeviceList, setSelectedDeviceList] = useState<SelectedDevice[]>([])

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<RentalForm>(INITIAL_FORM)
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

    // Logic tính tiền tự động cho NHIỀU máy
    const calculatedTotal = useMemo(() => {
        if (!formData.startRental || !formData.endRental || selectedDeviceList.length === 0) return 0;

        const start = moment(formData.startRental);
        const end = moment(formData.endRental);
        const totalHours = end.diff(start, 'hours', true);
        if (totalHours <= 0) return 0;

        // Tính toán số ngày dựa trên logic giờ lẻ của bạn
        const fullDays = Math.floor(totalHours / 24);
        const extraHours = totalHours % 24;
        let additionalDayCharge = 0;
        let extraFee = 0;

        // Tính phí giờ lẻ riêng biệt. 
        if (extraHours > 0 && extraHours <= 6) { //Trễ 1-3 tiếng Free
            extraFee = 0;
        } else if (extraHours > 6 && extraHours <= 12) { // Tính 1/2 ngày
            additionalDayCharge = 0.5;
            extraFee = 0; // Reset extraFee khi không dùng
        } else if (extraHours > 12) { // Trên 12 tiếng tính 1 ngày
            additionalDayCharge = 1;
            extraFee = 0; // Reset extraFee khi không dùng
        }

        const billableDays = Math.max(fullDays + additionalDayCharge, 1);

        // TỔNG GIÁ THUÊ CỦA TẤT CẢ MÁY ĐÃ CHỌN
        const totalBasePrice = selectedDeviceList.reduce((sum, dev) => sum + (dev.priceRental || 0), 0);

        const subTotal = (billableDays * totalBasePrice) + extraFee;
        return Math.round(subTotal - (subTotal * (formData.discount / 100)));
    }, [formData.startRental, formData.endRental, formData.discount, selectedDeviceList]);

    useEffect(() => {
        updateField('total', calculatedTotal);
    }, [calculatedTotal]);

    const fetchDataRental = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await RentalService.getAll(new URLSearchParams({ status: filterStatus }).toString())
            setRentals(res.data)
        } catch (error) {
            toast.error("Lỗi tải danh sách lịch thuê. Vui lòng thử lại.")
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus])

    const fetchDataDevices = useCallback(async () => {
        try {
            const res = await DeviceService.getAll(new URLSearchParams({ status: statusDevices }).toString());
            setDevices(res.data);
        } catch (error) {
            toast.error("Lỗi tải thiết bị")
            console.log(error)
        }
    }, [statusDevices]);

    // Không thêm checkAvailableDevices vào dependency array vì nó là stable function
    useEffect(() => {
        const checkAvailable = async () => {
            // Chỉ gọi khi có đủ cả 2 mốc thời gian
            if (!formData.startRental || !formData.endRental) {
                setAvailableDevices([]);
                return;
            }

            try {
                const query = new URLSearchParams({
                    start: formData.startRental,
                    end: formData.endRental
                }).toString();
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
        fetchDataDevices();
    }, [fetchDataRental, fetchDataDevices]);

    const handleOpenAdd = () => {
        setSelectedItem(null);
        setSelectedDeviceList([]);
        setFormData(INITIAL_FORM);
        setStatusDevices('available');
        setOpen(true);
    };

    const handleOpenEdit = (rental: any) => {
        setSelectedItem(rental);

        // Nếu Backend trả về mảng thiết bị (Populate), map nó vào list chọn
        const currentDevices = Array.isArray(rental.deviceIds)
            ? rental.deviceIds
            : rental.deviceIds ? [rental.deviceIds] : [];

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
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Validation
        if (selectedDeviceList.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 thiết bị");
            return;
        }

        if (!formData.nameCustomer.trim()) {
            toast.error("Vui lòng nhập tên khách hàng");
            return;
        }

        const start = moment(formData.startRental);
        const end = moment(formData.endRental);
        if (!start.isValid() || !end.isValid() || start.isSameOrAfter(end)) {
            toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
            return;
        }

        const finalData = {
            ...formData,
            deviceIds: selectedDeviceList.map(d => d._id) // Đồng bộ mảng ID trước khi gửi
        };

        setIsSubmitting(true);
        try {
            const apiCall = selectedItem
                ? RentalService.update(selectedItem._id, finalData)
                : RentalService.create(finalData);

            const res = await apiCall;
            if (res.status === 200 || res.success) {
                setOpen(false);
                toast.success(res.message || selectedItem ? "Cập nhật thành công" : "Tạo đơn thuê thành công");
                fetchDataRental();
            } else {
                toast.error(res.message || "Có lỗi xảy ra")
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi hệ thống. Vui lòng thử lại.")
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

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="md:flex items-center justify-between">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý lịch thuê</h1>
                </div>
                <Button className="gap-2" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm lịch thuê
                </Button>
            </div>

            <div className="my-2">
                <span className="text-sm font-medium text-gray-600 mx-2">Lọc theo trạng thái</span>
                <select
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="rented">Đang cho thuê</option>
                    <option value="deposit">Đặt cọc</option>
                    <option value="appointment">Hẹn lịch</option>
                    <option value="canceled">Đã hủy</option>
                </select>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>{selectedItem ? "Cập nhật đơn thuê" : "Tạo đơn thuê mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên khách hàng</Label>
                                    <Input required value={formData.nameCustomer} onChange={(e) => updateField('nameCustomer', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Input value={formData.phoneCustomer} onChange={(e) => updateField('phoneCustomer', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Ghi chú khách hàng</Label>
                                <Input placeholder="Lưu ý..." value={formData.noteCustomer} onChange={(e) => updateField('noteCustomer', e.target.value)} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><CalendarDays className="w-3 h-3 text-blue-500" /> Bắt đầu</Label>
                                    <Input required type="datetime-local" value={formData.startRental} onChange={(e) => updateField('startRental', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label><CalendarDays className="w-3 h-3 text-blue-500" /> Kết thúc</Label>
                                    <Input required type="datetime-local" value={formData.endRental} onChange={(e) => updateField('endRental', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                                <Label className="flex items-center gap-2 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                                    <Monitor className="w-4 h-4" /> Danh sách máy thuê ({selectedDeviceList.length})
                                </Label>

                                <div className="space-y-2">
                                    {selectedDeviceList.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2 px-3 rounded-lg border shadow-sm">
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <Button
                                                type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                                                onClick={() => setSelectedDeviceList(prev => prev.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Select
                                    onValueChange={(val) => {
                                        // Tìm máy trong cả 2 danh sách để tránh bị sót khi Edit
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
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={(!formData.startRental || !formData.endRental) ? "Vui lòng chọn thời gian" : "+ Thêm máy vào đơn"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDevices.length > 0 ? (
                                            availableDevices.map(d => (
                                                <SelectItem key={d._id} value={d._id!}>
                                                    {d.name} ({d.priceRental?.toLocaleString()}đ)
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-slate-500 text-center italic">
                                                {(!formData.startRental || !formData.endRental)
                                                    ? "Chưa chọn thời gian thuê"
                                                    : "Hết máy trống trong khoảng này"}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Trạng thái đơn</Label>
                                    <Select value={formData.status} onValueChange={(val) => updateField('status', val as RentalStatus)}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusConfig).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><BadgePercent className="w-4 h-4 text-blue-600" /> Giảm giá (%)</Label>
                                    <Input type="number" value={formData.discount} onChange={(e) => updateField('discount', Number(e.target.value))} />
                                </div>
                            </div>

                            <div className="">
                                <span className="font-bold uppercase text-xs opacity-80">Tổng cộng tạm tính {formData.total.toLocaleString()}</span>
                                <Input type="number" value={formData.total} onChange={(e) => updateField('total', Number(e.target.value))} />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-30" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    selectedItem ? "Lưu thay đổi" : "Tạo đơn hàng"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                ) : rentals.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-white rounded-xl border">Chưa có lịch thuê nào</div>
                ) : (
                    rentals.map((rental: any) => (
                        <div key={rental._id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex flex-col text-sm font-bold ">
                                        <span className="text-blue-400">{moment(rental.startRental).format('HH:mm DD/MM')}</span>
                                        <span className="text-blue-700">{moment(rental.endRental).format('HH:mm DD/MM')}</span>
                                    </div>
                                    <div className="text-lg font-bold mt-1">{rental.customerId?.name || 'N/A'}</div>
                                    <div className="text-sm">{rental.customerId?.phone || ''}</div>
                                    <div className="text-sm">{rental.customerId?.note || ''}</div>
                                </div>

                                <StatusBadge status={rental.status || ''} />
                            </div>

                            <div className="flex flex-wrap gap-1.5 py-2 border-y border-dashed">
                                {Array.isArray(rental.deviceIds) ? rental.deviceIds.map((d: any, i: number) => (
                                    <span key={i} className="text-[11px] bg-slate-100 px-2 py-1 rounded border flex items-center gap-1">
                                        <Monitor className="w-3 h-3" /> {d.name}
                                    </span>
                                )) : <span className="text-sm">{rental.deviceId?.name || '---'}</span>}
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                <div>
                                    <div className="text-[11px] text-slate-400">Tổng thanh toán</div>
                                    <div className="text-md font-bold text-slate-900">{rental.total?.toLocaleString()}đ</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-blue-600" onClick={() => handleOpenEdit(rental)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-red-500" onClick={() => setDeleteConfirmId(rental._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="hidden lg:block bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Thiết bị</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                                </TableCell>
                            </TableRow>
                        ) : rentals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Chưa có lịch thuê nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            rentals.map((rental: any) => (
                                <TableRow key={rental._id}>
                                    <TableCell>
                                        <div className="text-sm font-semibold">{moment(rental.startRental).format('HH:mm DD/MM')}</div>
                                        <div className="text-xs text-slate-400 font-medium">đến {moment(rental.endRental).format('HH:mm DD/MM')}</div>
                                    </TableCell>
                                    <TableCell className="max-w-50">
                                        <div className="flex flex-wrap gap-1">
                                            {/* Xử lý hiển thị nhiều máy nếu deviceIds là mảng */}
                                            {Array.isArray(rental.deviceIds) ? rental.deviceIds.map((d: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border leading-none">{d.name}</span>
                                            )) : <span className="text-sm font-medium">{rental.deviceId?.name || '---'}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{rental.customerId?.name || 'N/A'}</div>
                                        <div className="text-[11px] text-slate-400 truncate max-w-37.5">{rental.customerId?.note}</div>
                                    </TableCell>
                                    <TableCell className="font-bold text-blue-600">{rental.total?.toLocaleString()}đ</TableCell>
                                    <TableCell>
                                        <StatusBadge status={rental.status || ''} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleOpenEdit(rental)} disabled={isLoading}><Edit2 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteConfirmId(rental._id)} disabled={isLoading}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Delete Confirmation Dialog */}
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
        </div>
    )
}

export default RentalSchedule
"use client"
import { expenseService } from '@/app/service/expenseService'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit2, Plus, Trash2, Loader2, DollarSign } from 'lucide-react'
import moment from 'moment'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import StatusBadge from '@/app/(components)/StatusBadge'

type ExpenseStatus = 'pending' | 'paid' | 'cancelled';

interface Expense {
    _id: string;
    description: string;
    total: number;
    note?: string;
    status: ExpenseStatus;
    datePaid: string;
    createdAt?: string;
}

const statusConfig: Record<ExpenseStatus, { label: string; className: string }> = {
    paid: { label: "Đã thanh toán", className: "bg-green-50 text-green-800 border-green-200" },
    pending: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-800 border-amber-200" },
    cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
};

// function StatusBadge({ status }: { status: string }) {
//     const cfg = statusConfig[status as ExpenseStatus];
//     if (!cfg) return null;
//     return (
//         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.className}`}>
//             <span className="w-1.5 h-1.5 rounded-full bg-current" />
//             {cfg.label}
//         </span>
//     );
// }

function StatCard({ label, value, valueClass = "", sub }: { label: string; value: string; valueClass?: string; sub?: string }) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</div>
            <div className={`text-xl font-semibold ${valueClass || "text-slate-800"}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
        </div>
    );
}

const INITIAL_FORM = {
    description: "",
    total: 0,
    note: "",
    status: "paid" as ExpenseStatus,
    datePaid: "",
};

function Expenses() {
    const [open, setOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedItem, setSelectedItem] = useState<Expense | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const stats = useMemo(() => {
        const totalDebt = expenses.filter(i => i.status === "pending").reduce((s, i) => s + (i.total || 0), 0);
        const totalPaid = expenses.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0);
        const countPending = expenses.filter(i => i.status === "pending").length;
        return { totalDebt, totalPaid, countPending };
    }, [expenses]);

    const getAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await expenseService.getAll({ status: filterStatus });
            setExpenses(res);
        } catch {
            toast.error("Không thể tải danh sách chi tiêu");
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => { getAll(); }, [getAll]);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenAdd = () => {
        setSelectedItem(null);
        setFormData(INITIAL_FORM);
        setOpen(true);
    };

    const handleOpenEdit = (item: Expense) => {
        setSelectedItem(item);
        setFormData({
            description: item.description || "",
            total: item.total || 0,
            note: item.note || "",
            datePaid: item.datePaid ? moment(item.datePaid).format('YYYY-MM-DDTHH:mm') : "",
            status: item.status || "paid",
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.total <= 0) return toast.error("Vui lòng nhập số tiền hợp lệ");
        setIsSubmitting(true);
        try {
            if (selectedItem) {
                await expenseService.update(selectedItem._id, formData);
                toast.success("Cập nhật thành công");
            } else {
                await expenseService.create(formData);
                toast.success("Đã thêm khoản chi mới");
            }
            setOpen(false);
            getAll();
        } catch {
            toast.error("Có lỗi xảy ra khi lưu");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirmId(null);
        setIsLoading(true);
        try {
            await expenseService.delete(id);
            toast.success("Đã xoá khoản chi");
            getAll();
        } catch {
            toast.error("Lỗi khi xoá. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-5 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Quản lý chi tiêu</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Theo dõi các khoản chi phí</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm chi tiêu
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                    label="Tổng nợ"
                    value={`${stats.totalDebt.toLocaleString()}đ`}
                    valueClass="text-red-600"
                    sub={`${stats.countPending} khoản chờ thanh toán`}
                />
                <StatCard
                    label="Đã chi"
                    value={`${stats.totalPaid.toLocaleString()}đ`}
                    valueClass="text-slate-800"
                />
                <StatCard
                    label="Tổng khoản"
                    value={`${expenses.length}`}
                    valueClass="text-slate-800"
                />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl px-4 py-3">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">Trạng thái</label>
                <select
                    className="h-9 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="pending">Chờ thanh toán</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {/* Dialog Form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>{selectedItem ? "Cập nhật chi phí" : "Thêm chi phí mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Nội dung chi phí <span className="text-red-400">*</span></Label>
                                <Input
                                    placeholder="Nhập nội dung..."
                                    required
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Số tiền (VNĐ) <span className="text-red-400">*</span></Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            className="pl-9 font-semibold text-blue-600"
                                            required
                                            value={formData.total}
                                            onChange={(e) => updateField('total', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Trạng thái</Label>
                                    <Select value={formData.status} onValueChange={(val) => updateField('status', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Đã thanh toán</SelectItem>
                                            <SelectItem value="pending">Chờ thanh toán</SelectItem>
                                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Ngày thanh toán</Label>
                                <Input
                                    required
                                    type="datetime-local"
                                    value={formData.datePaid}
                                    onChange={(e) => updateField('datePaid', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Ghi chú</Label>
                                <textarea
                                    className="flex min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all resize-none"
                                    placeholder="Thông tin thêm..."
                                    value={formData.note}
                                    onChange={(e) => updateField('note', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-24" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</>
                                    : selectedItem ? "Lưu thay đổi" : "Thêm mới"
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">Chưa có dữ liệu chi tiêu</div>
                ) : (
                    expenses.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-medium text-slate-800 leading-snug">{item.description}</h3>
                                <StatusBadge status={item.status} />
                            </div>
                            {item.note && <p className="text-xs text-slate-400 italic">{item.note}</p>}
                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-100">
                                <div>
                                    <div className="text-[11px] text-slate-400">{moment(item.datePaid).format('HH:mm DD/MM/YYYY')}</div>
                                    <div className="text-base font-semibold text-red-500 mt-0.5">{item.total.toLocaleString()}đ</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleOpenEdit(item)}>
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-400 border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirmId(item._id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center px-4 py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-400">{expenses.length} khoản chi</span>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-slate-100">
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Nội dung</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Ngày</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Số tiền</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Trạng thái</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Ghi chú</TableHead>
                            <TableHead className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-medium">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                                </TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    Chưa có dữ liệu chi tiêu
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((item) => (
                                <TableRow key={item._id} className="border-slate-100 hover:bg-slate-50/60">
                                    <TableCell className="font-medium text-slate-800">{item.description}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-700">{moment(item.datePaid).format('DD/MM/YYYY')}</div>
                                        <div className="text-xs text-slate-400">{moment(item.datePaid).format('HH:mm')}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-red-500">{item.total.toLocaleString()}đ</span>
                                    </TableCell>
                                    <TableCell><StatusBadge status={item.status} /></TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm text-slate-400">{item.note || "—"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleOpenEdit(item)}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmId(item._id)}
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
                            Bạn có chắc muốn xoá khoản chi này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Huỷ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
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

export default Expenses;
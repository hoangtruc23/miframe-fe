"use client"
import StatusBadge from '@/app/(components)/StatusBadge'
import { expenseService } from '@/app/service/expenseService'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit2, Plus, Trash2, Loader2, DollarSign } from 'lucide-react' // Thêm Loader2 và DollarSign
import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

// 1. Định nghĩa Type chuẩn
type ExpenseStatus = 'pending' | 'paid' | 'cancelled';

interface Expense {
    _id: string;
    description: string;
    total: number;
    note?: string;
    status: ExpenseStatus;
    createdAt?: string;
}

function Expenses() {
    const [open, setOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedItem, setSelectedItem] = useState<Expense | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false); // Fix: Thêm state này
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        description: "",
        total: 0,
        note: "",
        status: "paid" as ExpenseStatus,
    });

    // 2. Hàm lấy dữ liệu (Giả lập hoặc gọi API của bạn)
    const getAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await expenseService.getAll({ status: filterStatus })
            setExpenses(res)
            console.log("Fetching expenses with status:", filterStatus);
        } catch (error) {
            toast.error("Không thể tải danh sách chi tiêu");
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        getAll();
    }, [getAll]);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenAdd = () => {
        setSelectedItem(null);
        setFormData({
            description: "",
            total: 0,
            note: "",
            status: "paid",
        });
        setOpen(true);
    };

    const handleOpenEdit = (item: Expense) => {
        setSelectedItem(item);
        setFormData({
            description: item.description || "",
            total: item.total || 0,
            note: item.note || "",
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
                await expenseService.update(selectedItem._id, formData)
                toast.success("Cập nhật thành công");
            } else {
                await expenseService.create(formData)
                toast.success("Đã thêm khoản chi mới");
            }
            setOpen(false);
            getAll();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="md:flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Quản lý chi tiêu</h1>
                    <p className="text-slate-500 text-sm">Theo dõi các khoản chi phí của Mili</p>
                </div>
                <Button className="w-full md:w-auto gap-2 mt-4 md:mt-0" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm chi tiêu
                </Button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-sm font-medium text-gray-600 shrink-0">Trạng thái:</span>
                <select
                    className="border rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="pending">Chưa thanh toán</option>
                </select>
            </div>

            {/* Dialog Form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[95vw] sm:max-w-125 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {selectedItem ? "Cập nhật chi phí" : "Thêm chi phí mới"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Nội dung chi phí <span className="text-red-500">*</span></Label>
                                <Input
                                    id="description"
                                    placeholder="Nhập nội dung..."
                                    required
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="total">Số tiền (VNĐ) *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="total"
                                            type="number"
                                            className="pl-9 font-bold text-blue-600"
                                            required
                                            value={formData.total}
                                            onChange={(e) => updateField('total', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="note">Ghi chú</Label>
                                <textarea
                                    id="note"
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Thông tin thêm..."
                                    value={formData.note}
                                    onChange={(e) => updateField('note', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex-row gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Hủy</Button>
                            <Button type="submit" className="flex-2 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Danh sách */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Nội dung</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ghi chú</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 font-medium">Chưa có dữ liệu chi tiêu</TableCell></TableRow>
                            ) : (
                                expenses.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell className="font-bold text-red-500">{item.total.toLocaleString()}đ</TableCell>
                                        <TableCell><StatusBadge status={item.status} /></TableCell>
                                        <TableCell className="max-w-\[200px\] truncate text-slate-500">{item.note}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                                            <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Giao diện Mobile Card */}
                <div className="md:hidden divide-y">
                    {expenses.map((item) => (
                        <div key={item._id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900">{item.description}</h3>
                                <StatusBadge status={item.status} />
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-slate-400 italic mb-1">{item.note}</div>
                                    <div className="text-lg font-bold text-red-600">{item.total.toLocaleString()}đ</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="sm" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Expenses;
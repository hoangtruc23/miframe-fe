import CustomerModel from "@/app/Model/Customer";
import { CustomerService } from "@/app/service/customerService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit2, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react"
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function Customer() {
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pagination, setPagination] = useState({ total: 0 });
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [formData, setFormData] = useState<CustomerModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const getCustomers = async (page: number) => {
        setIsLoading(true);
        try {
            const res = await CustomerService.getAll({ page })
            setCustomers(res.data);
            setTotalPages(res.pagination.totalPages);
            setPagination({ total: res.pagination.total })
        } catch {
            toast.error("Không thể tải danh sách khách hàng");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getCustomers(currentPage)
    }, [currentPage])

    const updateField = (field: string, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const handleOpenAdd = () => {
        setSelectedCustomer(null);
        setFormData({ name: "", phone: "", note: "", status: "active", times: 0 });
        setOpen(true);
    };

    const handleOpenEdit = (customer: any) => {
        setSelectedCustomer(customer)
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            times: customer.times,
            note: customer.note || '',
            status: customer.status,
        })
        setOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData?.name?.trim()) return toast.error("Vui lòng nhập tên khách hàng");
        setIsSubmitting(true);
        try {
            if (selectedCustomer) {
                // await CustomerService.update(selectedCustomer._id, formData);
                toast.success("Cập nhật thành công");
            } else {
                // await CustomerService.create(formData);
                toast.success("Đã thêm khách hàng mới");
            }
            setOpen(false);
            getCustomers(currentPage);
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
            // await CustomerService.delete(id);
            toast.success("Đã xoá khách hàng");
            getCustomers(currentPage);
        } catch {
            toast.error("Lỗi khi xoá. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchPhone = async (value: string) => {
        const res = await CustomerService.getAll(new URLSearchParams({ phone: value }))
        setCustomers(res.data)
    }

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Smart pagination: show max 5 page buttons around current
    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [];
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    return (
        <div className="p-6 space-y-5 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Khách hàng</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {pagination.total > 0 ? `${pagination.total} khách hàng` : "Quản lý danh sách khách hàng"}
                    </p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" /> Thêm khách hàng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-4">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Tổng khách hàng</div>
                    <div className="text-2xl font-semibold text-slate-800">{pagination.total}</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Trang hiện tại</div>
                    <div className="text-2xl font-semibold text-slate-800">{currentPage} / {totalPages}</div>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl px-4 py-3">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">Tìm kiếm</label>
                <Input
                    className="h-9 text-sm border-slate-200 max-w-xs"
                    placeholder="Nhập số điện thoại..."
                    onChange={(e) => handleSearchPhone(e.target.value)}
                />
            </div>

            {/* Dialog Form */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>{selectedCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Tên khách hàng <span className="text-red-400">*</span></Label>
                                    <Input
                                        required
                                        placeholder="Họ và tên..."
                                        value={formData?.name || ""}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">Số điện thoại</Label>
                                    <Input
                                        placeholder="0912 345 678"
                                        value={formData?.phone || ""}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Ghi chú</Label>
                                <textarea
                                    className="flex min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all resize-none"
                                    placeholder="Lưu ý về khách hàng..."
                                    value={formData?.note || ""}
                                    onChange={(e) => updateField('note', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Hủy</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-24" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</>
                                    : selectedCustomer ? "Lưu thay đổi" : "Thêm mới"
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
                ) : customers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">Chưa có khách hàng nào</div>
                ) : (
                    customers.map((cus: any) => (
                        <div key={cus._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <div className="font-medium text-slate-800">{cus.name}</div>
                                    <div className="text-sm text-slate-400 mt-0.5">{cus.phone || "—"}</div>
                                </div>
                                <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200 shrink-0">
                                    {cus.times || 0} lần thuê
                                </span>
                            </div>
                            {cus.note && <p className="text-xs text-slate-400 italic border-t border-dashed border-slate-100 pt-2">{cus.note}</p>}
                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleOpenEdit(cus)}>
                                    <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Sửa
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-red-400 border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirmId(cus._id)}>
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Xóa
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center px-4 py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-400">{pagination.total} khách hàng</span>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-slate-100">
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Khách hàng</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Số điện thoại</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">CCCD</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Số lần thuê</TableHead>
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
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    Chưa có khách hàng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((cus: any) => (
                                <TableRow key={cus._id} className="border-slate-100 hover:bg-slate-50/60">
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <span className="text-[11px] font-semibold text-blue-600">
                                                    {cus.name?.charAt(0)?.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                            <span className="font-medium text-slate-800">{cus.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{cus.phone || "—"}</TableCell>
                                    <TableCell className="text-sm text-slate-400">{cus.cccd || "—"}</TableCell>
                                    <TableCell>
                                        <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                            {cus.times || 0} lần
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate text-sm text-slate-400">{cus.note || "—"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleOpenEdit(cus)}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmId(cus._id)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-sm text-slate-400">
                            Trang <span className="font-medium text-slate-700">{currentPage}</span> / {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline" size="sm"
                                className="h-8 px-3 text-xs border-slate-200"
                                onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </Button>
                            {getPageNumbers().map((pageNum, idx) =>
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                                ) : (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        className={`h-8 w-8 text-xs ${currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-slate-100"}`}
                                        onClick={() => goToPage(pageNum as number)}
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            )}
                            <Button
                                variant="outline" size="sm"
                                className="h-8 px-3 text-xs border-slate-200"
                                onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
                <div className="flex md:hidden items-center justify-between">
                    <Button
                        variant="outline" size="sm"
                        onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-slate-500">
                        Trang <span className="font-medium text-slate-800">{currentPage}</span> / {totalPages}
                    </span>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xoá khách hàng này? Hành động này không thể hoàn tác.
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
    )
}

export default Customer
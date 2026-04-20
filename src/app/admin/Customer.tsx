import StatusBadge from "@/app/(components)/StatusBadge";
import CustomerModel from "@/app/Model/Customer";
import { CustomerService } from "@/app/service/customerService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"
import { Input } from '@/components/ui/input'

function Customer() {
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState([])
    const [formData, setFormData] = useState<CustomerModel | null>(null);

    const getCustomers = async (page: number) => {
        const res = await CustomerService.getAll({ page })
        setCustomers(res.data);
        setTotalPages(res.pagination.totalPages);
    }

    useEffect(() => {
        getCustomers(currentPage)
    }, [currentPage])

    const handleOpenEdit = (customer: any) => {
        setSelectedCustomer(customer)
        setFormData({
            name: customer.name,
            times: customer.times,
            note: customer.note || '',
            status: customer.status,
        })
        setOpen(true)
    }

     const handleSearchPhone = async(value) => {
        // const res = await CustomerService.getAll(new URLSearchParams({ phone: value }).toString())
        // setCustomers(res.data)
    }

    return (
        <>
        <div className="my-2">
                    <Input placeholder="Nhập số điện thoại" onChange={(e)=>handleSearchPhone(e.target.value)} />
                </div>
            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {/* --- GIAO DIỆN TABLE (Chỉ hiện từ màn hình sm trở lên) --- */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Tên khách hàng</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>CCCD</TableHead>
                                <TableHead>Số lần thuê</TableHead>
                                <TableHead>Ghi chú</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers && customers.map((cus: any) => (
                                <TableRow key={cus._id}>
                                    <TableCell>{cus.name}</TableCell>
                                    <TableCell>{cus.phone}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{cus.times}</TableCell>
                                    <TableCell>{cus.note}</TableCell>
                                    <TableCell className="text-right text-nowrap">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cus)}><Edit2 className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* --- GIAO DIỆN MOBILE CARD --- */}
                <div className="md:hidden divide-y">
                    {customers && customers.map((cus: any) => (
                        <div key={cus._id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900">{cus.name}</h3>
                                <StatusBadge status={cus.status || ''} />
                            </div>

                            <div className="text-sm text-slate-500">Số lần: {cus.times}</div>
                            <div className="text-sm text-slate-500">{cus.note || ''}</div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1 h-9" onClick={() => handleOpenEdit(cus)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Sửa
                                </Button>
                                <Button variant="outline" className="flex-1 h-9 text-red-500 border-red-100 bg-red-50">
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= PAGINATION CONTAINER ================= */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">

                    <div className=" sm:block text-sm text-slate-500">
                        Trang <span className="font-medium text-slate-900">{currentPage}</span> / {totalPages}
                    </div>
                    <div className="flex flex-1 justify-between sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-auto"
                            onClick={() => {
                                setCurrentPage((prev) => Math.max(prev - 1, 1));
                                window.scrollTo(0, 0);
                            }}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </Button>

                        <div className="hidden md:flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    className="w-9 h-9"
                                    onClick={() => {
                                        setCurrentPage(pageNum);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    {pageNum}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-auto"
                            onClick={() => {
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                                window.scrollTo(0, 0);
                            }}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </div>


        </>
    )
}

export default Customer
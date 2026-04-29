"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DialogModelDeviceProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: any | null; // null = tạo mới, object = sửa
    onSave: (data: any) => Promise<void>;
}

export default function DialogModelDevice({ open, onOpenChange, initialData, onSave }: DialogModelDeviceProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (open) {
            setFormData(initialData || { name: "", pricePerDay: 0, isForSale: false, isForRent: true });
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onOpenChange(false); // Đóng sau khi lưu thành công
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Cập nhật dòng máy" : "Thêm dòng máy"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        <div className="space-y-2">
                            <Label>Tên thiết bị</Label>
                            <Input required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Giá thuê/ngày</Label>
                            <Input type="number" value={formData.pricePerDay || 0} onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Hủy</Button></DialogClose>
                        <Button type="submit">Xác nhận</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DialogDeviceProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDevice: any | null; // Nếu null là tạo mới, có data là đang sửa
    onSave: (data: any) => Promise<void>;
    listModelDevice: any[]; // Danh sách các dòng máy

}

export default function DialogDevice({ open, onOpenChange, selectedDevice, onSave, listModelDevice }: DialogDeviceProps) {
    const [formData, setFormData] = useState<any>({});

    // Khi open hoặc selectedDevice thay đổi, reset hoặc fill form
    useEffect(() => {
        if (open) {
            setFormData(selectedDevice || {
                modelId: '',
                code: '',
                name: '',
                priceBuy: 0,
                priceRental: 0,
                note: '',
                status: 'available'
            });
        }
    }, [open, selectedDevice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDevice ? "Cập nhật thiết bị" : "Thêm thiết bị"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        {/* Tên thiết bị (Auto-generated) */}
                        <div className="space-y-2">
                            <Label>Tên thiết bị</Label>
                            <Input
                                disabled
                                required
                                value={`${formData?.name || ''} - ${formData?.code || ''}`}
                            />
                        </div>

                        {/* Dòng máy & Mã máy */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dòng máy</Label>
                                <Select
                                    value={formData?.modelId?._id || ''}
                                    onValueChange={(value) => setFormData({ ...formData, modelId: { _id: value } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dòng máy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listModelDevice && listModelDevice.map((model: any) => (
                                            <SelectItem key={model._id} value={model._id}>{model.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Mã máy</Label>
                                <Input
                                    required
                                    value={formData?.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Giá */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Giá mua</Label>
                                <Input
                                    type="number"
                                    value={formData?.priceBuy || ''}
                                    onChange={(e) => setFormData({ ...formData, priceBuy: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Giá thuê</Label>
                                <Input
                                    type="number"
                                    value={formData?.priceRental || ''}
                                    onChange={(e) => setFormData({ ...formData, priceRental: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Ghi chú & Trạng thái */}
                        <div className="space-y-2">
                            <Label>Ghi chú</Label>
                            <Input
                                value={formData?.note || ''}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={formData?.status || 'available'}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Sẵn sàng</SelectItem>
                                    <SelectItem value="rented">Đang cho thuê</SelectItem>
                                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                                    <SelectItem value="sold">Đã bán</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Hủy</Button>
                        </DialogClose>
                        <Button type="submit">
                            {selectedDevice ? "Cập nhật" : "Xác nhận tạo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CheckCircle2, ClipboardList, TrendingUp } from "lucide-react"
import { RentalService } from '@/app/service/rentalService'
import { toast } from 'sonner'

interface DashboardData {
    allTotal: number;
    completedTotal: number;
    count: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        allTotal: 0,
        completedTotal: 0,
        count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Gọi API dashBoard bạn đã viết ở NodeJS
                const res = await RentalService.getDashboard();
                setData(res.data);
            } catch (error: any) {
                toast.error("Không thể tải dữ liệu dashboard");
                console.log(error)
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const stats = [
        {
            title: "Tổng doanh thu dự kiến",
            value: `${data.allTotal.toLocaleString()}đ`,
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            description: "Tổng tất cả các đơn thuê",
            color: "text-blue-600"
        },
        {
            title: "Doanh thu thực tế",
            value: `${data.completedTotal.toLocaleString()}đ`,
            icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
            description: "Đơn hàng đã hoàn thành",
            color: "text-green-600"
        },
        {
            title: "Tổng đơn hàng",
            value: data.count.toString(),
            icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
            description: "Số lượng lịch thuê hệ thống",
            color: "text-orange-600"
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: data.count > 0 ? `${((data.completedTotal / data.allTotal) * 100).toFixed(1)}%` : "0%",
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            description: "Hiệu suất thanh toán",
            color: "text-purple-600"
        }
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Tổng quan tình hình kinh doanh.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow gap-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bạn có thể thêm biểu đồ Chart ở đây nếu cần */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-slate-400 italic">
                            (Chưa có dữ liệu biểu đồ)
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Thông tin hỗ trợ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm">
                            <p className="text-slate-600 font-medium">Lưu ý cho admin:</p>
                            <ul className="list-disc pl-4 space-y-2 text-slate-500">
                                <li>Kiểm tra các đơn hàng "Đang thuê" quá hạn.</li>
                                <li>Xác nhận trạng thái "Hoàn thành" để cập nhật doanh thu thực.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CheckCircle2, ClipboardList, TrendingUp } from "lucide-react"
import { RentalService } from '@/app/service/rentalService'
import { toast } from 'sonner'
import StatusBadge from '@/app/(components)/StatusBadge'

interface DashboardData {
    allTotal: number;
    completedTotal: number;
    count: number;
}

interface RentalItem {
    name: string;
    [key: string]: any;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        allTotal: 0,
        completedTotal: 0,
        count: 0
    });
    const [loading, setLoading] = useState(true);
    const [listToday, setListToday] = useState<RentalItem[]>([]);

    const getRentalToday = async () => {
        try {
            const res = await RentalService.getRentalToday();
            console.log(res)
            setListToday(res);
        } catch (error: any) {
            toast.error("Không thể tải dữ liệu dashboard");
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await RentalService.getDashboard();
                setData(res.data);
            } catch (error: any) {
                toast.error("Không thể tải dữ liệu dashboard");
                console.log(error)
            } finally {
                setLoading(false);
            }
        };

        getRentalToday()
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Việc làm hôm nay</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {listToday && listToday.map((item, index) => (
                            <div key={index} className="mb-2 border-b pb-2">
                                <p className="font-bold">{item?.customerId?.name}</p>
                                <div className="text-sm text-gray-500">
                                    Thiết bị: {item?.deviceIds?.map((d: any) => d.name).join(', ')}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Giá: {item?.total}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Trạng thái: <StatusBadge status={item?.status} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-50 flex items-center justify-center text-slate-400 italic">
                            (Chưa có dữ liệu biểu đồ)
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    );
}
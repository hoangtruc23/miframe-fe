"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CheckCircle2, ClipboardList, TrendingUp, Badge, Calendar, Award, BarChart3 } from "lucide-react"
import { RentalService } from '@/app/service/rentalService'
import { toast } from 'sonner'
import StatusBadge from '@/app/(components)/StatusBadge'
import moment from 'moment'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

interface DashboardData {
    monthTotal: number;
    monthActual: number;
    yearActual: number;
    targetPercent: string | number;
    targetTotal: string | number;
    highestMonth: {
        actualCollected: number;
        total: number;
        _id: {
            month: number;
        };
    }
};

interface RentalItem {
    name: string;
    [key: string]: any;
}

const currentMonth = new Date().toISOString().slice(0, 7);

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        monthTotal: 0,
        monthActual: 0,
        yearActual: 0,
        targetTotal: 0,
        targetPercent: 0,
        highestMonth: {
            actualCollected: 0,
            total: 0,
            _id: {
                month: 1
            }
        }
    });
    const [loading, setLoading] = useState(true);
    const [listToday, setListToday] = useState<RentalItem[]>([]);
    const [processValue, setProcessValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState(currentMonth);

    const getRentalToday = async () => {
        try {
            const res = await RentalService.getRentalToday();
            setListToday(res);
        } catch (error: any) {
            toast.error("Không thể tải dữ liệu dashboard");
            console.log(error)
        }
    }

    const renderActionBadge = (rental: any) => {
        const now = moment();

        if (now.isSame(rental.startRental, 'day')) {
            return (
                <StatusBadge status={"getDevice"} />
            );
        }

        if (now.isSame(rental.endRental, 'day')) {
            return (
                <StatusBadge status={"backDevice"} />
            );
        }

        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                <StatusBadge status={rental.status} />
            </span>
        );
    };

    const fetchDashboard = async () => {
        try {
            const month = searchQuery.split('-')[1];
            const year = searchQuery.split('-')[0];
            const res = await RentalService.getDashboard(month, year);
            setData(res.data);
            setProcessValue(res.data.targetPercent)
        } catch (error: any) {
            // toast.error("Không thể tải dữ liệu dashboard");
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRentalToday()
        fetchDashboard();
    }, [searchQuery]);

    const formatCurrency = (value: any) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const stats = [
        {
            title: "Doanh thu thực tế",
            value: formatCurrency(data?.monthActual),
            description: "Lịch đã hoàn thành",
            icon: <BarChart3 className="h-4 w-4 text-purple-500" />,
            color: "text-purple-600"
        },
        {
            title: "Doanh thu ước tính",
            value: formatCurrency(data?.monthTotal),
            description: `Đạt ${data?.targetTotal}% mục tiêu`,
            icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
            color: "text-emerald-600"
        },
        {
            title: "Tháng cao nhất",
            // value: formatCurrency(data?.monthActual),
            value: `Tháng ${data.highestMonth?._id.month}`,
            description: `Kỷ lục: ${formatCurrency(data?.highestMonth?.actualCollected)}`,
            icon: <Award className="h-4 w-4 text-amber-500" />,
            color: "text-amber-600"
        },
        {
            title: "Doanh thu năm 2026",
            value: formatCurrency(data?.yearActual),
            description: "Tổng thu từ đầu năm đến nay",
            icon: <Calendar className="h-4 w-4 text-blue-500" />,
            color: "text-blue-600"
        },

    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Tổng quan tình hình kinh doanh.</p>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-card">
                <div className="">
                    <p className="text-sm font-medium text-muted-foreground">KPI {searchQuery}</p>
                    <p className="text-sm font-medium text-muted-foreground">{processValue >= 100
                        ? "🎉 Chúc mừng! Bạn đã vượt chỉ tiêu tháng."
                        : `còn ${(100 - processValue).toFixed(2)}% nữa để hoàn thành mục tiêu.`}</p>

                    <div className="flex items-center gap-2">
                        <Progress
                            value={processValue}
                            className="h-2"
                        />
                        <span className={`text-sm font-bold ${processValue >= 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {processValue}%
                        </span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground italic">

                </p>
            </div>

            <Input required type="month" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Việc làm hôm nay
                        <span className="text-md font-bold text-slate-500">{moment().format('DD/MM/YYYY')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {listToday && listToday.length > 0 ? (
                        listToday.map((item, index) => (
                            <div key={index} className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0">
                                <div className="">
                                    {renderActionBadge(item)}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item?.deviceIds?.map((d: any, i: number) => (
                                            <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded border">
                                                {d.name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="font-bold">{item.customerId.name}</div>
                                    <div className="mt-1 space-y-0.5">
                                        <div className="flex items-center text-slate-500">
                                            <span className="font-medium">Bắt đầu: </span>
                                            <span>{moment(item.startRental).format('HH:mm DD-MM-YYYY')}</span>
                                        </div>
                                        <div className="flex items-center text-slate-500">
                                            <span className="font-medium">Kết thúc: </span>
                                            <span>{moment(item.endRental).format('HH:mm DD-MM-YYYY')}</span>
                                        </div>
                                    </div>

                                </div>

                                <div className="font-bold">

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-sm italic">
                            Hôm nay chưa có lịch mới
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
            </div> */}
        </div>
    );
}
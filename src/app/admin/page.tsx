"use client"
import React, { useState } from 'react'
import MenuAdmin from '@/app/admin/menu'
import DeviceManagement from '@/app/admin/deviceManagement'
import RentalSchedule from '@/app/admin/rentalsSchedule'
import DashboardPage from '@/app/admin/dashboard'

function AdminPage() {
    // 1. Khởi tạo state để quản lý tab hiện tại
    const [activeTab, setActiveTab] = useState('dashboard');

    // 2. Hàm render nội dung tương ứng với Tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardPage />;
            case 'devices':
                return <DeviceManagement />;
            case 'rentals':
                return <RentalSchedule />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50">
            {/* Sidebar / Menu bên trái - Truyền function setActiveTab vào để menu điều khiển được */}
            <div className="w-64 h-full border-r bg-white">
                <MenuAdmin activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Vùng nội dung bên phải */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default AdminPage
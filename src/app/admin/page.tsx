"use client"
import React, { useState } from 'react'

import { Menu, X } from 'lucide-react' // Bạn có thể dùng icon tùy ý
import DashboardPage from '@/app/admin/Dashboard';
import DeviceManagement from '@/app/admin/DeviceManagement';
import RentalSchedule from '@/app/admin/RentalsSchedule';
import MenuAdmin from '@/app/admin/Menu';
import Expenses from '@/app/admin/Expenses';
import Customer from '@/app/admin/Customer';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [openSidebar, setOpenSidebar] = useState(false); // Mặc định đóng trên mobile

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardPage />;
            case 'devices': return <DeviceManagement />;
            case 'rentals': return <RentalSchedule />;
            case 'expenses': return <Expenses />;
            case 'customers': return <Customer />;
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 relative">
            {/* 1. Overlay (Lớp phủ đen khi mở menu trên mobile) */}
            {openSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setOpenSidebar(false)}
                />
            )}

            {/* 2. Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 transform
                ${openSidebar ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex justify-between items-center p-4 lg:hidden">
                    <span className="font-bold text-xl">Admin Panel</span>
                    <button onClick={() => setOpenSidebar(false)}>
                        <X size={24} />
                    </button>
                </div>
                <MenuAdmin activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setOpenSidebar(false); // Tự động đóng menu sau khi chọn tab trên mobile
                }} />
            </div>

            {/* 3. Vùng nội dung chính */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header cho Mobile */}
                <header className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
                    <button
                        onClick={() => setOpenSidebar(true)}
                        className="p-2 hover:bg-slate-100 rounded-md"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="font-semibold capitalize">{activeTab}</h1>
                    <div className="w-8" /> {/* Cân bằng layout */}
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default AdminPage
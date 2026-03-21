const StatusBadge = ({ status }: { status: string }) => {
    const configs = {
        available: { label: "Sẵn sàng", class: "bg-green-100 text-green-700 border-green-200" },
        rented: { label: "Đang thuê", class: "bg-blue-100 text-blue-700 border-blue-200" },
        maintenance: { label: "Bảo trì", class: "bg-amber-100 text-amber-700 border-amber-200" },
    };

    const config = configs[status as keyof typeof configs] || configs.available;

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${config.class}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge
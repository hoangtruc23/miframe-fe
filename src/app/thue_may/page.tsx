import Image from 'next/image'
import React from 'react'

function RentalPage() {
    // Danh sách ảnh và tiêu đề tương ứng để tăng SEO/Accessibility
    const rentalImages = [
        { src: "thue_may", alt: "Thông tin thuê máy" },
        { src: "quy_trinh_thue", alt: "Quy trình thuê máy" },
        { src: "quy_dinh", alt: "Quy định thuê máy" },
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-800">
                    Quy trình & Quy định Thuê Máy Ảnh
                </h1>
                <div className="h-1 w-20 bg-blue-500 mx-auto mt-2"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rentalImages.map((img, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-xl shadow-lg border border-gray-100"
                    >
                        <Image
                            src={`/img/thue_may/${img.src}.png`}
                            width={700}
                            height={700}
                            alt={img.alt}
                            layout="responsive"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <footer className="mt-12 text-center text-gray-500 italic">
                <p>* Vui lòng đọc kỹ quy định trước khi ký hợp đồng thuê máy.</p>
            </footer>

            <button>Đặt lịch thuê</button>
        </div>
    )
}

export default RentalPage
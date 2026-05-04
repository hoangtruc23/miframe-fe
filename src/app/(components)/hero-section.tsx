'use client'
import Image from "next/image"
// 1. Sửa lại import router từ next/navigation
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AuthService } from "@/app/service/authService";

export function HeroSection() {
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (username && password) {
            const res = AuthService.login(username, password)
            console.log(res)
        }
        // const token = "your-jwt-token-from-api";

        // // Lưu vào cookie (expires: 7 -> hết hạn sau 7 ngày)
        // Cookies.set("token", token, { expires: 7, path: "/" });

        // // Chuyển hướng vào trang quản lý
        // router.push("/admin");
    };

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
            {/* Hero Header Section */}
            <div className="flex flex-col justify-center items-center text-center max-w-2xl mx-auto mb-10">
                <div className="relative mb-6">
                    <Image
                        src="/img/goultra.png"
                        width={250}
                        height={100}
                        alt="insta360_go_ultra"
                        className="w-40 md:w-56 h-auto object-contain drop-shadow-sm"
                        priority
                    />
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3">
                    Mili.Frame
                </h1>
                <p className="text-base md:text-lg text-gray-600">
                    Hệ thống quản lý lịch thuê máy
                </p>
            </div>

            {/* Login Card Section */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Đăng nhập
                </h2>

                {/* 2. Gắn handleLogin vào onSubmit của form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập username"
                            required
                            name='username'
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            placeholder="Nhập password"
                            required
                            name='password'
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/20 mt-6"
                    >
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    )
}
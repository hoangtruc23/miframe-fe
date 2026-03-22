import { HeroSection } from "@/components/hero-section";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Tiêu đề chính: Giảm size chữ trên mobile */}
      <div className="py-10">
        <h1 className="font-alfa text-[30px] md:text-[40px] text-center px-4">
          Top Camera Hành Động đang HOT
        </h1>
      </div>
      <div className="mx-4 md:mx-25 space-y-20 md:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-auto md:min-h-screen justify-center items-center gap-8">
          <h1 className="font-alfa text-[50px] md:text-[100px] text-center md:text-left">
            Pocket 3
          </h1>
          <div className="flex justify-center">
            <Image
              src="/img/pocket3.png"
              width={700}
              height={100}
              alt="pocket3"
              className="w-full max-w-75 md:max-w-full h-auto"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="border border-gray-500 p-4 md:p-3 rounded-xl text-sm md:text-base leading-relaxed">
              DJI Osmo Pocket 3 Creator Combo là lựa chọn tối ưu cho người sáng tạo nội dung cần một thiết bị quay phim nhỏ gọn, mạnh mẽ...
            </p>
            <p className="font-alfa mt-5 cursor-pointer hover:underline">Xem thêm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 min-h-auto md:min-h-screen justify-center items-center gap-8">
          <h1 className="font-alfa text-[40px] md:text-[70px] text-center md:text-left">
            DJI<br className="hidden md:block" /> Osmo Nano
          </h1>
          <div className="flex justify-center">
            <Image
              src="/img/osmo_nano.png"
              width={700}
              height={100}
              alt="osmo_nano"
              className="w-full max-w-75 md:max-w-full h-auto"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="border border-gray-500 p-4 md:p-3 rounded-xl text-sm md:text-base leading-relaxed">
              Mô tả cho DJI Osmo Nano... (Bạn hãy thay nội dung thật vào đây nhé)
            </p>
            <p className="font-alfa mt-5 cursor-pointer hover:underline">Xem thêm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 min-h-auto md:min-h-screen justify-center items-center gap-8 pb-20">
          <h1 className="font-alfa text-[35px] md:text-[50px] text-center md:text-left">INSTA360 Go Ultra</h1>
          <div className="flex justify-center">
            <Image
              src="/img/goultra.png"
              width={700}
              height={100}
              alt="goultra"
              className="w-full max-w-75 md:max-w-full h-auto"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="border border-gray-500 p-4 md:p-3 rounded-xl text-sm md:text-base leading-relaxed">
              Mô tả cho Insta360 Go Ultra...
            </p>
            <p className="font-alfa mt-5 cursor-pointer hover:underline">Xem thêm</p>
          </div>
        </div>

      </div>
    </>
  );
}
import { HeroSection } from "@/components/hero-section";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="">
        <h1 className="font-alfa text-[40px] text-center">
          Top Camera Hành Động đang HOT
        </h1>
      </div>
      <div className="mx-[100px]">
        <div className="grid grid-cols-3 min-h-screen justify-center items-center">
          <h1 className="font-alfa text-[100px]">
            Pocket 3
          </h1>
          <div className="">
            <Image src="/img/pocket3.png" width={700} height={100} alt="pocket3"></Image>
          </div>
          <div className="text-center">
            <p className="border border-gray-500 p-3 rounded-xl">DJI Osmo Pocket 3 Creator Combo là lựa chọn tối ưu cho người sáng tạo nội dung cần một thiết bị quay phim nhỏ gọn, mạnh mẽ, dễ mang theo và giàu tính năng. Với cảm biến lớn 1 inch, khả năng quay 4K 120fps, tích hợp chống rung 3 trục và nhiều chế độ sáng tạo như D-Log M, ActiveTrack 6.0 hay Timelapse, chiếc máy quay bỏ túi này cho phép bạn tạo nên những thước phim chuyên nghiệp, mượt mà ở bất kỳ đâu..</p>
            <p className="font-alfa mt-5">Xem thêm</p>
          </div>
        </div>
      </div>

      <div className="mx-[100px]">
        <div className="grid grid-cols-3 min-h-screen justify-center items-center">
          <h1 className="font-alfa text-[70px]">
            DJI
            <br />Osmo Nano
          </h1>
          <div className="">
            <Image src="/img/osmo_nano.png" width={700} height={100} alt="pocket3"></Image>
          </div>
          <div className="text-center">
            <p className="border border-gray-500 p-3 rounded-xl">DJI Osmo Pocket 3 Creator Combo là lựa chọn tối ưu cho người sáng tạo nội dung cần một thiết bị quay phim nhỏ gọn, mạnh mẽ, dễ mang theo và giàu tính năng. Với cảm biến lớn 1 inch, khả năng quay 4K 120fps, tích hợp chống rung 3 trục và nhiều chế độ sáng tạo như D-Log M, ActiveTrack 6.0 hay Timelapse, chiếc máy quay bỏ túi này cho phép bạn tạo nên những thước phim chuyên nghiệp, mượt mà ở bất kỳ đâu..</p>
            <p className="font-alfa mt-5">Xem thêm</p>
          </div>
        </div>
      </div>

      <div className="mx-[100px]">
        <div className="grid grid-cols-3 min-h-screen justify-center items-center">
          <h1 className="font-alfa text-[70px]">
            INSTA360
            <br />Go Ultra
          </h1>
          <div className="">
            <Image src="/img/goultra.png" width={700} height={100} alt="pocket3"></Image>
          </div>
          <div className="text-center">
            <p className="border border-gray-500 p-3 rounded-xl">DJI Osmo Pocket 3 Creator Combo là lựa chọn tối ưu cho người sáng tạo nội dung cần một thiết bị quay phim nhỏ gọn, mạnh mẽ, dễ mang theo và giàu tính năng. Với cảm biến lớn 1 inch, khả năng quay 4K 120fps, tích hợp chống rung 3 trục và nhiều chế độ sáng tạo như D-Log M, ActiveTrack 6.0 hay Timelapse, chiếc máy quay bỏ túi này cho phép bạn tạo nên những thước phim chuyên nghiệp, mượt mà ở bất kỳ đâu..</p>
            <p className="font-alfa mt-5">Xem thêm</p>
          </div>
        </div>
      </div>


    </>
  );
}

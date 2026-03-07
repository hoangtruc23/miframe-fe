import Image from "next/image"

export function HeroSection() {
    return (
        <div className="w-full min-h-screen">
            <div className="flex relative flex-col min-h-screen justify-center items-center">
                <div className="flex">
                    <Image src="/img/pocket3.png" width={400} height={100} alt="pocket3"></Image>
                    <Image src="/img/osmo_nano.png" width={400} height={100} alt="osmo_nano"></Image>
                    <Image src="/img/goultra.png" width={400} height={100} alt="insta360_go_ultra"></Image>
                </div>
                <h1 className="font-alfa text-[150px]">
                    MiFrame
                </h1>
                <p className="font-alfa text-white bg-black p-3 rounded-xl">Mua bán - cho thuê máy ảnh/ action cam</p>
                <p className="font-alfa mt-5">Xem thêm</p>
            </div>
        </div>
    )
}

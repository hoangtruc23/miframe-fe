import Image from "next/image"

export function HeroSection() {
    return (
        <div className="w-full min-h-screen px-4">
            <div className="flex relative flex-col min-h-screen justify-center items-center">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
                    <Image
                        src="/img/pocket3.png"
                        width={250}
                        height={100}
                        alt="pocket3"
                        className="w-50 md:w-100 h-auto object-contain hidden sm:block"
                    />
                    <Image
                        src="/img/osmo_nano.png"
                        width={250}
                        height={100}
                        alt="osmo_nano"
                        className="w-50 md:w-100 h-auto object-contain hidden sm:block"
                    />
                    <Image
                        src="/img/goultra.png"
                        width={250}
                        height={100}
                        alt="insta360_go_ultra"
                        className="w-50 md:w-100 h-auto object-contain"
                    />
                </div>

                <h1 className="my-5 font-alfa text-[60px] md:text-[150px] leading-tight text-center">
                    MiFrame
                </h1>

                <p className="font-alfa text-white bg-black p-2 md:p-3 rounded-xl text-sm md:text-base text-center">
                    Mua bán - cho thuê máy ảnh/ action cam
                </p>

                <p className="font-alfa mt-8 md:mt-5 animate-bounce cursor-pointer">
                    Xem thêm
                </p>
            </div>
        </div>
    )
}
"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Shield, Clock, Camera } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background">
            <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full mb-6 border border-border">
                            <Camera className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Uy tín - Chất lượng - Chuyên nghiệp</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6 text-primary">
                            Thuê máy ảnh
                            {/* <span className="block text-primary">Chuyen Nghiep</span> */}
                        </h1>

                        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                            Mili.Frame cung cap dich vu cho thue may anh, ong kinh va thiet bi quay phim
                            tu cac thuong hieu hang dau. Giai phap hoan hao cho moi du an sang tao cua ban.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Button size="lg" className="gap-2 text-base px-8">
                                Xem thêm
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="text-base px-8 bg-card">
                                Bang Gia
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Bảo hiểm đầy đủ</p>
                                    <p className="text-xs text-muted-foreground">Mọi thiết bị được bảo vệ</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Nhận trong ngày</p>
                                    <p className="text-xs text-muted-foreground">Sẵn sàng khi bạn cần</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border shadow-lg">
                            <Image
                                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
                                alt="Thiet bi may anh chuyen nghiep"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Floating Card - Pricing */}
                        <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-card p-4 rounded-xl shadow-xl border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Canon R50</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">200k</span>
                                <span className="text-sm text-muted-foreground">/ngay</span>
                            </div>
                            <div className="mt-2 px-2 py-1 bg-primary/10 rounded text-xs text-primary font-medium">
                                3 ngay tro len giam 15%
                            </div>
                        </div>

                        {/* Floating Card - Reviews */}
                        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-card p-3 rounded-xl shadow-xl border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex -space-x-1.5">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold ring-2 ring-card">N</div>
                                    <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-[10px] font-bold ring-2 ring-card">T</div>
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold ring-2 ring-card">+</div>
                                </div>
                                <span className="text-xs font-medium text-foreground">500+ khach hang</span>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

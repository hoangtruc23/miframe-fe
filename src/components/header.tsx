"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, Menu, X, Phone } from "lucide-react"
import { useState } from "react"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Camera className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-primary leading-none">Mili.Frame</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Camera Rental</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#equipment" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                        Thiết Bị
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                        Quy Trình Thuê
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                        Bang Gia
                    </Link>
                    <Link href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                        Liên Hệ
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="gap-2 text-foreground/80 hover:text-foreground">
                        <Phone className="h-4 w-4" />
                        0123 456 789
                    </Button>
                    <Button size="sm">
                        Dat Thue Ngay
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-card">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        <Link
                            href="#equipment"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Thiet Bi
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Quy Trinh
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Bang Gia
                        </Link>
                        <Link
                            href="#contact"
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Lien He
                        </Link>
                        <div className="flex flex-col gap-2 pt-4 border-t border-border">
                            <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                                <Phone className="h-4 w-4" />
                                0123 456 789
                            </Button>
                            <Button size="sm" className="w-full">
                                Dat Thue Ngay
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}

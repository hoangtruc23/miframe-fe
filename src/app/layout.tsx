import type { Metadata } from "next";
import { Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";


const alfaSlabOne = Alfa_Slab_One({
  weight: '400', // Font này thường chỉ có weight 400
  subsets: ['latin'],
  variable: '--font-alfa-slab-one',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mili-Frame",
  description: "Quản lý lịch thuê",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${alfaSlabOne.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>

    </html>
  );
}

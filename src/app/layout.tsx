import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KSC Stablecoin - 한국 원화 기반 스테이블코인",
  description: "한국 원화 기반 스테이블코인 KSC의 발행, 전송, 관리 플랫폼",
  keywords: ["스테이블코인", "KSC", "원화", "블록체인", "Avalanche", "XRPL"],
  authors: [{ name: "KSC Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "KSC Stablecoin",
    description: "한국 원화 기반 스테이블코인 KSC 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "KSC Stablecoin",
    description: "한국 원화 기반 스테이블코인 KSC 플랫폼",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full bg-ksc-background text-ksc-white`}>
        <Providers>
          <div className="min-h-screen bg-ksc-background">
            <Header />
            {children}
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#343035",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#1BDEBE",
                  secondary: "#201E21",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#201E21",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

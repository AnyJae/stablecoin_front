"use client";

import Link from "next/link";
import { useState } from "react";
import { Wallet, Menu, X, Coins } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connectAvalancheWallet, walletInfo, connectXRPLWallet } = useWallet();

  return (
    <header className="bg-ksc-box/80 backdrop-blur-sm border-b border-ksc-box sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ksc-mint rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-ksc-black" />
            </div>
            <span className="text-xl font-bold text-gradient">KSC</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-ksc-gray hover:text-ksc-mint transition-colors">
              홈
            </Link>
            <Link href="/dashboard" className="text-ksc-gray hover:text-ksc-mint transition-colors">
              대시보드
            </Link>
            <Link href="/wallet" className="text-ksc-gray hover:text-ksc-mint transition-colors">
              지갑
            </Link>
            <Link href="/admin" className="text-ksc-gray hover:text-ksc-mint transition-colors">
              관리자
            </Link>
            <Link href="/docs" className="text-ksc-gray hover:text-ksc-mint transition-colors">
              문서
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={connectXRPLWallet} className="btn-primary flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>{walletInfo.isConnected ? walletInfo.address.slice(0, 6) + "..." : "지갑 연결"}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-ksc-box border-t border-ksc-box/50">
              <Link
                href="/"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/wallet"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                지갑
              </Link>
              <Link
                href="/admin"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                관리자
              </Link>
              <Link
                href="/docs"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                문서
              </Link>
              <div className="pt-4">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>지갑 연결</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

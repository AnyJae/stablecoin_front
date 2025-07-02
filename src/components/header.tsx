'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Wallet, Menu, X, Coins, Send, Shield, LogOut, User } from 'lucide-react';
import { useWallet } from '@/providers/wallet-provider';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, address, balance, connect, disconnect, isLoading, error } = useWallet();
  const { t } = useLanguage();
  const pathname = usePathname();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success(t('messages.walletConnected'));
    } catch (err) {
      toast.error(t('errors.walletConnection'));
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success(t('messages.walletDisconnected'));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num > 0.001 ? num.toFixed(4) : '< 0.001';
  };

  return (
    <header className="w-full bg-ksc-box/80 backdrop-blur-sm border-b border-ksc-box sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full relative flex items-center h-16">
          {/* Logo (왼쪽) */}
          <div className="flex items-center h-full flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-ksc-mint rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-ksc-black" />
              </div>
              <span className="text-xl font-bold text-gradient">KSC</span>
            </Link>
          </div>

          {/* Desktop Navigation (가운데) */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${pathname === '/' ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors`}
            >
              {t('navigation.home')}
            </Link>
            <Link
              href="/dashboard"
              className={`${pathname.startsWith('/dashboard') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors`}
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              href="/wallet"
              className={`${pathname.startsWith('/wallet') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors`}
            >
              {t('navigation.wallet')}
            </Link>
            <Link
              href="/payment"
              className={`${pathname.startsWith('/payment') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors flex items-center space-x-1`}
            >
              <Send size={16} />
              <span>{t('navigation.payment')}</span>
            </Link>
            <Link
              href="/collateral"
              className={`${pathname.startsWith('/collateral') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors flex items-center space-x-1`}
            >
              <Shield size={16} />
              <span>{t('navigation.collateral')}</span>
            </Link>
            <Link
              href="/admin"
              className={`${pathname.startsWith('/admin') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors`}
            >
              {t('navigation.admin')}
            </Link>
            <Link
              href="/docs"
              className={`${pathname.startsWith('/docs') ? 'text-ksc-mint' : 'text-ksc-gray'} hover:text-ksc-mint transition-colors`}
            >
              {t('navigation.docs')}
            </Link>
          </nav>

          {/* Connect Wallet Button (오른쪽) */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <LanguageSwitcher />
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{formatAddress(address!)}</p>
                  <p className="text-xs text-ksc-gray-light">
                    {balance ? `${formatBalance(balance)} AVAX` : t('common.loading')}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary flex items-center space-x-2"
                  title={t('wallet.disconnect')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('wallet.disconnect')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? t('common.loading') : t('wallet.connect')}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 ml-2"
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
                {t('navigation.home')}
              </Link>
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                href="/wallet"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.wallet')}
              </Link>
              <Link
                href="/payment"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Send size={16} />
                <span>{t('navigation.payment')}</span>
              </Link>
              <Link
                href="/collateral"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield size={16} />
                <span>{t('navigation.collateral')}</span>
              </Link>
              <Link
                href="/admin"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.admin')}
              </Link>
              <Link
                href="/docs"
                className="block px-3 py-2 text-ksc-gray hover:text-ksc-mint hover:bg-ksc-box/50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.docs')}
              </Link>
              
              {/* Mobile Wallet Section */}
              <div className="pt-4 border-t border-ksc-box/50">
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-ksc-gray rounded-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-ksc-mint" />
                        <span className="text-sm font-medium">{formatAddress(address!)}</span>
                      </div>
                      <p className="text-xs text-ksc-gray-light">
                        {balance ? `${formatBalance(balance)} AVAX` : t('common.loading')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleDisconnect();
                        setIsMenuOpen(false);
                      }}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('wallet.disconnect')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleConnect();
                      setIsMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                      <span>{isLoading ? t('common.loading') : t('wallet.connect')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
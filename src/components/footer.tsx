'use client';

import Link from 'next/link';
import { Coins, Github, Twitter, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: '지갑', href: '/wallet' },
      { name: '관리자', href: '/admin' },
      { name: '문서', href: '/docs' },
      { name: 'API', href: '/api' },
    ],
    resources: [
      { name: '개발자 문서', href: '/docs/developer' },
      { name: 'API 참조', href: '/docs/api' },
      { name: 'GitHub', href: 'https://github.com', external: true },
      { name: '커뮤니티', href: '/community' },
    ],
    company: [
      { name: '소개', href: '/about' },
      { name: '블로그', href: '/blog' },
      { name: '채용', href: '/careers' },
      { name: '연락처', href: '/contact' },
    ],
    legal: [
      { name: '개인정보처리방침', href: '/privacy' },
      { name: '이용약관', href: '/terms' },
      { name: '쿠키 정책', href: '/cookies' },
      { name: '라이선스', href: '/license' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@ksc.com' },
  ];

  return (
    <footer className="bg-ksc-box text-ksc-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-ksc-mint rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-ksc-black" />
              </div>
              <span className="text-xl font-bold">KSC</span>
            </Link>
            <p className="text-ksc-gray mb-6 max-w-md">
              한국 원화 기반 스테이블코인 KSC는 혁신적인 블록체인 기술을 통해
              안정적이고 효율적인 디지털 자산 거래를 제공합니다.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ksc-gray hover:text-ksc-mint transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              제품
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              리소스
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-ksc-gray uppercase tracking-wider mb-4">
              회사
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ksc-gray hover:text-ksc-mint transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ksc-box/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-ksc-gray text-sm">
              © {currentYear} KSC Stablecoin. 모든 권리 보유.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-ksc-gray hover:text-ksc-mint text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-ksc-box/50">
          <div className="text-center text-ksc-gray text-xs">
            <p className="mb-2">
              KSC는 테스트넷 환경에서 운영되는 데모 프로젝트입니다.
            </p>
            <p>
              실제 투자나 거래 목적으로 사용하지 마시고, 교육 및 개발 목적으로만 활용해주세요.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 
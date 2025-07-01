'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ksc-background py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-ksc-white mb-6">
            한국 원화 기반{' '}
            <span className="text-gradient">스테이블코인</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-ksc-gray mb-8 max-w-3xl mx-auto">
            KSC는 한국 원화와 1:1로 연동된 안정적인 디지털 자산입니다.
            <br />
            Avalanche와 XRPL을 기반으로 한 혁신적인 블록체인 솔루션을 경험해보세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/wallet" className="btn-primary text-lg px-8 py-3 flex items-center space-x-2">
              <span>지갑 시작하기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/docs" className="btn-secondary text-lg px-8 py-3">
              문서 보기
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">안정성</h3>
              <p className="text-ksc-gray">
                한국 원화와 1:1 연동으로 가격 안정성 보장
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">빠른 거래</h3>
              <p className="text-ksc-gray">
                초당 수천 건의 트랜잭션 처리 가능
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-ksc-mint/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-ksc-mint" />
              </div>
              <h3 className="text-lg font-semibold text-ksc-white mb-2">글로벌 접근</h3>
              <p className="text-ksc-gray">
                전 세계 어디서나 24/7 거래 가능
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">₩1</div>
              <div className="text-sm text-ksc-gray">KSC 가치</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">100%</div>
              <div className="text-sm text-ksc-gray">원화 연동</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">2</div>
              <div className="text-sm text-ksc-gray">지원 네트워크</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ksc-mint mb-2">24/7</div>
              <div className="text-sm text-ksc-gray">거래 가능</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-ksc-mint/20 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-ksc-mint/20 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-ksc-mint/20 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
    </section>
  );
} 
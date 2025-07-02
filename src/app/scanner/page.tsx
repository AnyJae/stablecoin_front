'use client';

import { ScannerInterface } from '@/components/scanner/scanner-interface';

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-ksc-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ksc-white mb-4">
            블록체인 <span className="text-gradient">스캐너</span>
          </h1>
          <p className="text-xl text-ksc-gray max-w-3xl mx-auto">
            XRPL과 Avalanche 네트워크에서 KSC 트랜잭션을 실시간으로 조회하고 모니터링하세요.
          </p>
        </div>
        <ScannerInterface />
      </div>
    </div>
  );
} 
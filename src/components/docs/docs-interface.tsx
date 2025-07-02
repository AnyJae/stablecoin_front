'use client';

import { useState } from 'react';
import { BookOpen, Code, Database, Shield, Zap, Users, Globe, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function DocsInterface() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: t('docs.sections.overview'),
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">KSC 스테이블코인 프로젝트</h3>
          <p className="text-ksc-gray">
            KSC(Korea Stable Coin)는 한국 원화와 1:1 연동되는 스테이블코인입니다. 
            XRPL과 Avalanche 블록체인을 기반으로 하여 안정성과 확장성을 모두 확보했습니다.
          </p>
          
          <h4 className="text-md font-semibold text-ksc-white mt-6">주요 특징</h4>
          <ul className="list-disc list-inside text-ksc-gray space-y-2">
            <li>한국 원화 1:1 연동</li>
            <li>XRPL + Avalanche 하이브리드 아키텍처</li>
            <li>실시간 모니터링 및 긴급 제어</li>
            <li>MetaMask 및 XUMM 지갑 지원</li>
            <li>관리자 발행/소각 기능</li>
          </ul>
        </div>
      )
    },
    {
      id: 'architecture',
      title: t('docs.sections.architecture'),
      icon: Code,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">시스템 아키텍처</h3>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">프론트엔드</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• Next.js 14 (App Router)</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• React Query</li>
              <li>• MetaMask 연동</li>
            </ul>
          </div>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">백엔드</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• Node.js + Express</li>
              <li>• Avalanche C-Chain 연동</li>
              <li>• XRPL 연동</li>
              <li>• RESTful API</li>
              <li>• 보안 미들웨어</li>
            </ul>
          </div>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">블록체인</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• Avalanche C-Chain (ERC20)</li>
              <li>• XRPL (Issued Currency)</li>
              <li>• Solidity 스마트 컨트랙트</li>
              <li>• Hardhat 개발 환경</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'smart-contract',
      title: t('docs.sections.smartContract'),
      icon: Database,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">KSCStablecoin 컨트랙트</h3>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">주요 기능</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• ERC20 표준 준수</li>
              <li>• 관리자 발행/소각</li>
              <li>• 긴급 일시정지</li>
              <li>• 재진입 공격 방지</li>
              <li>• 이벤트 로깅</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">보안 기능</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• Ownable 패턴</li>
              <li>• Pausable 패턴</li>
              <li>• ReentrancyGuard</li>
              <li>• 입력값 검증</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">관리자 기능</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• mint(address to, uint256 amount)</li>
              <li>• burn(address from, uint256 amount)</li>
              <li>• emergencyPause()</li>
              <li>• emergencyUnpause()</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: t('docs.sections.api'),
      icon: Zap,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">REST API 엔드포인트</h3>
          
          <div className="space-y-4">
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">Avalanche API</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/balance/:address</code> - KSC 잔액 조회</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/contract-info</code> - 컨트랙트 정보</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/avalanche/transfer</code> - KSC 전송</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/avalanche/transaction/:hash</code> - 트랜잭션 조회</div>
              </div>
            </div>
            
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">XRPL API</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">GET /api/xrpl/balance/:address</code> - XRP/KSC 잔액 조회</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/xrpl/transfer</code> - XRPL 전송</div>
              </div>
            </div>
            
            <div className="border border-ksc-border rounded-lg p-4 bg-ksc-box/30">
              <h4 className="font-semibold text-ksc-white mb-2">관리자 API</h4>
              <div className="text-sm space-y-2">
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/mint</code> - KSC 발행</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/burn</code> - KSC 소각</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/pause</code> - 긴급 일시정지</div>
                <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">POST /api/admin/unpause</code> - 일시정지 해제</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: t('docs.sections.security'),
      icon: Shield,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">보안 정책</h3>
          
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <h4 className="font-semibold text-red-400 mb-2">스마트 컨트랙트 보안</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• OpenZeppelin 라이브러리 사용</li>
              <li>• 재진입 공격 방지</li>
              <li>• 권한 기반 접근 제어</li>
              <li>• 긴급 일시정지 기능</li>
              <li>• 입력값 검증</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">백엔드 보안</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• CORS 설정</li>
              <li>• Rate Limiting</li>
              <li>• Helmet 보안 헤더</li>
              <li>• 입력값 검증 (Joi)</li>
              <li>• 에러 핸들링</li>
            </ul>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">프론트엔드 보안</h4>
            <ul className="text-sm text-ksc-gray space-y-1">
              <li>• MetaMask 서명 검증</li>
              <li>• HTTPS 강제</li>
              <li>• XSS 방지</li>
              <li>• 환경변수 관리</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: '배포',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ksc-white">배포 가이드</h3>
          
          <div className="bg-ksc-box/50 rounded-lg p-4 border border-ksc-border">
            <h4 className="font-semibold text-ksc-white mb-2">개발 환경</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><strong>Node.js:</strong> 18+ 버전</div>
              <div><strong>npm:</strong> 8+ 버전</div>
              <div><strong>MetaMask:</strong> 브라우저 확장</div>
              <div><strong>Hardhat:</strong> 스마트 컨트랙트 개발</div>
            </div>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">로컬 배포</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm install</code> - 의존성 설치</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run dev</code> - 개발 서버 실행</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run build</code> - 프로덕션 빌드</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run test</code> - 테스트 실행</div>
            </div>
          </div>
          
          <div className="bg-ksc-mint/10 rounded-lg p-4 border border-ksc-mint/20">
            <h4 className="font-semibold text-ksc-mint mb-2">테스트넷 배포</h4>
            <div className="text-sm text-ksc-gray space-y-2">
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">cd contracts</code> - 컨트랙트 폴더로 이동</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run deploy</code> - Avalanche Fuji 테스트넷 배포</div>
              <div><code className="bg-ksc-box px-2 py-1 rounded text-ksc-mint">npm run verify</code> - 컨트랙트 검증</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* 사이드바 네비게이션 */}
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="card bg-ksc-card border-ksc-border p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-ksc-white mb-4">목차</h3>
            <ul className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-ksc-mint/20 text-ksc-mint border border-ksc-mint/30'
                          : 'text-ksc-gray hover:bg-ksc-box/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-3">
          <div className="card bg-ksc-card border-ksc-border p-8">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { 
  Wallet, 
  Send, 
  Shield, 
  BarChart3, 
  Zap, 
  Globe,
  Lock,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Wallet,
      title: '지갑 연결',
      description: 'MetaMask와 XUMM 지갑을 지원하여 Avalanche와 XRPL 네트워크에서 KSC를 관리할 수 있습니다.',
      color: 'ksc-mint'
    },
    {
      icon: Send,
      title: '빠른 전송',
      description: '초당 수천 건의 트랜잭션을 처리하여 빠르고 안전한 KSC 전송이 가능합니다.',
      color: 'ksc-mint'
    },
    {
      icon: Shield,
      title: '보안 보장',
      description: '스마트 컨트랙트 기반의 안전한 토큰 관리와 긴급 일시정지 기능을 제공합니다.',
      color: 'ksc-mint'
    },
    {
      icon: BarChart3,
      title: '실시간 모니터링',
      description: '발행량, 소각량, 순환 공급량 등 KSC의 모든 지표를 실시간으로 확인할 수 있습니다.',
      color: 'ksc-mint'
    },
    {
      icon: Zap,
      title: '하이브리드 아키텍처',
      description: 'Avalanche의 확장성과 XRPL의 안정성을 결합한 혁신적인 블록체인 솔루션입니다.',
      color: 'ksc-mint'
    },
    {
      icon: Globe,
      title: '글로벌 접근',
      description: '전 세계 어디서나 24시간 언제든지 KSC 거래에 참여할 수 있습니다.',
      color: 'ksc-mint'
    }
  ];

  const benefits = [
    '한국 원화와 1:1 연동으로 가격 안정성 보장',
    '빠른 거래 처리 속도 (초당 수천 건)',
    '낮은 거래 수수료',
    '투명한 블록체인 기록',
    '긴급 상황 대응 기능',
    '다중 네트워크 지원'
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'ksc-mint':
        return 'bg-ksc-mint/20 text-ksc-mint';
      default:
        return 'bg-ksc-mint/20 text-ksc-mint';
    }
  };

  return (
    <section className="py-20 bg-ksc-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ksc-white mb-4">
            KSC의 <span className="text-gradient">핵심 기능</span>
          </h2>
          <p className="text-xl text-ksc-gray max-w-3xl mx-auto">
            한국 원화 기반 스테이블코인 KSC는 혁신적인 블록체인 기술을 통해
            안정적이고 효율적인 디지털 자산 거래를 제공합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="card-hover group">
              <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-ksc-white mb-3">
                {feature.title}
              </h3>
              <p className="text-ksc-gray leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-ksc-white mb-6">
              KSC를 선택해야 하는 <span className="text-gradient">이유</span>
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-ksc-mint mt-0.5 flex-shrink-0" />
                  <span className="text-ksc-gray">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-ksc-card border-ksc-border">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-ksc-mint mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-ksc-white mb-2">
                성장하는 생태계
              </h4>
              <p className="text-ksc-gray mb-6">
                KSC는 지속적으로 성장하는 블록체인 생태계의 핵심 자산으로,
                다양한 DeFi 프로토콜과 결제 시스템에서 활용됩니다.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-ksc-mint">2</div>
                  <div className="text-sm text-ksc-gray">지원 네트워크</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ksc-mint">100%</div>
                  <div className="text-sm text-ksc-gray">원화 연동</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="card bg-gradient-to-r from-ksc-mint to-ksc-mint/80 text-ksc-white">
            <h3 className="text-2xl font-bold mb-4">
              지금 바로 KSC를 시작해보세요
            </h3>
            <p className="text-ksc-white/90 mb-6">
              안전하고 빠른 한국 원화 기반 스테이블코인을 경험해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-ksc-white text-ksc-background hover:bg-ksc-gray font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                지갑 연결하기
              </button>
              <button className="border border-ksc-white text-ksc-white hover:bg-ksc-white hover:text-ksc-background font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                자세히 알아보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
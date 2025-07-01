"use client";

import { abi } from "abi.json";
import { ethers, formatEther } from "ethers";
import { Activity, DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalSupply: number;
  totalMinted: string;
  totalBurned: string;
  circulatingSupply: string;
  activeWallets: number;
  dailyTransactions: number;
  marketCap: number;
  price: number;
}

interface PriceData {
  timestamp: number;
  price: number;
}

export function DashboardInterface() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d">("7d");

  const avaxProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL);
  const xrplProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
  const tokenAddress = process.env.NEXT_PUBLIC_KSC_CONTRACT_ADDRESS!;
  // const abi = [
  //   "function balanceOf(address) view returns (uint256)",
  //   "function circulatingSupply() external view returns (uint256)",
  //   "function getTotalMinted() external view returns (uint256)",
  //   "function getTotalBurned() external view returns (uint256)",
  //   "function mint(address to, uint256 amount) external onlyOwner whenNotPaused nonReentrant",
  // ];
  const avaxTokenContract = new ethers.Contract(tokenAddress, abi, avaxProvider);
  const xrplTokenContract = new ethers.Contract(tokenAddress, abi, xrplProvider);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const totalMinted = formatEther(await xrplTokenContract.getTotalMinted());
    const totalBurned = formatEther(await xrplTokenContract.getTotalBurned());
    const circulatingSupply = formatEther(await xrplTokenContract.circulatingSupply());

    try {
      // 실제 API 호출 (현재는 모의 데이터)
      const mockStats: DashboardStats = {
        totalSupply: 1000000,
        totalMinted: totalMinted.toString(),
        totalBurned: totalBurned.toString(),
        circulatingSupply: circulatingSupply.toString(),
        activeWallets: 1250,
        dailyTransactions: 89,
        marketCap: 450000000,
        price: 100000,
      };

      const mockPriceHistory: PriceData[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
        price: 1000 + Math.random() * 10 - 5,
      }));

      setStats(mockStats);
      setPriceHistory(mockPriceHistory);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (value: string | number) => {
    return `₩${Number(value).toLocaleString("ko-KR")}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-ksc-box rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card bg-ksc-card border-ksc-border p-6">
                <div className="h-4 bg-ksc-box rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-ksc-box rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ksc-white mb-2">KSC 대시보드</h1>
        <p className="text-ksc-gray">한국 원화 기반 스테이블코인 KSC의 실시간 현황</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-ksc-card border-ksc-border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-ksc-mint/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-ksc-mint" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ksc-gray">총 공급량</p>
              <p className="text-2xl font-bold text-ksc-white">{formatNumber(stats?.totalSupply || 0)} KSC</p>
            </div>
          </div>
        </div>

        <div className="card bg-ksc-card border-ksc-border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-ksc-mint/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-ksc-mint" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ksc-gray">순환 공급량</p>
              <p className="text-2xl font-bold text-ksc-white">{formatNumber(stats?.circulatingSupply || 0)} KSC</p>
            </div>
          </div>
        </div>

        <div className="card bg-ksc-card border-ksc-border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-ksc-mint/20 rounded-lg">
              <Users className="w-6 h-6 text-ksc-mint" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ksc-gray">활성 지갑</p>
              <p className="text-2xl font-bold text-ksc-white">{formatNumber(stats?.activeWallets || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-ksc-card border-ksc-border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-ksc-mint/20 rounded-lg">
              <Activity className="w-6 h-6 text-ksc-mint" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-ksc-gray">일일 거래</p>
              <p className="text-2xl font-bold text-ksc-white">{formatNumber(stats?.dailyTransactions || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 발행/소각 현황 */}
        <div className="card bg-ksc-card border-ksc-border p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">발행/소각 현황</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-ksc-mint mr-2" />
                <span className="text-ksc-gray">총 발행량</span>
              </div>
              <span className="font-semibold text-ksc-mint">{formatNumber(stats?.totalMinted || 0)} KSC</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-ksc-gray">총 소각량</span>
              </div>
              <span className="font-semibold text-red-400">{formatNumber(stats?.totalBurned || 0)} KSC</span>
            </div>
            <div className="pt-4 border-t border-ksc-border">
              <div className="flex items-center justify-between">
                <span className="text-ksc-gray">발행률</span>
                <span className="font-semibold text-ksc-mint">
                  {stats ? ((Number(stats.totalMinted) / Number(stats.totalSupply)) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 시장 정보 */}
        <div className="card bg-ksc-card border-ksc-border p-6">
          <h3 className="text-lg font-semibold text-ksc-white mb-4">시장 정보</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">현재 가격</span>
              <span className="font-semibold text-ksc-mint">{formatCurrency(stats?.price || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ksc-gray">시가총액</span>
              <span className="font-semibold text-ksc-mint">{formatCurrency(stats?.marketCap || 0)}</span>
            </div>
            <div className="pt-4 border-t border-ksc-border">
              <div className="flex items-center justify-between">
                <span className="text-ksc-gray">가격 안정성</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-ksc-mint rounded-full mr-2"></div>
                  <span className="text-sm text-ksc-mint">안정</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 및 상태 */}
      <div className="card bg-ksc-card border-ksc-border p-6">
        <h3 className="text-lg font-semibold text-ksc-white mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-ksc-mint/10 rounded-lg border border-ksc-mint/20">
            <div className="w-3 h-3 bg-ksc-mint rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-ksc-white">Avalanche 네트워크</p>
              <p className="text-xs text-ksc-gray">정상 운영 중</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-ksc-mint/10 rounded-lg border border-ksc-mint/20">
            <div className="w-3 h-3 bg-ksc-mint rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-ksc-white">XRPL 네트워크</p>
              <p className="text-xs text-ksc-gray">정상 운영 중</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-ksc-mint/10 rounded-lg border border-ksc-mint/20">
            <div className="w-3 h-3 bg-ksc-mint rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-ksc-white">스마트 컨트랙트</p>
              <p className="text-xs text-ksc-gray">정상 운영 중</p>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="card bg-ksc-card border-ksc-border p-6 mt-8">
        <h3 className="text-lg font-semibold text-ksc-white mb-4">최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-ksc-box/50 rounded-lg border border-ksc-border">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-ksc-mint mr-3" />
              <div>
                <p className="text-sm font-medium text-ksc-white">KSC 발행</p>
                <p className="text-xs text-ksc-gray">1,000 KSC가 새로 발행되었습니다</p>
              </div>
            </div>
            <span className="text-xs text-ksc-gray">2분 전</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-ksc-box/50 rounded-lg border border-ksc-border">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-ksc-mint mr-3" />
              <div>
                <p className="text-sm font-medium text-ksc-white">거래 완료</p>
                <p className="text-xs text-ksc-gray">500 KSC 전송이 완료되었습니다</p>
              </div>
            </div>
            <span className="text-xs text-ksc-gray">5분 전</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-ksc-box/50 rounded-lg border border-ksc-border">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-ksc-mint mr-3" />
              <div>
                <p className="text-sm font-medium text-ksc-white">새 지갑 연결</p>
                <p className="text-xs text-ksc-gray">새로운 지갑이 연결되었습니다</p>
              </div>
            </div>
            <span className="text-xs text-ksc-gray">10분 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}
